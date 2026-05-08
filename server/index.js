import 'dotenv/config';
import bcrypt from 'bcryptjs';
import express from 'express';
import cors from 'cors';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const app = express();
const port = Number(process.env.PORT ?? 8787);
const host = '0.0.0.0';
const dataDir = path.resolve(process.cwd(), 'server', 'data');
const accountsFile = path.join(dataDir, 'accounts.json');
const adminWorkspaceFile = path.join(dataDir, 'admin-workspace.json');
const sessionsFile = path.join(dataDir, 'sessions.json');
const distDir = path.resolve(process.cwd(), 'dist');
const eventClients = new Set();
const sessions = new Map();
let adminWorkspaceMutationQueue = Promise.resolve();
const SESSION_COOKIE_NAME = 'apex_bank_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;
const SESSION_REFRESH_THRESHOLD_MS = 60 * 60 * 1000;
const BANK_NAME = 'Apex Bank';
const BANK_WORDMARK = 'APEX BANK';
const DEFAULT_APEX_ROUTING_NUMBER = '031100089';
const PASSWORD_HASH_ROUNDS = 10;
let nodemailerPromise;
let sendGridMailPromise;


function getSeedIssuedCards(account) {
  const existingIssuedCards = account.issuedCards ?? [];

  if (existingIssuedCards.length > 0 || account.role === 'admin') {
    return existingIssuedCards;
  }

  const isSeedExampleUser = account.id === 'USR-0001' || String(account.email ?? '').toLowerCase() === 'example.user@demo.local';

  if (!isSeedExampleUser) {
    return existingIssuedCards;
  }

  return [
    {
      id: 'CARD-SEED-USR-0001',
      requestId: 'CARD-SEED-USR-0001',
      type: 'Physical Debit Card - Generated',
      cardMode: 'Physical Card',
      status: 'Active',
      requested: 'Apr 05, 2026',
      issuedAt: '2026-04-05T09:30:00.000Z',
      network: 'Mastercard World',
      maskedNumber: '**** 8842',
      issuedBy: 'Apex Demo Seed',
    },
  ];
}

function normalizeStoredAccount(account) {
  const isAdminAccount = account.role === 'admin';

  return {
    ...account,
    password: normalizeStoredPassword(account.password),
    accountNumber: isAdminAccount
      ? account.accountNumber ?? ''
      : account.accountNumber ?? generateApexAccountNumber(account.id || account.email || account.phone || account.name),
    routingNumber: isAdminAccount ? account.routingNumber ?? '' : account.routingNumber ?? DEFAULT_APEX_ROUTING_NUMBER,
    savedBanks: account.savedBanks ?? [],
    notifications: account.notifications ?? [],
    pendingIncomingTransfers: account.pendingIncomingTransfers ?? [],
    issuedCards: getSeedIssuedCards(account),
  };
}

function isPasswordHash(password) {
  return /^\$2[aby]\$\d{2}\$/.test(String(password ?? ''));
}

function normalizeStoredPassword(password) {
  const normalizedPassword = String(password ?? '').trim();

  if (!normalizedPassword) {
    return '';
  }

  if (isPasswordHash(normalizedPassword)) {
    return normalizedPassword;
  }

  return bcrypt.hashSync(normalizedPassword, PASSWORD_HASH_ROUNDS);
}

function verifyPassword(password, storedPassword) {
  const normalizedStoredPassword = String(storedPassword ?? '').trim();

  if (!normalizedStoredPassword) {
    return false;
  }

  if (!isPasswordHash(normalizedStoredPassword)) {
    return normalizedStoredPassword === String(password ?? '');
  }

  return bcrypt.compareSync(String(password ?? ''), normalizedStoredPassword);
}

function generateApexAccountNumber(seed) {
  const normalizedSeed = String(seed ?? 'APEX').trim().toUpperCase();
  let hash = 0;

  for (const char of normalizedSeed) {
    hash = ((hash * 31) + char.charCodeAt(0)) % 900000000;
  }

  return String(1000000000 + hash).slice(0, 10);
}

function formatAccountNumber(accountNumber) {
  const cleaned = String(accountNumber ?? '').replace(/\D/g, '');

  if (cleaned.length < 10) {
    return accountNumber || 'Not available';
  }

  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}


function getEmailFromAddress() {
  return process.env.EMAIL_FROM?.trim() || 'no-reply@apex.bank';
}

function parseCookies(cookieHeader) {
  return String(cookieHeader ?? '')
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const separatorIndex = entry.indexOf('=');

      if (separatorIndex === -1) {
        return cookies;
      }

      const name = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();

      if (!name) {
        return cookies;
      }

      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function createSessionCookieValue(token, maxAgeSeconds) {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (typeof maxAgeSeconds === 'number') {
    attributes.push(`Max-Age=${maxAgeSeconds}`);
  }

  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}

function setSessionCookie(response, token) {
  response.setHeader('Set-Cookie', createSessionCookieValue(token, SESSION_MAX_AGE_SECONDS));
}

function clearSessionCookie(response) {
  response.setHeader('Set-Cookie', createSessionCookieValue('', 0));
}

function sanitizeAccountForUser(account, requester) {
  const normalizedAccount = normalizeStoredAccount(account);
  const { password: _password, ...sanitizedAccount } = normalizedAccount;

  if (requester.role === 'admin') {
    return sanitizedAccount;
  }

  if (normalizedAccount.id === requester.id) {
    return sanitizedAccount;
  }

  return {
    id: normalizedAccount.id,
    role: normalizedAccount.role,
    status: normalizedAccount.status,
    verificationStatus: normalizedAccount.verificationStatus,
    name: normalizedAccount.name,
    accountNumber: normalizedAccount.accountNumber,
    routingNumber: normalizedAccount.routingNumber,
  };
}

function buildVisibleAccounts(accounts, requester) {
  return accounts.map((account) => sanitizeAccountForUser(account, requester));
}

function sanitizeAdminWorkspace(workspace) {
  if (!workspace || typeof workspace !== 'object' || Array.isArray(workspace)) {
    return {};
  }

  return {
    ...workspace,
    adminUserRecords: Array.isArray(workspace.adminUserRecords)
      ? workspace.adminUserRecords.map((record) => {
          const { password: _password, ...sanitizedRecord } = record ?? {};
          return sanitizedRecord;
        })
      : [],
  };
}

function mergeAccountsWithStoredPasswords(existingAccounts, incomingAccounts) {
  return incomingAccounts.map((account) => {
    const existingAccount = existingAccounts.find((entry) => entry.id === account.id);
    const incomingPassword = String(account.password ?? '').trim();

    if (incomingPassword) {
      return account;
    }

    if (!existingAccount?.password) {
      return account;
    }

    return {
      ...account,
      password: existingAccount.password,
    };
  });
}

function createSession(account) {
  const now = new Date().toISOString();
  const token = randomBytes(32).toString('hex');

  sessions.set(token, {
    userId: account.id,
    role: account.role,
    createdAt: now,
    lastSeenAt: now,
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
  });

  return persistSessions().then(() => token);
}

function normalizeStoredSession(session) {
  if (!session || typeof session !== 'object' || Array.isArray(session) || !session.userId || !session.role) {
    return null;
  }

  const createdAt = new Date(session.createdAt ?? Date.now()).toISOString();
  const lastSeenAt = new Date(session.lastSeenAt ?? createdAt).toISOString();
  const expiresAt = new Date(session.expiresAt ?? (Date.parse(lastSeenAt) + SESSION_MAX_AGE_MS)).toISOString();

  return {
    userId: session.userId,
    role: session.role,
    createdAt,
    lastSeenAt,
    expiresAt,
  };
}

function isSessionExpired(session) {
  return Date.parse(session?.expiresAt ?? 0) <= Date.now();
}

function serializeSessions() {
  return Object.fromEntries(sessions.entries());
}

async function persistSessions() {
  await ensureAccountsFile();
  await writeFile(sessionsFile, JSON.stringify(serializeSessions(), null, 2), 'utf8');
}

async function loadSessions() {
  await ensureAccountsFile();

  try {
    const content = await readFile(sessionsFile, 'utf8');
    const parsed = JSON.parse(content);
    let changed = false;

    sessions.clear();

    for (const [token, storedSession] of Object.entries(parsed ?? {})) {
      const normalizedSession = normalizeStoredSession(storedSession);

      if (!normalizedSession || isSessionExpired(normalizedSession)) {
        changed = true;
        continue;
      }

      if (JSON.stringify(storedSession) !== JSON.stringify(normalizedSession)) {
        changed = true;
      }

      sessions.set(token, normalizedSession);
    }

    if (changed) {
      await persistSessions();
    }
  } catch {
    sessions.clear();
    await persistSessions();
  }
}

async function deleteSession(token) {
  if (!token || !sessions.has(token)) {
    return;
  }

  sessions.delete(token);
  await persistSessions();
}

async function refreshSession(token, session) {
  const now = Date.now();
  const expiresAt = Date.parse(session.expiresAt ?? 0);

  if (Number.isNaN(expiresAt) || expiresAt - now > SESSION_REFRESH_THRESHOLD_MS) {
    return session;
  }

  const refreshedSession = {
    ...session,
    lastSeenAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_MAX_AGE_MS).toISOString(),
  };

  sessions.set(token, refreshedSession);
  await persistSessions();
  return refreshedSession;
}

function getRequestToken(request) {
  const cookies = parseCookies(request.headers.cookie);

  if (cookies[SESSION_COOKIE_NAME]) {
    return cookies[SESSION_COOKIE_NAME];
  }

  const authorization = request.get('authorization') ?? '';

  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  if (typeof request.query.token === 'string') {
    return request.query.token.trim();
  }

  return '';
}

function serializeAuthUser(account) {
  return {
    id: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
    phone: account.phone,
    status: account.status,
    verificationStatus: account.verificationStatus,
  };
}

function buildUserWorkspace(account, workspace) {
  const matchesAccount = (record = {}) => {
    return (
      record.accountId === account.id
      || record.requesterId === account.id
      || record.email === account.email
      || record.name === account.name
      || record.owner === account.name
      || record.requesterName === account.name
    );
  };

  return {
    withdrawalRecords: Array.isArray(workspace?.adminWithdrawalRecords)
      ? workspace.adminWithdrawalRecords.filter((record) => matchesAccount(record))
      : [],
    cardRecords: Array.isArray(workspace?.adminCardRecords)
      ? workspace.adminCardRecords.filter((record) => matchesAccount(record))
      : [],
    caseRecords: Array.isArray(workspace?.adminCaseRecords)
      ? workspace.adminCaseRecords.filter((record) => matchesAccount(record))
      : [],
  };
}

function ensureRetailUser(request, response) {
  if (request.auth.account.role === 'admin') {
    response.status(403).json({ message: 'Retail user access is required.' });
    return false;
  }

  return true;
}

function formatWorkspaceTimestamp(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function prependWorkspaceEntry(entries, nextEntry, limit) {
  return [nextEntry, ...(Array.isArray(entries) ? entries : [])].slice(0, limit);
}

function toTrimmedString(value) {
  return String(value ?? '').trim();
}

function sanitizeUserCaseRecord(inputCase, account) {
  const nextType = toTrimmedString(inputCase.type);
  const allowedTypes = new Set(['Support', 'Loan', 'Investment']);

  if (!allowedTypes.has(nextType)) {
    return null;
  }

  const nextCase = {
    id: toTrimmedString(inputCase.id),
    type: nextType,
    subject: toTrimmedString(inputCase.subject),
    owner: account.name,
    requesterId: account.id,
    priority: toTrimmedString(inputCase.priority) || 'Medium',
    status: 'Open',
    assignee: toTrimmedString(inputCase.assignee) || 'Support Desk',
  };

  const optionalFields = [
    'message',
    'amountRequested',
    'tenor',
    'purpose',
    'sourceAccount',
    'horizon',
    'goal',
    'fundingAccount',
  ];

  for (const field of optionalFields) {
    const value = toTrimmedString(inputCase[field]);

    if (value) {
      nextCase[field] = value;
    }
  }

  if (!nextCase.id || !nextCase.subject) {
    return null;
  }

  return nextCase;
}

async function buildAuthPayload(account, accounts) {
  const payload = {
    user: serializeAuthUser(account),
    accounts: buildVisibleAccounts(accounts, account),
  };

  const workspace = await readAdminWorkspace();

  if (account.role === 'admin') {
    payload.workspace = workspace;
  } else {
    payload.userWorkspace = buildUserWorkspace(account, workspace);
  }

  return payload;
}

function findAccountByIdentifier(accounts, identifier) {
  const normalizedIdentifier = String(identifier ?? '').trim().toLowerCase();

  if (!normalizedIdentifier) {
    return null;
  }

  return accounts.find((account) => {
    const email = String(account.email ?? '').trim().toLowerCase();
    const phone = String(account.phone ?? '').trim();
    return email === normalizedIdentifier || phone === identifier;
  }) ?? null;
}

async function getAuthenticatedContext(request, response) {
  const token = getRequestToken(request);

  if (!token) {
    return null;
  }

  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  if (isSessionExpired(session)) {
    await deleteSession(token);

    if (response) {
      clearSessionCookie(response);
    }

    return null;
  }

  const activeSession = await refreshSession(token, session);

  const accounts = await readAccounts();
  const account = accounts.find((entry) => entry.id === activeSession.userId);

  if (!account) {
    await deleteSession(token);

    if (response) {
      clearSessionCookie(response);
    }

    return null;
  }

  if (response) {
    setSessionCookie(response, token);
  }

  return {
    token,
    session: activeSession,
    account,
    accounts,
  };
}

async function requireAuth(request, response, next) {
  const auth = await getAuthenticatedContext(request, response);

  if (!auth) {
    response.status(401).json({ message: 'Authentication is required.' });
    return;
  }

  request.auth = auth;
  next();
}

function requireAdmin(request, response, next) {
  if (request.auth.account.role !== 'admin') {
    response.status(403).json({ message: 'Admin access is required.' });
    return;
  }

  next();
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: String(process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true',
    user,
    pass,
    from: getEmailFromAddress(),
  };
}

function getSendGridConfig() {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const from = getEmailFromAddress();
  if (!apiKey) return null;
  return { apiKey, from };
}

async function getNodemailer() {
  if (!nodemailerPromise) {
    nodemailerPromise = import('nodemailer')
      .then((module) => module.default ?? module)
      .catch((error) => {
        if (error?.code === 'ERR_MODULE_NOT_FOUND') {
          return null;
        }

        throw error;
      });
  }

  return nodemailerPromise;
}

async function getSendGridMail() {
  if (!sendGridMailPromise) {
    sendGridMailPromise = import('@sendgrid/mail')
      .then((module) => module.default ?? module)
      .catch((error) => {
        if (error?.code === 'ERR_MODULE_NOT_FOUND') {
          return null;
        }

        throw error;
      });
  }

  return sendGridMailPromise;
}

async function getSendGridClient() {
  const config = getSendGridConfig();
  if (!config) return null;

  const sgMail = await getSendGridMail();
  if (!sgMail) return null;

  sgMail.setApiKey(config.apiKey);
  return { sgMail, from: config.from };
}

async function getMailClient() {
  const smtpConfig = getSmtpConfig();

  if (smtpConfig) {
    const nodemailer = await getNodemailer();

    if (nodemailer) {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });

      return {
        from: smtpConfig.from,
        send: (message) => transporter.sendMail({
          from: smtpConfig.from,
          ...message,
        }),
      };
    }
  }

  const sendGridClient = await getSendGridClient();
  if (!sendGridClient) {
    return null;
  }

  return {
    from: sendGridClient.from,
    send: (message) => sendGridClient.sgMail.send({
      from: sendGridClient.from,
      ...message,
    }),
  };
}

async function sendWelcomeEmail({ name, email, accountNumber }) {
  const mailer = await getMailClient();
  if (!mailer) {
    return {
      ok: false,
      configured: false,
      message: 'Email provider is not configured on the server.',
    };
  }
  const formattedAccountNumber = formatAccountNumber(accountNumber);
  const subject = `Welcome to ${BANK_NAME}`;
  const text = [
    `Hello ${name},`,
    '',
    `Your ${BANK_NAME} account has been created successfully.`,
    `Account number: ${formattedAccountNumber}`,
    'Routing number: 031100089',
    '',
    'Your account may require verification before certain incoming transfers can be released.',
    'If you need help, contact customer support.',
    '',
    BANK_NAME,
  ].join('\n');
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">Welcome to ${BANK_NAME}</h2>
      <p>Hello ${name},</p>
      <p>Your ${BANK_NAME} account has been created successfully.</p>
      <p><strong>Account number:</strong> ${formattedAccountNumber}<br /><strong>Routing number:</strong> 031100089</p>
      <p>Your account may require verification before certain incoming transfers can be released.</p>
      <p>If you need help, contact customer support.</p>
      <p style="margin-top: 24px;">${BANK_NAME}</p>
    </div>
  `;
  await mailer.send({
    to: email,
    subject,
    text,
    html,
  });
  return {
    ok: true,
    configured: true,
    message: `Welcome email sent to ${email}.`,
  };
}

async function sendTransferReceivedEmail({ name, email, amount, fromAccount, toAccount, transferDate }) {
  const mailer = await getMailClient();
  if (!mailer) {
    return {
      ok: false,
      configured: false,
      message: 'Email provider is not configured on the server.',
    };
  }
  const subject = 'You have received a transfer';
  const text = [
    `Hello ${name},`,
    '',
    `You have received a transfer of $${amount} to your account (${toAccount}).`,
    fromAccount ? `From: ${fromAccount}` : '',
    transferDate ? `Date: ${transferDate}` : '',
    '',
    'If you have any questions, contact customer support.',
    '',
    BANK_NAME,
  ].filter(Boolean).join('\n');
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">You have received a transfer</h2>
      <p>Hello ${name},</p>
      <p>You have received a transfer of <strong>$${amount}</strong> to your account (<strong>${toAccount}</strong>).</p>
      ${fromAccount ? `<p><strong>From:</strong> ${fromAccount}</p>` : ''}
      ${transferDate ? `<p><strong>Date:</strong> ${transferDate}</p>` : ''}
      <p>If you have any questions, contact customer support.</p>
      <p style="margin-top: 24px;">${BANK_NAME}</p>
    </div>
  `;
  await mailer.send({
    to: email,
    subject,
    text,
    html,
  });
  return {
    ok: true,
    configured: true,
    message: `Transfer received email sent to ${email}.`,
  };
}

async function sendImportantMessageEmail({ name, email, subject, message }) {
  const mailer = await getMailClient();
  if (!mailer) {
    return {
      ok: false,
      configured: false,
      message: 'Email provider is not configured on the server.',
    };
  }
  const emailSubject = subject || `Important message from ${BANK_NAME}`;
  const text = [
    `Hello ${name},`,
    '',
    message,
    '',
    'If you have any questions, contact customer support.',
    '',
    BANK_NAME,
  ].join('\n');
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">${emailSubject}</h2>
      <p>Hello ${name},</p>
      <p>${message}</p>
      <p>If you have any questions, contact customer support.</p>
      <p style="margin-top: 24px;">${BANK_NAME}</p>
    </div>
  `;
  await mailer.send({
    to: email,
    subject: emailSubject,
    text,
    html,
  });
  return {
    ok: true,
    configured: true,
    message: `Important message email sent to ${email}.`,
  };
}

function broadcastEvent(type) {
  const payload = `data: ${JSON.stringify({ type, timestamp: new Date().toISOString() })}\n\n`;

  for (const client of eventClients) {
    client.write(payload);
  }
}

const defaultAccounts = [
  {
    id: 'USR-0001',
    role: 'user',
    status: 'Active',
    verificationStatus: 'Verified',
    name: 'Example User',
    email: 'example.user@demo.local',
    phone: '+1 202 555 0101',
    password: 'ExampleUser!26',
    segment: 'Demo Client',
    avatar: 'EU',
    accounts: [
      { label: 'Savings', amount: 25000.0 },
      { label: 'Current', amount: 8200.5 },
      { label: 'Business', amount: 0 },
    ],
    savedBanks: [
      { id: 'BNK-1001', bankName: 'Demo Credit Union', accountName: 'Example User', accountNumber: '**** 1101' },
    ],
    notifications: [],
    pendingIncomingTransfers: [],
    accountNumber: '1102003004',
    routingNumber: DEFAULT_APEX_ROUTING_NUMBER,
  },
  {
    id: 'ADM-0001',
    role: 'admin',
    status: 'Active',
    verificationStatus: 'Verified',
    name: 'Admin Control',
    email: 'admin@demo.local',
    phone: '+1 202 555 0199',
    password: 'AdminDemo!26',
    segment: 'Demo Admin',
    avatar: 'AD',
    accounts: [],
    savedBanks: [],
    notifications: [],
    pendingIncomingTransfers: [],
  },
];

async function ensureAccountsFile() {
  await mkdir(dataDir, { recursive: true });

  if (!existsSync(accountsFile)) {
    await writeFile(accountsFile, JSON.stringify(defaultAccounts, null, 2), 'utf8');
  }

  if (!existsSync(adminWorkspaceFile)) {
    await writeFile(adminWorkspaceFile, JSON.stringify({}, null, 2), 'utf8');
  }

  if (!existsSync(sessionsFile)) {
    await writeFile(sessionsFile, JSON.stringify({}, null, 2), 'utf8');
  }
}

async function readAccounts() {
  await ensureAccountsFile();

  try {
    const content = await readFile(accountsFile, 'utf8');
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      const normalizedAccounts = parsed.map(normalizeStoredAccount);

      if (JSON.stringify(parsed) !== JSON.stringify(normalizedAccounts)) {
        await writeFile(accountsFile, JSON.stringify(normalizedAccounts, null, 2), 'utf8');
      }

      return normalizedAccounts;
    }

    return defaultAccounts.map(normalizeStoredAccount);
  } catch {
    return defaultAccounts.map(normalizeStoredAccount);
  }
}

async function saveAccounts(accounts) {
  await ensureAccountsFile();
  await writeFile(accountsFile, JSON.stringify(accounts, null, 2), 'utf8');
}

async function readAdminWorkspace() {
  await ensureAccountsFile();

  try {
    const content = await readFile(adminWorkspaceFile, 'utf8');
    const parsed = JSON.parse(content);
    const sanitizedWorkspace = sanitizeAdminWorkspace(parsed);

    if (JSON.stringify(parsed) !== JSON.stringify(sanitizedWorkspace)) {
      await writeFile(adminWorkspaceFile, JSON.stringify(sanitizedWorkspace, null, 2), 'utf8');
    }

    return sanitizedWorkspace;
  } catch {
    return {};
  }
}

async function saveAdminWorkspace(workspace) {
  await ensureAccountsFile();
  await writeFile(adminWorkspaceFile, JSON.stringify(sanitizeAdminWorkspace(workspace), null, 2), 'utf8');
}

async function mutateAdminWorkspace(mutator) {
  const mutation = adminWorkspaceMutationQueue.catch(() => undefined).then(async () => {
    const currentWorkspace = await readAdminWorkspace();
    const nextWorkspace = await mutator(currentWorkspace);
    await saveAdminWorkspace(nextWorkspace);
    return nextWorkspace;
  });

  adminWorkspaceMutationQueue = mutation.then(
    () => undefined,
    () => undefined,
  );

  return mutation;
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, port });
});

app.post('/api/auth/login', async (request, response) => {
  const { identifier, password } = request.body ?? {};
  const accounts = await readAccounts();
  const matchedAccount = findAccountByIdentifier(accounts, identifier);

  if (!matchedAccount || !verifyPassword(password, matchedAccount.password)) {
    response.status(401).json({ message: 'Invalid email/phone or password.' });
    return;
  }

  if (matchedAccount.status === 'Suspended') {
    response.status(403).json({ message: 'This account is suspended.' });
    return;
  }

  const token = await createSession(matchedAccount);
  const payload = await buildAuthPayload(matchedAccount, accounts);

  setSessionCookie(response, token);
  response.json(payload);
});

app.get('/api/auth/session', requireAuth, async (request, response) => {
  const payload = await buildAuthPayload(request.auth.account, request.auth.accounts);
  response.json(payload);
});

app.post('/api/auth/logout', async (request, response) => {
  const token = getRequestToken(request);

  if (token) {
    await deleteSession(token);
  }

  clearSessionCookie(response);
  response.json({ ok: true });
});

app.post('/api/auth/register', async (request, response) => {
  const {
    name,
    email,
    phone,
    password,
    dateOfBirth,
    gender,
    avatarImage,
  } = request.body ?? {};

  const trimmedEmail = String(email ?? '').trim().toLowerCase();
  const trimmedPhone = String(phone ?? '').trim() || '+1 202 555 0100';
  const trimmedName = String(name ?? '').trim() || 'New User';

  if (!trimmedEmail || !password || !dateOfBirth || !gender) {
    response.status(400).json({ message: 'Name, email, password, date of birth, and gender are required.' });
    return;
  }

  const accounts = await readAccounts();

  if (accounts.some((account) => String(account.email ?? '').trim().toLowerCase() === trimmedEmail)) {
    response.status(409).json({ message: 'That email already exists.' });
    return;
  }

  const nextUserIndex = accounts.filter((account) => account.role !== 'admin').length + 1;
  const newAccount = normalizeStoredAccount({
    id: `USR-${String(nextUserIndex).padStart(4, '0')}`,
    role: 'user',
    status: 'Active',
    verificationStatus: 'Pending',
    name: trimmedName,
    email: trimmedEmail,
    phone: trimmedPhone,
    password,
    dateOfBirth,
    gender,
    segment: 'Digital Client',
    avatar: trimmedName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    avatarImage: avatarImage ?? '',
    accounts: [
      { label: 'Savings', amount: 0 },
      { label: 'Current', amount: 0 },
      { label: 'Business', amount: 0 },
    ],
    savedBanks: [],
    notifications: [],
    pendingIncomingTransfers: [],
    accountNumber: generateApexAccountNumber(`${trimmedEmail}-${trimmedPhone}`),
    routingNumber: DEFAULT_APEX_ROUTING_NUMBER,
  });

  const nextAccounts = [...accounts, newAccount];
  await saveAccounts(nextAccounts);
  const token = await createSession(newAccount);
  const payload = await buildAuthPayload(newAccount, nextAccounts);

  setSessionCookie(response, token);
  response.status(201).json(payload);
});

app.get('/api/accounts', requireAuth, async (request, response) => {
  const accounts = await readAccounts();
  response.json({
    accounts: buildVisibleAccounts(accounts, request.auth.account),
    updatedAt: new Date().toISOString(),
  });
});

app.put('/api/accounts', requireAuth, requireAdmin, async (request, response) => {
  const { accounts } = request.body ?? {};

  if (!Array.isArray(accounts)) {
    response.status(400).json({ message: 'Accounts payload must be an array.' });
    return;
  }

  const existingAccounts = await readAccounts();
  const mergedAccounts = mergeAccountsWithStoredPasswords(existingAccounts, accounts);

  await saveAccounts(mergedAccounts.map(normalizeStoredAccount));
  broadcastEvent('accounts');
  response.json({ ok: true, updatedAt: new Date().toISOString() });
});

app.get('/api/admin-workspace', requireAuth, requireAdmin, async (_request, response) => {
  const workspace = await readAdminWorkspace();
  response.json({ workspace, updatedAt: new Date().toISOString() });
});

app.put('/api/admin-workspace', requireAuth, requireAdmin, async (request, response) => {
  const { workspace } = request.body ?? {};

  if (!workspace || typeof workspace !== 'object' || Array.isArray(workspace)) {
    response.status(400).json({ message: 'Workspace payload must be an object.' });
    return;
  }

  await mutateAdminWorkspace(() => workspace);
  broadcastEvent('admin-workspace');
  response.json({ ok: true, updatedAt: new Date().toISOString() });
});

app.post('/api/user-workspace/withdrawals', requireAuth, async (request, response) => {
  if (!ensureRetailUser(request, response)) {
    return;
  }

  const submittedRequest = request.body?.request;

  if (!submittedRequest || typeof submittedRequest !== 'object' || Array.isArray(submittedRequest)) {
    response.status(400).json({ message: 'Withdrawal request payload must be an object.' });
    return;
  }

  const nextRequest = {
    id: toTrimmedString(submittedRequest.id),
    amount: toTrimmedString(submittedRequest.amount),
    destination: toTrimmedString(submittedRequest.destination),
    requested: toTrimmedString(submittedRequest.requested),
    status: 'Pending',
    code: 'Awaiting approval',
    requesterId: request.auth.account.id,
    requesterName: request.auth.account.name,
    supportMessage: toTrimmedString(submittedRequest.supportMessage),
  };

  if (!nextRequest.id || !nextRequest.amount || !nextRequest.destination || !nextRequest.requested || !nextRequest.supportMessage) {
    response.status(400).json({ message: 'Withdrawal request is missing required fields.' });
    return;
  }

  const activityEntry = `${formatWorkspaceTimestamp()} - ${request.auth.account.name} submitted withdrawal request ${nextRequest.id}.`;
  await mutateAdminWorkspace((workspace) => ({
    ...workspace,
    adminNotice: `New withdrawal request received from ${request.auth.account.name}.`,
    adminWithdrawalRecords: [
      nextRequest,
      ...(Array.isArray(workspace.adminWithdrawalRecords) ? workspace.adminWithdrawalRecords : []).filter((entry) => entry.id !== nextRequest.id),
    ],
    adminActivityRecords: prependWorkspaceEntry(workspace.adminActivityRecords, activityEntry, 8),
    adminLiveEvents: prependWorkspaceEntry(workspace.adminLiveEvents, activityEntry, 6),
  }));
  broadcastEvent('admin-workspace');
  response.status(201).json({ request: nextRequest, updatedAt: new Date().toISOString() });
});

app.post('/api/user-workspace/cards', requireAuth, async (request, response) => {
  if (!ensureRetailUser(request, response)) {
    return;
  }

  const submittedRequest = request.body?.request;

  if (!submittedRequest || typeof submittedRequest !== 'object' || Array.isArray(submittedRequest)) {
    response.status(400).json({ message: 'Card request payload must be an object.' });
    return;
  }

  const nextRequest = {
    id: toTrimmedString(submittedRequest.id),
    type: toTrimmedString(submittedRequest.type),
    requested: toTrimmedString(submittedRequest.requested),
    status: 'Pending',
    requesterId: request.auth.account.id,
    requesterName: request.auth.account.name,
  };

  if (!nextRequest.id || !nextRequest.type || !nextRequest.requested) {
    response.status(400).json({ message: 'Card request is missing required fields.' });
    return;
  }

  const activityEntry = `${formatWorkspaceTimestamp()} - ${request.auth.account.name} opened card request ${nextRequest.id}.`;
  await mutateAdminWorkspace((workspace) => ({
    ...workspace,
    adminNotice: `${request.auth.account.name} requested a ${nextRequest.type.toLowerCase().replace(' atm card', '')}.`,
    adminCardRecords: [
      nextRequest,
      ...(Array.isArray(workspace.adminCardRecords) ? workspace.adminCardRecords : []).filter((entry) => entry.id !== nextRequest.id),
    ],
    adminActivityRecords: prependWorkspaceEntry(workspace.adminActivityRecords, activityEntry, 8),
    adminLiveEvents: prependWorkspaceEntry(workspace.adminLiveEvents, activityEntry, 6),
  }));
  broadcastEvent('admin-workspace');
  response.status(201).json({ request: nextRequest, updatedAt: new Date().toISOString() });
});

app.post('/api/user-workspace/cases', requireAuth, async (request, response) => {
  if (!ensureRetailUser(request, response)) {
    return;
  }

  const submittedCase = request.body?.case;

  if (!submittedCase || typeof submittedCase !== 'object' || Array.isArray(submittedCase)) {
    response.status(400).json({ message: 'Case payload must be an object.' });
    return;
  }

  const nextCase = sanitizeUserCaseRecord(submittedCase, request.auth.account);

  if (!nextCase) {
    response.status(400).json({ message: 'Case is missing required fields or contains an unsupported type.' });
    return;
  }

  const activityEntry = `${formatWorkspaceTimestamp()} - ${request.auth.account.name} opened ${nextCase.type.toLowerCase()} request ${nextCase.id}${nextCase.amountRequested ? ` for ${nextCase.amountRequested}` : ''}.`;
  await mutateAdminWorkspace((workspace) => ({
    ...workspace,
    adminNotice: `${nextCase.type} request opened for ${request.auth.account.name}.`,
    adminCaseRecords: [
      nextCase,
      ...(Array.isArray(workspace.adminCaseRecords) ? workspace.adminCaseRecords : []).filter((entry) => entry.id !== nextCase.id),
    ],
    adminActivityRecords: prependWorkspaceEntry(workspace.adminActivityRecords, activityEntry, 8),
    adminLiveEvents: prependWorkspaceEntry(workspace.adminLiveEvents, activityEntry, 6),
  }));
  broadcastEvent('admin-workspace');
  response.status(201).json({ case: nextCase, updatedAt: new Date().toISOString() });
});

app.post('/api/emails/welcome', requireAuth, async (request, response) => {
  const { name, email, accountNumber } = request.body ?? {};

  if (!name || !email || !accountNumber) {
    response.status(400).json({ ok: false, message: 'Name, email, and account number are required.' });
    return;
  }

  const requesterEmail = String(request.auth.account.email ?? '').trim().toLowerCase();
  const requestedEmail = String(email ?? '').trim().toLowerCase();

  if (request.auth.account.role !== 'admin' && requesterEmail !== requestedEmail) {
    response.status(403).json({ ok: false, message: 'You can only send a welcome email for your own account.' });
    return;
  }

  try {
    const result = await sendWelcomeEmail({ name, email, accountNumber });

    if (!result.ok && result.configured === false) {
      response.status(503).json(result);
      return;
    }

    response.json(result);
  } catch (error) {
    response.status(500).json({
      ok: false,
      configured: true,
      message: error instanceof Error ? error.message : 'Failed to send welcome email.',
    });
  }
});

app.post('/api/emails/transfer-received', requireAuth, requireAdmin, async (request, response) => {
  const { name, email, amount, fromAccount, toAccount, transferDate } = request.body ?? {};

  if (!name || !email || !amount || !toAccount) {
    response.status(400).json({ ok: false, message: 'Name, email, amount, and toAccount are required.' });
    return;
  }

  try {
    const result = await sendTransferReceivedEmail({ name, email, amount, fromAccount, toAccount, transferDate });

    if (!result.ok && result.configured === false) {
      response.status(503).json(result);
      return;
    }

    response.json(result);
  } catch (error) {
    response.status(500).json({
      ok: false,
      configured: true,
      message: error instanceof Error ? error.message : 'Failed to send transfer received email.',
    });
  }
});

app.post('/api/emails/important-message', requireAuth, requireAdmin, async (request, response) => {
  const { name, email, subject, message } = request.body ?? {};

  if (!name || !email || !message) {
    response.status(400).json({ ok: false, message: 'Name, email, and message are required.' });
    return;
  }

  try {
    const result = await sendImportantMessageEmail({ name, email, subject, message });

    if (!result.ok && result.configured === false) {
      response.status(503).json(result);
      return;
    }

    response.json(result);
  } catch (error) {
    response.status(500).json({
      ok: false,
      configured: true,
      message: error instanceof Error ? error.message : 'Failed to send important message email.',
    });
  }
});

app.get('/api/events', async (request, response) => {
  const auth = await getAuthenticatedContext(request, response);

  if (!auth) {
    response.status(401).json({ message: 'Authentication is required.' });
    return;
  }

  if (auth.account.role !== 'admin') {
    response.status(403).json({ message: 'Admin access is required.' });
    return;
  }

  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');
  response.flushHeaders?.();

  response.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
  eventClients.add(response);

  request.on('close', () => {
    eventClients.delete(response);
  });
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get(/^(?!\/api).*/, async (_request, response, next) => {
    try {
      const indexHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');
      response.type('html').send(indexHtml);
    } catch (error) {
      next(error);
    }
  });
}

Promise.all([ensureAccountsFile(), loadSessions()]).then(() => {
  app.listen(port, host, () => {
    console.log(`${BANK_WORDMARK} app server running on http://${host}:${port}`);
  });
});