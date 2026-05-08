import React, { useEffect, useMemo, useRef, useState } from 'react';

const LEGACY_STORAGE_KEYS = [
  'pnc-bank-accounts',
  'pnc-bank-active-user',
  'pnc-bank-admin-workspace',
  'pnc-bank-dashboard-mode',
  'pnc-bank-language',
  'pnc-bank-session',
  'pnc-bank-storage-version',
];
const ACCOUNTS_STORAGE_KEY = 'apex-bank-accounts';
const ACTIVE_USER_STORAGE_KEY = 'apex-bank-active-user';
const ADMIN_WORKSPACE_STORAGE_KEY = 'apex-bank-admin-workspace';
const DASHBOARD_MODE_STORAGE_KEY = 'apex-bank-dashboard-mode';
const LANGUAGE_STORAGE_KEY = 'apex-bank-language';
const SESSION_STORAGE_KEY = 'apex-bank-session';
const STORAGE_VERSION_KEY = 'apex-bank-storage-version';
const CURRENT_STORAGE_VERSION = '2026-05-apex-storage-reset';
const CUSTOMER_SERVICE_NUMBER = '(+18005550100)';
const SHARED_ACCOUNTS_API_PORT = 8787;
const APEX_ROUTING_NUMBER = '031100089';
const NOTIFICATION_RETENTION_DAYS = 30;
const PAGE_LOADING_DELAY_MS = 2000;
const TRANSFER_LOADING_MIN_DELAY_MS = 3000;
const TRANSFER_LOADING_MAX_DELAY_MS = 5000;
const GOOGLE_TRANSLATE_SCRIPT_ID = 'apex-google-translate-script';

function getRandomDelay(minDelayMs, maxDelayMs) {
  return Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;
}

function getSharedApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return `http://localhost:${SHARED_ACCOUNTS_API_PORT}`;
  }

  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:${SHARED_ACCOUNTS_API_PORT}`;
  }

  return window.location.origin;
}

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'sq', label: 'Albanian' },
  { value: 'es', label: 'Espa\u00f1ol' },
  { value: 'am', label: 'Amharic' },
  { value: 'hy', label: 'Armenian' },
  { value: 'fr', label: 'Fran\u00e7ais' },
  { value: 'az', label: 'Azerbaijani' },
  { value: 'eu', label: 'Basque' },
  { value: 'be', label: 'Belarusian' },
  { value: 'bn', label: 'Bengali' },
  { value: 'bs', label: 'Bosnian' },
  { value: 'bg', label: 'Bulgarian' },
  { value: 'ca', label: 'Catalan' },
  { value: 'ceb', label: 'Cebuano' },
  { value: 'ny', label: 'Chichewa' },
  { value: 'co', label: 'Corsican' },
  { value: 'hr', label: 'Croatian' },
  { value: 'cs', label: 'Czech' },
  { value: 'da', label: 'Danish' },
  { value: 'de', label: 'Deutsch' },
  { value: 'nl', label: 'Dutch' },
  { value: 'eo', label: 'Esperanto' },
  { value: 'et', label: 'Estonian' },
  { value: 'tl', label: 'Filipino' },
  { value: 'fi', label: 'Finnish' },
  { value: 'pt', label: 'Portugu\u00eas' },
  { value: 'fy', label: 'Frisian' },
  { value: 'gl', label: 'Galician' },
  { value: 'ka', label: 'Georgian' },
  { value: 'el', label: 'Greek' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'ht', label: 'Haitian Creole' },
  { value: 'ha', label: 'Hausa' },
  { value: 'haw', label: 'Hawaiian' },
  { value: 'iw', label: 'Hebrew' },
  { value: 'hi', label: 'Hindi' },
  { value: 'hmn', label: 'Hmong' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'is', label: 'Icelandic' },
  { value: 'ig', label: 'Igbo' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ga', label: 'Irish' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'jw', label: 'Javanese' },
  { value: 'kn', label: 'Kannada' },
  { value: 'kk', label: 'Kazakh' },
  { value: 'km', label: 'Khmer' },
  { value: 'ko', label: 'Korean' },
  { value: 'ku', label: 'Kurdish' },
  { value: 'ky', label: 'Kyrgyz' },
  { value: 'lo', label: 'Lao' },
  { value: 'la', label: 'Latin' },
  { value: 'lv', label: 'Latvian' },
  { value: 'lt', label: 'Lithuanian' },
  { value: 'lb', label: 'Luxembourgish' },
  { value: 'mk', label: 'Macedonian' },
  { value: 'mg', label: 'Malagasy' },
  { value: 'ms', label: 'Malay' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'mt', label: 'Maltese' },
  { value: 'mi', label: 'Maori' },
  { value: 'mr', label: 'Marathi' },
  { value: 'mn', label: 'Mongolian' },
  { value: 'my', label: 'Myanmar' },
  { value: 'ne', label: 'Nepali' },
  { value: 'no', label: 'Norwegian' },
  { value: 'ps', label: 'Pashto' },
  { value: 'fa', label: 'Persian' },
  { value: 'pl', label: 'Polish' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
  { value: 'ro', label: 'Romanian' },
  { value: 'ru', label: 'Russian' },
  { value: 'sm', label: 'Samoan' },
  { value: 'gd', label: 'Scots Gaelic' },
  { value: 'sr', label: 'Serbian' },
  { value: 'st', label: 'Sesotho' },
  { value: 'sn', label: 'Shona' },
  { value: 'sd', label: 'Sindhi' },
  { value: 'si', label: 'Sinhala' },
  { value: 'sk', label: 'Slovak' },
  { value: 'sl', label: 'Slovenian' },
  { value: 'so', label: 'Somali' },
  { value: 'su', label: 'Sundanese' },
  { value: 'sw', label: 'Swahili' },
  { value: 'sv', label: 'Swedish' },
  { value: 'tg', label: 'Tajik' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'th', label: 'Thai' },
  { value: 'tr', label: 'Turkish' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'ur', label: 'Urdu' },
  { value: 'uz', label: 'Uzbek' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'cy', label: 'Welsh' },
  { value: 'xh', label: 'Xhosa' },
  { value: 'yi', label: 'Yiddish' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'zh-CN', label: '\u7b80\u4f53\u4e2d\u6587' },
  { value: 'zh-TW', label: '\u7e41\u9ad4\u4e2d\u6587' },
  { value: 'zu', label: 'Zulu' },
];

const loadingScreenContent = {
  default: {
    eyebrow: 'Preparing Session',
    title: 'Loading your workspace',
    message: 'Please wait while we prepare the next banking view.',
    tone: 'teal',
  },
  'public-home': {
    eyebrow: 'Landing Page',
    title: 'Opening Apex home',
    message: 'Loading the main banking experience and feature highlights.',
    tone: 'blue',
  },
  'public-about': {
    eyebrow: 'About Apex',
    title: 'Loading the story page',
    message: 'Preparing the Apex Bank overview, trust message, and service highlights.',
    tone: 'gold',
  },
  'auth-login': {
    eyebrow: 'Secure Sign-In',
    title: 'Preparing login access',
    message: 'Checking credentials and opening the correct dashboard experience.',
    tone: 'teal',
  },
  'auth-register': {
    eyebrow: 'Account Setup',
    title: 'Creating local banking access',
    message: 'Preparing your account profile, routing details, and dashboard access.',
    tone: 'violet',
  },
  'dashboard-user': {
    eyebrow: 'User Dashboard',
    title: 'Opening customer banking',
    message: 'Loading accounts, cards, balances, and your personal banking tools.',
    tone: 'teal',
  },
  'dashboard-admin': {
    eyebrow: 'Admin Desk',
    title: 'Opening operations control',
    message: 'Loading customer oversight, transactions, and live service controls.',
    tone: 'blue',
  },
  'user-page-dashboard': {
    eyebrow: 'Dashboard',
    title: 'Refreshing account overview',
    message: 'Loading balances, recent activity, and quick actions.',
    tone: 'teal',
  },
  'user-page-accounts': {
    eyebrow: 'Accounts',
    title: 'Opening account views',
    message: 'Loading balance details, transaction tools, and account shortcuts.',
    tone: 'teal',
  },
  'user-page-profile': {
    eyebrow: 'Profile',
    title: 'Opening profile details',
    message: 'Loading customer identity details, support links, and account settings.',
    tone: 'blue',
  },
  'user-page-transfers': {
    eyebrow: 'Transfers',
    title: 'Opening transfer desk',
    message: 'Preparing recipient details, account routing, and transfer controls.',
    tone: 'blue',
  },
  'user-page-bill-pay': {
    eyebrow: 'Bill Pay',
    title: 'Loading bill payment tools',
    message: 'Preparing references, billers, and source account options.',
    tone: 'gold',
  },
  'user-page-withdrawals': {
    eyebrow: 'Withdrawals',
    title: 'Opening withdrawal request desk',
    message: 'Preparing linked banks, request forms, and payout guidance.',
    tone: 'rose',
  },
  'user-page-add-money': {
    eyebrow: 'Add Money',
    title: 'Loading funding details',
    message: 'Preparing transfer instructions and account funding references.',
    tone: 'violet',
  },
  'user-page-cards': {
    eyebrow: 'Cards',
    title: 'Opening card center',
    message: 'Loading issued cards, card requests, and issuance status.',
    tone: 'violet',
  },
  'user-page-support': {
    eyebrow: 'Support',
    title: 'Opening support desk',
    message: 'Preparing service channels, support templates, and case history.',
    tone: 'blue',
  },
  'user-page-security': {
    eyebrow: 'Security',
    title: 'Opening security controls',
    message: 'Loading alerts, biometrics, and card lock settings.',
    tone: 'rose',
  },
  'user-page-loans': {
    eyebrow: 'Loans',
    title: 'Opening lending workspace',
    message: 'Preparing loan products, tenor options, and request tools.',
    tone: 'gold',
  },
  'user-page-investments': {
    eyebrow: 'Investments',
    title: 'Opening wealth tools',
    message: 'Preparing portfolio options, funding accounts, and request forms.',
    tone: 'violet',
  },
  'user-page-receipt': {
    eyebrow: 'Receipt',
    title: 'Preparing payment receipt',
    message: 'Loading confirmation details, destination records, and proof of payment.',
    tone: 'teal',
  },
  'user-page-notifications': {
    eyebrow: 'Notifications',
    title: 'Opening message center',
    message: 'Loading account alerts, funding messages, and service notices.',
    tone: 'blue',
  },
  'action-transfer': {
    eyebrow: 'Transfer In Progress',
    title: 'Processing bank transfer',
    message: 'Validating account balance, recipient route, and transfer reference.',
    tone: 'blue',
  },
  'action-bill': {
    eyebrow: 'Bill Payment',
    title: 'Processing bill payment',
    message: 'Verifying source funds, payment reference, and biller details.',
    tone: 'gold',
  },
  'action-withdrawal': {
    eyebrow: 'Withdrawal Request',
    title: 'Submitting withdrawal',
    message: 'Preparing payout request, support code details, and review routing.',
    tone: 'rose',
  },
  'action-card': {
    eyebrow: 'Card Request',
    title: 'Submitting card request',
    message: 'Preparing card issuance request for operations review.',
    tone: 'violet',
  },
  'action-support': {
    eyebrow: 'Support Request',
    title: 'Opening support case',
    message: 'Routing your issue, priority level, and service details to the desk.',
    tone: 'blue',
  },
  'action-loan': {
    eyebrow: 'Loan Request',
    title: 'Submitting lending request',
    message: 'Reviewing amount, tenor, and product details before routing.',
    tone: 'gold',
  },
  'action-investment': {
    eyebrow: 'Investment Request',
    title: 'Submitting investment request',
    message: 'Reviewing funding amount, plan, and advisor routing details.',
    tone: 'violet',
  },
  'action-bank': {
    eyebrow: 'Bank Setup',
    title: 'Adding withdrawal bank',
    message: 'Saving linked bank details for future withdrawal requests.',
    tone: 'teal',
  },
  'action-admin-funding': {
    eyebrow: 'Admin Funding',
    title: 'Posting customer funds',
    message: 'Crediting the selected customer account and preparing the receipt.',
    tone: 'gold',
  },
  'admin-users-management': {
    eyebrow: 'Users Management',
    title: 'Opening customer directory',
    message: 'Loading customer records, statuses, and operational controls.',
    tone: 'blue',
  },
  'admin-transactions': {
    eyebrow: 'Transactions',
    title: 'Opening transaction desk',
    message: 'Loading transaction queues, review state, and risk signals.',
    tone: 'gold',
  },
  'admin-withdrawal-requests': {
    eyebrow: 'Withdrawals Desk',
    title: 'Opening withdrawal requests',
    message: 'Loading queued requests, codes, and approval controls.',
    tone: 'rose',
  },
  'admin-card-requests': {
    eyebrow: 'Card Requests',
    title: 'Opening card operations',
    message: 'Loading pending issuance requests and fulfillment status.',
    tone: 'violet',
  },
  'admin-loans-management': {
    eyebrow: 'Loans And Investments',
    title: 'Opening portfolio review',
    message: 'Loading lending, investment, and advisory review items.',
    tone: 'gold',
  },
  'admin-reports-&-analytics': {
    eyebrow: 'Reports And Analytics',
    title: 'Opening reporting suite',
    message: 'Preparing exports, performance metrics, and operational summaries.',
    tone: 'blue',
  },
  'admin-fraud-monitoring': {
    eyebrow: 'Fraud Monitoring',
    title: 'Opening monitoring desk',
    message: 'Loading alerts, risky events, and suspicious activity reviews.',
    tone: 'rose',
  },
  'admin-settings': {
    eyebrow: 'Admin Settings',
    title: 'Opening control settings',
    message: 'Loading notification, access, and security preferences.',
    tone: 'teal',
  },
  'admin-user-workspace': {
    eyebrow: 'Customer Workspace',
    title: 'Opening customer workspace',
    message: 'Loading customer balances, controls, activity, and service details.',
    tone: 'violet',
  },
  'admin-workspace-overview': {
    eyebrow: 'Workspace Overview',
    title: 'Loading overview section',
    message: 'Preparing balances, identity details, and operational summary.',
    tone: 'teal',
  },
  'admin-workspace-funding': {
    eyebrow: 'Workspace Funding',
    title: 'Loading funding section',
    message: 'Preparing account funding controls and recent posting receipt.',
    tone: 'gold',
  },
  'admin-workspace-controls': {
    eyebrow: 'Workspace Controls',
    title: 'Loading control section',
    message: 'Preparing profile edits, limits, and privileged actions.',
    tone: 'blue',
  },
  'admin-workspace-activity': {
    eyebrow: 'Workspace Activity',
    title: 'Loading activity section',
    message: 'Preparing cases, withdrawals, and linked customer history.',
    tone: 'rose',
  },
};

function getLoadingScreenContent(flowKey) {
  return loadingScreenContent[flowKey] ?? loadingScreenContent.default;
}

function getTranslateComboElement() {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector('.goog-te-combo');
}

function applyGoogleTranslateLanguage(nextLanguage) {
  const combo = getTranslateComboElement();

  if (!combo) {
    return false;
  }

  if (combo.value === nextLanguage) {
    return true;
  }

  combo.value = nextLanguage;
  combo.dispatchEvent(new Event('change'));
  return true;
}

function getLoadingIcon(flowKey = '') {
  if (/transfer|transactions?/.test(flowKey)) {
    return 'TX';
  }

  if (/bill/.test(flowKey)) {
    return 'BIL';
  }

  if (/withdraw/.test(flowKey)) {
    return 'WD';
  }

  if (/card/.test(flowKey)) {
    return 'CRD';
  }

  if (/support/.test(flowKey)) {
    return 'SUP';
  }

  if (/loan/.test(flowKey)) {
    return 'LN';
  }

  if (/investment/.test(flowKey)) {
    return 'INV';
  }

  if (/security|fraud/.test(flowKey)) {
    return 'SEC';
  }

  if (/notification|message/.test(flowKey)) {
    return 'MSG';
  }

  if (/receipt/.test(flowKey)) {
    return 'RCP';
  }

  if (/funding|add-money|bank/.test(flowKey)) {
    return 'FND';
  }

  if (/admin|workspace|users-management|reports|settings/.test(flowKey)) {
    return 'ADM';
  }

  if (/auth-login/.test(flowKey)) {
    return 'IN';
  }

  if (/auth-register/.test(flowKey)) {
    return 'NEW';
  }

  return 'APX';
}

const seededAccounts = [
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
    notifications: [],
    pendingIncomingTransfers: [],
    savedBanks: [
      { id: 'BNK-1001', bankName: 'Demo Credit Union', accountName: 'Example User', accountNumber: '**** 1101' },
    ],
    accountNumber: '1102003004',
    routingNumber: APEX_ROUTING_NUMBER,
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
    notifications: [],
    pendingIncomingTransfers: [],
    savedBanks: [],
  },
];

const userNav = [
  'Dashboard',
  'Accounts',
  'Transfers',
  'Cards',
  'Loans',
  'Investments',
  'Insurance',
  'Settings',
  'Logout',
];

const adminNav = [
  'Overview',
  'Users Management',
  'Transactions',
  'Withdrawal Requests',
  'Card Requests',
  'Loans Management',
  'Reports & Analytics',
  'Fraud Monitoring',
  'Settings',
];

const quickActions = [
  { label: 'Send Money', icon: '↗' },
  { label: 'Request Money', icon: '↙' },
  { label: 'Pay Bills', icon: '◎' },
  { label: 'Buy Airtime', icon: '◌' },
];

const mobileQuickActions = [
  { label: 'Send Money', icon: '↗' },
  { label: 'Withdraw', icon: '↓' },
  { label: 'Add Money', icon: '+' },
  { label: 'More', icon: '⋯' },
];

const bottomNavItems = [
  { label: 'Dashboard', icon: '⌂' },
  { label: 'Accounts', icon: '№' },
  { label: 'Cards', icon: '▣' },
  { label: 'Profile', icon: '◉' },
];

const spendingCategories = [
  { name: 'Lifestyle', amount: '$2,480', percent: 68 },
  { name: 'Utilities', amount: '$1,140', percent: 49 },
  { name: 'Travel', amount: '$860', percent: 34 },
  { name: 'Investments', amount: '$3,920', percent: 82 },
];

const transactions = [
  {
    id: 'TX-1001',
    name: 'Netflix Premium',
    type: 'Subscription',
    amount: '-$24.99',
    date: 'Apr 07, 2026',
    status: 'Completed',
  },
  {
    id: 'TX-1002',
    name: 'Salary Credit',
    type: 'Income',
    amount: '+$8,400.00',
    date: 'Apr 06, 2026',
    status: 'Completed',
  },
  {
    id: 'TX-1003',
    name: 'BlueJet Airlines',
    type: 'Travel',
    amount: '-$640.00',
    date: 'Apr 05, 2026',
    status: 'Completed',
  },
  {
    id: 'TX-1004',
    name: 'Apex Investment Fund',
    type: 'Investment',
    amount: '-$1,250.00',
    date: 'Apr 03, 2026',
    status: 'Pending',
  },
  {
    id: 'TX-1005',
    name: 'Utility Board',
    type: 'Bills',
    amount: '-$186.40',
    date: 'Apr 02, 2026',
    status: 'Completed',
  },
];

const withdrawalRequests = [
  {
    id: 'WD-2110',
    amount: '$2,500.00',
    destination: 'Apex Platinum Checking',
    requested: 'Apr 06, 2026',
    status: 'Pending',
    code: 'Awaiting approval',
  },
  {
    id: 'WD-2104',
    amount: '$1,200.00',
    destination: 'External Bank Transfer',
    requested: 'Apr 04, 2026',
    status: 'Approved',
    code: 'APX-882194',
  },
  {
    id: 'WD-2098',
    amount: '$320.00',
    destination: 'Cash Desk Pickup',
    requested: 'Apr 01, 2026',
    status: 'Rejected',
    code: 'Not issued',
  },
];

const cardRequests = [
  {
    id: 'VC-301',
    type: 'Virtual ATM Card',
    requested: 'Apr 05, 2026',
    status: 'Pending',
  },
  {
    id: 'VC-287',
    type: 'Virtual ATM Card',
    requested: 'Mar 31, 2026',
    status: 'Approved',
  },
  {
    id: 'VC-276',
    type: 'Virtual ATM Card',
    requested: 'Mar 28, 2026',
    status: 'Rejected',
  },
];

const cardProductCatalog = {
  'Physical Card': {
    eyebrow: 'Physical Card',
    title: 'Mastercard Card - Vibe',
    subtitle: 'Credit & Debit, All-In-One Card',
    network: 'Mastercard World',
    number: '5314  7788  2044  8842',
    expires: '08/29',
    themeClass: 'physical',
  },
  'Virtual Card': {
    eyebrow: 'Virtual Card',
    title: 'Mastercard Digital Edge',
    subtitle: 'Credit & Debit, All-In-One Card',
    network: 'Mastercard Debit',
    number: '5314  9901  6652  8842',
    expires: '08/29',
    themeClass: 'virtual',
  },
};

function getCardModeFromRequestType(requestType = '') {
  if (/physical/i.test(requestType)) {
    return 'Physical Card';
  }

  if (/virtual/i.test(requestType)) {
    return 'Virtual Card';
  }

  return null;
}

function getSeedIssuedCards(account) {
  const existingIssuedCards = account.issuedCards ?? [];

  if (existingIssuedCards.length > 0 || account.role === 'admin') {
    return existingIssuedCards;
  }

  const isSeedExampleUser = account.id === 'USR-0001' || String(account.email ?? '').toLowerCase() === 'example.user@demo.local';

  if (!isSeedExampleUser) {
    return existingIssuedCards;
  }

  const seededProduct = cardProductCatalog['Physical Card'];

  return [
    {
      id: 'CARD-SEED-USR-0001',
      requestId: 'CARD-SEED-USR-0001',
      type: 'Physical Debit Card - Generated',
      cardMode: 'Physical Card',
      status: 'Active',
      requested: 'Apr 05, 2026',
      issuedAt: '2026-04-05T09:30:00.000Z',
      network: seededProduct.network,
      maskedNumber: `**** ${seededProduct.number.replace(/\D/g, '').slice(-4)}`,
      issuedBy: 'Apex Demo Seed',
    },
  ];
}

const cardBenefitItems = [
  { icon: '◔', title: 'Get up to $500,000 Credit limit' },
  { icon: '◎', title: 'Lowest to 0.1% Daily Interest' },
  { icon: '◌', title: 'Zero Maintenance Fee' },
];

const notificationItems = [
  {
    title: 'Example User withdrawal review',
    audience: 'Example User',
    channel: 'In-app + Email',
    status: 'Queued',
  },
  {
    title: 'Admin authentication enabled',
    audience: 'Admin Control',
    channel: 'Push',
    status: 'Delivered',
  },
];

const activityLogs = [
  '09:40 - Admin Control reviewed Example User account access.',
  '09:22 - Security reset removed legacy seeded customers.',
  '09:10 - API authentication requirement was enabled.',
  '08:55 - Demo workspace prepared for local review.',
];

const adminUsers = [];

const liveFeed = [
  '09:42 - Example User workspace refreshed after security reset.',
  '09:37 - Admin Control signed in to the protected dashboard.',
  '09:31 - Legacy customer records were removed from the admin view.',
  '09:18 - Session tokens are now required for API access.',
];

const landingNav = ['Personal', 'Business', 'Corporate', 'About Us'];

const landingFeatures = [
  {
    icon: '◈',
    title: 'Security You Can Trust',
    text: 'Your security is our priority.',
  },
  {
    icon: '▮▮▮',
    title: 'Financial Strength',
    text: 'Built on a foundation of trust.',
  },
  {
    icon: '◌',
    title: 'Smarter Solutions',
    text: 'Innovative banking for today.',
  },
  {
    icon: '◔',
    title: 'Here to Help',
    text: 'Support when you need it.',
  },
];

const aboutUsMessage = [
  'At Apex Bank, we deliver secure, high-touch financial services designed for clients who expect discretion, speed, and control.',
  'Founded on the principles of trust, transparency, and excellence, we provide a wide range of banking services including savings, transfers, virtual cards, and digital financial management - all designed to make banking simple and accessible.',
  'Our mission is to combine stability with innovation. We leverage modern technology to ensure fast, secure transactions while maintaining the highest standards of customer protection.',
  'We believe banking should be easy, safe, and always within reach. That\'s why we focus on user-friendly digital experiences, real-time support, and smart financial tools tailored to your needs.',
  'At Apex Bank, your financial growth remains the standard we build around.',
];

const publicPageContent = {
  home: {
    label: '',
    title: 'Private banking\nwith a sharper edge',
    description: 'Apex Bank combines elevated service, modern control, and secure digital access for ambitious clients.',
    primaryAction: 'Get Started',
    secondaryAction: 'Learn More',
    sideType: 'brand',
  },
  personal: {
    label: 'Personal Banking',
    title: 'Everyday banking designed around your life.',
    description:
      'Manage savings, transfers, payments, cards, and daily financial planning from one secure digital experience built for speed and clarity.',
    primaryAction: 'Open Personal Access',
    secondaryAction: 'Back Home',
    sideType: 'highlights',
    highlights: [
      { title: 'Smart Accounts', text: 'Flexible savings and current accounts with instant visibility.' },
      { title: 'Fast Payments', text: 'Send money, pay bills, and track transactions in real time.' },
      { title: 'Digital Control', text: 'Manage cards, alerts, and spending tools from anywhere.' },
    ],
  },
  business: {
    label: 'Business Banking',
    title: 'Tools that help businesses move with confidence.',
    description:
      'Support operations, payroll, collections, and cashflow with secure banking services tailored to growing teams and modern business needs.',
    primaryAction: 'Explore Business Services',
    secondaryAction: 'Back Home',
    sideType: 'highlights',
    highlights: [
      { title: 'Cashflow Visibility', text: 'Track balances, outgoing payments, and operating liquidity.' },
      { title: 'Operational Support', text: 'Built for transfers, approvals, and multi-account management.' },
      { title: 'Scalable Banking', text: 'Banking infrastructure that grows with your company.' },
    ],
  },
  corporate: {
    label: 'Corporate Banking',
    title: 'Structured financial services for complex organizations.',
    description:
      'Access secure treasury workflows, transaction oversight, and enterprise-grade controls for institutions operating at scale.',
    primaryAction: 'View Corporate Solutions',
    secondaryAction: 'Back Home',
    sideType: 'highlights',
    highlights: [
      { title: 'Treasury Control', text: 'Advanced oversight for high-volume transactions and settlements.' },
      { title: 'Enterprise Security', text: 'Permissioned access, audit trails, and monitoring workflows.' },
      { title: 'Strategic Support', text: 'Reliable infrastructure for institutional financial operations.' },
    ],
  },
  about: {
    label: 'About Apex Bank',
    title: 'Built on trust. Designed for growth.',
    description: aboutUsMessage[0],
    primaryAction: 'Back Home',
    secondaryAction: 'Log In',
    sideType: 'highlights',
    highlights: [
      { title: 'Trust', text: 'Transparent, stable financial services.' },
      { title: 'Innovation', text: 'Modern tools built for speed and protection.' },
      { title: 'Support', text: 'User-friendly experiences with real-time assistance.' },
    ],
  },
  login: {
    label: 'Secure Sign In',
    title: 'Access your dashboard with your Apex Bank credentials.',
    description: 'Sign in to manage balances, transfers, cards, verification updates, and customer support in one place.',
    primaryAction: 'Sign In',
    secondaryAction: 'Create Account',
    sideType: 'auth',
  },
  register: {
    label: 'Open An Account',
    title: 'Create your Apex Bank profile and receive your account details instantly.',
    description:
      'Register to get a local Apex Bank account number, start using your dashboard, and move into verification review for inbound transfers.',
    primaryAction: 'Create Account',
    secondaryAction: 'Log In',
    sideType: 'auth',
  },
};

const incomeTrend = [38, 52, 44, 68, 59, 76, 72, 88, 81, 96, 90, 102];
const expenseTrend = [22, 28, 24, 32, 39, 46, 43, 52, 50, 63, 57, 61];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
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

function formatCardNumber(cardNumber, { masked = false } = {}) {
  const cleaned = String(cardNumber ?? '').replace(/\D/g, '');

  if (!cleaned) {
    return 'Not available';
  }

  if (!masked) {
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  }

  if (cleaned.length <= 8) {
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  }

  const maskedDigits = `${cleaned.slice(0, 4)}${'*'.repeat(Math.max(cleaned.length - 8, 0))}${cleaned.slice(-4)}`;
  return maskedDigits.replace(/(.{4})/g, '$1 ').trim();
}

function formatActionTimestamp(value) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function slugifyReceiptSegment(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'confirmation';
}

function getWhatsAppContactHref(phoneNumber, message = '') {
  const normalizedNumber = String(phoneNumber ?? '').replace(/\D/g, '');

  if (!normalizedNumber) {
    return '#';
  }

  return message
    ? `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${normalizedNumber}`;
}

function buildConfirmationExportText({ eyebrow, title, message, auditLabel, createdAt, details = [], nextStep }) {
  const lines = [
    'APEX BANK CONFIRMATION',
    eyebrow ? `Type: ${eyebrow}` : null,
    title ? `Title: ${title}` : null,
    message ? `Message: ${message}` : null,
    auditLabel ? `Audit: ${auditLabel}` : null,
    createdAt ? `Logged: ${createdAt}` : null,
    details.length ? '' : null,
    details.length ? 'DETAILS' : null,
    ...details.map((entry) => `${entry.label}: ${entry.value}`),
    nextStep ? '' : null,
    nextStep ? `Next Step: ${nextStep}` : null,
  ].filter(Boolean);

  return lines.join('\n');
}

function downloadTextDocument(filename, content) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const href = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(href);
  return true;
}

function downloadBlobDocument(filename, blob) {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !blob) {
    return false;
  }

  const href = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(href);
  return true;
}

function wrapCanvasText(context, text, maxWidth) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return [''];
  }

  const lines = [];
  let currentLine = words[0];

  for (let index = 1; index < words.length; index += 1) {
    const nextLine = `${currentLine} ${words[index]}`;

    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
    } else {
      lines.push(currentLine);
      currentLine = words[index];
    }
  }

  lines.push(currentLine);
  return lines;
}

async function createReceiptImageBlob({ receipt, customerName }) {
  if (typeof document === 'undefined' || !receipt) {
    return null;
  }

  const canvas = document.createElement('canvas');
  const width = 1400;
  const height = 1760;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#08111f');
  gradient.addColorStop(0.6, '#0a1a32');
  gradient.addColorStop(1, '#13284a');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let index = 0; index < 10; index += 1) {
    const offset = 120 + (index * 120);
    context.fillRect(offset, 0, 2, height);
    context.fillRect(0, offset, width, 2);
  }

  const cardX = 90;
  const cardY = 90;
  const cardWidth = width - 180;
  const cardHeight = height - 180;
  const radius = 38;

  context.beginPath();
  context.moveTo(cardX + radius, cardY);
  context.lineTo(cardX + cardWidth - radius, cardY);
  context.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
  context.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
  context.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
  context.lineTo(cardX + radius, cardY + cardHeight);
  context.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
  context.lineTo(cardX, cardY + radius);
  context.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
  context.closePath();
  context.fillStyle = '#f7fafc';
  context.fill();

  const headerGradient = context.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + 260);
  headerGradient.addColorStop(0, '#0e67ad');
  headerGradient.addColorStop(1, '#1b86c8');
  context.fillStyle = headerGradient;
  context.fillRect(cardX, cardY, cardWidth, 260);

  context.fillStyle = '#ffffff';
  context.font = '700 74px Georgia';
  context.fillText('APEX BANK', cardX + 70, cardY + 108);
  context.font = '500 34px Segoe UI';
  context.fillText('Transfer Receipt', cardX + 70, cardY + 164);
  context.font = '500 28px Segoe UI';
  context.fillStyle = 'rgba(255, 255, 255, 0.84)';
  context.fillText(`Generated for ${customerName}`, cardX + 70, cardY + 214);

  const detailEntries = [
    ['Reference', receipt.id],
    ['Beneficiary', receipt.name],
    ['Type', receipt.type],
    ['Amount', receipt.amount],
    ['Date', receipt.date],
    ['Status', receipt.status],
    ...(receipt.destination ? [['Destination', receipt.destination]] : []),
    ...(receipt.note ? [['Note', receipt.note]] : []),
  ];

  let rowY = cardY + 340;
  detailEntries.forEach(([label, value]) => {
    context.fillStyle = '#6b7d93';
    context.font = '600 24px Segoe UI';
    context.fillText(String(label).toUpperCase(), cardX + 70, rowY);

    context.fillStyle = label === 'Amount' ? (String(value).startsWith('+') ? '#0c9b79' : '#d1495b') : '#10263d';
    context.font = label === 'Amount' ? '700 42px Segoe UI' : '600 38px Segoe UI';
    const wrappedLines = wrapCanvasText(context, String(value ?? ''), cardWidth - 140);
    let lineY = rowY + 54;
    wrappedLines.forEach((line) => {
      context.fillText(line, cardX + 70, lineY);
      lineY += label === 'Amount' ? 52 : 46;
    });

    rowY = lineY + 30;
    context.fillStyle = 'rgba(16, 38, 61, 0.08)';
    context.fillRect(cardX + 70, rowY - 6, cardWidth - 140, 2);
    rowY += 34;
  });

  context.fillStyle = '#35506c';
  context.font = '500 26px Segoe UI';
  context.fillText(`WhatsApp customer service: ${CUSTOMER_SERVICE_NUMBER}`, cardX + 70, cardY + cardHeight - 120);
  context.fillText('This receipt can be shared as proof of payment.', cardX + 70, cardY + cardHeight - 72);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function normalizeNotificationEntry(entry) {
  return {
    ...entry,
    id: entry.id ?? `NOTICE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: entry.title ?? (entry.type === 'verification-hold' ? 'Incoming transfer on hold' : 'Account update'),
    message: entry.message ?? '',
    createdAt: entry.createdAt ?? new Date().toISOString(),
    readAt: entry.readAt ?? null,
  };
}

function isNotificationExpired(entry) {
  const createdAt = new Date(entry?.createdAt ?? 0).getTime();

  if (!createdAt) {
    return false;
  }

  return Date.now() - createdAt > NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function getNotificationPreview(message) {
  const normalizedMessage = String(message ?? '').trim();

  if (!normalizedMessage) {
    return 'No message preview available.';
  }

  const sentenceParts = normalizedMessage.match(/[^.!?]+[.!?]?/g)?.map((part) => part.trim()).filter(Boolean) ?? [];

  if (sentenceParts.length > 0) {
    return sentenceParts.slice(0, 5).join(' ');
  }

  return normalizedMessage.split(/\s+/).slice(0, 25).join(' ');
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ApexBrand({ className = '', showTagline = false }) {
  const brandClassName = ['apex-brand', className].filter(Boolean).join(' ');

  return (
    <div className={brandClassName} aria-label="Apex Bank">
      <svg
        className="apex-brand-symbol"
        viewBox="0 0 96 96"
        role="img"
        aria-hidden="true"
      >
        <rect x="8" y="8" width="80" height="80" rx="24" fill="#0f172a" />
        <path fill="#d4af37" d="M26 70 45 24h6l19 46h-9.5l-4.1-10.8H39.7L35.5 70H26Zm16.7-18.1h10.8L48 37.4l-5.3 14.5Z" />
        <path
          fill="#f8e7a1"
          d="M32 30h32v4H32zm6 10h20v4H38z"
        />
      </svg>
      <div className="apex-brand-copy">
        <strong>APEX BANK</strong>
        {showTagline ? <span>private banking for the exceptional</span> : null}
      </div>
    </div>
  );
}

function AvatarBadge({ className = '', imageSrc = '', fallback = '', alt = 'Profile photo' }) {
  return (
    <div className={className}>
      {imageSrc ? <img src={imageSrc} alt={alt} /> : fallback}
    </div>
  );
}

function readStorage(key) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const currentVersion = window.localStorage.getItem(STORAGE_VERSION_KEY);

    if (currentVersion !== CURRENT_STORAGE_VERSION) {
      LEGACY_STORAGE_KEYS.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
      window.localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
      window.localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      window.localStorage.removeItem(ADMIN_WORKSPACE_STORAGE_KEY);
      window.localStorage.removeItem(DASHBOARD_MODE_STORAGE_KEY);
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
    }

    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function getSharedAccountsApiUrl() {
  return `${getSharedApiBaseUrl()}/api/accounts`;
}

function getSharedAdminWorkspaceApiUrl() {
  return `${getSharedApiBaseUrl()}/api/admin-workspace`;
}

function getUserWithdrawalRequestsApiUrl() {
  return `${getSharedApiBaseUrl()}/api/user-workspace/withdrawals`;
}

function getUserCardRequestsApiUrl() {
  return `${getSharedApiBaseUrl()}/api/user-workspace/cards`;
}

function getUserCaseRequestsApiUrl() {
  return `${getSharedApiBaseUrl()}/api/user-workspace/cases`;
}

function getSharedEventsApiUrl(sessionToken = '') {
  return `${getSharedApiBaseUrl()}/api/events`;
}

function getWelcomeEmailApiUrl() {
  return `${getSharedApiBaseUrl()}/api/emails/welcome`;
}

function getTransferReceivedEmailApiUrl() {
  return `${getSharedApiBaseUrl()}/api/emails/transfer-received`;
}

function getLoginApiUrl() {
  return `${getSharedApiBaseUrl()}/api/auth/login`;
}

function getRegisterApiUrl() {
  return `${getSharedApiBaseUrl()}/api/auth/register`;
}

function getSessionApiUrl() {
  return `${getSharedApiBaseUrl()}/api/auth/session`;
}

function getLogoutApiUrl() {
  return `${getSharedApiBaseUrl()}/api/auth/logout`;
}

function buildAuthorizedHeaders(sessionToken, extraHeaders = {}) {
  return extraHeaders;
}

function buildCredentialedRequest(init = {}) {
  return {
    ...init,
    credentials: 'include',
    headers: init.headers ?? {},
  };
}

function loadStoredSession() {
  return null;
}

async function loginRemoteSession({ identifier, password }) {
  const response = await fetch(getLoginApiUrl(), buildCredentialedRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  }));

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to sign in right now.');
  }

  return payload;
}

async function registerRemoteSession(payload) {
  const response = await fetch(getRegisterApiUrl(), buildCredentialedRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }));

  const parsed = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(parsed.message ?? 'Unable to create the account right now.');
  }

  return parsed;
}

async function fetchRemoteAccounts(sessionToken) {
  const response = await fetch(getSharedAccountsApiUrl(), buildCredentialedRequest({
    headers: buildAuthorizedHeaders(sessionToken),
  }));

  if (!response.ok) {
    throw new Error('Failed to fetch shared accounts.');
  }

  const payload = await response.json();
  return Array.isArray(payload.accounts) ? payload.accounts : [];
}

async function saveRemoteAccounts(sessionToken, accounts) {
  const response = await fetch(getSharedAccountsApiUrl(), buildCredentialedRequest({
    method: 'PUT',
    headers: buildAuthorizedHeaders(sessionToken, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ accounts }),
  }));

  if (!response.ok) {
    throw new Error('Failed to save shared accounts.');
  }

  return response.json();
}

async function fetchRemoteAdminWorkspace(sessionToken) {
  const response = await fetch(getSharedAdminWorkspaceApiUrl(), buildCredentialedRequest({
    headers: buildAuthorizedHeaders(sessionToken),
  }));

  if (!response.ok) {
    throw new Error('Failed to fetch shared admin workspace.');
  }

  const payload = await response.json();
  return payload.workspace && typeof payload.workspace === 'object' ? payload.workspace : {};
}

async function saveRemoteAdminWorkspace(sessionToken, workspace) {
  const response = await fetch(getSharedAdminWorkspaceApiUrl(), buildCredentialedRequest({
    method: 'PUT',
    headers: buildAuthorizedHeaders(sessionToken, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ workspace }),
  }));

  if (!response.ok) {
    throw new Error('Failed to save shared admin workspace.');
  }

  return response.json();
}

async function submitRemoteUserWithdrawal(request) {
  const response = await fetch(getUserWithdrawalRequestsApiUrl(), buildCredentialedRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ request }),
  }));

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Failed to submit withdrawal request.');
  }

  return payload.request;
}

async function submitRemoteUserCardRequest(request) {
  const response = await fetch(getUserCardRequestsApiUrl(), buildCredentialedRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ request }),
  }));

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Failed to submit card request.');
  }

  return payload.request;
}

async function submitRemoteUserCase(caseRecord) {
  const response = await fetch(getUserCaseRequestsApiUrl(), buildCredentialedRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ case: caseRecord }),
  }));

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Failed to submit case request.');
  }

  return payload.case;
}

async function requestWelcomeEmail({ name, email, accountNumber }) {
  try {
    const response = await fetch(getWelcomeEmailApiUrl(), buildCredentialedRequest({
      method: 'POST',
      headers: buildAuthorizedHeaders('', {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ name, email, accountNumber }),
    }));

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        configured: payload.configured ?? true,
        message: payload.message ?? 'Unable to send welcome email right now.',
      };
    }

    return {
      ok: true,
      configured: true,
      message: payload.message ?? `Welcome email sent to ${email}.`,
    };
  } catch {
    return {
      ok: false,
      configured: false,
      message: 'Email service is unavailable right now.',
    };
  }
}

async function requestTransferReceivedEmail({ name, email, amount, fromAccount, toAccount, transferDate, verificationRequired = false }) {
  try {
    const response = await fetch(getTransferReceivedEmailApiUrl(), buildCredentialedRequest({
      method: 'POST',
      headers: buildAuthorizedHeaders('', {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ name, email, amount, fromAccount, toAccount, transferDate, verificationRequired }),
    }));

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        configured: payload.configured ?? true,
        message: payload.message ?? 'Unable to send transfer received email right now.',
      };
    }

    return {
      ok: true,
      configured: true,
      message: payload.message ?? `Transfer received email sent to ${email}.`,
    };
  } catch {
    return {
      ok: false,
      configured: false,
      message: 'Email service is unavailable right now.',
    };
  }
}

function normalizeAccountDefaults(account) {
  const isAdminAccount = account.role === 'admin';
  const accountNumber = isAdminAccount
    ? account.accountNumber ?? ''
    : account.accountNumber ?? generateApexAccountNumber(account.id || account.email || account.phone || account.name);

  return {
    ...account,
    status: account.status ?? 'Active',
    verificationStatus: account.verificationStatus ?? (isAdminAccount ? 'Verified' : 'Verified'),
    savedBanks: account.savedBanks ?? [],
    notifications: (account.notifications ?? []).map(normalizeNotificationEntry),
    issuedCards: getSeedIssuedCards(account),
    pendingIncomingTransfers: account.pendingIncomingTransfers ?? [],
    accountNumber,
    routingNumber: isAdminAccount ? account.routingNumber ?? '' : account.routingNumber ?? APEX_ROUTING_NUMBER,
  };
}

function mergeAccountsWithRemote(localAccounts, remoteAccounts) {
  const normalizedRemoteAccounts = remoteAccounts.map(normalizeAccountDefaults);
  const remoteIds = new Set(normalizedRemoteAccounts.map((account) => account.id));
  const localOnlyAccounts = localAccounts
    .filter((account) => !remoteIds.has(account.id))
    .map(normalizeAccountDefaults);

  return [...normalizedRemoteAccounts, ...localOnlyAccounts];
}

function createIssuedCardRecord(request, adminName) {
  const cardMode = getCardModeFromRequestType(request.type) ?? 'Virtual Card';
  const cardProduct = cardProductCatalog[cardMode] ?? cardProductCatalog['Virtual Card'];
  const issuedAt = new Date().toISOString();

  return {
    id: request.id,
    requestId: request.id,
    type: request.type.includes('Generated') ? request.type : `${request.type} - Generated`,
    cardMode,
    status: 'Active',
    requested: request.requested,
    issuedAt,
    network: cardProduct.network,
    maskedNumber: `**** ${cardProduct.number.replace(/\D/g, '').slice(-4)}`,
    issuedBy: adminName,
  };
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);

    if (value === null) {
      window.localStorage.removeItem(key);
      return;
    }

    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function loadAccounts() {
  const storedAccounts = readStorage(ACCOUNTS_STORAGE_KEY);
  if (!storedAccounts) {
    return seededAccounts.map(normalizeAccountDefaults);
  }

  try {
    const parsed = JSON.parse(storedAccounts);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map(normalizeAccountDefaults)
      : seededAccounts.map(normalizeAccountDefaults);
  } catch {
    return seededAccounts.map(normalizeAccountDefaults);
  }
}

async function fetchCurrentSession() {
  const response = await fetch(getSessionApiUrl(), buildCredentialedRequest());

  if (response.status === 401) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to restore the active session.');
  }

  return payload;
}

async function logoutRemoteSession() {
  await fetch(getLogoutApiUrl(), buildCredentialedRequest({ method: 'POST' })).catch(() => null);
}

function getDisplayDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function buildWithdrawalSupportMessage({ userName, amount, bankName, accountNumber, requestId, note }) {
  const parts = [
    `Hello customer service, I need my withdrawal code for request ${requestId}.`,
    `Customer: ${userName}.`,
    `Amount: ${amount}.`,
    `Destination bank: ${bankName} (${accountNumber}).`,
  ];

  if (note) {
    parts.push(`Message: ${note}.`);
  }

  return parts.join(' ');
}

function loadDashboardMode(accounts, activeUserId) {
  if (!activeUserId) {
    return 'user';
  }

  const matchedAccount = accounts.find((account) => account.id === activeUserId);

  if (!matchedAccount || matchedAccount.role !== 'admin') {
    return 'user';
  }

  const storedMode = readStorage(DASHBOARD_MODE_STORAGE_KEY);
  return storedMode === 'user' || storedMode === 'admin' ? storedMode : 'admin';
}

function getDefaultAdminUserRecords() {
  return adminUsers.map((user, index) => ({
    ...user,
    accountId: `LEGACY-${String(index + 1).padStart(4, '0')}`,
    customerId: `CUS-${String(index + 1001).padStart(4, '0')}`,
    email: ['maya@apex.bank', 'daniel@apex.bank', 'sophia@apex.bank', 'ethan@apex.bank'][index] ?? `user${index + 1}@apex.bank`,
    phone: ['+1 202 555 0161', '+1 202 555 0162', '+1 202 555 0163', '+1 202 555 0164'][index] ?? '+1 202 555 0100',
    lastActivity: ['2 minutes ago', '18 minutes ago', '6 minutes ago', '45 minutes ago'][index] ?? '5 minutes ago',
    riskScore: [14, 61, 82, 23][index] ?? 20,
    verificationStatus: 'Verified',
    kycLevel: ['Verified Tier 3', 'Pending Review', 'Verified Tier 2', 'Verified Tier 2'][index] ?? 'Verified Tier 1',
    transferLimit: '15000',
    cardLimit: '5000',
  }));
}

function createAdminRecordFromAccount(account, existingRecord, index) {
  const totalBalance = (account.accounts ?? []).reduce((sum, item) => sum + item.amount, 0);
  const status = account.status ?? existingRecord?.status ?? 'Active';
  const verificationStatus = account.verificationStatus ?? existingRecord?.verificationStatus ?? 'Verified';

  return {
    ...existingRecord,
    accountId: account.id,
    customerId: existingRecord?.customerId ?? `CUS-${String(index + 2001).padStart(4, '0')}`,
    accountNumber: account.accountNumber,
    name: account.name,
    email: account.email,
    phone: account.phone,
    segment: account.segment,
    balance: formatCurrency(totalBalance),
    activity: existingRecord?.activity ?? (totalBalance > 10000 ? 'High' : totalBalance > 1000 ? 'Moderate' : 'Low'),
    kyc: existingRecord?.kyc ?? (verificationStatus === 'Verified' ? 'Verified' : 'Pending'),
    status,
    verificationStatus,
    lastActivity: existingRecord?.lastActivity ?? 'New registration',
    riskScore: existingRecord?.riskScore ?? (status === 'Flagged' ? 88 : status === 'Suspended' ? 64 : 18),
    kycLevel: existingRecord?.kycLevel ?? (verificationStatus === 'Verified' ? 'Verified Tier 2' : 'Pending Verification'),
    transferLimit: existingRecord?.transferLimit ?? '15000',
    cardLimit: existingRecord?.cardLimit ?? '5000',
    dateOfBirth: account.dateOfBirth ?? existingRecord?.dateOfBirth ?? '',
    gender: account.gender ?? existingRecord?.gender ?? '',
    avatar: account.avatar ?? existingRecord?.avatar ?? getInitials(account.name),
    avatarImage: account.avatarImage ?? existingRecord?.avatarImage ?? '',
  };
}

function syncAdminUserRecordsWithAccounts(currentRecords, accounts) {
  const userAccounts = accounts.filter((account) => account.role !== 'admin');
  const accountRecords = userAccounts.map((account, index) => {
    const existingRecord = currentRecords.find(
      (record) => record.accountId === account.id || record.email === account.email || record.name === account.name,
    );

    return createAdminRecordFromAccount(account, existingRecord, index);
  });

  const standaloneRecords = currentRecords.filter(
    (record) => !record.accountId || !userAccounts.some((account) => account.id === record.accountId),
  );

  return [...accountRecords, ...standaloneRecords];
}

function getDefaultAdminTransactionRecords() {
  return transactions.map((entry, index) => ({
    ...entry,
    reviewStatus: ['Monitored', 'Monitored', 'Monitored', 'Pending Review', 'Monitored'][index] ?? 'Monitored',
    owner: 'Example User',
  }));
}

function getDefaultAdminCaseRecords() {
  return [
    {
      id: 'CASE-201',
      type: 'Support',
      subject: 'Example User profile verification review',
      owner: 'Example User',
      priority: 'Medium',
      status: 'Open',
      assignee: 'Compliance Desk',
    },
    {
      id: 'CASE-202',
      type: 'Support',
      subject: 'Example User card activation issue',
      owner: 'Example User',
      priority: 'Medium',
      status: 'Open',
      assignee: 'Support Desk',
    },
  ];
}

function getDefaultAdminSettings() {
  return {
    alerts: true,
    biometricApproval: true,
    maintenanceMode: false,
    autoFreeze: true,
  };
}

function getDefaultAdminExportHistory() {
  return [
    { id: 'RPT-101', label: 'Operations Snapshot', createdAt: 'Apr 08, 2026 09:10', status: 'Ready' },
    { id: 'RPT-100', label: 'Fraud Summary', createdAt: 'Apr 08, 2026 08:45', status: 'Ready' },
  ];
}

function getDefaultAdminWorkspaceState() {
  return {
    adminSection: adminNav[0],
    adminNotice: 'Security reset complete. Only Example User remains in the demo workspace.',
    adminUserRecords: getDefaultAdminUserRecords(),
    adminWithdrawalRecords: withdrawalRequests,
    adminCardRecords: cardRequests,
    adminNotificationRecords: notificationItems,
    adminActivityRecords: activityLogs,
    adminLiveEvents: liveFeed,
    adminTransactionRecords: getDefaultAdminTransactionRecords(),
    adminCaseRecords: getDefaultAdminCaseRecords(),
    adminSettings: getDefaultAdminSettings(),
    adminExportHistory: getDefaultAdminExportHistory(),
    selectedUser: 'Example User',
  };
}

function normalizeAdminWorkspaceState(rawWorkspace) {
  const defaults = getDefaultAdminWorkspaceState();
  const parsed = rawWorkspace && typeof rawWorkspace === 'object' ? rawWorkspace : {};

  return {
    ...defaults,
    adminSection: parsed.adminSection ?? defaults.adminSection,
    adminNotice: parsed.adminNotice ?? defaults.adminNotice,
    adminUserRecords: Array.isArray(parsed.adminUserRecords) && parsed.adminUserRecords.length > 0 ? parsed.adminUserRecords : defaults.adminUserRecords,
    adminWithdrawalRecords:
      Array.isArray(parsed.adminWithdrawalRecords) && parsed.adminWithdrawalRecords.length > 0
        ? parsed.adminWithdrawalRecords
        : defaults.adminWithdrawalRecords,
    adminCardRecords: Array.isArray(parsed.adminCardRecords) && parsed.adminCardRecords.length > 0 ? parsed.adminCardRecords : defaults.adminCardRecords,
    adminNotificationRecords:
      Array.isArray(parsed.adminNotificationRecords) && parsed.adminNotificationRecords.length > 0
        ? parsed.adminNotificationRecords
        : defaults.adminNotificationRecords,
    adminActivityRecords:
      Array.isArray(parsed.adminActivityRecords) && parsed.adminActivityRecords.length > 0
        ? parsed.adminActivityRecords
        : defaults.adminActivityRecords,
    adminLiveEvents: Array.isArray(parsed.adminLiveEvents) && parsed.adminLiveEvents.length > 0 ? parsed.adminLiveEvents : defaults.adminLiveEvents,
    adminTransactionRecords:
      Array.isArray(parsed.adminTransactionRecords) && parsed.adminTransactionRecords.length > 0
        ? parsed.adminTransactionRecords
        : defaults.adminTransactionRecords,
    adminCaseRecords: Array.isArray(parsed.adminCaseRecords) && parsed.adminCaseRecords.length > 0 ? parsed.adminCaseRecords : defaults.adminCaseRecords,
    adminSettings: parsed.adminSettings ? { ...defaults.adminSettings, ...parsed.adminSettings } : defaults.adminSettings,
    adminExportHistory:
      Array.isArray(parsed.adminExportHistory) && parsed.adminExportHistory.length > 0
        ? parsed.adminExportHistory
        : defaults.adminExportHistory,
    selectedUser: parsed.selectedUser ?? defaults.selectedUser,
  };
}

function loadAdminWorkspaceState() {
  const stored = readStorage(ADMIN_WORKSPACE_STORAGE_KEY);

  if (!stored) {
    return getDefaultAdminWorkspaceState();
  }

  try {
    return normalizeAdminWorkspaceState(JSON.parse(stored));
  } catch {
    return getDefaultAdminWorkspaceState();
  }
}

function App() {
  const [authSession, setAuthSession] = useState(loadStoredSession);
  const [accounts, setAccounts] = useState(loadAccounts);
  const [activeUserId, setActiveUserId] = useState(() => loadStoredSession()?.user?.id ?? '');
  const [authMode, setAuthMode] = useState('login');
  const [publicPage, setPublicPage] = useState('home');
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const storedLanguage = readStorage(LANGUAGE_STORAGE_KEY) ?? 'en';
    return languageOptions.some((entry) => entry.value === storedLanguage) ? storedLanguage : 'en';
  });
  const [translateReady, setTranslateReady] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authForm, setAuthForm] = useState({
    name: 'Example User',
    identifier: 'example.user@demo.local',
    phone: '+1 202 555 0101',
    password: 'ExampleUser!26',
    dateOfBirth: '',
    gender: '',
  });
  const persistedAdminWorkspace = useMemo(loadAdminWorkspaceState, []);
  const [mode, setMode] = useState(() => loadDashboardMode(accounts, activeUserId));
  const [showBalance, setShowBalance] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [amountFilter, setAmountFilter] = useState('All Amounts');
  const [withdrawalCode, setWithdrawalCode] = useState('');
  const [appLoadingState, setAppLoadingState] = useState({ open: false, flowKey: 'default', ...loadingScreenContent.default });
  const [selectedUser, setSelectedUser] = useState(persistedAdminWorkspace.selectedUser);
  const [adminUsersView, setAdminUsersView] = useState('list');
  const [adminUserWorkspaceTab, setAdminUserWorkspaceTab] = useState('Overview');
  const [adminSection, setAdminSection] = useState(persistedAdminWorkspace.adminSection);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminNotice, setAdminNotice] = useState(persistedAdminWorkspace.adminNotice);
  const [adminUserRecords, setAdminUserRecords] = useState(() => syncAdminUserRecordsWithAccounts(persistedAdminWorkspace.adminUserRecords, accounts));
  const [adminWithdrawalRecords, setAdminWithdrawalRecords] = useState(persistedAdminWorkspace.adminWithdrawalRecords);
  const [adminCardRecords, setAdminCardRecords] = useState(persistedAdminWorkspace.adminCardRecords);
  const [adminNotificationRecords, setAdminNotificationRecords] = useState(persistedAdminWorkspace.adminNotificationRecords);
  const [adminActivityRecords, setAdminActivityRecords] = useState(persistedAdminWorkspace.adminActivityRecords);
  const [adminLiveEvents, setAdminLiveEvents] = useState(persistedAdminWorkspace.adminLiveEvents);
  const [adminTransactionRecords, setAdminTransactionRecords] = useState(persistedAdminWorkspace.adminTransactionRecords);
  const [adminCaseRecords, setAdminCaseRecords] = useState(persistedAdminWorkspace.adminCaseRecords);
  const [adminSettings, setAdminSettings] = useState(persistedAdminWorkspace.adminSettings);
  const [adminExportHistory, setAdminExportHistory] = useState(persistedAdminWorkspace.adminExportHistory);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [adminDialog, setAdminDialog] = useState({
    open: false,
    kind: '',
    targetId: '',
    title: '',
    message: '',
    customerMessage: '',
    note: '',
    nextStatus: '',
    confirmLabel: 'Confirm',
    requiresNote: false,
  });
  const [adminUserStatusFilter, setAdminUserStatusFilter] = useState('All');
  const [adminUserPage, setAdminUserPage] = useState(1);
  const [selectedAdminUserNames, setSelectedAdminUserNames] = useState([]);
  const [adminTransactionStatusFilter, setAdminTransactionStatusFilter] = useState('All');
  const [adminTransactionPage, setAdminTransactionPage] = useState(1);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);
  const [announcementComposerOpen, setAnnouncementComposerOpen] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState({
    title: '',
    audience: 'All retail users',
    channel: 'Push + Email',
  });
  const [userEditForm, setUserEditForm] = useState({ segment: '', kycLevel: '', password: '' });
  const [adminCreditForm, setAdminCreditForm] = useState({ amount: '', accountLabel: 'Current', note: '' });
  const [adminFundingReceipt, setAdminFundingReceipt] = useState(null);
  const [adminFundingResult, setAdminFundingResult] = useState(null);
  const [limitForm, setLimitForm] = useState({ transferLimit: '15000', cardLimit: '5000' });
  const [remoteAccountsReady, setRemoteAccountsReady] = useState(false);
  const [remoteAdminWorkspaceReady, setRemoteAdminWorkspaceReady] = useState(false);
  const latestAccountsRef = useRef(accounts);
  const lastRemoteAccountsSnapshotRef = useRef('');
  const lastRemoteAdminWorkspaceSnapshotRef = useRef('');
  const loadingRequestRef = useRef(0);
  const sessionToken = authSession ? 'cookie-session' : '';
  const isAdminSession = authSession?.user?.role === 'admin';

  const activeUser = accounts.find((account) => account.id === activeUserId) ?? null;
  const userBalances = activeUser?.accounts ?? [];
  const totalBalance = userBalances.reduce((total, account) => total + account.amount, 0);
  const effectiveMode = mode === 'admin' && activeUser?.role !== 'admin' ? 'user' : mode;
  const selectedAdminRecord = useMemo(
    () => adminUserRecords.find((user) => user.name === selectedUser) ?? adminUserRecords[0] ?? null,
    [adminUserRecords, selectedUser],
  );
  const selectedAdminAccount = useMemo(
    () =>
      selectedAdminRecord
        ? accounts.find((account) => account.id === selectedAdminRecord.accountId && account.role !== 'admin') ?? null
        : null,
    [accounts, selectedAdminRecord],
  );
  const selectedAdminFundingAccounts = selectedAdminAccount?.accounts ?? [];
  const filteredAdminUsers = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();

    return adminUserRecords.filter((user) => {
      const queryMatch =
        !query || [user.name, user.segment, user.kyc, user.status, user.customerId, user.accountNumber ?? ''].some((value) => value.toLowerCase().includes(query));
      const statusMatch = adminUserStatusFilter === 'All' || user.status === adminUserStatusFilter;
      return queryMatch && statusMatch;
    });
  }, [adminSearch, adminUserRecords, adminUserStatusFilter]);
  const filteredAdminTransactions = useMemo(() => {
    return adminTransactionRecords.filter((entry) => {
      return adminTransactionStatusFilter === 'All' || entry.reviewStatus === adminTransactionStatusFilter;
    });
  }, [adminTransactionRecords, adminTransactionStatusFilter]);
  const adminUsersPerPage = 3;
  const adminTransactionsPerPage = 4;
  const adminUserPageCount = Math.max(1, Math.ceil(filteredAdminUsers.length / adminUsersPerPage));
  const adminTransactionPageCount = Math.max(1, Math.ceil(filteredAdminTransactions.length / adminTransactionsPerPage));
  const paginatedAdminUsers = useMemo(() => {
    const startIndex = (adminUserPage - 1) * adminUsersPerPage;
    return filteredAdminUsers.slice(startIndex, startIndex + adminUsersPerPage);
  }, [adminUserPage, filteredAdminUsers]);
  const paginatedAdminTransactions = useMemo(() => {
    const startIndex = (adminTransactionPage - 1) * adminTransactionsPerPage;
    return filteredAdminTransactions.slice(startIndex, startIndex + adminTransactionsPerPage);
  }, [adminTransactionPage, filteredAdminTransactions]);
  const pendingWithdrawalCount = adminWithdrawalRecords.filter((request) => request.status === 'Pending').length;
  const riskEventCount = adminLiveEvents.filter((event) => /risk|flagged|suspicious/i.test(event)).length;
  const activeAdminUsers = adminUserRecords.filter((user) => user.status === 'Active').length;
  const openCaseCount = adminCaseRecords.filter((item) => item.status === 'Open' || item.status === 'Escalated').length;

  useEffect(() => {
    writeStorage(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      try {
        const payload = await fetchCurrentSession();

        if (cancelled || !payload?.user) {
          if (!cancelled) {
            setAuthSession(null);
            setActiveUserId('');
            setMode('user');
            setPublicPage('home');
          }
          return;
        }

        const nextAccounts = Array.isArray(payload.accounts) ? payload.accounts.map(normalizeAccountDefaults) : [];

        setAuthSession({ user: payload.user });
        setAccounts(nextAccounts.length > 0 ? nextAccounts : seededAccounts.map(normalizeAccountDefaults));
        setActiveUserId(payload.user.id);
        setMode(payload.user.role === 'admin' ? 'admin' : 'user');

        if (payload.user.role === 'admin') {
          const workspace = normalizeAdminWorkspaceState(payload.workspace ?? {});
          setAdminSection(workspace.adminSection);
          setAdminNotice(workspace.adminNotice);
          setAdminUserRecords(syncAdminUserRecordsWithAccounts(workspace.adminUserRecords, nextAccounts));
          setAdminWithdrawalRecords(workspace.adminWithdrawalRecords);
          setAdminCardRecords(workspace.adminCardRecords);
          setAdminNotificationRecords(workspace.adminNotificationRecords);
          setAdminActivityRecords(workspace.adminActivityRecords);
          setAdminLiveEvents(workspace.adminLiveEvents);
          setAdminTransactionRecords(workspace.adminTransactionRecords);
          setAdminCaseRecords(workspace.adminCaseRecords);
          setAdminSettings(workspace.adminSettings);
          setAdminExportHistory(workspace.adminExportHistory);
          setSelectedUser(workspace.selectedUser);
        } else {
          const userWorkspace = payload.userWorkspace && typeof payload.userWorkspace === 'object' ? payload.userWorkspace : {};
          setAdminWithdrawalRecords(Array.isArray(userWorkspace.withdrawalRecords) ? userWorkspace.withdrawalRecords : []);
          setAdminCardRecords(Array.isArray(userWorkspace.cardRecords) ? userWorkspace.cardRecords : []);
          setAdminCaseRecords(Array.isArray(userWorkspace.caseRecords) ? userWorkspace.caseRecords : []);
        }
      } catch {
        if (!cancelled) {
          setAuthSession(null);
          setActiveUserId('');
          setMode('user');
          setPublicPage('home');
        }
      }
    }

    writeStorage(SESSION_STORAGE_KEY, null);
    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    writeStorage(LANGUAGE_STORAGE_KEY, selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    function initializeGoogleTranslate() {
      if (!window.google?.translate?.TranslateElement) {
        return;
      }

      if (!window.__apexGoogleTranslateInitialized) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: languageOptions.map((entry) => entry.value).join(','),
            autoDisplay: false,
          },
          'google_translate_element',
        );
        window.__apexGoogleTranslateInitialized = true;
      }

      setTranslateReady(true);
    }

    window.googleTranslateElementInit = initializeGoogleTranslate;

    if (window.google?.translate?.TranslateElement) {
      initializeGoogleTranslate();
      return;
    }

    if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    if (!translateReady || typeof window === 'undefined') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      applyGoogleTranslateLanguage(selectedLanguage);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    translateReady,
    selectedLanguage,
    publicPage,
    authMode,
    effectiveMode,
    adminSection,
    adminUsersView,
    adminUserWorkspaceTab,
    activeUserId,
    appLoadingState.open,
    appLoadingState.flowKey,
  ]);

  const languageSelector = (
    <div className="global-language-selector" role="group" aria-label="Language selector">
      <span>Language</span>
      <select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)} aria-label="Select language">
        {languageOptions.map((entry) => (
          <option key={entry.value} value={entry.value}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  );

  useEffect(() => {
    writeStorage(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    latestAccountsRef.current = accounts;
  }, [accounts]);

  useEffect(() => {
    if (!isAdminSession || !sessionToken) {
      setRemoteAccountsReady(false);
      return undefined;
    }

    let cancelled = false;

    async function loadSharedAccounts() {
      try {
        const remoteAccounts = (await fetchRemoteAccounts(sessionToken)).map(normalizeAccountDefaults);
        const mergedAccounts = mergeAccountsWithRemote(latestAccountsRef.current, remoteAccounts);
        const remoteSnapshot = JSON.stringify(remoteAccounts);
        const mergedSnapshot = JSON.stringify(mergedAccounts);

        if (mergedSnapshot !== remoteSnapshot) {
          await saveRemoteAccounts(sessionToken, mergedAccounts);
        }

        if (cancelled) {
          return;
        }

        lastRemoteAccountsSnapshotRef.current = mergedSnapshot;
        setAccounts(mergedAccounts);
      } catch {
        return;
      } finally {
        if (!cancelled) {
          setRemoteAccountsReady(true);
        }
      }
    }

    loadSharedAccounts();

    return () => {
      cancelled = true;
    };
  }, [isAdminSession, sessionToken]);

  useEffect(() => {
    writeStorage(ACTIVE_USER_STORAGE_KEY, activeUserId || null);
  }, [activeUserId]);

  useEffect(() => {
    if (!isAdminSession || !sessionToken) {
      setRemoteAdminWorkspaceReady(false);
      return undefined;
    }

    let cancelled = false;

    async function loadSharedAdminWorkspace() {
      try {
        const remoteWorkspace = normalizeAdminWorkspaceState(await fetchRemoteAdminWorkspace(sessionToken));
        const remoteSnapshot = JSON.stringify(remoteWorkspace);

        if (cancelled) {
          return;
        }

        lastRemoteAdminWorkspaceSnapshotRef.current = remoteSnapshot;
        setAdminSection(remoteWorkspace.adminSection);
        setAdminNotice(remoteWorkspace.adminNotice);
        setAdminUserRecords(syncAdminUserRecordsWithAccounts(remoteWorkspace.adminUserRecords, latestAccountsRef.current));
        setAdminWithdrawalRecords(remoteWorkspace.adminWithdrawalRecords);
        setAdminCardRecords(remoteWorkspace.adminCardRecords);
        setAdminNotificationRecords(remoteWorkspace.adminNotificationRecords);
        setAdminActivityRecords(remoteWorkspace.adminActivityRecords);
        setAdminLiveEvents(remoteWorkspace.adminLiveEvents);
        setAdminTransactionRecords(remoteWorkspace.adminTransactionRecords);
        setAdminCaseRecords(remoteWorkspace.adminCaseRecords);
        setAdminSettings(remoteWorkspace.adminSettings);
        setAdminExportHistory(remoteWorkspace.adminExportHistory);
        setSelectedUser(remoteWorkspace.selectedUser);
      } catch {
        return;
      } finally {
        if (!cancelled) {
          setRemoteAdminWorkspaceReady(true);
        }
      }
    }

    loadSharedAdminWorkspace();

    return () => {
      cancelled = true;
    };
  }, [isAdminSession, sessionToken]);

  useEffect(() => {
    if (!remoteAccountsReady || !isAdminSession || !sessionToken) {
      return;
    }

    const snapshot = JSON.stringify(accounts);

    if (snapshot === lastRemoteAccountsSnapshotRef.current) {
      return;
    }

    let cancelled = false;

    async function pushSharedAccounts() {
      try {
        await saveRemoteAccounts(sessionToken, accounts);

        if (!cancelled) {
          lastRemoteAccountsSnapshotRef.current = snapshot;
        }
      } catch {
        return;
      }
    }

    pushSharedAccounts();

    return () => {
      cancelled = true;
    };
  }, [accounts, isAdminSession, remoteAccountsReady, sessionToken]);

  useEffect(() => {
    if (!remoteAccountsReady || !isAdminSession || !sessionToken) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const remoteAccounts = (await fetchRemoteAccounts(sessionToken)).map(normalizeAccountDefaults);
        const remoteSnapshot = JSON.stringify(remoteAccounts);

        if (remoteSnapshot !== lastRemoteAccountsSnapshotRef.current) {
          lastRemoteAccountsSnapshotRef.current = remoteSnapshot;
          setAccounts(remoteAccounts);
        }
      } catch {
        return;
      }
    }, 12000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAdminSession, remoteAccountsReady, sessionToken]);

  useEffect(() => {
    setAdminUserRecords((current) => syncAdminUserRecordsWithAccounts(current, accounts));
  }, [accounts]);

  const adminWorkspaceSnapshot = useMemo(
    () => ({
      adminSection,
      adminNotice,
      adminUserRecords,
      adminWithdrawalRecords,
      adminCardRecords,
      adminNotificationRecords,
      adminActivityRecords,
      adminLiveEvents,
      adminTransactionRecords,
      adminCaseRecords,
      adminSettings,
      adminExportHistory,
      selectedUser,
    }),
    [
      adminActivityRecords,
      adminCardRecords,
      adminCaseRecords,
      adminExportHistory,
      adminLiveEvents,
      adminNotice,
      adminNotificationRecords,
      adminSection,
      adminSettings,
      adminTransactionRecords,
      adminUserRecords,
      adminWithdrawalRecords,
      selectedUser,
    ],
  );

  useEffect(() => {
    if (!activeUser) {
      writeStorage(DASHBOARD_MODE_STORAGE_KEY, null);
      return;
    }

    writeStorage(DASHBOARD_MODE_STORAGE_KEY, effectiveMode);
  }, [activeUser, effectiveMode]);

  useEffect(() => {
    if (activeUserId && !activeUser) {
      setActiveUserId('');
    }
  }, [activeUser, activeUserId]);

  useEffect(() => {
    if (adminUserRecords.length === 0) {
      setSelectedUser('');
      return;
    }

    if (!adminUserRecords.some((user) => user.name === selectedUser)) {
      setSelectedUser(adminUserRecords[0].name);
    }
  }, [adminUserRecords, selectedUser]);

  useEffect(() => {
    setAdminUserPage(1);
  }, [adminSearch, adminUserStatusFilter]);

  useEffect(() => {
    setAdminTransactionPage(1);
  }, [adminTransactionStatusFilter]);

  useEffect(() => {
    if (adminUserPage > adminUserPageCount) {
      setAdminUserPage(adminUserPageCount);
    }
  }, [adminUserPage, adminUserPageCount]);

  useEffect(() => {
    if (adminTransactionPage > adminTransactionPageCount) {
      setAdminTransactionPage(adminTransactionPageCount);
    }
  }, [adminTransactionPage, adminTransactionPageCount]);

  useEffect(() => {
    if (!selectedAdminRecord) {
      return;
    }

    setUserEditForm({
      segment: selectedAdminRecord.segment,
      kycLevel: selectedAdminRecord.kycLevel,
      password: selectedAdminRecord.password ?? '',
    });
    setAdminCreditForm({
      amount: '',
      accountLabel: selectedAdminFundingAccounts[0]?.label ?? 'Current',
      note: '',
    });
    setAdminFundingReceipt(null);
    setAdminFundingResult(null);
    setLimitForm({
      transferLimit: selectedAdminRecord.transferLimit ?? '15000',
      cardLimit: selectedAdminRecord.cardLimit ?? '5000',
    });
  }, [selectedAdminFundingAccounts, selectedAdminRecord]);

  useEffect(() => {
    if (selectedAdminFundingAccounts.length === 0) {
      return;
    }

    const availableLabels = selectedAdminFundingAccounts.map((entry) => entry.label);

    setAdminCreditForm((current) =>
      availableLabels.includes(current.accountLabel)
        ? current
        : {
            ...current,
            accountLabel: selectedAdminFundingAccounts[0].label,
          },
    );
  }, [selectedAdminFundingAccounts]);

  useEffect(() => {
    writeStorage(
      ADMIN_WORKSPACE_STORAGE_KEY,
      JSON.stringify(adminWorkspaceSnapshot),
    );
  }, [adminWorkspaceSnapshot]);

  useEffect(() => {
    if (!remoteAdminWorkspaceReady || !isAdminSession || !sessionToken) {
      return;
    }

    const snapshot = JSON.stringify(adminWorkspaceSnapshot);

    if (snapshot === lastRemoteAdminWorkspaceSnapshotRef.current) {
      return;
    }

    let cancelled = false;

    async function pushSharedAdminWorkspace() {
      try {
        await saveRemoteAdminWorkspace(sessionToken, adminWorkspaceSnapshot);

        if (!cancelled) {
          lastRemoteAdminWorkspaceSnapshotRef.current = snapshot;
        }
      } catch {
        return;
      }
    }

    pushSharedAdminWorkspace();

    return () => {
      cancelled = true;
    };
  }, [adminWorkspaceSnapshot, isAdminSession, remoteAdminWorkspaceReady, sessionToken]);

  useEffect(() => {
    if (!remoteAdminWorkspaceReady || !isAdminSession || !sessionToken || typeof window === 'undefined') {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const remoteWorkspace = normalizeAdminWorkspaceState(await fetchRemoteAdminWorkspace(sessionToken));
        const remoteSnapshot = JSON.stringify(remoteWorkspace);

        if (remoteSnapshot === lastRemoteAdminWorkspaceSnapshotRef.current) {
          return;
        }

        lastRemoteAdminWorkspaceSnapshotRef.current = remoteSnapshot;
        setAdminSection(remoteWorkspace.adminSection);
        setAdminNotice(remoteWorkspace.adminNotice);
        setAdminUserRecords(syncAdminUserRecordsWithAccounts(remoteWorkspace.adminUserRecords, accounts));
        setAdminWithdrawalRecords(remoteWorkspace.adminWithdrawalRecords);
        setAdminCardRecords(remoteWorkspace.adminCardRecords);
        setAdminNotificationRecords(remoteWorkspace.adminNotificationRecords);
        setAdminActivityRecords(remoteWorkspace.adminActivityRecords);
        setAdminLiveEvents(remoteWorkspace.adminLiveEvents);
        setAdminTransactionRecords(remoteWorkspace.adminTransactionRecords);
        setAdminCaseRecords(remoteWorkspace.adminCaseRecords);
        setAdminSettings(remoteWorkspace.adminSettings);
        setAdminExportHistory(remoteWorkspace.adminExportHistory);
        setSelectedUser(remoteWorkspace.selectedUser);
      } catch {
        return;
      }
    }, 12000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [accounts, isAdminSession, remoteAdminWorkspaceReady, sessionToken]);

  useEffect(() => {
    if (!isAdminSession || !sessionToken || typeof window === 'undefined') {
      return;
    }

    const eventSource = new EventSource(getSharedEventsApiUrl(sessionToken), { withCredentials: true });

    async function refreshSharedAccounts() {
      try {
        const remoteAccounts = (await fetchRemoteAccounts(sessionToken)).map(normalizeAccountDefaults);
        const remoteSnapshot = JSON.stringify(remoteAccounts);

        lastRemoteAccountsSnapshotRef.current = remoteSnapshot;
        setAccounts(remoteAccounts);
      } catch {
        return;
      }
    }

    async function refreshAdminWorkspace() {
      try {
        const remoteWorkspace = normalizeAdminWorkspaceState(await fetchRemoteAdminWorkspace(sessionToken));
        const remoteSnapshot = JSON.stringify(remoteWorkspace);

        lastRemoteAdminWorkspaceSnapshotRef.current = remoteSnapshot;
        setAdminSection(remoteWorkspace.adminSection);
        setAdminNotice(remoteWorkspace.adminNotice);
        setAdminUserRecords(syncAdminUserRecordsWithAccounts(remoteWorkspace.adminUserRecords, latestAccountsRef.current));
        setAdminWithdrawalRecords(remoteWorkspace.adminWithdrawalRecords);
        setAdminCardRecords(remoteWorkspace.adminCardRecords);
        setAdminNotificationRecords(remoteWorkspace.adminNotificationRecords);
        setAdminActivityRecords(remoteWorkspace.adminActivityRecords);
        setAdminLiveEvents(remoteWorkspace.adminLiveEvents);
        setAdminTransactionRecords(remoteWorkspace.adminTransactionRecords);
        setAdminCaseRecords(remoteWorkspace.adminCaseRecords);
        setAdminSettings(remoteWorkspace.adminSettings);
        setAdminExportHistory(remoteWorkspace.adminExportHistory);
        setSelectedUser(remoteWorkspace.selectedUser);
      } catch {
        return;
      }
    }

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'accounts') {
          refreshSharedAccounts();
        }

        if (payload.type === 'admin-workspace') {
          refreshAdminWorkspace();
        }
      } catch {
        return;
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isAdminSession, sessionToken]);

  const userTransactionFeed = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    const generatedEntries = adminTransactionRecords.filter(
      (entry) => entry.owner === activeUser.name && !transactions.some((seededEntry) => seededEntry.id === entry.id),
    );
    const seededEntries = activeUser.name === 'Example User' ? transactions : [];
    return [...generatedEntries, ...seededEntries];
  }, [activeUser, adminTransactionRecords]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return userTransactionFeed.filter((entry) => {
      const typeMatch = transactionFilter === 'All' || entry.type === transactionFilter;
      const transactionDate = new Date(entry.date);
      const dateDistance = Number.isNaN(transactionDate.getTime())
        ? Number.POSITIVE_INFINITY
        : Math.floor((startOfToday - new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate())) / 86400000);
      const dateMatch =
        dateFilter === 'All Dates' ||
        (dateFilter === 'Last 3 Days' && dateDistance >= 0 && dateDistance <= 3) ||
        (dateFilter === 'This Week' && dateDistance >= 0 && dateDistance <= 7);

      const numericAmount = Number(entry.amount.replace(/[^0-9.]/g, ''));
      const amountMatch =
        amountFilter === 'All Amounts' ||
        (amountFilter === 'Under $1000' && numericAmount < 1000) ||
        (amountFilter === '$1000 - $5000' && numericAmount >= 1000 && numericAmount <= 5000) ||
        (amountFilter === 'Above $5000' && numericAmount > 5000);

      return typeMatch && dateMatch && amountMatch;
    });
  }, [amountFilter, dateFilter, transactionFilter, userTransactionFeed]);
  const userWithdrawalRequests = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    return adminWithdrawalRecords.filter((request) => request.requesterId === activeUser.id);
  }, [activeUser, adminWithdrawalRecords]);
  const userCardRequests = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    const requestEntries = adminCardRecords.filter((request) => request.requesterId === activeUser.id || request.requesterName === activeUser.name);
    const fallbackIssuedEntries = (activeUser.issuedCards ?? []).filter(
      (card) => !requestEntries.some((request) => request.id === card.requestId || request.id === card.id),
    );

    return [...requestEntries, ...fallbackIssuedEntries];
  }, [activeUser, adminCardRecords]);
  const userSupportCases = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    return adminCaseRecords.filter(
      (entry) => entry.type === 'Support' && (entry.requesterId === activeUser.id || entry.owner === activeUser.name),
    );
  }, [activeUser, adminCaseRecords]);
  const userLoanCases = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    return adminCaseRecords.filter(
      (entry) => entry.type === 'Loan' && (entry.requesterId === activeUser.id || entry.owner === activeUser.name),
    );
  }, [activeUser, adminCaseRecords]);
  const userInvestmentCases = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    return adminCaseRecords.filter(
      (entry) => entry.type === 'Investment' && (entry.requesterId === activeUser.id || entry.owner === activeUser.name),
    );
  }, [activeUser, adminCaseRecords]);
  const userNotifications = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    return (activeUser.notifications ?? []).map(normalizeNotificationEntry).filter((entry) => !isNotificationExpired(entry));
  }, [activeUser]);

  function handleMarkUserNotificationsRead(notificationIds) {
    if (!activeUser || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return;
    }

    const readAt = new Date().toISOString();

    setAccounts((current) =>
      current.map((account) => {
        if (account.id !== activeUser.id) {
          return account;
        }

        return {
          ...account,
          notifications: (account.notifications ?? []).map((entry) =>
            notificationIds.includes(entry.id) && !entry.readAt ? { ...entry, readAt } : entry,
          ),
        };
      }),
    );
  }

  function updateAuthField(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  async function runLoadingFlow(flowKey, action, delayMs = PAGE_LOADING_DELAY_MS) {
    const requestId = loadingRequestRef.current + 1;
    loadingRequestRef.current = requestId;
    setAppLoadingState({ open: true, flowKey, ...getLoadingScreenContent(flowKey) });

    try {
      const [result] = await Promise.all([
        Promise.resolve().then(action),
        new Promise((resolve) => {
          window.setTimeout(resolve, delayMs);
        }),
      ]);

      return result;
    } finally {
      if (loadingRequestRef.current === requestId) {
        setAppLoadingState((current) => ({ ...current, open: false }));
      }
    }
  }

  function renderLoadingOverlay() {
    if (!appLoadingState.open) {
      return null;
    }

    return (
      <div className={`app-loading-backdrop tone-${appLoadingState.tone}`} role="status" aria-live="polite" aria-label={appLoadingState.title}>
        <div className="app-loading-card glass-card">
          <div className="app-loading-orbit" aria-hidden="true">
            <span className="app-loading-ring" />
            <span className="app-loading-ring app-loading-ring-delayed" />
            <span className="app-loading-core">
              <span className={`app-loading-icon ${getLoadingIcon(appLoadingState.flowKey).length > 2 ? 'is-wide' : ''}`}>
                {getLoadingIcon(appLoadingState.flowKey)}
              </span>
            </span>
          </div>
          <p className="eyebrow">{appLoadingState.eyebrow}</p>
          <h3>{appLoadingState.title}</h3>
          <p>{appLoadingState.message}</p>
          <div className="app-loading-progress" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    );
  }

  function applyUserWorkspaceState(userWorkspace) {
    const nextWorkspace = userWorkspace && typeof userWorkspace === 'object' ? userWorkspace : {};
    setAdminWithdrawalRecords(Array.isArray(nextWorkspace.withdrawalRecords) ? nextWorkspace.withdrawalRecords : []);
    setAdminCardRecords(Array.isArray(nextWorkspace.cardRecords) ? nextWorkspace.cardRecords : []);
    setAdminCaseRecords(Array.isArray(nextWorkspace.caseRecords) ? nextWorkspace.caseRecords : []);
  }

  async function handleLogin() {
    try {
      const payload = await loginRemoteSession({
        identifier: authForm.identifier,
        password: authForm.password,
      });
      const nextAccounts = Array.isArray(payload.accounts) ? payload.accounts.map(normalizeAccountDefaults) : [];

      setAuthSession({ user: payload.user });
      setAccounts(nextAccounts.length > 0 ? nextAccounts : seededAccounts.map(normalizeAccountDefaults));
      setActiveUserId(payload.user.id);
      setMode(payload.user.role === 'admin' ? 'admin' : 'user');
      setPublicPage('home');
      setAuthMessage('');

      if (payload.user.role === 'admin') {
        const workspace = normalizeAdminWorkspaceState(payload.workspace ?? {});
        setAdminSection(workspace.adminSection);
        setAdminNotice(workspace.adminNotice);
        setAdminUserRecords(syncAdminUserRecordsWithAccounts(workspace.adminUserRecords, nextAccounts));
        setAdminWithdrawalRecords(workspace.adminWithdrawalRecords);
        setAdminCardRecords(workspace.adminCardRecords);
        setAdminNotificationRecords(workspace.adminNotificationRecords);
        setAdminActivityRecords(workspace.adminActivityRecords);
        setAdminLiveEvents(workspace.adminLiveEvents);
        setAdminTransactionRecords(workspace.adminTransactionRecords);
        setAdminCaseRecords(workspace.adminCaseRecords);
        setAdminSettings(workspace.adminSettings);
        setAdminExportHistory(workspace.adminExportHistory);
        setSelectedUser(workspace.selectedUser);
      } else {
        applyUserWorkspaceState(payload.userWorkspace);
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Unable to sign in right now.');
    }
  }

  async function handleRegister(profilePhoto = '') {
    try {
      const payload = await registerRemoteSession({
        name: authForm.name.trim() || 'New User',
        email: authForm.identifier.trim(),
        phone: authForm.phone.trim() || '+1 202 555 0100',
        password: authForm.password,
        dateOfBirth: authForm.dateOfBirth,
        gender: authForm.gender,
        avatarImage: profilePhoto,
      });
      const nextAccounts = Array.isArray(payload.accounts) ? payload.accounts.map(normalizeAccountDefaults) : [];
      const activeAccount = nextAccounts.find((account) => account.id === payload.user.id);

      setAuthSession({ user: payload.user });
      setAccounts(nextAccounts.length > 0 ? nextAccounts : seededAccounts.map(normalizeAccountDefaults));
      setActiveUserId(payload.user.id);
      setMode('user');
      setAuthMode('login');
      setPublicPage('home');
      applyUserWorkspaceState(payload.userWorkspace);

      const emailResult = activeAccount
        ? await requestWelcomeEmail({
            name: activeAccount.name,
            email: activeAccount.email,
            accountNumber: activeAccount.accountNumber,
          })
        : { ok: false, configured: false };

      const registrationMessage = activeAccount
        ? `Account created successfully. Your Apex Bank account number is ${formatAccountNumber(activeAccount.accountNumber)}. Verification by Apex Bank is required before you can receive money from other users.`
        : 'Account created successfully.';
      const emailMessage = emailResult.ok
        ? ` A welcome email has been sent to ${activeAccount?.email}.`
        : emailResult.configured === false
          ? ' Account creation succeeded, but welcome email delivery is not configured on the server yet.'
          : ' Account creation succeeded, but the welcome email could not be sent right now.';

      setAuthMessage(`${registrationMessage}${emailMessage}`);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Unable to create the account right now.');
    }
  }

  async function handleLogout() {
    await logoutRemoteSession();
    setAuthSession(null);
    setActiveUserId('');
    setMode('user');
    setAuthMode('login');
    setPublicPage('home');
    setAuthForm((current) => ({
      ...current,
      identifier: 'example.user@demo.local',
      password: 'ExampleUser!26',
      dateOfBirth: '',
      gender: '',
    }));
    setAuthMessage('Signed out.');
  }

  function requestLogout() {
    setLogoutDialogOpen(true);
  }

  function cancelLogout() {
    setLogoutDialogOpen(false);
  }

  function confirmLogout() {
    setLogoutDialogOpen(false);
    handleLogout();
  }

  function handleRestoreDemo() {
    logoutRemoteSession();
    setAuthSession(null);
    setAccounts(seededAccounts.map(normalizeAccountDefaults));
    setActiveUserId('');
    setMode('user');
    setAuthMode('login');
    setPublicPage('home');
    setAuthForm({
      name: 'Example User',
      identifier: 'example.user@demo.local',
      phone: '+1 202 555 0101',
      password: 'ExampleUser!26',
      dateOfBirth: '',
      gender: '',
    });
    setAuthMessage('Demo accounts restored.');
  }

  function handleAddSavedBank(bankForm) {
    if (!activeUser || activeUser.role === 'admin') {
      return { ok: false, message: 'Only retail users can add withdrawal banks.' };
    }

    const cleanedNumber = bankForm.accountNumber.replace(/\D/g, '');

    if (!bankForm.bankName.trim() || !bankForm.accountName.trim() || cleanedNumber.length < 6) {
      return { ok: false, message: 'Enter a bank name, account name, and a valid account number.' };
    }

    const maskedNumber = `**** ${cleanedNumber.slice(-4)}`;
    const newBank = {
      id: `BNK-${Date.now()}`,
      bankName: bankForm.bankName.trim(),
      accountName: bankForm.accountName.trim(),
      accountNumber: maskedNumber,
    };

    setAccounts((current) =>
      current.map((account) =>
        account.id === activeUser.id
          ? { ...account, savedBanks: [...(account.savedBanks ?? []), newBank] }
          : account,
      ),
    );

    return { ok: true, bank: newBank, message: 'Withdrawal bank added successfully.' };
  }

  function debitActiveUserAccount(accountLabel, amountValue) {
    if (!activeUser) {
      return { ok: false, message: 'No active user session found.' };
    }

    const selectedAccount = activeUser.accounts.find((account) => account.label === accountLabel) ?? activeUser.accounts[0];

    if (!selectedAccount) {
      return { ok: false, message: 'No eligible source account is available.' };
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return { ok: false, message: 'Enter a valid amount.' };
    }

    if (selectedAccount.amount < amountValue) {
      return { ok: false, message: `Insufficient funds in ${selectedAccount.label}.` };
    }

    setAccounts((current) =>
      current.map((account) =>
        account.id === activeUser.id
          ? {
              ...account,
              accounts: account.accounts.map((entry) =>
                entry.label === selectedAccount.label
                  ? { ...entry, amount: Number((entry.amount - amountValue).toFixed(2)) }
                  : entry,
              ),
            }
          : account,
      ),
    );

    return { ok: true, sourceLabel: selectedAccount.label };
  }

  async function handleSubmitTransfer(transferForm) {
    if (!activeUser || activeUser.role === 'admin') {
      return { ok: false, message: 'Transfers are only available for signed-in retail users.' };
    }

    const recipient = transferForm.recipient.trim();
    const bankName = transferForm.bankName.trim();
    const cleanedAccountNumber = transferForm.accountNumber.replace(/\D/g, '');
    const amountValue = Number(transferForm.amount);
    const apexRecipient = accounts.find(
      (account) => account.role !== 'admin' && account.id !== activeUser.id && account.accountNumber === cleanedAccountNumber,
    );
    const recipientVerified = apexRecipient ? apexRecipient.verificationStatus === 'Verified' : true;
    const resolvedRecipient = apexRecipient?.name ?? recipient;
    const resolvedBankName = apexRecipient ? 'Apex Bank' : bankName;

    if (!resolvedRecipient || !resolvedBankName || cleanedAccountNumber.length < 6) {
      return { ok: false, message: 'Enter a recipient or valid Apex Bank account number and bank details.' };
    }

    const debitResult = debitActiveUserAccount(transferForm.sourceAccount, amountValue);

    if (!debitResult.ok) {
      return debitResult;
    }

    const transactionId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt = {
      id: transactionId,
      name: resolvedRecipient,
      type: 'Transfer',
      amount: `-${formatCurrency(amountValue)}`,
      date: getDisplayDate(),
      status: apexRecipient && !recipientVerified ? 'Pending Verification' : 'Completed',
      owner: activeUser.name,
      reviewStatus: apexRecipient && !recipientVerified ? 'Pending Review' : amountValue >= 5000 ? 'Pending Review' : 'Monitored',
      destination: `${resolvedBankName} • **** ${cleanedAccountNumber.slice(-4)}`,
      note: transferForm.note.trim(),
    };

    const internalTransferReceipt = apexRecipient && recipientVerified
      ? {
          id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          name: activeUser.name,
          type: 'Income',
          amount: `+${formatCurrency(amountValue)}`,
          date: getDisplayDate(),
          status: 'Completed',
          owner: apexRecipient.name,
          reviewStatus: 'Monitored',
          destination: `Apex Bank • **** ${cleanedAccountNumber.slice(-4)}`,
          note: transferForm.note.trim() || `Incoming Apex Bank transfer from ${activeUser.name}`,
        }
      : null;

    if (apexRecipient && recipientVerified) {
      setAccounts((current) =>
        current.map((account) => {
          if (account.id !== apexRecipient.id) {
            return account;
          }

          const targetLabel = account.accounts.some((entry) => entry.label === 'Current')
            ? 'Current'
            : account.accounts[0]?.label;

          return {
            ...account,
            accounts: account.accounts.map((entry) =>
              entry.label === targetLabel
                ? { ...entry, amount: Number((entry.amount + amountValue).toFixed(2)) }
                : entry,
            ),
          };
        }),
      );
    }

    if (apexRecipient && !recipientVerified) {
      const heldMessage = `Dear ${apexRecipient.name}, ${activeUser.name} have sent you ${formatCurrency(amountValue)} and you cannot receive this money until you are verified by Apex Bank. Please contact customer service to complete account verification. Thank you.`;

      setAccounts((current) =>
        current.map((account) => {
          if (account.id !== apexRecipient.id) {
            return account;
          }

          return {
            ...account,
            notifications: [
              {
                id: `NOTICE-${transactionId}`,
                type: 'verification-hold',
                message: heldMessage,
              },
              ...(account.notifications ?? []),
            ],
            pendingIncomingTransfers: [
              {
                id: `HOLD-${transactionId}`,
                senderName: activeUser.name,
                senderId: activeUser.id,
                amountValue,
                transactionId,
                note: transferForm.note.trim(),
                createdAt: getDisplayDate(),
              },
              ...(account.pendingIncomingTransfers ?? []),
            ],
          };
        }),
      );
    }

    setAdminTransactionRecords((current) => (internalTransferReceipt ? [receipt, internalTransferReceipt, ...current] : [receipt, ...current]));
    setAdminNotice(
      apexRecipient && !recipientVerified
        ? `Transfer from ${activeUser.name} is on hold until ${resolvedRecipient} is verified.`
        : `Transfer request received from ${activeUser.name}.`,
    );
    pushAdminActivity(`${activeUser.name} submitted transfer ${receipt.id} to ${resolvedRecipient}.`, {
      promoteToLiveFeed: amountValue >= 5000,
    });

    let emailNotificationMessage = '';

    if (apexRecipient && apexRecipient.email) {
      const senderAccount = activeUser.accounts.find((entry) => entry.label === debitResult.sourceLabel);
      const senderAccountNumber = senderAccount?.accountNumber ?? activeUser.accountNumber ?? '';
      const emailResult = await requestTransferReceivedEmail({
        name: apexRecipient.name,
        email: apexRecipient.email,
        amount: Number(amountValue).toFixed(2),
        fromAccount: senderAccountNumber,
        toAccount: apexRecipient.accountNumber,
        transferDate: new Date().toISOString(),
        verificationRequired: !recipientVerified,
      });

      if (emailResult.ok) {
        emailNotificationMessage = recipientVerified
          ? ` A transfer receipt email has been sent to ${apexRecipient.email}.`
          : ` A verification email has been sent to ${apexRecipient.email}.`;
      } else if (emailResult.configured === false) {
        emailNotificationMessage = ' The transfer completed, but recipient email delivery is not configured on the server yet.';
      } else {
        emailNotificationMessage = ' The transfer completed, but the recipient email could not be sent right now.';
      }
    }

    return {
      ok: true,
      receipt,
      message:
        apexRecipient && !recipientVerified
          ? `${formatCurrency(amountValue)} was sent to ${resolvedRecipient}, but the funds are on hold until the recipient is verified by Apex Bank.`
          : `${formatCurrency(amountValue)} sent to ${resolvedRecipient} from ${debitResult.sourceLabel}.${emailNotificationMessage}`,
    };
  }

  function handleSubmitBillPayment(billForm) {
    if (!activeUser || activeUser.role === 'admin') {
      return { ok: false, message: 'Bill payment is only available for signed-in retail users.' };
    }

    const biller = billForm.biller.trim();
    const reference = billForm.reference.trim();
    const amountValue = Number(billForm.amount);

    if (!biller || !reference) {
      return { ok: false, message: 'Enter a biller and payment reference.' };
    }

    const debitResult = debitActiveUserAccount(billForm.sourceAccount, amountValue);

    if (!debitResult.ok) {
      return debitResult;
    }

    const receipt = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: biller,
      type: 'Bills',
      amount: `-${formatCurrency(amountValue)}`,
      date: getDisplayDate(),
      status: 'Completed',
      owner: activeUser.name,
      reviewStatus: amountValue >= 5000 ? 'Pending Review' : 'Monitored',
      destination: `Reference • ${reference}`,
      note: billForm.note.trim(),
    };

    setAdminTransactionRecords((current) => [receipt, ...current]);
    setAdminNotice(`Bill payment queued for ${activeUser.name}.`);
    pushAdminActivity(`${activeUser.name} paid ${biller} with reference ${reference}.`, {
      promoteToLiveFeed: amountValue >= 5000,
    });

    return {
      ok: true,
      receipt,
      message: `${formatCurrency(amountValue)} paid to ${biller} from ${debitResult.sourceLabel}.`,
    };
  }

  async function handleSubmitCardRequest(cardType) {
    if (!activeUser || activeUser.role === 'admin') {
      return { ok: false, message: 'Card requests are only available for signed-in retail users.' };
    }

    const draftRequest = {
      id: `VC-${Math.floor(100 + Math.random() * 900)}`,
      type: `${cardType} ATM Card`,
      requested: getDisplayDate(),
      status: 'Pending',
      requesterId: activeUser.id,
      requesterName: activeUser.name,
    };

    const request = await submitRemoteUserCardRequest(draftRequest);

    setAdminCardRecords((current) => [request, ...current]);
    setAdminNotice(`${activeUser.name} requested a ${cardType.toLowerCase()}.`);
    pushAdminActivity(`${activeUser.name} opened card request ${request.id}.`, { promoteToLiveFeed: true });

    return {
      ok: true,
      request,
      message: `${cardType} request submitted. Card operations will review it shortly.`,
    };
  }

  async function handleSubmitSupportCase(supportForm) {
    if (!activeUser || activeUser.role === 'admin') {
      return { ok: false, message: 'Support requests are only available for signed-in retail users.' };
    }

    const subject = supportForm.subject.trim();
    const message = supportForm.message.trim();

    if (!subject || !message) {
      return { ok: false, message: 'Enter a support subject and a clear message.' };
    }

    const draftCase = {
      id: `CASE-${Math.floor(300 + Math.random() * 700)}`,
      type: 'Support',
      subject,
      owner: activeUser.name,
      requesterId: activeUser.id,
      priority: supportForm.priority,
      status: 'Open',
      assignee: 'Support Desk',
      message,
    };

    const supportCase = await submitRemoteUserCase(draftCase);

    setAdminCaseRecords((current) => [supportCase, ...current]);
    setAdminNotice(`Support case opened for ${activeUser.name}.`);
    pushAdminActivity(`${activeUser.name} opened support case ${supportCase.id}.`, {
      promoteToLiveFeed: supportForm.priority === 'High',
    });

    return {
      ok: true,
      supportCase,
      message: `Support case ${supportCase.id} opened and routed to the ${supportCase.assignee}.`,
    };
  }

  async function handleSubmitLoanRequest(loanForm) {
    if (!activeUser || activeUser.role === 'admin') {
      return { ok: false, message: 'Loan requests are only available for signed-in retail users.' };
    }

    const amountValue = Number(loanForm.amount);
    const purpose = loanForm.purpose.trim();

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return { ok: false, message: 'Enter a valid loan amount.' };
    }

    if (!purpose) {
      return { ok: false, message: 'Enter the purpose of the loan request.' };
    }

    const draftCase = {
      id: `CASE-${Math.floor(300 + Math.random() * 700)}`,
      type: 'Loan',
      subject: `${loanForm.product} request`,
      owner: activeUser.name,
      requesterId: activeUser.id,
      priority: amountValue >= 25000 ? 'High' : 'Medium',
      status: 'Open',
      assignee: 'Lending Desk',
      amountRequested: formatCurrency(amountValue),
      tenor: `${loanForm.tenor} months`,
      purpose,
      sourceAccount: loanForm.sourceAccount,
    };

    const loanCase = await submitRemoteUserCase(draftCase);

    setAdminCaseRecords((current) => [loanCase, ...current]);
    setAdminNotice(`Loan request opened for ${activeUser.name}.`);
    pushAdminActivity(`${activeUser.name} opened loan request ${loanCase.id} for ${loanCase.amountRequested}.`, {
      promoteToLiveFeed: amountValue >= 25000,
    });

    return {
      ok: true,
      request: loanCase,
      message: `Loan request ${loanCase.id} submitted to the ${loanCase.assignee}.`,
    };
  }

  async function handleSubmitInvestmentRequest(investmentForm) {
    if (!activeUser || activeUser.role === 'admin') {
      return { ok: false, message: 'Investment requests are only available for signed-in retail users.' };
    }

    const amountValue = Number(investmentForm.amount);
    const goal = investmentForm.goal.trim();

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return { ok: false, message: 'Enter a valid investment amount.' };
    }

    if (!goal) {
      return { ok: false, message: 'Enter the investment goal or objective.' };
    }

    const draftCase = {
      id: `CASE-${Math.floor(300 + Math.random() * 700)}`,
      type: 'Investment',
      subject: `${investmentForm.plan} interest`,
      owner: activeUser.name,
      requesterId: activeUser.id,
      priority: amountValue >= 20000 ? 'High' : 'Medium',
      status: 'Open',
      assignee: 'Wealth Desk',
      amountRequested: formatCurrency(amountValue),
      horizon: investmentForm.horizon,
      goal,
      fundingAccount: investmentForm.fundingAccount,
    };

    const investmentCase = await submitRemoteUserCase(draftCase);

    setAdminCaseRecords((current) => [investmentCase, ...current]);
    setAdminNotice(`Investment request opened for ${activeUser.name}.`);
    pushAdminActivity(`${activeUser.name} opened investment request ${investmentCase.id} for ${investmentCase.amountRequested}.`, {
      promoteToLiveFeed: amountValue >= 20000,
    });

    return {
      ok: true,
      request: investmentCase,
      message: `Investment request ${investmentCase.id} submitted to the ${investmentCase.assignee}.`,
    };
  }

  async function handleSubmitWithdrawalRequest(withdrawalForm) {
    if (!activeUser || activeUser.role === 'admin') {
      return { ok: false, message: 'Withdrawal requests are only available for users.' };
    }

    const amountValue = Number(withdrawalForm.amount);
    const selectedBank = (activeUser.savedBanks ?? []).find((bank) => bank.id === withdrawalForm.bankId);

    if (!selectedBank) {
      return { ok: false, message: 'Select a saved bank for this withdrawal.' };
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return { ok: false, message: 'Enter a valid withdrawal amount.' };
    }

    const requestId = `WD-${Math.floor(1000 + Math.random() * 9000)}`;
    const supportMessage = buildWithdrawalSupportMessage({
      userName: activeUser.name,
      amount: formatCurrency(amountValue),
      bankName: selectedBank.bankName,
      accountNumber: selectedBank.accountNumber,
      requestId,
      note: withdrawalForm.message.trim(),
    });

    const draftRequest = {
      id: requestId,
      amount: formatCurrency(amountValue),
      destination: `${selectedBank.bankName} • ${selectedBank.accountNumber}`,
      requested: getDisplayDate(),
      status: 'Pending',
      code: 'Awaiting approval',
      requesterId: activeUser.id,
      requesterName: activeUser.name,
      supportMessage,
    };

    const nextRequest = await submitRemoteUserWithdrawal(draftRequest);

    setAdminWithdrawalRecords((current) => [nextRequest, ...current]);
    setAdminNotice(`New withdrawal request received from ${activeUser.name}.`);
    pushAdminActivity(`${activeUser.name} submitted withdrawal request ${requestId}.`, { promoteToLiveFeed: true });

    return {
      ok: true,
      request: nextRequest,
      message: 'Withdrawal request submitted. Contact customer service to request your withdrawal code.',
    };
  }

  function getAdminTimestamp() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  function pushAdminActivity(message, options = {}) {
    const entry = `${getAdminTimestamp()} - ${message}`;
    setAdminActivityRecords((current) => [entry, ...current].slice(0, 8));

    if (options.promoteToLiveFeed) {
      setAdminLiveEvents((current) => [entry, ...current].slice(0, 6));
    }
  }

  function handleAdminSectionChange(section) {
    runLoadingFlow(`admin-${section.toLowerCase().replace(/\s+/g, '-')}`, () => {
      setAdminSection(section);
      setAdminNotice(`${section} opened.`);
      pushAdminActivity(`${activeUser?.name ?? 'Admin'} opened ${section}.`);
    });
  }

  function openAnnouncementComposer() {
    setAnnouncementComposerOpen(true);
  }

  function closeAnnouncementComposer() {
    setAnnouncementComposerOpen(false);
  }

  function handleAdminAnnouncement() {
    const issuedAt = new Date().toISOString();
    const audience = announcementDraft.audience.trim() || 'All retail users';
    const announcement = {
      id: `ANN-${Date.now()}`,
      title: announcementDraft.title.trim() || 'Operations update issued',
      audience,
      channel: announcementDraft.channel,
      status: 'Queued',
      createdAt: issuedAt,
    };
    const normalizedAudience = audience.toLowerCase();

    setAdminNotificationRecords((current) => [announcement, ...current].slice(0, 6));
    setAccounts((current) =>
      current.map((account) => {
        if (account.role === 'admin') {
          return account;
        }

        const matchesSpecificAudience = [account.name, account.email, account.id, account.accountNumber ?? '']
          .some((value) => String(value).toLowerCase() === normalizedAudience);
        const deliverToAccount =
          normalizedAudience === 'all retail users'
          || normalizedAudience === 'all users'
          || normalizedAudience === 'all customers'
          || matchesSpecificAudience;

        if (!deliverToAccount) {
          return account;
        }

        return {
          ...account,
          notifications: [
            normalizeNotificationEntry({
              id: `${announcement.id}-${account.id}`,
              type: 'admin-announcement',
              title: 'Admin message',
              message: announcement.title,
              channel: announcement.channel,
              audience: announcement.audience,
              createdAt: issuedAt,
            }),
            ...(account.notifications ?? []).map(normalizeNotificationEntry),
          ],
        };
      }),
    );
    setAnnouncementDraft((current) => ({ ...current, title: '' }));
    setAdminNotice(`Announcement queued for ${audience}.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} queued a new announcement for ${audience}.`, { promoteToLiveFeed: true });
    setAnnouncementComposerOpen(false);
  }

  function updateAnnouncementDraft(field, value) {
    setAnnouncementDraft((current) => ({ ...current, [field]: value }));
  }

  function handleAdminExportReports() {
    const reportId = `RPT-${Math.floor(100 + Math.random() * 900)}`;
    const report = {
      id: reportId,
      generatedAt: new Date().toISOString(),
      section: adminSection,
      users: adminUserRecords.length,
      activeUsers: activeAdminUsers,
      pendingWithdrawals: pendingWithdrawalCount,
      cardRequests: adminCardRecords.length,
      alerts: riskEventCount,
    };

    if (typeof window !== 'undefined') {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = 'apex-admin-report.json';
      link.click();
      window.URL.revokeObjectURL(href);
    }

    setAdminExportHistory((current) => [
      { id: reportId, label: `${adminSection} Export`, createdAt: 'Just now', status: 'Ready' },
      ...current,
    ].slice(0, 6));
    setAdminNotice('Report exported successfully.');
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} exported the admin report.`);
  }

  function openAdminDialog(kind, targetId, title, message, options = {}) {
    setAdminDialog({
      open: true,
      kind,
      targetId,
      title,
      message,
      customerMessage: options.customerMessage ?? '',
      note: options.note ?? '',
      nextStatus: options.nextStatus ?? '',
      confirmLabel: options.confirmLabel ?? 'Confirm',
      requiresNote: options.requiresNote ?? false,
    });
  }

  function closeAdminDialog() {
    setAdminDialog({
      open: false,
      kind: '',
      targetId: '',
      title: '',
      message: '',
      customerMessage: '',
      note: '',
      nextStatus: '',
      confirmLabel: 'Confirm',
      requiresNote: false,
    });
  }

  function updateAdminDialogNote(note) {
    setAdminDialog((current) => ({ ...current, note }));
  }

  function openCaseReviewDialog(caseEntry, nextStatus) {
    const actionLabel = nextStatus === 'Approved' ? 'Approve' : nextStatus === 'Rejected' ? 'Reject' : nextStatus === 'Resolved' ? 'Resolve' : 'Review';
    const defaultNote = caseEntry.adminNote ?? '';

    openAdminDialog(
      `case-${nextStatus.toLowerCase()}`,
      caseEntry.id,
      `${actionLabel} ${caseEntry.type.toLowerCase()} request`,
      `${actionLabel} ${caseEntry.id} for ${caseEntry.owner} and store a reviewer note for the user.`,
      {
        customerMessage: caseEntry.message ?? '',
        note: defaultNote,
        nextStatus,
        confirmLabel: actionLabel,
        requiresNote: true,
      },
    );
  }

  function handleAdminUserReview(name) {
    runLoadingFlow('admin-user-workspace', () => {
      setSelectedUser(name);
      setAdminUsersView('detail');
      setAdminUserWorkspaceTab('Overview');
      setAdminSection('Users Management');
      setAdminNotice(`${name} loaded into the review panel.`);
      pushAdminActivity(`${activeUser?.name ?? 'Admin'} opened ${name}'s profile.`);
    });
  }

  function handleCloseAdminUserWorkspace() {
    runLoadingFlow('admin-users-management', () => {
      setAdminUsersView('list');
      setAdminUserWorkspaceTab('Overview');
    });
  }

  function handleAdminUserWorkspaceTabChange(tab) {
    runLoadingFlow(`admin-workspace-${tab.toLowerCase()}`, () => {
      setAdminUserWorkspaceTab(tab);
    });
  }

  function updateUserEditForm(field, value) {
    setUserEditForm((current) => ({ ...current, [field]: value }));
  }

  function updateLimitForm(field, value) {
    setLimitForm((current) => ({ ...current, [field]: value }));
  }

  function handleSaveUserProfileEdits() {
    if (!selectedAdminRecord) {
      return;
    }

    const nextPassword = userEditForm.password.trim();

    setAdminUserRecords((current) =>
      current.map((user) =>
        user.name === selectedAdminRecord.name
          ? {
              ...user,
              segment: userEditForm.segment.trim() || user.segment,
              kycLevel: userEditForm.kycLevel.trim() || user.kycLevel,
              lastActivity: 'Just now',
            }
          : user,
      ),
    );

    setAccounts((current) =>
      current.map((account) =>
        account.id === selectedAdminRecord.accountId
          ? {
              ...account,
              segment: userEditForm.segment.trim() || account.segment,
              ...(nextPassword ? { password: nextPassword } : {}),
            }
          : account,
      ),
    );

    setAdminNotice(`${selectedAdminRecord.name} profile details were updated.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} updated ${selectedAdminRecord.name}'s profile details.`);
  }

  function updateAdminCreditForm(field, value) {
    setAdminCreditForm((current) => ({ ...current, [field]: value }));
  }

  function handleAdminAddFunds() {
    if (!selectedAdminRecord) {
      setAdminFundingResult({
        ok: false,
        kind: 'admin-funding',
        title: 'Funding could not be posted',
        message: 'No customer is currently selected for funding.',
        createdAt: new Date().toISOString(),
        auditLabel: 'Needs Review',
      });
      return;
    }

    const amountValue = Number(adminCreditForm.amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setAdminNotice('Enter a valid amount to credit this user.');
      setAdminFundingResult({
        ok: false,
        kind: 'admin-funding',
        title: 'Funding amount is invalid',
        message: 'Enter a valid positive amount before posting customer funds.',
        createdAt: new Date().toISOString(),
        auditLabel: 'Needs Review',
      });
      return;
    }

    const targetAccount = accounts.find((account) => account.id === selectedAdminRecord.accountId && account.role !== 'admin');

    if (!targetAccount) {
      setAdminNotice('No valid retail user is selected for funding.');
      setAdminFundingResult({
        ok: false,
        kind: 'admin-funding',
        title: 'Customer account unavailable',
        message: 'The selected customer account could not be found for this funding action.',
        createdAt: new Date().toISOString(),
        auditLabel: 'Needs Review',
      });
      return;
    }

    const availableLabels = targetAccount.accounts.map((entry) => entry.label);
    const targetLabel = availableLabels.includes(adminCreditForm.accountLabel)
      ? adminCreditForm.accountLabel
      : availableLabels.includes('Current')
        ? 'Current'
        : availableLabels[0];

    if (!targetLabel) {
      setAdminNotice('No eligible balance bucket was found for this user.');
      setAdminFundingResult({
        ok: false,
        kind: 'admin-funding',
        title: 'No eligible account bucket',
        message: 'This customer does not have a valid balance bucket available for funding.',
        createdAt: new Date().toISOString(),
        auditLabel: 'Needs Review',
      });
      return;
    }

    const transactionId = `ADM-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date().toISOString();
    const note = adminCreditForm.note.trim();

    setAccounts((current) =>
      current.map((account) => {
        if (account.id !== targetAccount.id) {
          return account;
        }

        return {
          ...account,
          accounts: account.accounts.map((entry) =>
            entry.label === targetLabel
              ? { ...entry, amount: Number((entry.amount + amountValue).toFixed(2)) }
              : entry,
          ),
          notifications: [
            normalizeNotificationEntry({
              id: `NOTICE-${transactionId}`,
              type: 'admin-credit',
              title: 'Account funded',
              message: `${activeUser?.name ?? 'Admin'} added ${formatCurrency(amountValue)} to your ${targetLabel} account${note ? ` with note: ${note}` : '.'}`,
              createdAt,
            }),
            ...(account.notifications ?? []).map(normalizeNotificationEntry),
          ],
        };
      }),
    );

    setAdminTransactionRecords((current) => [
      {
        id: transactionId,
        name: targetAccount.name,
        type: 'Admin Credit',
        amount: `+${formatCurrency(amountValue)}`,
        date: 'Just now',
        status: 'Completed',
        reviewStatus: 'Reviewed',
        destination: `Apex Bank • ${targetLabel}`,
        note: note || 'Admin funding action',
      },
      ...current,
    ]);

    setAdminUserRecords((current) =>
      current.map((user) =>
        user.accountId === selectedAdminRecord.accountId
          ? { ...user, lastActivity: 'Admin funding applied' }
          : user,
      ),
    );

    setAdminCreditForm({ amount: '', accountLabel: targetLabel, note: '' });
    setAdminFundingReceipt({
      transactionId,
      accountId: selectedAdminRecord.accountId,
      userName: selectedAdminRecord.name,
      accountLabel: targetLabel,
      amount: amountValue,
      note,
      createdAt,
    });
    setAdminFundingResult({
      ok: true,
      kind: 'admin-funding',
      title: 'Funding posted successfully',
      message: `${formatCurrency(amountValue)} was credited to ${selectedAdminRecord.name}'s ${targetLabel} account.`,
      amount: amountValue,
      accountLabel: targetLabel,
      transactionId,
      customerName: selectedAdminRecord.name,
      createdAt,
      auditLabel: 'Audit Logged',
    });
    setAdminNotice(`${formatCurrency(amountValue)} was added to ${selectedAdminRecord.name}'s ${targetLabel} account.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} added ${formatCurrency(amountValue)} to ${selectedAdminRecord.name}.`, {
      promoteToLiveFeed: true,
    });
  }

  function handleSaveUserLimits() {
    if (!selectedAdminRecord) {
      return;
    }

    setAdminUserRecords((current) =>
      current.map((user) =>
        user.name === selectedAdminRecord.name
          ? {
              ...user,
              transferLimit: limitForm.transferLimit,
              cardLimit: limitForm.cardLimit,
              lastActivity: 'Just now',
            }
          : user,
      ),
    );

    setAdminNotice(`${selectedAdminRecord.name} limits were updated.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} updated limits for ${selectedAdminRecord.name}.`);
  }

  function toggleAdminUserSelection(name) {
    setSelectedAdminUserNames((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
  }

  function toggleSelectAllAdminUsers() {
    const currentPageNames = paginatedAdminUsers.map((user) => user.name);
    const allSelected = currentPageNames.every((name) => selectedAdminUserNames.includes(name));

    setSelectedAdminUserNames((current) =>
      allSelected ? current.filter((name) => !currentPageNames.includes(name)) : [...new Set([...current, ...currentPageNames])],
    );
  }

  function handleBulkUserAction(action) {
    if (selectedAdminUserNames.length === 0) {
      setAdminNotice('Select at least one user before running a bulk action.');
      return;
    }

    const nextStatus = {
      activate: 'Active',
      suspend: 'Suspended',
      flag: 'Flagged',
    }[action];

    setAdminUserRecords((current) =>
      current.map((user) =>
        selectedAdminUserNames.includes(user.name)
          ? {
              ...user,
              status: nextStatus,
              lastActivity: 'Just now',
              riskScore: action === 'flag' ? 88 : action === 'suspend' ? 64 : 18,
            }
          : user,
      ),
    );

    setAccounts((current) =>
      current.map((account) =>
        selectedAdminUserNames.includes(account.name) && account.role !== 'admin'
          ? { ...account, status: nextStatus }
          : account,
      ),
    );

    setAdminNotice(`${selectedAdminUserNames.length} users updated to ${nextStatus}.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} ran a bulk ${nextStatus.toLowerCase()} action on ${selectedAdminUserNames.length} users.`);
    setSelectedAdminUserNames([]);
  }

  function toggleTransactionSelection(transactionId) {
    setSelectedTransactionIds((current) =>
      current.includes(transactionId) ? current.filter((item) => item !== transactionId) : [...current, transactionId],
    );
  }

  function toggleSelectAllTransactions() {
    const currentPageIds = paginatedAdminTransactions.map((entry) => entry.id);
    const allSelected = currentPageIds.every((id) => selectedTransactionIds.includes(id));

    setSelectedTransactionIds((current) =>
      allSelected ? current.filter((id) => !currentPageIds.includes(id)) : [...new Set([...current, ...currentPageIds])],
    );
  }

  function handleBulkTransactionAction(action) {
    if (selectedTransactionIds.length === 0) {
      setAdminNotice('Select at least one transaction before running a bulk action.');
      return;
    }

    setAdminTransactionRecords((current) =>
      current.map((entry) =>
        selectedTransactionIds.includes(entry.id)
          ? { ...entry, reviewStatus: action === 'flag' ? 'Flagged' : 'Resolved' }
          : entry,
      ),
    );

    setAdminNotice(`${selectedTransactionIds.length} transactions updated.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} ran a bulk ${action} action on ${selectedTransactionIds.length} transactions.`);
    setSelectedTransactionIds([]);
  }

  function handleAdminUserAction(action, targetIdentifier = selectedAdminRecord?.accountId ?? selectedAdminRecord?.name) {
    if (!targetIdentifier) {
      return;
    }

    const targetRecord = adminUserRecords.find(
      (user) => user.accountId === targetIdentifier || user.name === targetIdentifier || user.customerId === targetIdentifier,
    );

    if (!targetRecord) {
      return;
    }

    setSelectedUser(targetRecord.name);

    if (action === 'delete') {
      openAdminDialog(
        'delete-user',
        targetRecord.accountId ?? targetRecord.name,
        'Delete user account',
        `Remove ${targetRecord.name} from the admin customer list? This action is destructive.`,
      );
      return;
    }

    if (action === 'verify') {
      let releasedTransfers = [];

      setAdminUserRecords((current) =>
        current.map((user) =>
          user.name === targetRecord.name
            ? {
                ...user,
                verificationStatus: 'Verified',
                kyc: 'Verified',
                kycLevel: 'Verified Tier 2',
                lastActivity: 'Just now',
              }
            : user,
        ),
      );

      if (targetRecord.accountId) {
        setAccounts((current) =>
          current.map((account) => {
            if (account.id !== targetRecord.accountId) {
              return account;
            }

            releasedTransfers = account.pendingIncomingTransfers ?? [];
            const targetLabel = account.accounts.some((entry) => entry.label === 'Current')
              ? 'Current'
              : account.accounts[0]?.label;
            const releasedTotal = releasedTransfers.reduce((sum, entry) => sum + entry.amountValue, 0);

            return {
              ...account,
              verificationStatus: 'Verified',
              accounts: account.accounts.map((entry) =>
                entry.label === targetLabel
                  ? { ...entry, amount: Number((entry.amount + releasedTotal).toFixed(2)) }
                  : entry,
              ),
              pendingIncomingTransfers: [],
              notifications: [
                {
                  id: `NOTICE-VERIFIED-${Date.now()}`,
                  type: 'verification-complete',
                  message: 'Your account verification is complete. Held incoming Apex Bank transfers have been released to your account.',
                },
                ...(account.notifications ?? []).filter((entry) => entry.type !== 'verification-hold'),
              ],
            };
          }),
        );
      }

      if (releasedTransfers.length > 0) {
        setAdminTransactionRecords((current) => [
          ...releasedTransfers.map((entry) => ({
            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            name: entry.senderName,
            type: 'Income',
            amount: `+${formatCurrency(entry.amountValue)}`,
            date: getDisplayDate(),
            status: 'Completed',
            owner: targetRecord.name,
            reviewStatus: 'Reviewed',
            destination: 'Apex Bank • Released after verification',
            note: entry.note || `Incoming Apex Bank transfer from ${entry.senderName}`,
          })),
          ...current,
        ]);
      }

      setAdminNotice(`${targetRecord.name} has been verified.${releasedTransfers.length > 0 ? ` ${releasedTransfers.length} held transfer(s) released.` : ''}`);
      pushAdminActivity(`${activeUser?.name ?? 'Admin'} verified ${targetRecord.name}.${releasedTransfers.length > 0 ? ` Released ${releasedTransfers.length} held transfer(s).` : ''}`, {
        promoteToLiveFeed: true,
      });
      return;
    }

    const nextStatus = {
      activate: 'Active',
      suspend: 'Suspended',
      flag: 'Flagged',
    }[action];

    const nextRiskScore = {
      activate: 18,
      suspend: 64,
      flag: 88,
    }[action];

    setAdminUserRecords((current) =>
      current.map((user) =>
        user.name === targetRecord.name
          ? {
              ...user,
              status: nextStatus,
              lastActivity: 'Just now',
              riskScore: nextRiskScore,
            }
          : user,
      ),
    );

    if (targetRecord.accountId) {
      setAccounts((current) =>
        current.map((account) =>
          account.id === targetRecord.accountId ? { ...account, status: nextStatus } : account,
        ),
      );
    }

    setAdminNotice(`${targetRecord.name} is now ${nextStatus}.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} changed ${targetRecord.name} to ${nextStatus}.`, {
      promoteToLiveFeed: action !== 'activate',
    });
  }

  function handleWithdrawalDecision(requestId, decision) {
    if (decision === 'reject') {
      openAdminDialog('reject-withdrawal', requestId, 'Reject withdrawal request', `Reject withdrawal ${requestId} and mark it as not issued?`);
      return;
    }

    applyWithdrawalDecision(requestId, decision);
  }

  function applyWithdrawalDecision(requestId, decision) {
    let updatedRequest = null;

    setAdminWithdrawalRecords((current) =>
      current.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        updatedRequest = {
          ...request,
          status: decision === 'approve' ? 'Approved' : 'Rejected',
          code: decision === 'approve' ? `APX-${Math.floor(100000 + Math.random() * 899999)}` : 'Not issued',
        };

        return updatedRequest;
      }),
    );

    if (!updatedRequest) {
      return;
    }

    setAdminNotice(`${updatedRequest.id} ${decision === 'approve' ? 'approved' : 'rejected'}.`);
    pushAdminActivity(
      `${activeUser?.name ?? 'Admin'} ${decision === 'approve' ? 'approved' : 'rejected'} withdrawal ${updatedRequest.id}.`,
      { promoteToLiveFeed: true },
    );
  }

  function handleCardGeneration(requestId) {
    let updatedRequest = null;

    setAdminCardRecords((current) =>
      current.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        updatedRequest = {
          ...request,
          status: 'Active',
          type: request.type.includes('Generated') ? request.type : `${request.type} - Generated`,
        };

        return updatedRequest;
      }),
    );

    if (!updatedRequest) {
      return;
    }

    const issuedCard = createIssuedCardRecord(updatedRequest, activeUser?.name ?? 'Admin');

    setAccounts((current) =>
      current.map((account) => {
        if (account.role === 'admin' || (account.id !== updatedRequest.requesterId && account.name !== updatedRequest.requesterName)) {
          return account;
        }

        const existingIssuedCards = account.issuedCards ?? [];
        const nextIssuedCards = existingIssuedCards.some((card) => card.requestId === updatedRequest.id || card.id === updatedRequest.id)
          ? existingIssuedCards.map((card) =>
              card.requestId === updatedRequest.id || card.id === updatedRequest.id
                ? { ...card, ...issuedCard }
                : card,
            )
          : [issuedCard, ...existingIssuedCards];

        return {
          ...account,
          issuedCards: nextIssuedCards,
          notifications: [
            normalizeNotificationEntry({
              id: `NOTICE-CARD-${updatedRequest.id}`,
              type: 'card-generated',
              title: 'Debit card ready',
              message: `Your ${issuedCard.cardMode.toLowerCase()} has been generated and is now active on your dashboard.`,
              createdAt: issuedCard.issuedAt,
            }),
            ...(account.notifications ?? []).map(normalizeNotificationEntry),
          ],
        };
      }),
    );

    setAdminNotice(`${updatedRequest.id} has been generated and activated.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} generated card request ${updatedRequest.id}.`, { promoteToLiveFeed: true });
  }

  function handleTransactionAction(transactionId, action) {
    let updatedTransaction = null;

    setAdminTransactionRecords((current) =>
      current.map((entry) => {
        if (entry.id !== transactionId) {
          return entry;
        }

        updatedTransaction = {
          ...entry,
          reviewStatus: action === 'flag' ? 'Flagged' : action === 'resolve' ? 'Resolved' : 'Reviewed',
        };

        return updatedTransaction;
      }),
    );

    if (!updatedTransaction) {
      return;
    }

    setAdminNotice(`${updatedTransaction.id} marked as ${updatedTransaction.reviewStatus}.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} updated transaction ${updatedTransaction.id} to ${updatedTransaction.reviewStatus}.`, {
      promoteToLiveFeed: action === 'flag',
    });
  }

  function getCaseAdminGuidance(caseEntry, nextStatus, customNote) {
    if (customNote) {
      return customNote;
    }

    if (caseEntry.type === 'Loan') {
      return {
        Reviewing: 'Lending desk is reviewing your amount, repayment tenor, and account profile.',
        Approved: 'Loan request approved in principle. Lending desk will contact you for final documentation and disbursement steps.',
        Rejected: 'Loan request was not approved. Reduce the requested amount or update your financial details before reapplying.',
      }[nextStatus] ?? '';
    }

    if (caseEntry.type === 'Investment') {
      return {
        Reviewing: 'Wealth desk is reviewing your selected plan, horizon, and funding profile.',
        Approved: 'Investment request approved for advisor onboarding. Expect a callback with next funding steps.',
        Rejected: 'Investment request was declined for now. Review your goal, horizon, or funding amount before submitting again.',
      }[nextStatus] ?? '';
    }

    if (caseEntry.type === 'Support') {
      return {
        Reviewing: 'Support desk is reviewing your case details and preparing the next response.',
        Resolved: 'Your support issue has been resolved. Review the admin note for the final update or next steps.',
      }[nextStatus] ?? '';
    }

    return '';
  }

  function handleCaseAction(caseId, nextStatus, customNote = '') {
    let updatedCase = null;

    setAdminCaseRecords((current) =>
      current.map((entry) => {
        if (entry.id !== caseId) {
          return entry;
        }

        const adminNote = getCaseAdminGuidance(entry, nextStatus, customNote);
        const nextAction = nextStatus === 'Rejected'
          ? 'Review the note and submit a fresh request when ready.'
          : nextStatus === 'Approved'
            ? 'Wait for the assigned desk to complete the next contact step.'
            : nextStatus === 'Reviewing'
              ? 'Keep your account details and supporting documents ready.'
              : entry.nextAction;

        updatedCase = {
          ...entry,
          status: nextStatus,
          adminNote: adminNote || entry.adminNote,
          nextAction,
        };
        return updatedCase;
      }),
    );

    if (!updatedCase) {
      return;
    }

    setAdminNotice(`${updatedCase.id} moved to ${nextStatus}.`);
    pushAdminActivity(`${activeUser?.name ?? 'Admin'} moved case ${updatedCase.id} to ${nextStatus}.`, {
      promoteToLiveFeed: nextStatus === 'Escalated',
    });
  }

  function handleSettingToggle(settingKey) {
    setAdminSettings((current) => {
      const nextValue = !current[settingKey];
      setAdminNotice(`${settingKey} ${nextValue ? 'enabled' : 'disabled'}.`);
      pushAdminActivity(`${activeUser?.name ?? 'Admin'} ${nextValue ? 'enabled' : 'disabled'} ${settingKey}.`);
      return { ...current, [settingKey]: nextValue };
    });
  }

  function confirmAdminDialog() {
    if (!adminDialog.open) {
      return;
    }

    if (adminDialog.requiresNote && !adminDialog.note.trim()) {
      setAdminNotice('Add a reviewer note before confirming this case update.');
      return;
    }

    if (adminDialog.kind === 'delete-user') {
      const deletedRecord = adminUserRecords.find((user) => user.accountId === adminDialog.targetId || user.name === adminDialog.targetId);
      const deletedName = deletedRecord?.name ?? adminDialog.targetId;

      setAdminUserRecords((current) => current.filter((user) => user.accountId !== adminDialog.targetId && user.name !== adminDialog.targetId));

      if (deletedRecord?.accountId) {
        setAccounts((current) => current.filter((account) => account.id !== deletedRecord.accountId));
      }

      setAdminNotice(`${deletedName} was removed from the customer list.`);
      pushAdminActivity(`${activeUser?.name ?? 'Admin'} deleted ${deletedName}.`, { promoteToLiveFeed: true });
    }

    if (adminDialog.kind === 'reject-withdrawal') {
      applyWithdrawalDecision(adminDialog.targetId, 'reject');
    }

    if (adminDialog.kind.startsWith('case-')) {
      handleCaseAction(adminDialog.targetId, adminDialog.nextStatus, adminDialog.note.trim());
    }

    closeAdminDialog();
  }

  if (!activeUser) {
    return (
      <div className="app-shell auth-shell">
        <div id="google_translate_element" className="google-translate-host" aria-hidden="true" />
        <div className="ambient ambient-left" />
        <div className="ambient ambient-right" />
        <AuthScreen
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          updateAuthField={updateAuthField}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          authMessage={authMessage}
          setAuthMessage={setAuthMessage}
          publicPage={publicPage}
          setPublicPage={setPublicPage}
          onRunLoadingFlow={runLoadingFlow}
          onResetDemoData={handleRestoreDemo}
          languageSelector={languageSelector}
        />

        {renderLoadingOverlay()}
      </div>
    );
  }

  if (effectiveMode === 'user') {
    return (
      <div className="app-shell app-shell-user">
        <div id="google_translate_element" className="google-translate-host" aria-hidden="true" />
        <div className="ambient ambient-left" />
        <div className="ambient ambient-right" />
        <UserDashboard
          user={activeUser}
          accounts={accounts}
          canAccessAdmin={activeUser.role === 'admin'}
          customerServiceNumber={CUSTOMER_SERVICE_NUMBER}
          totalBalance={totalBalance}
          showBalance={showBalance}
          setShowBalance={setShowBalance}
          transactionFilter={transactionFilter}
          setTransactionFilter={setTransactionFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          amountFilter={amountFilter}
          setAmountFilter={setAmountFilter}
          filteredTransactions={filteredTransactions}
          withdrawalCode={withdrawalCode}
          setWithdrawalCode={setWithdrawalCode}
          userWithdrawalRequests={userWithdrawalRequests}
          userCardRequests={userCardRequests}
          userSupportCases={userSupportCases}
          userLoanCases={userLoanCases}
          userInvestmentCases={userInvestmentCases}
          userNotifications={userNotifications}
          onMarkNotificationsRead={handleMarkUserNotificationsRead}
          onAddSavedBank={handleAddSavedBank}
          onSubmitTransfer={handleSubmitTransfer}
          onSubmitBillPayment={handleSubmitBillPayment}
          onSubmitWithdrawalRequest={handleSubmitWithdrawalRequest}
          onSubmitCardRequest={handleSubmitCardRequest}
          onSubmitSupportCase={handleSubmitSupportCase}
          onSubmitLoanRequest={handleSubmitLoanRequest}
          onSubmitInvestmentRequest={handleSubmitInvestmentRequest}
          onOpenAdminDashboard={() => runLoadingFlow('dashboard-admin', () => setMode('admin'))}
          onRunLoadingFlow={runLoadingFlow}
          onLogout={requestLogout}
        />

        {logoutDialogOpen && (
          <div className="admin-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Confirm logout">
            <div className="admin-dialog glass-card logout-dialog-card">
              <p className="eyebrow">Session Confirmation</p>
              <h3>Do you want to log out?</h3>
              <p>Your current banking session will close and you will return to the sign-in screen.</p>
              <div className="row-actions admin-dialog-actions logout-dialog-actions">
                <button type="button" className="secondary-button" onClick={cancelLogout}>
                  Cancel
                </button>
                <button type="button" className="primary-button" onClick={confirmLogout}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {renderLoadingOverlay()}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div id="google_translate_element" className="google-translate-host" aria-hidden="true" />
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="app-header glass-card">
        <div className="app-header-brand">
          <ApexBrand className="app-brand" />
          <div>
            <p className="eyebrow">Operations Workspace</p>
            <h1>Premium Digital Banking Control Center</h1>
          </div>
        </div>

        <div className="mode-toggle" role="tablist" aria-label="Dashboard mode selector">
          <button type="button" onClick={() => runLoadingFlow('dashboard-user', () => setMode('user'))}>
            User Dashboard
          </button>
          <button className="active" type="button" onClick={() => runLoadingFlow('dashboard-admin', () => setMode('admin'))}>
            Admin Dashboard
          </button>
        </div>

        <div className="session-bar">
          <div className="profile-pill">
            <AvatarBadge className="avatar" imageSrc={activeUser.avatarImage} fallback={activeUser.avatar} alt={`${activeUser.name} profile`} />
            <div>
              <strong>{activeUser.name}</strong>
              <span>{activeUser.segment}</span>
            </div>
          </div>
          <button type="button" className="secondary-button compact-button" onClick={requestLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <AdminDashboard
        adminUser={activeUser}
        currentMode={mode}
        onSwitchToUser={() => runLoadingFlow('dashboard-user', () => setMode('user'))}
        onSwitchToAdmin={() => runLoadingFlow('dashboard-admin', () => setMode('admin'))}
        adminSection={adminSection}
        onSectionChange={handleAdminSectionChange}
        adminNotice={adminNotice}
        announcementComposerOpen={announcementComposerOpen}
        onOpenAnnouncementComposer={openAnnouncementComposer}
        onCloseAnnouncementComposer={closeAnnouncementComposer}
        onSendAnnouncement={handleAdminAnnouncement}
        announcementDraft={announcementDraft}
        onAnnouncementDraftChange={updateAnnouncementDraft}
        onExportReports={handleAdminExportReports}
        adminUserRecords={adminUserRecords}
        filteredAdminUsers={filteredAdminUsers}
        paginatedAdminUsers={paginatedAdminUsers}
        adminSearch={adminSearch}
        setAdminSearch={setAdminSearch}
        adminUserStatusFilter={adminUserStatusFilter}
        setAdminUserStatusFilter={setAdminUserStatusFilter}
        adminUserPage={adminUserPage}
        adminUserPageCount={adminUserPageCount}
        setAdminUserPage={setAdminUserPage}
        selectedAdminUserNames={selectedAdminUserNames}
        onToggleAdminUserSelection={toggleAdminUserSelection}
        onToggleSelectAllAdminUsers={toggleSelectAllAdminUsers}
        onBulkUserAction={handleBulkUserAction}
        selectedUser={selectedUser}
        adminUsersView={adminUsersView}
        adminUserWorkspaceTab={adminUserWorkspaceTab}
        selectedAdminRecord={selectedAdminRecord}
        onReviewUser={handleAdminUserReview}
        onCloseUserWorkspace={handleCloseAdminUserWorkspace}
        onAdminUserWorkspaceTabChange={handleAdminUserWorkspaceTabChange}
        onUserAction={handleAdminUserAction}
        onQuickUserAction={handleAdminUserAction}
        userEditForm={userEditForm}
        onUserEditChange={updateUserEditForm}
        onSaveUserProfileEdits={handleSaveUserProfileEdits}
        adminCreditForm={adminCreditForm}
        onAdminCreditFormChange={updateAdminCreditForm}
        onAdminAddFunds={() => runLoadingFlow('action-admin-funding', handleAdminAddFunds)}
        adminFundingAccounts={selectedAdminFundingAccounts}
        adminFundingReceipt={adminFundingReceipt}
        adminFundingResult={adminFundingResult}
        limitForm={limitForm}
        onLimitFormChange={updateLimitForm}
        onSaveUserLimits={handleSaveUserLimits}
        adminWithdrawalRecords={adminWithdrawalRecords}
        onWithdrawalDecision={handleWithdrawalDecision}
        adminCardRecords={adminCardRecords}
        onGenerateCard={handleCardGeneration}
        adminTransactionRecords={adminTransactionRecords}
        paginatedAdminTransactions={paginatedAdminTransactions}
        adminTransactionStatusFilter={adminTransactionStatusFilter}
        setAdminTransactionStatusFilter={setAdminTransactionStatusFilter}
        adminTransactionPage={adminTransactionPage}
        adminTransactionPageCount={adminTransactionPageCount}
        setAdminTransactionPage={setAdminTransactionPage}
        selectedTransactionIds={selectedTransactionIds}
        onToggleTransactionSelection={toggleTransactionSelection}
        onToggleSelectAllTransactions={toggleSelectAllTransactions}
        onBulkTransactionAction={handleBulkTransactionAction}
        onTransactionAction={handleTransactionAction}
        adminCaseRecords={adminCaseRecords}
        onCaseAction={handleCaseAction}
        onOpenCaseReviewDialog={openCaseReviewDialog}
        adminSettings={adminSettings}
        onSettingToggle={handleSettingToggle}
        adminExportHistory={adminExportHistory}
        adminDialog={adminDialog}
        onCloseDialog={closeAdminDialog}
        onConfirmDialog={confirmAdminDialog}
        onAdminDialogNoteChange={updateAdminDialogNote}
        adminNotificationRecords={adminNotificationRecords}
        adminActivityRecords={adminActivityRecords}
        adminLiveEvents={adminLiveEvents}
        pendingWithdrawalCount={pendingWithdrawalCount}
        riskEventCount={riskEventCount}
        activeAdminUsers={activeAdminUsers}
        openCaseCount={openCaseCount}
      />

      {logoutDialogOpen && (
        <div className="admin-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Confirm logout">
          <div className="admin-dialog glass-card logout-dialog-card">
            <p className="eyebrow">Session Confirmation</p>
            <h3>Do you want to log out?</h3>
            <p>Your current admin session will close and you will return to the sign-in screen.</p>
            <div className="row-actions admin-dialog-actions logout-dialog-actions">
              <button type="button" className="secondary-button" onClick={cancelLogout}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={confirmLogout}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {renderLoadingOverlay()}
    </div>
  );
}

function AuthScreen({
  authMode,
  setAuthMode,
  authForm,
  updateAuthField,
  handleLogin,
  handleRegister,
  authMessage,
  setAuthMessage,
  publicPage,
  setPublicPage,
  onRunLoadingFlow,
  onResetDemoData,
  languageSelector,
}) {
  const isHomePage = publicPage === 'home';
  const isAuthPage = publicPage === 'login' || publicPage === 'register';
  const pageContent = publicPageContent[publicPage] ?? publicPageContent.home;
  const generalCustomerServiceHref = getWhatsAppContactHref(
    CUSTOMER_SERVICE_NUMBER,
    'Hello Apex Bank concierge, I need help with my account.',
  );
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!cameraDialogOpen) {
      return undefined;
    }

    let cancelled = false;

    async function startCamera() {
      try {
        setCameraError('');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError('Camera access was not available. You can still continue without a captured photo.');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraDialogOpen]);

  function openPublicPage(nextPage) {
    onRunLoadingFlow(`public-${nextPage}`, () => {
      setPublicPage(nextPage);
    });
  }

  function openAuthPage(mode) {
    onRunLoadingFlow(`auth-${mode}`, () => {
      setAuthMode(mode);
      setPublicPage(mode);
      setAuthMessage('');
    });
  }

  function handleAuthSubmit(event) {
    event.preventDefault();

    if (authMode === 'login') {
      onRunLoadingFlow('auth-login', handleLogin);
      return;
    }

    setCapturedPhoto('');
    setCameraDialogOpen(true);
  }

  function closeCameraDialog() {
    setCameraDialogOpen(false);
    setCapturedPhoto('');
    setCameraError('');
  }

  function captureCameraPhoto() {
    if (!videoRef.current) {
      setCameraError('Camera preview is not ready yet.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 480;
    const context = canvas.getContext('2d');

    if (!context) {
      setCameraError('Photo capture is not supported in this browser session.');
      return;
    }

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.92));
    setCameraError('');
  }

  function retakeCameraPhoto() {
    setCapturedPhoto('');
    setCameraError('');
  }

  async function finalizeRegistration() {
    await onRunLoadingFlow('auth-register', () => handleRegister(capturedPhoto));
    closeCameraDialog();
  }

  async function continueWithoutPhoto() {
    setAuthMessage('Account will be created without a captured profile photo.');
    await onRunLoadingFlow('auth-register', () => handleRegister(''));
    closeCameraDialog();
  }

  if (isAuthPage) {
    return (
      <div className="auth-standalone-shell">
        <div className="landing-overlay auth-standalone-overlay" />
        <div className="landing-grid auth-standalone-grid" />

        <section className="auth-standalone-panel-wrap">
          <div className="auth-panel glass-card auth-page-panel auth-standalone-panel">
            <div className="mode-toggle auth-toggle">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => openAuthPage('login')}>
                Login
              </button>
              <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => openAuthPage('register')}>
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <label>
                  <span>Full name</span>
                  <input value={authForm.name} onChange={(event) => updateAuthField('name', event.target.value)} />
                </label>
              )}

              <label>
                <span>{authMode === 'login' ? 'Email or phone' : 'Email address'}</span>
                <input value={authForm.identifier} onChange={(event) => updateAuthField('identifier', event.target.value)} />
              </label>

              {authMode === 'register' && (
                <label>
                  <span>Phone number</span>
                  <input required value={authForm.phone} onChange={(event) => updateAuthField('phone', event.target.value)} />
                </label>
              )}

              {authMode === 'register' && (
                <label>
                  <span>Date of birth</span>
                  <input type="date" required value={authForm.dateOfBirth} onChange={(event) => updateAuthField('dateOfBirth', event.target.value)} />
                </label>
              )}

              {authMode === 'register' && (
                <label>
                  <span>Gender</span>
                  <select required value={authForm.gender} onChange={(event) => updateAuthField('gender', event.target.value)}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              )}

              <label>
                <span>Password</span>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(event) => updateAuthField('password', event.target.value)}
                />
              </label>

              {authMessage && <p className="auth-message">{authMessage}</p>}

              <button type="submit" className="primary-button auth-submit auth-standalone-submit">
                {authMode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
          </div>
        </section>

        {cameraDialogOpen ? (
          <div className="auth-camera-backdrop" role="dialog" aria-modal="true" aria-label="Capture profile photo">
            <div className="auth-camera-dialog glass-card">
              <div className="section-head compact">
                <div>
                  <p className="eyebrow">Profile Photo</p>
                  <h3>Take a picture to finish registration</h3>
                </div>
              </div>

              <div className="auth-camera-stage">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured profile preview" className="auth-camera-preview-image" />
                ) : (
                  <video ref={videoRef} className="auth-camera-video" autoPlay muted playsInline />
                )}
              </div>

              {cameraError ? <p className="auth-message">{cameraError}</p> : null}

              <div className="auth-camera-actions">
                {!capturedPhoto ? (
                  <button type="button" className="secondary-button" onClick={captureCameraPhoto}>
                    Capture Photo
                  </button>
                ) : (
                  <button type="button" className="secondary-button" onClick={retakeCameraPhoto}>
                    Retake Photo
                  </button>
                )}
                <button type="button" className="secondary-button" onClick={continueWithoutPhoto}>
                  Continue Without Photo
                </button>
                <button type="button" className="primary-button" onClick={finalizeRegistration}>
                  Finish Creating Account
                </button>
                <button type="button" className="secondary-button" onClick={closeCameraDialog}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="landing-page">
      <section
        className={
          publicPage === 'about'
            ? 'landing-hero landing-hero-about'
            : isHomePage
              ? 'landing-hero landing-hero-home'
              : 'landing-hero'
        }
      >
        <div className="landing-overlay" />
        <div className="landing-grid" />

        <header className="landing-nav">
          <ApexBrand className="landing-logo" />

          <nav className="landing-links">
            {landingNav.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-').replace('-us', '')}`}
                className="landing-link"
                onClick={(event) => {
                  event.preventDefault();
                  openPublicPage(item.toLowerCase().replace(/\s+/g, '-').replace('-us', ''));
                }}
              >
                <span className="landing-link-label">{item}</span>
                <span className="landing-link-caret">⌄</span>
              </a>
            ))}
          </nav>

          <div className="landing-nav-actions">
            {languageSelector}
            <button type="button" className="landing-login-button" onClick={() => openAuthPage('login')}>
              Log In
            </button>
          </div>
        </header>

        <div
          className={
            isHomePage
              ? 'landing-content landing-content-home'
              : isAuthPage
                ? 'landing-content landing-content-auth'
                : 'landing-content'
          }
        >
          <div className="landing-copy">
            {publicPage === 'about' ? (
              <>
                <p className="eyebrow landing-page-label">{publicPageContent[publicPage].label}</p>
                <h1>{publicPageContent[publicPage].title}</h1>
                <p className="eyebrow landing-page-label">{pageContent.label}</p>
                <div className="about-page-copy">
                  {aboutUsMessage.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="landing-actions">
                  <button type="button" className="landing-cta-primary" onClick={() => openPublicPage('home')}>
                    {publicPageContent[publicPage].primaryAction}
                  </button>
                  <button type="button" className="landing-cta-secondary" onClick={() => openAuthPage('login')}>
                    {publicPageContent[publicPage].secondaryAction} <span>›</span>
                  </button>
                </div>
              </>
            ) : publicPage !== 'home' ? (
              <>
                <p className="eyebrow landing-page-label">{publicPageContent[publicPage].label}</p>
                <h1>{publicPageContent[publicPage].title}</h1>
                <p>{publicPageContent[publicPage].description}</p>
                <p className="eyebrow landing-page-label">{pageContent.label}</p>
                <div className="landing-actions">
                  <button type="button" className="landing-cta-primary" onClick={() => openAuthPage('login')}>
                    {publicPageContent[publicPage].primaryAction}
                  </button>
                  <button type="button" className="landing-cta-secondary" onClick={() => openPublicPage('home')}>
                    {publicPageContent[publicPage].secondaryAction} <span>›</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1>
                  Brilliantly
                  <br />
                  Boring Since 1865
                </h1>
                <p>
                  We provide the stability you need to grow and the innovation you want to lead.
                </p>
                <div className="landing-actions">
                  <button
                    type="button"
                    className="landing-cta-primary"
                    onClick={() => openAuthPage('register')}
                  >
                    Get Started
                  </button>
                  <button type="button" className="landing-cta-secondary" onClick={() => openPublicPage('about')}>
                    Learn More <span>›</span>
                  </button>
                  <a className="landing-cta-support" href={generalCustomerServiceHref} target="_blank" rel="noreferrer">
                    WhatsApp Concierge
                  </a>
                </div>
              </>
            )}
          </div>

          {publicPage === 'about' ? (
            <div className="about-page-card glass-card">
              <p className="eyebrow">Our Promise</p>
              <h3>Banking that stays clear, secure, and within reach.</h3>
              <div className="about-page-highlights">
                <div>
                  <strong>Trust</strong>
                  <span>Transparent, stable financial services.</span>
                </div>
                <div>
                  <strong>Innovation</strong>
                  <span>Modern tools built for speed and protection.</span>
                </div>
                <div>
                  <strong>Support</strong>
                  <span>User-friendly experiences with real-time assistance.</span>
                </div>
              </div>
            </div>
          ) : publicPage !== 'home' ? (
            <div className="about-page-card glass-card">
              <p className="eyebrow">Why Apex</p>
              <h3>{pageContent.label} with trusted digital infrastructure.</h3>
              <div className="about-page-highlights">
                {pageContent.highlights.map((item) => (
                  <div key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="landing-image-spacer" aria-hidden="true">
              <div className="landing-brand-badge">
                <ApexBrand className="apex-brand-hero" showTagline />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="landing-feature-strip">
        {landingFeatures.map((feature) => (
          <article key={feature.title} className="landing-feature-item">
            <div className="landing-feature-icon">{feature.icon}</div>
            <div>
              <strong>{feature.title}</strong>
              <p>{feature.text}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function UserDashboard({
  user,
  accounts,
  canAccessAdmin,
  customerServiceNumber,
  totalBalance,
  showBalance,
  setShowBalance,
  transactionFilter,
  setTransactionFilter,
  dateFilter,
  setDateFilter,
  amountFilter,
  setAmountFilter,
  filteredTransactions,
  withdrawalCode,
  setWithdrawalCode,
  userWithdrawalRequests,
  userCardRequests,
  userSupportCases,
  userLoanCases,
  userInvestmentCases,
  userNotifications,
  onMarkNotificationsRead,
  onAddSavedBank,
  onSubmitTransfer,
  onSubmitBillPayment,
  onSubmitWithdrawalRequest,
  onSubmitCardRequest,
  onSubmitSupportCase,
  onSubmitLoanRequest,
  onSubmitInvestmentRequest,
  onOpenAdminDashboard,
  onRunLoadingFlow,
  onLogout,
}) {
  const [activeMobileTab, setActiveMobileTab] = useState('Dashboard');
  const [lastMobileTab, setLastMobileTab] = useState('Dashboard');
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState('');
  const [activeCardMode, setActiveCardMode] = useState('Virtual Card');
  const [showFullCardNumber, setShowFullCardNumber] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({ amount: '', bankId: user.savedBanks?.[0]?.id ?? '', message: '' });
  const [withdrawalFeedback, setWithdrawalFeedback] = useState('');
  const [submittedWithdrawal, setSubmittedWithdrawal] = useState(null);
  const [bankForm, setBankForm] = useState({ bankName: '', accountName: user.name, accountNumber: '' });
  const [bankFeedback, setBankFeedback] = useState('');
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    bankName: '',
    accountNumber: '',
    amount: '',
    sourceAccount: user.accounts[0]?.label ?? '',
    note: '',
  });
  const [transferFeedback, setTransferFeedback] = useState('');
  const [billForm, setBillForm] = useState({
    biller: '',
    reference: '',
    amount: '',
    sourceAccount: user.accounts[0]?.label ?? '',
    note: '',
  });
  const [billFeedback, setBillFeedback] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [actionUtilityFeedback, setActionUtilityFeedback] = useState('');
  const [cardFeedback, setCardFeedback] = useState('');
  const [supportForm, setSupportForm] = useState({ subject: '', priority: 'Medium', message: '' });
  const [supportFeedback, setSupportFeedback] = useState('');
  const [loanForm, setLoanForm] = useState({ product: 'Personal Loan', amount: '', tenor: '12', sourceAccount: user.accounts[0]?.label ?? '', purpose: '' });
  const [loanFeedback, setLoanFeedback] = useState('');
  const [investmentForm, setInvestmentForm] = useState({ plan: 'Managed Portfolio', amount: '', horizon: '12-24 months', fundingAccount: user.accounts[0]?.label ?? '', goal: '' });
  const [investmentFeedback, setInvestmentFeedback] = useState('');
  const [securityState, setSecurityState] = useState({ alerts: true, biometrics: true, cardLock: false });
  const [securityFeedback, setSecurityFeedback] = useState('');
  const primaryAccount = user.accounts[1] ?? user.accounts[0];
  const firstName = user.name.split(' ')[0];
  const selectedWithdrawalBank = (user.savedBanks ?? []).find((bank) => bank.id === withdrawalForm.bankId) ?? null;
  const inflowTotal = filteredTransactions
    .filter((entry) => entry.amount.startsWith('+'))
    .reduce((sum, entry) => sum + Number(entry.amount.replace(/[^0-9.]/g, '')), 0);
  const outflowTotal = filteredTransactions
    .filter((entry) => entry.amount.startsWith('-'))
    .reduce((sum, entry) => sum + Number(entry.amount.replace(/[^0-9.]/g, '')), 0);
  const paymentTransactions = filteredTransactions.filter((entry) => ['Transfer', 'Bills'].includes(entry.type));
  const billTransactions = filteredTransactions.filter((entry) => entry.type === 'Bills');
  const activeUserCards = userCardRequests.filter((request) => request.status === 'Active');
  const availableCardModes = Array.from(new Set(activeUserCards.map((request) => request.cardMode ?? getCardModeFromRequestType(request.type)).filter(Boolean)));
  const selectedCardMode = availableCardModes.includes(activeCardMode) ? activeCardMode : availableCardModes[0] ?? activeCardMode;
  const activeCardProduct = availableCardModes.includes(selectedCardMode) ? cardProductCatalog[selectedCardMode] : null;
  const latestCardRequest = userCardRequests[0] ?? null;
  const selectedCardRequest =
    userCardRequests.find((request) => (request.cardMode ?? getCardModeFromRequestType(request.type)) === selectedCardMode && request.status !== 'Rejected')
    ?? latestCardRequest;
  const hasIssuedCard = Boolean(activeCardProduct);
  const unreadNotifications = userNotifications.filter((entry) => !entry.readAt);
  const selectedNotification = selectedNotificationId
    ? userNotifications.find((entry) => entry.id === selectedNotificationId) ?? null
    : null;
  const activeNavItem = ['Accounts', 'Transfers', 'Bill Pay', 'Withdrawals', 'Receipt', 'Add Money'].includes(activeMobileTab)
    ? 'Accounts'
    : ['Support', 'Security'].includes(activeMobileTab)
      ? 'Profile'
      : ['Loans', 'Investments'].includes(activeMobileTab)
        ? 'Dashboard'
      : activeMobileTab;
  const moreActionItems = [
    { label: 'Pay Bills', icon: '◎', description: 'Utilities, subscriptions, and invoices.', page: 'Bill Pay' },
    { label: 'Loans', icon: '◈', description: 'View lending options and request help.', page: 'Loans' },
    { label: 'Investments', icon: '▲', description: 'Explore wealth and savings tools.', page: 'Investments' },
    { label: 'Support', icon: '☎', description: 'Open a case or call the desk.', page: 'Support' },
    { label: 'Security', icon: '⚙', description: 'Manage alerts and card access.', page: 'Security' },
    { label: 'Cards', icon: '▣', description: 'Review and request banking cards.', page: 'Cards' },
  ];
  const supportBackPage = ['Withdrawals', 'Add Money', 'Loans', 'Investments'].includes(lastMobileTab) ? lastMobileTab : 'Profile';
  const securityBackPage = ['Support', 'Add Money'].includes(lastMobileTab) ? lastMobileTab : 'Profile';
  const fundingAccountDigits = `${user.id}${user.phone}`.replace(/\D/g, '').slice(-10).padStart(10, '0');
  const fundingReference = `APX-${user.id.replace(/\D/g, '').slice(-4).padStart(4, '0')}-${firstName.toUpperCase()}`;
  const cleanedTransferAccountNumber = transferForm.accountNumber.replace(/\D/g, '');
  const matchedApexRecipient = useMemo(() => {
    if (cleanedTransferAccountNumber.length !== 10) {
      return null;
    }

    return (
      accounts.find(
        (account) =>
          account.role !== 'admin'
          && account.id !== user.id
          && String(account.accountNumber ?? '').replace(/\D/g, '') === cleanedTransferAccountNumber,
      ) ?? null
    );
  }, [accounts, cleanedTransferAccountNumber, user.id]);
  const isOwnTransferAccountNumber =
    cleanedTransferAccountNumber.length === 10
    && String(user.accountNumber ?? '').replace(/\D/g, '') === cleanedTransferAccountNumber;
  const supportRequestMessage = submittedWithdrawal?.supportMessage
    ?? (selectedWithdrawalBank && withdrawalForm.amount
      ? buildWithdrawalSupportMessage({
          userName: user.name,
          amount: formatCurrency(Number(withdrawalForm.amount || 0)),
          bankName: selectedWithdrawalBank.bankName,
          accountNumber: selectedWithdrawalBank.accountNumber,
          requestId: 'PENDING-REQUEST',
          note: withdrawalForm.message.trim(),
        })
      : '');
  const customerServiceHref = getWhatsAppContactHref(customerServiceNumber, supportRequestMessage);
  const generalCustomerServiceHref = getWhatsAppContactHref(customerServiceNumber, 'Hello Apex Bank concierge, I need help with my account.');

  function getActionResultExportLabel(result) {
    if (result.kind === 'withdrawal') {
      return 'Confirmation';
    }

    return 'Receipt';
  }

  function buildActionResultExportPayload(result) {
    const exportLabel = getActionResultExportLabel(result);

    return {
      filename: `apex-${slugifyReceiptSegment(result.kind)}-${slugifyReceiptSegment(result.details?.find((entry) => entry.label === 'Reference')?.value ?? user.id)}.txt`,
      content: buildConfirmationExportText({
        eyebrow: result.eyebrow ?? exportLabel,
        title: result.title,
        message: result.message,
        auditLabel: result.auditLabel ?? 'Audit Logged',
        createdAt: formatActionTimestamp(result.createdAt ?? new Date().toISOString()),
        details: [
          { label: 'Customer', value: user.name },
          ...(result.details ?? []),
        ],
        nextStep: result.nextStep,
      }),
      label: exportLabel,
    };
  }

  function buildSelectedReceiptExportPayload(receipt) {
    return {
      filename: `apex-${slugifyReceiptSegment(receipt.type)}-${slugifyReceiptSegment(receipt.id)}.txt`,
      content: buildConfirmationExportText({
        eyebrow: 'Receipt Copy',
        title: `${receipt.type} receipt`,
        message: `${receipt.amount} for ${receipt.name}`,
        auditLabel: 'Receipt Archived',
        createdAt: receipt.date,
        details: [
          { label: 'Customer', value: user.name },
          { label: 'Reference', value: receipt.id },
          { label: 'Beneficiary', value: receipt.name },
          { label: 'Type', value: receipt.type },
          { label: 'Amount', value: receipt.amount },
          { label: 'Status', value: receipt.status },
          ...(receipt.destination ? [{ label: 'Destination', value: receipt.destination }] : []),
          ...(receipt.note ? [{ label: 'Note', value: receipt.note }] : []),
        ],
      }),
      label: 'Receipt',
    };
  }

  async function handleCopyActionResult(result) {
    const payload = buildActionResultExportPayload(result);

    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }

      await navigator.clipboard.writeText(payload.content);
      setActionUtilityFeedback(`${payload.label} copied. You can now share it anywhere.`);
    } catch {
      setActionUtilityFeedback(`Unable to copy this ${payload.label.toLowerCase()} from the current browser session.`);
    }
  }

  function handleDownloadActionResult(result) {
    const payload = buildActionResultExportPayload(result);
    const downloaded = downloadTextDocument(payload.filename, payload.content);
    setActionUtilityFeedback(
      downloaded
        ? `${payload.label} downloaded successfully.`
        : `Unable to download this ${payload.label.toLowerCase()} from the current browser session.`,
    );
  }

  async function handleShareSelectedReceiptImage() {
    if (!selectedReceipt) {
      return;
    }

    const receiptBlob = await createReceiptImageBlob({ receipt: selectedReceipt, customerName: user.name });

    if (!receiptBlob) {
      setActionUtilityFeedback('Unable to generate a receipt image from the current browser session.');
      return;
    }

    const filename = `apex-${slugifyReceiptSegment(selectedReceipt.type)}-${slugifyReceiptSegment(selectedReceipt.id)}.png`;

    try {
      const receiptFile = new File([receiptBlob], filename, { type: 'image/png' });

      if (navigator?.share && navigator?.canShare?.({ files: [receiptFile] })) {
        await navigator.share({
          files: [receiptFile],
          title: 'Apex Bank receipt image',
          text: `Receipt ${selectedReceipt.id} for ${selectedReceipt.amount}`,
        });
        setActionUtilityFeedback('Receipt image shared successfully.');
        return;
      }

      const downloaded = downloadBlobDocument(filename, receiptBlob);
      setActionUtilityFeedback(
        downloaded
          ? 'Sharing is not available here, so the receipt image was downloaded instead.'
          : 'Unable to share this receipt image from the current browser session.',
      );
    } catch {
      setActionUtilityFeedback('Receipt sharing was cancelled or is not available in this browser.');
    }
  }

  async function handleDownloadSelectedReceiptImage() {
    if (!selectedReceipt) {
      return;
    }

    const receiptBlob = await createReceiptImageBlob({ receipt: selectedReceipt, customerName: user.name });

    if (!receiptBlob) {
      setActionUtilityFeedback('Unable to generate a receipt image from the current browser session.');
      return;
    }

    const filename = `apex-${slugifyReceiptSegment(selectedReceipt.type)}-${slugifyReceiptSegment(selectedReceipt.id)}.png`;
    const downloaded = downloadBlobDocument(filename, receiptBlob);
    setActionUtilityFeedback(downloaded ? 'Receipt image downloaded successfully.' : 'Unable to download this receipt image from the current browser session.');
  }

  function renderActionResultCard(result) {
    if (!result) {
      return null;
    }

    let recoveryActions = null;
    let successActions = null;

    if (result.ok && ['transfer', 'bill', 'withdrawal'].includes(result.kind) && (result.kind === 'withdrawal' || activeMobileTab !== 'Receipt')) {
      const exportLabel = getActionResultExportLabel(result);
      successActions = (
        <>
          <div className="mobile-action-result-actions">
            <button type="button" className="secondary-button" onClick={() => handleCopyActionResult(result)}>
              Copy {exportLabel}
            </button>
            <button type="button" className="primary-button" onClick={() => handleDownloadActionResult(result)}>
              Download {exportLabel}
            </button>
          </div>
          {actionUtilityFeedback ? <p className="action-utility-feedback">{actionUtilityFeedback}</p> : null}
        </>
      );
    }

    if (!result.ok && result.kind === 'transfer') {
      recoveryActions = (
        <div className="mobile-action-result-actions">
          <button type="button" className="primary-button" onClick={handleTransferSubmit}>
            Retry Transfer
          </button>
          <button type="button" className="secondary-button" onClick={() => openPage('Transfers')}>
            Review Transfer Form
          </button>
        </div>
      );
    }

    if (!result.ok && result.kind === 'bill') {
      recoveryActions = (
        <div className="mobile-action-result-actions">
          <button type="button" className="primary-button" onClick={handleBillSubmit}>
            Retry Payment
          </button>
          <button type="button" className="secondary-button" onClick={() => openPage('Bill Pay')}>
            Review Bill Form
          </button>
        </div>
      );
    }

    if (!result.ok && result.kind === 'withdrawal') {
      recoveryActions = (
        <div className="mobile-action-result-actions">
          <button type="button" className="primary-button" onClick={handleWithdrawalRequestSubmit}>
            Retry Withdrawal
          </button>
          <button type="button" className="secondary-button" onClick={() => openPage('Support')}>
            Contact Support
          </button>
        </div>
      );
    }

    return (
      <article className={`mobile-action-result-card glass-card ${result.ok ? 'is-success' : 'is-failure'}`}>
        <div className="mobile-action-result-head">
          <div>
            <p className="eyebrow">{result.eyebrow ?? 'Completion State'}</p>
            <h4>{result.title}</h4>
          </div>
          <span className={`status-pill ${result.ok ? 'completed' : 'rejected'}`}>{result.ok ? 'Success' : 'Failed'}</span>
        </div>

        <p className="mobile-action-result-message">{result.message}</p>

        <div className="mobile-action-result-meta">
          <span>{result.auditLabel ?? (result.ok ? 'Audit Logged' : 'Needs Review')}</span>
          <strong>{formatActionTimestamp(result.createdAt ?? new Date().toISOString())}</strong>
        </div>

        {result.details?.length ? (
          <div className="detail-stack">
            {result.details.map((entry) => (
              <div key={entry.label} className="detail-row">
                <span>{entry.label}</span>
                <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
        ) : null}

        {result.nextStep ? <p className="mobile-action-result-next">{result.nextStep}</p> : null}
        {successActions}
        {recoveryActions}
      </article>
    );
  }

  useEffect(() => {
    setActionResult(null);
  }, [user.id]);

  useEffect(() => {
    setShowFullCardNumber(false);
  }, [selectedCardMode, user.id]);

  useEffect(() => {
    setActionUtilityFeedback('');
  }, [actionResult, selectedReceipt, user.id]);

  useEffect(() => {
    setWithdrawalForm((current) => {
      if (current.bankId && (user.savedBanks ?? []).some((bank) => bank.id === current.bankId)) {
        return current;
      }

      return { ...current, bankId: user.savedBanks?.[0]?.id ?? '' };
    });
  }, [user.savedBanks]);

  useEffect(() => {
    setTransferForm((current) => {
      if (current.sourceAccount && user.accounts.some((account) => account.label === current.sourceAccount)) {
        return current;
      }

      return { ...current, sourceAccount: user.accounts[0]?.label ?? '' };
    });

    setBillForm((current) => {
      if (current.sourceAccount && user.accounts.some((account) => account.label === current.sourceAccount)) {
        return current;
      }

      return { ...current, sourceAccount: user.accounts[0]?.label ?? '' };
    });

    setLoanForm((current) => {
      if (current.sourceAccount && user.accounts.some((account) => account.label === current.sourceAccount)) {
        return current;
      }

      return { ...current, sourceAccount: user.accounts[0]?.label ?? '' };
    });

    setInvestmentForm((current) => {
      if (current.fundingAccount && user.accounts.some((account) => account.label === current.fundingAccount)) {
        return current;
      }

      return { ...current, fundingAccount: user.accounts[0]?.label ?? '' };
    });
  }, [user.accounts]);

  function commitPage(page) {
    if (page !== activeMobileTab) {
      setLastMobileTab(activeMobileTab);
    }

    if (page !== 'Dashboard') {
      setShowMoreActions(false);
    }

    setActiveMobileTab(page);
  }

  async function openPage(page) {
    if (page === activeMobileTab) {
      return;
    }

    await onRunLoadingFlow(`user-page-${page.toLowerCase().replace(/\s+/g, '-')}`, () => {
      commitPage(page);
    });
  }

  function openNotificationsPage(notificationId = '') {
    if (unreadNotifications.length > 0) {
      onMarkNotificationsRead(unreadNotifications.map((entry) => entry.id));
    }

    if (notificationId) {
      setSelectedNotificationId(notificationId);
    } else {
      setSelectedNotificationId('');
    }

    void openPage('Notifications');
  }

  function handleNotificationSelect(notificationId) {
    setSelectedNotificationId(notificationId);

    const selectedEntry = userNotifications.find((entry) => entry.id === notificationId);

    if (selectedEntry && !selectedEntry.readAt) {
      onMarkNotificationsRead([notificationId]);
    }
  }

  function handleNotificationBackToList() {
    setSelectedNotificationId('');
  }

  function handleQuickAction(label) {
    if (label === 'More') {
      setShowMoreActions((current) => !current);
      return;
    }

    const nextPage = {
      'Send Money': 'Transfers',
      Withdraw: 'Withdrawals',
      'Add Money': 'Add Money',
    }[label] ?? 'Dashboard';

    void openPage(nextPage);
  }

  function openSupportTemplate(subject, message, priority = 'Medium') {
    setSupportFeedback('');
    setSupportForm({ subject, priority, message });
    void openPage('Support');
  }

  async function handleAddBankSubmit() {
    const result = await onRunLoadingFlow('action-bank', () => onAddSavedBank(bankForm));
    setBankFeedback(result.message);

    if (result.ok) {
      setBankForm({ bankName: '', accountName: user.name, accountNumber: '' });
      setWithdrawalForm((current) => ({ ...current, bankId: result.bank.id }));
    }
  }

  async function handleWithdrawalRequestSubmit() {
    const result = await onRunLoadingFlow('action-withdrawal', () => onSubmitWithdrawalRequest(withdrawalForm));
    setWithdrawalFeedback(result.message);

    if (result.ok) {
      setActionResult({
        ok: true,
        kind: 'withdrawal',
        eyebrow: 'Withdrawal Request',
        title: 'Withdrawal request submitted',
        message: result.message,
        createdAt: new Date().toISOString(),
        auditLabel: 'Audit Logged',
        details: [
          { label: 'Reference', value: result.request.id },
          { label: 'Status', value: result.request.status },
          { label: 'Destination', value: result.request.destination },
        ],
        nextStep: 'Contact customer service with the request reference if you need payout assistance or a withdrawal code update.',
      });
      setSubmittedWithdrawal(result.request);
      setWithdrawalCode(result.request.code);
      setWithdrawalForm((current) => ({ ...current, amount: '', message: '' }));
    } else {
      setActionResult({
        ok: false,
        kind: 'withdrawal',
        eyebrow: 'Withdrawal Request',
        title: 'Withdrawal request failed',
        message: result.message,
        createdAt: new Date().toISOString(),
        auditLabel: 'Needs Review',
        nextStep: 'Check that a payout bank is selected and that the withdrawal amount is valid before trying again.',
      });
    }
  }

  async function handleTransferSubmit() {
    const result = await onRunLoadingFlow(
      'action-transfer',
      () => onSubmitTransfer(transferForm),
      getRandomDelay(TRANSFER_LOADING_MIN_DELAY_MS, TRANSFER_LOADING_MAX_DELAY_MS),
    );
    setTransferFeedback(result.message);

    if (result.ok) {
      setActionResult({
        ok: true,
        kind: 'transfer',
        eyebrow: 'Transfer Complete',
        title: result.receipt.status === 'Pending Verification' ? 'Transfer placed on verification hold' : 'Transfer completed successfully',
        message: result.message,
        createdAt: new Date().toISOString(),
        auditLabel: result.receipt.status === 'Pending Verification' ? 'Pending Release' : 'Audit Logged',
        details: [
          { label: 'Reference', value: result.receipt.id },
          { label: 'Beneficiary', value: result.receipt.name },
          { label: 'Status', value: result.receipt.status },
        ],
        nextStep:
          result.receipt.status === 'Pending Verification'
            ? 'The transfer is recorded, but the recipient must complete Apex Bank verification before the funds are released.'
            : 'Review the receipt below or return to payments to send another transfer.',
      });
      setSelectedReceipt(result.receipt);
      setTransferForm({
        recipient: '',
        bankName: '',
        accountNumber: '',
        amount: '',
        sourceAccount: transferForm.sourceAccount,
        note: '',
      });
      commitPage('Receipt');
    } else {
      setActionResult({
        ok: false,
        kind: 'transfer',
        eyebrow: 'Transfer Failed',
        title: 'Transfer could not be completed',
        message: result.message,
        createdAt: new Date().toISOString(),
        auditLabel: 'Needs Review',
        nextStep: 'Verify the recipient details, available balance, and source account before sending again.',
      });
    }
  }

  async function handleBillSubmit() {
    const result = await onRunLoadingFlow('action-bill', () => onSubmitBillPayment(billForm));
    setBillFeedback(result.message);

    if (result.ok) {
      setActionResult({
        ok: true,
        kind: 'bill',
        eyebrow: 'Bill Payment Complete',
        title: 'Bill payment posted successfully',
        message: result.message,
        createdAt: new Date().toISOString(),
        auditLabel: 'Audit Logged',
        details: [
          { label: 'Reference', value: result.receipt.id },
          { label: 'Biller', value: result.receipt.name },
          { label: 'Status', value: result.receipt.status },
        ],
        nextStep: 'Keep the receipt for confirmation or return to Bill Pay for another payment.',
      });
      setSelectedReceipt(result.receipt);
      setBillForm({
        biller: '',
        reference: '',
        amount: '',
        sourceAccount: billForm.sourceAccount,
        note: '',
      });
      commitPage('Receipt');
    } else {
      setActionResult({
        ok: false,
        kind: 'bill',
        eyebrow: 'Bill Payment Failed',
        title: 'Bill payment could not be completed',
        message: result.message,
        createdAt: new Date().toISOString(),
        auditLabel: 'Needs Review',
        nextStep: 'Review the biller, payment reference, and source balance before trying again.',
      });
    }
  }

  async function handleCardRequestSubmit(cardType) {
    const result = await onRunLoadingFlow('action-card', () => onSubmitCardRequest(cardType));
    setCardFeedback(result.message);
  }

  async function handleSupportSubmit() {
    const result = await onRunLoadingFlow('action-support', () => onSubmitSupportCase(supportForm));
    setSupportFeedback(result.message);

    if (result.ok) {
      setSupportForm({ subject: '', priority: 'Medium', message: '' });
    }
  }

  async function handleLoanSubmit() {
    const result = await onRunLoadingFlow('action-loan', () => onSubmitLoanRequest(loanForm));
    setLoanFeedback(result.message);

    if (result.ok) {
      setLoanForm((current) => ({
        ...current,
        amount: '',
        purpose: '',
      }));
    }
  }

  async function handleInvestmentSubmit() {
    const result = await onRunLoadingFlow('action-investment', () => onSubmitInvestmentRequest(investmentForm));
    setInvestmentFeedback(result.message);

    if (result.ok) {
      setInvestmentForm((current) => ({
        ...current,
        amount: '',
        goal: '',
      }));
    }
  }

  function handleSecurityToggle(settingKey, label) {
    setSecurityState((current) => {
      const nextValue = !current[settingKey];
      setSecurityFeedback(`${label} ${nextValue ? 'enabled' : 'disabled'} successfully.`);
      return { ...current, [settingKey]: nextValue };
    });
  }

  function handleCardLockToggle() {
    setSecurityState((current) => {
      const nextValue = !current.cardLock;
      setSecurityFeedback(`Debit and virtual card access ${nextValue ? 'locked' : 'restored'}.`);
      return { ...current, cardLock: nextValue };
    });
  }

  function openReceipt(entry) {
    setActionResult(null);
    setSelectedReceipt(entry);
    void openPage('Receipt');
  }

  function renderPageHeader({ eyebrow, title, description, backPage, onBack }) {
    return (
      <section className="mobile-page-header-card glass-card">
        <div className="mobile-page-header-main">
          {backPage || onBack ? (
            <button
              type="button"
              className="mobile-page-back"
              onClick={onBack ?? (() => openPage(backPage))}
              aria-label={backPage ? `Back to ${backPage}` : 'Back'}
            >
              <span>←</span>
            </button>
          ) : null}
          <div className="mobile-page-title-block">
            <p className="eyebrow">{eyebrow}</p>
            <h3>{title}</h3>
            {description ? <p className="mobile-subcopy">{description}</p> : null}
          </div>
        </div>
      </section>
    );
  }

  function renderDashboardPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen mobile-dashboard-home">
        <section className="mobile-balance-card glass-card mobile-tab-panel">
          <div className="mobile-balance-top">
            <div>
              <p className="eyebrow">Available Balance</p>
              <h1>{showBalance ? formatCurrency(totalBalance) : '••••••••'}</h1>
            </div>
            <button type="button" className="mobile-visibility-chip" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="mobile-card-face mobile-card-page-face">
            {hasIssuedCard ? (
              <>
                <div className="mobile-card-face-top">
                  <span>{primaryAccount?.label ?? 'Primary'} Account</span>
                  <div className="mobile-card-brand" aria-label="Mastercard debit">
                    <div className="mastercard-logo" aria-hidden="true">
                      <span className="mastercard-red" />
                      <span className="mastercard-gold" />
                    </div>
                    <strong>Mastercard</strong>
                  </div>
                </div>
                <div className="card-number">{formatCardNumber(activeCardProduct.number, { masked: true })}</div>
                <div className="card-meta">
                  <div>
                    <span>Card Holder</span>
                    <strong>{user.name}</strong>
                  </div>
                  <div>
                    <span>Expires</span>
                    <strong>{activeCardProduct.expires}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="cards-empty-copy">
                <div className="mobile-card-face-top">
                  <span>Debit card</span>
                  {selectedCardRequest ? <span className={`status-pill ${selectedCardRequest.status.toLowerCase()}`}>{selectedCardRequest.status}</span> : null}
                </div>
                <strong>No active debit card</strong>
                <p>
                  {selectedCardRequest
                    ? `Your ${selectedCardRequest.type} request is ${selectedCardRequest.status.toLowerCase()}. Admin approval is required before your card is issued.`
                    : 'You do not have a debit card yet. Request one from Cards and wait for admin approval.'}
                </p>
                <button type="button" className="secondary-button compact-button" onClick={() => openPage('Cards')}>
                  Request Card
                </button>
              </div>
            )}
          </div>

        </section>

        <section className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Quick actions</p>
              <h3>Handle the essentials</h3>
            </div>
          </div>

          <div className="mobile-services-grid">
            {mobileQuickActions.map((action) => (
              <button key={action.label} type="button" className="mobile-service-card" onClick={() => handleQuickAction(action.label)}>
                <span>{action.icon}</span>
                <strong>{action.label}</strong>
              </button>
            ))}
          </div>

          {showMoreActions ? (
            <div className="mobile-services-grid mobile-services-grid-expanded">
              {moreActionItems.map((action) => (
                <button key={action.label} type="button" className="mobile-service-card mobile-service-card-detail" onClick={() => openPage(action.page)}>
                  <span>{action.icon}</span>
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="mobile-page-kpi-strip">
          <article className="glass-card mobile-page-kpi">
            <span>Inflow</span>
            <strong>{formatCurrency(inflowTotal)}</strong>
            <small>This filtered view</small>
          </article>
          <article className="glass-card mobile-page-kpi">
            <span>Outflow</span>
            <strong>{formatCurrency(outflowTotal)}</strong>
            <small>This filtered view</small>
          </article>
          <article className="glass-card mobile-page-kpi">
            <span>Withdrawal queue</span>
            <strong>{userWithdrawalRequests.length}</strong>
            <small>Requests submitted</small>
          </article>
        </section>

        <section className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head mobile-filter-head">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h3>Latest movements</h3>
            </div>
            <button type="button" className="secondary-button compact-button" onClick={() => openPage('Transfers')}>
              Open payments
            </button>
          </div>

          <div className="mobile-transaction-list">
            {filteredTransactions.slice(0, 5).map((entry) => (
              <article key={entry.id} className="mobile-transaction-item">
                <div className="mobile-transaction-icon">{entry.amount.startsWith('+') ? '↘' : '↗'}</div>
                <div className="mobile-transaction-main">
                  <strong>{entry.name}</strong>
                  <span>
                    {entry.type} • {entry.date}
                  </span>
                </div>
                <div className="mobile-transaction-amount">
                  <strong className={entry.amount.startsWith('+') ? 'amount-positive' : 'amount-negative'}>{entry.amount}</strong>
                  <button type="button" className="table-link transaction-link" onClick={() => openReceipt(entry)}>
                    View receipt
                  </button>
                </div>
              </article>
            ))}

            {filteredTransactions.length === 0 ? <div className="mobile-empty-state">No transactions are available yet.</div> : null}
          </div>
        </section>
      </section>
    );
  }

  function renderAccountsPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Accounts',
          title: 'View account numbers',
          description: 'Share your Apex Bank account number so other Apex Bank users can send money to you directly.',
          backPage: 'Dashboard',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel mobile-receipt-card">
          <div className="detail-row">
            <span>Account holder</span>
            <strong>{user.name}</strong>
          </div>
          <div className="detail-row">
            <span>Apex Bank account number</span>
            <strong>{formatAccountNumber(user.accountNumber)}</strong>
          </div>
          <div className="detail-row">
            <span>Routing number</span>
            <strong>{user.routingNumber || APEX_ROUTING_NUMBER}</strong>
          </div>
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Linked balances</p>
              <h3>Your account buckets</h3>
            </div>
            <button type="button" className="secondary-button compact-button" onClick={() => openPage('Transfers')}>
              Send money
            </button>
          </div>

          <div className="profile-account-grid">
            {user.accounts.map((account) => (
              <div key={account.label} className="mobile-balance-chip profile-account-card">
                <span>{account.label}</span>
                <strong>{formatCurrency(account.amount)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    );
  }

  function renderAddMoneyPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Add Money',
          title: 'Fund your account',
          description: 'Use these transfer details to move money in from another bank or payroll source.',
          backPage: 'Dashboard',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel mobile-receipt-card">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Funding details</p>
              <h3>Inbound transfer instructions</h3>
            </div>
          </div>

          <div className="detail-row">
            <span>Account name</span>
            <strong>{user.name}</strong>
          </div>
          <div className="detail-row">
            <span>Funding account</span>
            <strong>{fundingAccountDigits}</strong>
          </div>
          <div className="detail-row">
            <span>Reference</span>
            <strong>{fundingReference}</strong>
          </div>
          <div className="detail-row">
            <span>Posting window</span>
            <strong>Instant to 2 hours after bank confirmation</strong>
          </div>
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Funding options</p>
              <h3>Choose your next step</h3>
            </div>
          </div>

          <div className="mobile-history-list">
            <div className="mini-row withdrawal-request-row">
              <div>
                <strong>Bank transfer</strong>
                <span>Send from another bank using the funding account and reference above.</span>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => openSupportTemplate('Incoming transfer assistance', `I need help funding account ${fundingAccountDigits} with reference ${fundingReference}.`)}
              >
                Need help
              </button>
            </div>
            <div className="mini-row withdrawal-request-row">
              <div>
                <strong>Salary or employer credit</strong>
                <span>Share the same funding details with your payroll team for recurring credits.</span>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => openSupportTemplate('Payroll funding setup', 'I want to set up salary or employer funding into my account.')}
              >
                Open support
              </button>
            </div>
          </div>
        </article>
      </section>
    );
  }

  function renderTransfersPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Transfers',
          title: 'Send money',
          description: 'Create a bank transfer and open receipts from the same workspace.',
          backPage: 'Dashboard',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Transfer form</p>
              <h3>Send to another bank or Apex Bank user</h3>
            </div>
            <button type="button" className="secondary-button compact-button" onClick={() => openPage('Bill Pay')}>
              Pay a bill
            </button>
          </div>

          <div className="mobile-inline-form-grid">
            <label className="mobile-inline-field">
              <span>Recipient name</span>
              <input value={transferForm.recipient} placeholder="Optional for Apex Bank transfers" onChange={(event) => setTransferForm((current) => ({ ...current, recipient: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Bank name</span>
              <input value={transferForm.bankName} placeholder="Use Apex Bank for internal transfer" onChange={(event) => setTransferForm((current) => ({ ...current, bankName: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Account number</span>
              <input value={transferForm.accountNumber} placeholder="Enter 10-digit Apex Bank or bank account number" onChange={(event) => setTransferForm((current) => ({ ...current, accountNumber: event.target.value }))} />
              {matchedApexRecipient ? <small className="transfer-recipient-hint">Apex recipient: {matchedApexRecipient.name}</small> : null}
              {!matchedApexRecipient && isOwnTransferAccountNumber ? <small className="transfer-recipient-hint">This is your own Apex Bank account number.</small> : null}
            </label>
            <label className="mobile-inline-field">
              <span>Amount</span>
              <input type="number" min="1" value={transferForm.amount} onChange={(event) => setTransferForm((current) => ({ ...current, amount: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Source account</span>
              <select value={transferForm.sourceAccount} onChange={(event) => setTransferForm((current) => ({ ...current, sourceAccount: event.target.value }))}>
                {user.accounts.map((account) => (
                  <option key={account.label} value={account.label}>{account.label}</option>
                ))}
              </select>
            </label>
            <label className="mobile-inline-field mobile-inline-field-full">
              <span>Transfer note</span>
              <textarea rows="4" value={transferForm.note} onChange={(event) => setTransferForm((current) => ({ ...current, note: event.target.value }))} />
            </label>
            <button type="button" className="primary-button" onClick={handleTransferSubmit}>
              Send Money
            </button>
          </div>

          {transferFeedback ? <p className="auth-message mobile-inline-message">{transferFeedback}</p> : null}

          {actionResult && ['Transfer Complete', 'Transfer Failed'].includes(actionResult.eyebrow) ? renderActionResultCard(actionResult) : null}
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head mobile-filter-head">
            <div>
              <p className="eyebrow">Activity</p>
              <h3>Payment receipts</h3>
            </div>
            <div className="mobile-filter-strip">
              {['All', 'Transfer', 'Bills', 'Income'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={transactionFilter === filter ? 'chip active' : 'chip'}
                  onClick={() => setTransactionFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mobile-select-row">
            <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
              <option>All Dates</option>
              <option>Last 3 Days</option>
              <option>This Week</option>
            </select>
            <select value={amountFilter} onChange={(event) => setAmountFilter(event.target.value)}>
              <option>All Amounts</option>
              <option>Under $1000</option>
              <option>$1000 - $5000</option>
              <option>Above $5000</option>
            </select>
          </div>

          <div className="mobile-transaction-list transaction-detailed-list">
            {paymentTransactions.map((entry) => (
              <article key={entry.id} className="mobile-transaction-item transaction-detailed-item">
                <div className="mobile-transaction-icon">{entry.type === 'Bills' ? '◎' : '↗'}</div>
                <div className="mobile-transaction-main">
                  <strong>{entry.name}</strong>
                  <span>
                    {entry.type} • {entry.date}
                  </span>
                  <small>{entry.id}</small>
                </div>
                <div className="mobile-transaction-amount">
                  <strong className={entry.amount.startsWith('+') ? 'amount-positive' : 'amount-negative'}>{entry.amount}</strong>
                  <button type="button" className="table-link transaction-link" onClick={() => openReceipt(entry)}>
                    View receipt
                  </button>
                </div>
              </article>
            ))}

            {paymentTransactions.length === 0 ? <div className="mobile-empty-state">No payment receipt is available for the selected filters.</div> : null}
          </div>
        </article>
      </section>
    );
  }

  function renderBillPayPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Bill Pay',
          title: 'Pay bills',
          description: 'Settle utilities, subscriptions, and provider invoices from a dedicated page.',
          backPage: 'Transfers',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Bill payment</p>
              <h3>Submit a bill</h3>
            </div>
          </div>

          <div className="mobile-inline-form-grid">
            <label className="mobile-inline-field">
              <span>Biller name</span>
              <input value={billForm.biller} onChange={(event) => setBillForm((current) => ({ ...current, biller: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Reference</span>
              <input value={billForm.reference} onChange={(event) => setBillForm((current) => ({ ...current, reference: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Amount</span>
              <input type="number" min="1" value={billForm.amount} onChange={(event) => setBillForm((current) => ({ ...current, amount: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Source account</span>
              <select value={billForm.sourceAccount} onChange={(event) => setBillForm((current) => ({ ...current, sourceAccount: event.target.value }))}>
                {user.accounts.map((account) => (
                  <option key={account.label} value={account.label}>{account.label}</option>
                ))}
              </select>
            </label>
            <label className="mobile-inline-field mobile-inline-field-full">
              <span>Payment note</span>
              <textarea rows="4" value={billForm.note} onChange={(event) => setBillForm((current) => ({ ...current, note: event.target.value }))} />
            </label>
            <button type="button" className="primary-button" onClick={handleBillSubmit}>
              Pay Bill
            </button>
          </div>

          {billFeedback ? <p className="auth-message mobile-inline-message">{billFeedback}</p> : null}

          {actionResult && ['Bill Payment Complete', 'Bill Payment Failed'].includes(actionResult.eyebrow) ? renderActionResultCard(actionResult) : null}
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Recent bills</p>
              <h3>Latest bill receipts</h3>
            </div>
          </div>

          <div className="mobile-history-list">
            {billTransactions.map((entry) => (
              <div key={entry.id} className="mini-row withdrawal-request-row">
                <div>
                  <strong>{entry.name}</strong>
                  <span>
                    {entry.amount} • {entry.date}
                  </span>
                  <small>{entry.id}</small>
                </div>
                <div className="withdrawal-request-side">
                  <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                  <button type="button" className="table-link transaction-link" onClick={() => openReceipt(entry)}>
                    View receipt
                  </button>
                </div>
              </div>
            ))}

            {billTransactions.length === 0 ? <p className="muted-copy">No bill payment has been recorded yet.</p> : null}
          </div>
        </article>
      </section>
    );
  }

  function renderWithdrawalsPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Withdrawals',
          title: 'Withdraw to saved banks',
          description: 'Add destination banks, request approval, and message customer service from one page.',
          backPage: 'Dashboard',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Saved banks</p>
              <h3>Available payout destinations</h3>
            </div>
          </div>

          <div className="mobile-bank-list">
            {(user.savedBanks ?? []).length > 0 ? (
              user.savedBanks.map((bank) => (
                <div key={bank.id} className="mini-row profile-setting-row withdrawal-bank-row">
                  <div>
                    <strong>{bank.bankName}</strong>
                    <span>
                      {bank.accountName} • {bank.accountNumber}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-copy">No withdrawal bank added yet. Add one below before requesting a withdrawal.</p>
            )}
          </div>

          <div className="mobile-inline-form-grid">
            <label className="mobile-inline-field">
              <span>Bank name</span>
              <input value={bankForm.bankName} onChange={(event) => setBankForm((current) => ({ ...current, bankName: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Account name</span>
              <input value={bankForm.accountName} onChange={(event) => setBankForm((current) => ({ ...current, accountName: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Account number</span>
              <input value={bankForm.accountNumber} onChange={(event) => setBankForm((current) => ({ ...current, accountNumber: event.target.value }))} />
            </label>
            <button type="button" className="primary-button" onClick={handleAddBankSubmit}>
              Add Bank
            </button>
          </div>

          {bankFeedback ? <p className="auth-message mobile-inline-message">{bankFeedback}</p> : null}
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Request withdrawal</p>
              <h3>Submit a payout request</h3>
            </div>
          </div>

          <div className="mobile-inline-form-grid withdrawal-form-grid">
            <label className="mobile-inline-field">
              <span>Saved bank</span>
              <select value={withdrawalForm.bankId} onChange={(event) => setWithdrawalForm((current) => ({ ...current, bankId: event.target.value }))}>
                {(user.savedBanks ?? []).length > 0 ? (
                  user.savedBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.bankName} - {bank.accountNumber}
                    </option>
                  ))
                ) : (
                  <option value="">No saved bank</option>
                )}
              </select>
            </label>
            <label className="mobile-inline-field">
              <span>Amount</span>
              <input
                type="number"
                min="1"
                placeholder="2500"
                value={withdrawalForm.amount}
                onChange={(event) => setWithdrawalForm((current) => ({ ...current, amount: event.target.value }))}
              />
            </label>
            <label className="mobile-inline-field mobile-inline-field-full">
              <span>Custom message</span>
              <textarea
                rows="4"
                placeholder="Requesting withdrawal code for today's payout."
                value={withdrawalForm.message}
                onChange={(event) => setWithdrawalForm((current) => ({ ...current, message: event.target.value }))}
              />
            </label>
            <button type="button" className="primary-button" onClick={handleWithdrawalRequestSubmit}>
              Submit Withdrawal Request
            </button>
          </div>

          {withdrawalFeedback ? <p className="auth-message mobile-inline-message">{withdrawalFeedback}</p> : null}

          {actionResult && actionResult.eyebrow === 'Withdrawal Request' ? renderActionResultCard(actionResult) : null}

          {submittedWithdrawal ? (
            <div className="withdrawal-success-panel">
              <div className="detail-row">
                <span>Request ID</span>
                <strong>{submittedWithdrawal.id}</strong>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <strong>{submittedWithdrawal.status}</strong>
              </div>
              <div className="detail-row">
                <span>Code</span>
                <strong>{withdrawalCode}</strong>
              </div>
            </div>
          ) : null}

          <div className="mobile-request-actions">
            <a className="primary-button withdrawal-service-link" href={customerServiceHref} target="_blank" rel="noreferrer">
              WhatsApp Concierge {customerServiceNumber}
            </a>
            <button type="button" className="secondary-button" onClick={() => openPage('Support')}>
              Open support page
            </button>
          </div>
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Withdrawal requests</p>
              <h3>Track approval status</h3>
            </div>
          </div>

          <div className="mobile-history-list">
            {userWithdrawalRequests.length > 0 ? (
              userWithdrawalRequests.map((request) => (
                <div key={request.id} className="mini-row profile-setting-row withdrawal-request-row">
                  <div>
                    <strong>{request.id}</strong>
                    <span>
                      {request.amount} • {request.destination}
                    </span>
                    <small>{request.requested}</small>
                  </div>
                  <div className="withdrawal-request-side">
                    <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
                    <strong>{request.code}</strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-copy">You have not submitted any withdrawal request yet.</p>
            )}
          </div>
        </article>
      </section>
    );
  }

  function renderCardsPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen cards-screen">
        {renderPageHeader({
          eyebrow: 'Cards',
          title: 'Card control center',
          description: 'Switch between card products and submit new card requests from this page.',
          backPage: 'Dashboard',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel cards-shell">
          <div className="cards-type-tabs" role="tablist" aria-label="Card types">
            {['Physical Card', 'Virtual Card'].map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={selectedCardMode === tab}
                className={selectedCardMode === tab ? 'cards-type-tab active' : 'cards-type-tab'}
                onClick={() => setActiveCardMode(tab)}
              >
                <span>{tab}</span>
                {tab === 'Virtual Card' ? <small className="cards-hot-badge">HOT</small> : null}
              </button>
            ))}
          </div>

          <div key={selectedCardMode} className="cards-showcase-panel">
            {activeCardProduct ? (
              <>
                <div className={`cards-showcase-face mobile-card-face ${activeCardProduct.themeClass}`}>
                  <div className="cards-showcase-top mobile-card-face-top">
                    <div className="cards-bank-mark">APX</div>
                    <div className="mobile-card-brand" aria-label="Mastercard debit">
                      <div className="mastercard-logo" aria-hidden="true">
                        <span className="mastercard-red" />
                        <span className="mastercard-gold" />
                      </div>
                      <strong>{activeCardProduct.network}</strong>
                    </div>
                  </div>

                  <div className="cards-showcase-body">
                    <div className="cards-showcase-number card-number">{formatCardNumber(activeCardProduct.number, { masked: !showFullCardNumber })}</div>
                  </div>

                  <div className="cards-showcase-meta card-meta">
                    <div>
                      <span>Card Holder</span>
                      <strong>{user.name}</strong>
                    </div>
                    <div>
                      <span>Expires</span>
                      <strong>{activeCardProduct.expires}</strong>
                    </div>
                  </div>
                </div>

                <div className="cards-title-block">
                  <p className="eyebrow">{activeCardProduct.eyebrow}</p>
                  <h3>{activeCardProduct.title}</h3>
                  <p>{activeCardProduct.subtitle}</p>
                  <button
                    type="button"
                    className="secondary-button compact-button cards-reveal-button"
                    onClick={() => setShowFullCardNumber((current) => !current)}
                  >
                    {showFullCardNumber ? 'Hide full number' : 'Show full number'}
                  </button>
                  <small className="cards-reveal-note">
                    The card number stays masked until you choose to reveal it on this page.
                  </small>
                </div>
              </>
            ) : (
              <>
                <div className="cards-showcase-face cards-showcase-face-empty">
                  <div className="cards-showcase-top">
                    <div className="cards-bank-mark">APX</div>
                    {selectedCardRequest ? <span className={`status-pill ${selectedCardRequest.status.toLowerCase()}`}>{selectedCardRequest.status}</span> : null}
                  </div>

                  <div className="cards-empty-copy">
                    <strong>No {selectedCardMode.toLowerCase()} issued yet</strong>
                    <p>
                      {selectedCardRequest
                        ? `Your ${selectedCardRequest.type} request is ${selectedCardRequest.status.toLowerCase()}. The admin must approve and activate it before this card appears.`
                        : `You have not been issued a ${selectedCardMode.toLowerCase()} yet. Submit a request below and wait for admin approval.`}
                    </p>
                  </div>
                </div>

                <div className="cards-title-block">
                  <p className="eyebrow">{selectedCardMode}</p>
                  <h3>Request approval required</h3>
                  <p>Cards only become available after the admin approves and activates your request.</p>
                </div>
              </>
            )}
          </div>

          <div className="cards-benefits-list">
            {cardBenefitItems.map((benefit) => (
              <article key={benefit.title} className="cards-benefit-item">
                <span className="cards-benefit-icon">{benefit.icon}</span>
                <strong>{benefit.title}</strong>
              </article>
            ))}
          </div>

          <div className="mobile-card-request-grid">
            <button type="button" className="primary-button mobile-card-cta" onClick={() => handleCardRequestSubmit('Virtual Card')}>
              Request Virtual Card
            </button>
            <button type="button" className="secondary-button mobile-card-cta" onClick={() => handleCardRequestSubmit('Physical Card')}>
              Request Physical Card
            </button>
          </div>

          {cardFeedback ? <p className="auth-message mobile-inline-message">{cardFeedback}</p> : null}
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Card requests</p>
              <h3>Your request history</h3>
            </div>
          </div>

          <div className="mobile-history-list">
            {userCardRequests.length > 0 ? (
              userCardRequests.map((request) => (
                <div key={request.id} className="mini-row withdrawal-request-row">
                  <div>
                    <strong>{request.type}</strong>
                    <span>
                      {request.id} • {request.requested}
                    </span>
                  </div>
                  <div className="withdrawal-request-side">
                    <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-copy">No card request has been submitted yet.</p>
            )}
          </div>
        </article>
      </section>
    );
  }

  function renderSupportPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Support',
          title: 'Customer support desk',
          description: 'Open a support case and review previously submitted issues.',
          backPage: supportBackPage,
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">New case</p>
              <h3>Tell us what you need</h3>
            </div>
            <a className="secondary-button profile-link-button" href={generalCustomerServiceHref} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
          </div>

          <div className="mobile-inline-form-grid">
            <label className="mobile-inline-field">
              <span>Subject</span>
              <input value={supportForm.subject} onChange={(event) => setSupportForm((current) => ({ ...current, subject: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Priority</span>
              <select value={supportForm.priority} onChange={(event) => setSupportForm((current) => ({ ...current, priority: event.target.value }))}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label className="mobile-inline-field mobile-inline-field-full">
              <span>Message</span>
              <textarea rows="5" value={supportForm.message} onChange={(event) => setSupportForm((current) => ({ ...current, message: event.target.value }))} />
            </label>
            <button type="button" className="primary-button" onClick={handleSupportSubmit}>
              Submit Support Case
            </button>
          </div>

          {supportFeedback ? <p className="auth-message mobile-inline-message">{supportFeedback}</p> : null}
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Case history</p>
              <h3>Your open issues</h3>
            </div>
          </div>

          <div className="mobile-history-list">
            {userSupportCases.length > 0 ? (
              userSupportCases.map((entry) => (
                <div key={entry.id} className="mini-row withdrawal-request-row">
                  <div>
                    <strong>{entry.subject}</strong>
                    <span>
                      {entry.assignee} • {entry.priority} priority
                    </span>
                    <small>{entry.id}</small>
                  </div>
                  <div className="withdrawal-request-side">
                    <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-copy">No support case has been filed from this account yet.</p>
            )}
          </div>
        </article>
      </section>
    );
  }

  function renderSecurityPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Security',
          title: 'Security center',
          description: 'Control alerts, biometrics, and temporary card access from one page.',
          backPage: securityBackPage,
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="profile-settings-list mobile-security-grid">
            <div className="mini-row profile-setting-row mobile-security-action">
              <div>
                <strong>Transaction alerts</strong>
                <span>Push and email notifications for transfers and withdrawals</span>
              </div>
              <button type="button" className="secondary-button" onClick={() => handleSecurityToggle('alerts', 'Transaction alerts')}>
                {securityState.alerts ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
            <div className="mini-row profile-setting-row mobile-security-action">
              <div>
                <strong>Biometric login</strong>
                <span>Use device biometrics when supported</span>
              </div>
              <button type="button" className="secondary-button" onClick={() => handleSecurityToggle('biometrics', 'Biometric login')}>
                {securityState.biometrics ? 'Disable' : 'Enable'}
              </button>
            </div>
            <div className="mini-row profile-setting-row mobile-security-action">
              <div>
                <strong>Card access</strong>
                <span>{securityState.cardLock ? 'Cards are temporarily locked' : 'Cards are active for payments'}</span>
              </div>
              <button type="button" className={securityState.cardLock ? 'primary-button' : 'secondary-button'} onClick={handleCardLockToggle}>
                {securityState.cardLock ? 'Unlock Cards' : 'Lock Cards'}
              </button>
            </div>
          </div>

          {securityFeedback ? <p className="auth-message mobile-inline-message">{securityFeedback}</p> : null}
        </article>
      </section>
    );
  }

  function renderProfilePage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Profile',
          title: user.name,
          description: 'Review account identity, linked balances, and your service shortcuts.',
          backPage: 'Dashboard',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel profile-hero-card">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Account holder</p>
              <h3>{user.name}</h3>
            </div>
              <div className="profile-pill">
                <AvatarBadge className="avatar" imageSrc={user.avatarImage} fallback={user.avatar} alt={`${user.name} profile`} />
              <div>
                <strong>{user.segment}</strong>
                <span>Verified account</span>
              </div>
            </div>
          </div>

          <div className="detail-stack profile-detail-stack">
            <div className="detail-row">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className="detail-row">
              <span>Phone</span>
              <strong>{user.phone}</strong>
            </div>
            <div className="detail-row">
              <span>Segment</span>
              <strong>{user.segment}</strong>
            </div>
            <div className="detail-row">
              <span>Account Number</span>
              <strong>{formatAccountNumber(user.accountNumber)}</strong>
            </div>
          </div>
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Linked accounts</p>
              <h3>Your banking pockets</h3>
            </div>
          </div>

          <div className="profile-account-grid">
            {user.accounts.map((account) => (
              <div key={account.label} className="mobile-balance-chip profile-account-card">
                <span>{account.label}</span>
                <strong>{formatCurrency(account.amount)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel profile-actions-card">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Tools</p>
              <h3>Open account pages</h3>
            </div>
          </div>

          <div className="mobile-action-shortcuts">
            <button type="button" className="secondary-button" onClick={() => openPage('Withdrawals')}>Withdrawals</button>
            <button type="button" className="secondary-button" onClick={() => openPage('Support')}>Support</button>
            <button type="button" className="secondary-button" onClick={() => openPage('Security')}>Security Center</button>
            <button type="button" className="primary-button" onClick={onLogout}>Logout</button>
          </div>
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel profile-service-card">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Customer Service</p>
              <h3>WhatsApp only support line</h3>
            </div>
          </div>

          <p className="muted-copy">Reach Apex Bank concierge directly on WhatsApp for account help and service questions.</p>
          <a className="primary-button profile-link-button" href={generalCustomerServiceHref} target="_blank" rel="noreferrer">
            WhatsApp {customerServiceNumber}
          </a>
        </article>
      </section>
    );
  }

  function renderLoansPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Loans',
          title: 'Loan center',
          description: 'Review borrowing options and route a request to the lending desk.',
          backPage: 'Dashboard',
        })}

        <section className="mobile-page-kpi-strip">
          <article className="glass-card mobile-page-kpi">
            <span>Personal loan</span>
            <strong>Up to {formatCurrency(Math.max(totalBalance * 0.35, 5000))}</strong>
            <small>Subject to review</small>
          </article>
          <article className="glass-card mobile-page-kpi">
            <span>Auto finance</span>
            <strong>From 6.9% APR</strong>
            <small>Flexible repayment</small>
          </article>
          <article className="glass-card mobile-page-kpi">
            <span>Status</span>
            <strong>Pre-check ready</strong>
            <small>No application started</small>
          </article>
        </section>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Apply</p>
              <h3>Submit a loan request</h3>
            </div>
          </div>

          <div className="mobile-inline-form-grid">
            <label className="mobile-inline-field">
              <span>Product</span>
              <select value={loanForm.product} onChange={(event) => setLoanForm((current) => ({ ...current, product: event.target.value }))}>
                <option>Personal Loan</option>
                <option>Auto Finance</option>
                <option>Business Credit</option>
              </select>
            </label>
            <label className="mobile-inline-field">
              <span>Amount</span>
              <input type="number" min="1000" value={loanForm.amount} onChange={(event) => setLoanForm((current) => ({ ...current, amount: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Tenor</span>
              <select value={loanForm.tenor} onChange={(event) => setLoanForm((current) => ({ ...current, tenor: event.target.value }))}>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
              </select>
            </label>
            <label className="mobile-inline-field">
              <span>Primary account</span>
              <select value={loanForm.sourceAccount} onChange={(event) => setLoanForm((current) => ({ ...current, sourceAccount: event.target.value }))}>
                {user.accounts.map((account) => (
                  <option key={account.label} value={account.label}>{account.label}</option>
                ))}
              </select>
            </label>
            <label className="mobile-inline-field mobile-inline-field-full">
              <span>Purpose</span>
              <textarea rows="4" value={loanForm.purpose} onChange={(event) => setLoanForm((current) => ({ ...current, purpose: event.target.value }))} />
            </label>
            <button type="button" className="primary-button" onClick={handleLoanSubmit}>
              Submit Loan Request
            </button>
          </div>

          {loanFeedback ? <p className="auth-message mobile-inline-message">{loanFeedback}</p> : null}
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-history-list">
            <div className="mini-row withdrawal-request-row">
              <div>
                <strong>Personal loan review</strong>
                <span>Discuss amount, tenure, and monthly repayment with a lending specialist.</span>
              </div>
              <button type="button" className="primary-button" onClick={handleLoanSubmit}>
                Start request
              </button>
            </div>
            <div className="mini-row withdrawal-request-row">
              <div>
                <strong>Vehicle finance</strong>
                <span>Compare down-payment options and repayment schedules for auto purchases.</span>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => openSupportTemplate('Auto finance enquiry', 'I need help with vehicle financing options.')}
              >
                Talk to desk
              </button>
            </div>
          </div>

          <div className="mobile-history-list">
            {userLoanCases.length > 0 ? (
              userLoanCases.map((entry) => (
                <div key={entry.id} className="mini-row withdrawal-request-row">
                  <div>
                    <strong>{entry.subject}</strong>
                    <span>
                      {entry.amountRequested} • {entry.tenor}
                    </span>
                    {entry.adminNote ? <small>{entry.adminNote}</small> : null}
                    {entry.nextAction ? <small>Next: {entry.nextAction}</small> : null}
                    <small>{entry.id}</small>
                  </div>
                  <div className="withdrawal-request-side">
                    <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-copy">No loan request has been submitted from this account yet.</p>
            )}
          </div>
        </article>
      </section>
    );
  }

  function renderInvestmentsPage() {
    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Investments',
          title: 'Investment desk',
          description: 'Explore managed options and route portfolio questions to support.',
          backPage: 'Dashboard',
        })}

        <section className="mobile-page-kpi-strip">
          <article className="glass-card mobile-page-kpi">
            <span>Cash ready</span>
            <strong>{formatCurrency(primaryAccount?.amount ?? 0)}</strong>
            <small>Available in {primaryAccount?.label ?? 'primary account'}</small>
          </article>
          <article className="glass-card mobile-page-kpi">
            <span>Goal plans</span>
            <strong>3 options</strong>
            <small>Income, growth, and retirement</small>
          </article>
          <article className="glass-card mobile-page-kpi">
            <span>Advisor access</span>
            <strong>Available</strong>
            <small>Request a callback today</small>
          </article>
        </section>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-section-head">
            <div>
              <p className="eyebrow">Invest</p>
              <h3>Submit an investment request</h3>
            </div>
          </div>

          <div className="mobile-inline-form-grid">
            <label className="mobile-inline-field">
              <span>Plan</span>
              <select value={investmentForm.plan} onChange={(event) => setInvestmentForm((current) => ({ ...current, plan: event.target.value }))}>
                <option>Managed Portfolio</option>
                <option>Fixed Income Plan</option>
                <option>Retirement Goal Plan</option>
              </select>
            </label>
            <label className="mobile-inline-field">
              <span>Amount</span>
              <input type="number" min="500" value={investmentForm.amount} onChange={(event) => setInvestmentForm((current) => ({ ...current, amount: event.target.value }))} />
            </label>
            <label className="mobile-inline-field">
              <span>Horizon</span>
              <select value={investmentForm.horizon} onChange={(event) => setInvestmentForm((current) => ({ ...current, horizon: event.target.value }))}>
                <option>0-12 months</option>
                <option>12-24 months</option>
                <option>24-60 months</option>
                <option>5+ years</option>
              </select>
            </label>
            <label className="mobile-inline-field">
              <span>Funding account</span>
              <select value={investmentForm.fundingAccount} onChange={(event) => setInvestmentForm((current) => ({ ...current, fundingAccount: event.target.value }))}>
                {user.accounts.map((account) => (
                  <option key={account.label} value={account.label}>{account.label}</option>
                ))}
              </select>
            </label>
            <label className="mobile-inline-field mobile-inline-field-full">
              <span>Goal</span>
              <textarea rows="4" value={investmentForm.goal} onChange={(event) => setInvestmentForm((current) => ({ ...current, goal: event.target.value }))} />
            </label>
            <button type="button" className="primary-button" onClick={handleInvestmentSubmit}>
              Submit Investment Request
            </button>
          </div>

          {investmentFeedback ? <p className="auth-message mobile-inline-message">{investmentFeedback}</p> : null}
        </article>

        <article className="mobile-card-section glass-card mobile-tab-panel">
          <div className="mobile-history-list">
            <div className="mini-row withdrawal-request-row">
              <div>
                <strong>Managed portfolio</strong>
                <span>Balanced allocation for steady long-term growth with periodic reviews.</span>
              </div>
              <button type="button" className="primary-button" onClick={handleInvestmentSubmit}>
                Speak to advisor
              </button>
            </div>
            <div className="mini-row withdrawal-request-row">
              <div>
                <strong>Fixed income plan</strong>
                <span>Lower-volatility options for customers prioritizing capital preservation.</span>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => openSupportTemplate('Fixed income enquiry', 'I want to review fixed income investment options.')}
              >
                Learn more
              </button>
            </div>
          </div>

          <div className="mobile-history-list">
            {userInvestmentCases.length > 0 ? (
              userInvestmentCases.map((entry) => (
                <div key={entry.id} className="mini-row withdrawal-request-row">
                  <div>
                    <strong>{entry.subject}</strong>
                    <span>
                      {entry.amountRequested} • {entry.horizon}
                    </span>
                    {entry.adminNote ? <small>{entry.adminNote}</small> : null}
                    {entry.nextAction ? <small>Next: {entry.nextAction}</small> : null}
                    <small>{entry.id}</small>
                  </div>
                  <div className="withdrawal-request-side">
                    <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-copy">No investment request has been submitted from this account yet.</p>
            )}
          </div>
        </article>
      </section>
    );
  }

  function renderReceiptPage() {
    const receipt = selectedReceipt;

    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: 'Receipt',
          title: receipt ? 'Transaction receipt' : 'No receipt selected',
          description: receipt ? 'Review transfer or bill payment details.' : 'Return to payments and select a receipt to review.',
          backPage: receipt?.type === 'Bills' ? 'Bill Pay' : 'Transfers',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel mobile-receipt-card">
          {actionResult && ['Transfer Complete', 'Transfer Failed', 'Bill Payment Complete', 'Bill Payment Failed'].includes(actionResult.eyebrow)
            ? renderActionResultCard(actionResult)
            : null}

          {receipt ? (
            <>
              <div className="receipt-image-preview">
                <div className="receipt-image-preview-head">
                  <div>
                    <p className="eyebrow">Apex Bank</p>
                    <h3>Receipt Image Preview</h3>
                  </div>
                  <span className={`status-pill ${String(receipt.status).toLowerCase().replace(/\s+/g, '-')}`}>{receipt.status}</span>
                </div>

                <div className="receipt-image-preview-grid">
                  <div className="detail-row">
                    <span>Reference</span>
                    <strong>{receipt.id}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Beneficiary</span>
                    <strong>{receipt.name}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Type</span>
                    <strong>{receipt.type}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Amount</span>
                    <strong className={receipt.amount.startsWith('+') ? 'amount-positive' : 'amount-negative'}>{receipt.amount}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Date</span>
                    <strong>{receipt.date}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Status</span>
                    <strong>{receipt.status}</strong>
                  </div>
                  {receipt.destination ? (
                    <div className="detail-row">
                      <span>Destination</span>
                      <strong>{receipt.destination}</strong>
                    </div>
                  ) : null}
                  {receipt.note ? (
                    <div className="detail-row">
                      <span>Note</span>
                      <strong>{receipt.note}</strong>
                    </div>
                  ) : null}
                </div>

                <p className="receipt-image-preview-foot">Share this receipt as an image or download it as a PNG file.</p>
              </div>

              <div className="mobile-receipt-actions">
                <button type="button" className="secondary-button" onClick={handleShareSelectedReceiptImage}>
                  Share Receipt Image
                </button>
                <button type="button" className="primary-button" onClick={handleDownloadSelectedReceiptImage}>
                  Download PNG
                </button>
                <button type="button" className="secondary-button" onClick={() => openPage(receipt.type === 'Bills' ? 'Bill Pay' : 'Transfers')}>
                  Back to {receipt.type === 'Bills' ? 'Bill Pay' : 'Transfers'}
                </button>
                <button type="button" className="primary-button" onClick={() => openPage('Dashboard')}>
                  Return Dashboard
                </button>
              </div>

              {actionUtilityFeedback ? <p className="action-utility-feedback">{actionUtilityFeedback}</p> : null}
            </>
          ) : (
            <>
              <p className="muted-copy">No receipt has been selected yet.</p>
              <button type="button" className="primary-button" onClick={() => openPage('Transfers')}>
                Open payments
              </button>
            </>
          )}
        </article>
      </section>
    );
  }

  function renderNotificationsPage() {
    if (selectedNotification) {
      return (
        <section className="mobile-page-shell mobile-tab-screen notification-message-screen">
          {renderPageHeader({
            eyebrow: '',
            title: 'Notifications',
            description: '',
            onBack: handleNotificationBackToList,
          })}

          <article className="mobile-card-section glass-card mobile-tab-panel notification-message-only-card">
            <div className="notification-message-only-copy">
              <p>{selectedNotification.message}</p>
            </div>

            <button type="button" className="secondary-button notification-message-back" onClick={handleNotificationBackToList}>
              Back to notifications
            </button>
          </article>
        </section>
      );
    }

    return (
      <section className="mobile-page-shell mobile-tab-screen">
        {renderPageHeader({
          eyebrow: '',
          title: 'Notifications',
          description: '',
          backPage: 'Dashboard',
        })}

        <article className="mobile-card-section glass-card mobile-tab-panel notification-page-panel">
          <div className="mobile-section-head notification-page-head">
            <div>
              <p className="eyebrow">Message history</p>
              <h3>Your latest notifications</h3>
            </div>
          </div>

          <div className="notification-page-list">
            {userNotifications.length > 0 ? (
              userNotifications.map((entry) => (
                <article
                  key={entry.id}
                  className={selectedNotification?.id === entry.id ? 'notification-page-item active' : 'notification-page-item'}
                >
                  <div className="notification-page-item-copy">
                    <div className="user-notification-drawer-meta">
                      <strong>{entry.title}</strong>
                      <span>{entry.readAt ? 'Read' : 'Unread'}</span>
                    </div>
                    <p>{getNotificationPreview(entry.message)}</p>
                  </div>
                  <button type="button" className="secondary-button compact-button notification-item-action" onClick={() => handleNotificationSelect(entry.id)}>
                    View this message
                  </button>
                </article>
              ))
            ) : (
              <p className="muted-copy">No notifications available in the last 30 days.</p>
            )}
          </div>
        </article>
      </section>
    );
  }

  let activeTabContent = renderProfilePage();

  if (activeMobileTab === 'Dashboard') {
    activeTabContent = renderDashboardPage();
  } else if (activeMobileTab === 'Accounts') {
    activeTabContent = renderAccountsPage();
  } else if (activeMobileTab === 'Add Money') {
    activeTabContent = renderAddMoneyPage();
  } else if (activeMobileTab === 'Transfers') {
    activeTabContent = renderTransfersPage();
  } else if (activeMobileTab === 'Bill Pay') {
    activeTabContent = renderBillPayPage();
  } else if (activeMobileTab === 'Withdrawals') {
    activeTabContent = renderWithdrawalsPage();
  } else if (activeMobileTab === 'Cards') {
    activeTabContent = renderCardsPage();
  } else if (activeMobileTab === 'Loans') {
    activeTabContent = renderLoansPage();
  } else if (activeMobileTab === 'Investments') {
    activeTabContent = renderInvestmentsPage();
  } else if (activeMobileTab === 'Support') {
    activeTabContent = renderSupportPage();
  } else if (activeMobileTab === 'Security') {
    activeTabContent = renderSecurityPage();
  } else if (activeMobileTab === 'Receipt') {
    activeTabContent = renderReceiptPage();
  } else if (activeMobileTab === 'Notifications') {
    activeTabContent = renderNotificationsPage();
  }

  return (
    <div className="mobile-dashboard-shell">
      <main className="mobile-dashboard">
        <section className="mobile-header-row">
          <div className="mobile-header-main">
            <button
              type="button"
              className="mobile-avatar-button mobile-avatar-chip"
              onClick={() => openPage('Profile')}
              aria-label="Open profile"
            >
              <AvatarBadge className="avatar" imageSrc={user.avatarImage} fallback={user.avatar} alt={`${user.name} profile`} />
            </button>

            <div className="mobile-header-copy">
              <p className="eyebrow">Apex Bank</p>
              <h2>Hi, {firstName}</h2>
            </div>
          </div>

          <div className="mobile-header-actions">
            {canAccessAdmin && (
              <button
                type="button"
                className="secondary-button mobile-header-admin-button"
                onClick={onOpenAdminDashboard}
                aria-label="Open admin dashboard"
                title="Admin dashboard"
              >
                Admin
              </button>
            )}

            <button
              type="button"
              className="mobile-header-icon-button"
              onClick={() => openNotificationsPage()}
              aria-label="Open notifications"
              title="Notifications"
            >
              <span>🔔</span>
              {unreadNotifications.length > 0 ? <small className="mobile-header-badge">{Math.min(unreadNotifications.length, 9)}</small> : null}
            </button>

            <button
              type="button"
              className="mobile-header-icon-button"
              onClick={() => openPage('Security')}
              aria-label="Open settings"
              title="Settings"
            >
              <span>⚙</span>
            </button>
          </div>
        </section>

        <section key={activeMobileTab} className="mobile-tab-stage" aria-live="polite">
          {activeTabContent}
        </section>
      </main>

      <nav className="mobile-bottom-nav bottom-nav glass-card" aria-label="Bottom navigation">
        {bottomNavItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={activeNavItem === item.label ? 'mobile-bottom-item active' : 'mobile-bottom-item'}
            onClick={() => openPage(item.label)}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

function AdminDashboard({
  adminUser,
  currentMode,
  onSwitchToUser,
  onSwitchToAdmin,
  adminSection,
  onSectionChange,
  adminNotice,
  announcementComposerOpen,
  onOpenAnnouncementComposer,
  onCloseAnnouncementComposer,
  onSendAnnouncement,
  announcementDraft,
  onAnnouncementDraftChange,
  onExportReports,
  adminUserRecords,
  filteredAdminUsers,
  paginatedAdminUsers,
  adminSearch,
  setAdminSearch,
  adminUserStatusFilter,
  setAdminUserStatusFilter,
  adminUserPage,
  adminUserPageCount,
  setAdminUserPage,
  selectedAdminUserNames,
  onToggleAdminUserSelection,
  onToggleSelectAllAdminUsers,
  onBulkUserAction,
  selectedUser,
  adminUsersView,
  adminUserWorkspaceTab,
  selectedAdminRecord,
  onReviewUser,
  onCloseUserWorkspace,
  onAdminUserWorkspaceTabChange,
  onUserAction,
  onQuickUserAction,
  userEditForm,
  onUserEditChange,
  onSaveUserProfileEdits,
  adminCreditForm,
  onAdminCreditFormChange,
  onAdminAddFunds,
  adminFundingAccounts,
  adminFundingReceipt,
  adminFundingResult,
  limitForm,
  onLimitFormChange,
  onSaveUserLimits,
  adminWithdrawalRecords,
  onWithdrawalDecision,
  adminCardRecords,
  onGenerateCard,
  adminTransactionRecords,
  paginatedAdminTransactions,
  adminTransactionStatusFilter,
  setAdminTransactionStatusFilter,
  adminTransactionPage,
  adminTransactionPageCount,
  setAdminTransactionPage,
  selectedTransactionIds,
  onToggleTransactionSelection,
  onToggleSelectAllTransactions,
  onBulkTransactionAction,
  onTransactionAction,
  adminCaseRecords,
  onCaseAction,
  onOpenCaseReviewDialog,
  adminSettings,
  onSettingToggle,
  adminExportHistory,
  adminDialog,
  onCloseDialog,
  onConfirmDialog,
  onAdminDialogNoteChange,
  adminNotificationRecords,
  adminActivityRecords,
  adminLiveEvents,
  pendingWithdrawalCount,
  riskEventCount,
  activeAdminUsers,
  openCaseCount,
}) {
  const sectionMeta = {
    Overview: { eyebrow: 'Admin Overview', title: 'Operations command dashboard' },
    'Users Management': { eyebrow: 'Users Management', title: 'Review customers, KYC, and account controls' },
    Transactions: { eyebrow: 'Transactions', title: 'Monitor transaction flows and risk signals' },
    'Withdrawal Requests': { eyebrow: 'Withdrawal Requests', title: 'Approve or reject withdrawal queue items' },
    'Card Requests': { eyebrow: 'Card Requests', title: 'Generate and activate issued virtual cards' },
    'Loans Management': { eyebrow: 'Loans & Investments', title: 'Oversee credit and portfolio activity' },
    'Reports & Analytics': { eyebrow: 'Reports & Analytics', title: 'Review platform performance and exports' },
    'Fraud Monitoring': { eyebrow: 'Fraud Monitoring', title: 'Track high-risk behavior and admin actions' },
    Settings: { eyebrow: 'Admin Settings', title: 'Notifications, access, and security configuration' },
  };

  const activeSectionMeta = sectionMeta[adminSection] ?? sectionMeta.Overview;
  const kycCases = adminCaseRecords.filter((entry) => entry.type === 'KYC');
  const fraudCases = adminCaseRecords.filter((entry) => entry.type === 'Fraud');
  const supportCases = adminCaseRecords.filter((entry) => entry.type === 'Support');
  const loanCases = adminCaseRecords.filter((entry) => entry.type === 'Loan');
  const investmentCases = adminCaseRecords.filter((entry) => entry.type === 'Investment');
  const priorityUsers = [...adminUserRecords].sort((left, right) => right.riskScore - left.riskScore).slice(0, 3);
  const selectedUserCases = selectedAdminRecord ? adminCaseRecords.filter((entry) => entry.owner === selectedAdminRecord.name) : [];
  const selectedUserWithdrawals = selectedAdminRecord
    ? adminWithdrawalRecords.filter(
        (request) => request.requesterId === selectedAdminRecord.accountId || request.requesterName === selectedAdminRecord.name,
      )
    : [];
  const selectedUserInitials = selectedAdminRecord
    ? selectedAdminRecord.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'NA';
  const activeFundingReceipt =
    selectedAdminRecord && adminFundingReceipt?.accountId === selectedAdminRecord.accountId ? adminFundingReceipt : null;
  const [adminFundingUtilityFeedback, setAdminFundingUtilityFeedback] = useState('');
  const notificationAudienceOptions = Array.from(
    new Set([
      'All retail users',
      ...adminUserRecords.flatMap((entry) => [entry.name, entry.email, entry.accountId, entry.accountNumber].filter(Boolean)),
    ]),
  );
  const notificationRecipients = adminUserRecords.map((entry) => ({
    key: entry.accountId ?? entry.email ?? entry.name,
    audienceValue: entry.name,
    name: entry.name,
    email: entry.email,
    accountId: entry.accountId,
    accountNumber: entry.accountNumber,
    selected:
      announcementDraft.audience === entry.name
      || announcementDraft.audience === entry.email
      || announcementDraft.audience === entry.accountId
      || announcementDraft.audience === entry.accountNumber,
  }));
  const [announcementRecipientFilter, setAnnouncementRecipientFilter] = useState('');
  const filteredNotificationRecipients = notificationRecipients.filter((entry) => {
    const query = announcementRecipientFilter.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [entry.name, entry.email, entry.accountId, entry.accountNumber ?? '']
      .some((value) => String(value).toLowerCase().includes(query));
  });
  const selectedUserBalanceTotal = adminFundingAccounts.reduce((total, entry) => total + entry.amount, 0);
  const selectedUserOpenCases = selectedUserCases.filter((entry) => entry.status !== 'Resolved');
  const selectedUserPendingWithdrawals = selectedUserWithdrawals.filter((entry) => entry.status === 'Pending');
  const workspaceTabs = ['Overview', 'Funding', 'Controls', 'Activity'];
  const queuedWithdrawals = adminWithdrawalRecords.filter((request) => request.status === 'Pending');
  const flaggedUsers = adminUserRecords.filter((user) => user.status === 'Flagged');
  const suspendedUsers = adminUserRecords.filter((user) => user.status === 'Suspended');
  const activeCards = adminCardRecords.filter((request) => request.status === 'Active');
  const pendingTransferApprovals = adminTransactionRecords.filter((entry) => entry.reviewStatus === 'Pending Review');
  const transactionReviewQueue = adminTransactionRecords.filter((entry) => ['Pending Review', 'Flagged'].includes(entry.reviewStatus));

  function buildAdminFundingExportPayload() {
    const reference = activeFundingReceipt?.transactionId ?? adminFundingResult?.transactionId ?? selectedAdminRecord?.accountId ?? 'funding';

    return {
      filename: `apex-admin-funding-${slugifyReceiptSegment(reference)}.txt`,
      content: buildConfirmationExportText({
        eyebrow: 'Admin Funding',
        title: adminFundingResult?.title ?? 'Funding confirmation',
        message: adminFundingResult?.message ?? 'Customer funding action recorded.',
        auditLabel: adminFundingResult?.auditLabel ?? 'Audit Logged',
        createdAt: formatActionTimestamp(adminFundingResult?.createdAt ?? activeFundingReceipt?.createdAt ?? new Date().toISOString()),
        details: [
          ...(adminFundingResult?.transactionId ? [{ label: 'Reference', value: adminFundingResult.transactionId }] : []),
          ...(adminFundingResult?.customerName ? [{ label: 'Customer', value: adminFundingResult.customerName }] : []),
          ...(adminFundingResult?.accountLabel ? [{ label: 'Credited Account', value: adminFundingResult.accountLabel }] : []),
          ...(typeof adminFundingResult?.amount === 'number' ? [{ label: 'Amount', value: formatCurrency(adminFundingResult.amount) }] : []),
          ...(activeFundingReceipt?.note ? [{ label: 'Funding Note', value: activeFundingReceipt.note }] : []),
        ],
      }),
    };
  }

  async function handleCopyAdminFundingConfirmation() {
    const payload = buildAdminFundingExportPayload();

    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }

      await navigator.clipboard.writeText(payload.content);
      setAdminFundingUtilityFeedback('Funding confirmation copied. You can now share it anywhere.');
    } catch {
      setAdminFundingUtilityFeedback('Unable to copy this funding confirmation from the current browser session.');
    }
  }

  function handleDownloadAdminFundingConfirmation() {
    const payload = buildAdminFundingExportPayload();
    const downloaded = downloadTextDocument(payload.filename, payload.content);
    setAdminFundingUtilityFeedback(
      downloaded
        ? 'Funding confirmation downloaded successfully.'
        : 'Unable to download this funding confirmation from the current browser session.',
    );
  }

  useEffect(() => {
    setAdminFundingUtilityFeedback('');
  }, [activeFundingReceipt, adminFundingResult, selectedAdminRecord]);

  const renderOverviewPage = () => (
    <div className="admin-page-shell">
      <section className="admin-command-deck">
        <article className="glass-card admin-command-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Operations Snapshot</p>
              <h3>Control room highlights</h3>
            </div>
            <span className="badge positive">Live</span>
          </div>

          <div className="admin-command-grid">
            <div className="glass-inset admin-command-metric">
              <span>Accounts under watch</span>
              <strong>{adminUserRecords.length}</strong>
              <small>{activeAdminUsers} active and serviceable</small>
            </div>
            <div className="glass-inset admin-command-metric">
              <span>Pending approvals</span>
              <strong>{pendingWithdrawalCount}</strong>
              <small>Withdrawal queue items awaiting review</small>
            </div>
            <div className="glass-inset admin-command-metric">
              <span>Risk pressure</span>
              <strong>{riskEventCount}</strong>
              <small>Flagged events and fraud signals</small>
            </div>
            <div className="glass-inset admin-command-metric">
              <span>Open customer cases</span>
              <strong>{openCaseCount}</strong>
              <small>KYC, support, and fraud follow-ups</small>
            </div>
          </div>
        </article>

        <article className="glass-card admin-priority-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Priority Watchlist</p>
              <h3>Highest-risk customers</h3>
            </div>
          </div>

          <div className="mini-table">
            {priorityUsers.map((user) => (
              <button key={user.customerId} type="button" className="mini-row admin-priority-row" onClick={() => onReviewUser(user.name)}>
                <div>
                  <strong>{user.name}</strong>
                  <span>
                    {user.customerId} • {user.status}
                  </span>
                </div>
                <div className="admin-priority-side">
                  <span className={`status-pill ${user.status.toLowerCase()}`}>{user.status}</span>
                  <small>Risk {user.riskScore}/100</small>
                </div>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-stat-grid">
        <StatCard title="Total Users" value={adminUserRecords.length.toLocaleString()} meta={`${activeAdminUsers} active accounts`} />
        <StatCard title="Transactions" value="$24.8M" meta={`${adminLiveEvents.length} live watch items`} />
        <StatCard title="Revenue" value="$420,880" meta="Fees and spreads" />
        <StatCard
          title="User Status"
          value={`${Math.round((activeAdminUsers / Math.max(adminUserRecords.length, 1)) * 100)}% Active`}
          meta={`${pendingWithdrawalCount} withdrawals pending`}
        />
      </section>

      <section className="admin-page-grid admin-overview-grid">
        <article className="glass-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Queue Summary</p>
              <h3>Actionable desks</h3>
            </div>
            <span className="badge neutral">Cross-team</span>
          </div>

          <div className="mini-table">
            <div className="mini-row admin-mini-row">
              <div>
                <strong>User management</strong>
                <span>{flaggedUsers.length} flagged and {suspendedUsers.length} suspended</span>
              </div>
              <button type="button" className="table-link" onClick={() => onSectionChange('Users Management')}>
                Open desk
              </button>
            </div>
            <div className="mini-row admin-mini-row">
              <div>
                <strong>Transactions</strong>
                <span>{transactionReviewQueue.length} items need analyst review</span>
              </div>
              <button type="button" className="table-link" onClick={() => onSectionChange('Transactions')}>
                Open desk
              </button>
            </div>
            <div className="mini-row admin-mini-row">
              <div>
                <strong>Withdrawals</strong>
                <span>{queuedWithdrawals.length} requests are waiting on approval</span>
              </div>
              <button type="button" className="table-link" onClick={() => onSectionChange('Withdrawal Requests')}>
                Open desk
              </button>
            </div>
            <div className="mini-row admin-mini-row">
              <div>
                <strong>Fraud monitoring</strong>
                <span>{fraudCases.length} cases are active in the watchlist</span>
              </div>
              <button type="button" className="table-link" onClick={() => onSectionChange('Fraud Monitoring')}>
                Open desk
              </button>
            </div>
          </div>
        </article>

        <div className="admin-side-stack">
          <article className="glass-card admin-page-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Latest Withdrawals</p>
                <h3>Recent requests</h3>
              </div>
              <span className="badge neutral">{queuedWithdrawals.length} pending</span>
            </div>

            <div className="mini-table">
              {adminWithdrawalRecords.slice(0, 3).map((request) => (
                <div key={request.id} className="mini-row admin-mini-row">
                  <div>
                    <strong>{request.id}</strong>
                    <span>
                      {request.requesterName ?? 'Customer'} • {request.amount}
                    </span>
                  </div>
                  <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card admin-page-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Operations Feed</p>
                <h3>Live admin activity</h3>
              </div>
            </div>

            <div className="feed-list">
              {adminActivityRecords.slice(0, 4).map((entry, index) => (
                <div key={`${entry}-${index}`} className="feed-item">
                  <span className="pulse-dot" />
                  <p>{entry}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );

  const renderUsersPage = () => {
    if (adminUsersView === 'detail' && selectedAdminRecord) {
      return (
        <div className="admin-page-shell admin-user-workspace-page">
          <section className="admin-user-workspace-shell">
            <div className="admin-user-workspace-topbar">
              <button type="button" className="secondary-button admin-user-workspace-back" onClick={onCloseUserWorkspace}>
                Back To Directory
              </button>
              <div className="admin-user-workspace-topbar-copy">
                <p className="eyebrow">Customer Workspace</p>
                <h3>{selectedAdminRecord.name}</h3>
                <span>Dedicated service page for funding, profile controls, compliance review, and customer history.</span>
              </div>
            </div>

            <article className="glass-card admin-customer-stage">
              <div className="admin-customer-stage-copy">
                <div className="admin-customer-stage-identity">
                  <AvatarBadge
                    className="brand-mark admin-user-avatar admin-user-avatar-large"
                    imageSrc={selectedAdminRecord.avatarImage}
                    fallback={selectedUserInitials}
                    alt={`${selectedAdminRecord.name} profile`}
                  />
                  <div>
                    <p className="eyebrow">Selected Customer</p>
                    <h2>{selectedAdminRecord.name}</h2>
                    <span>
                      {selectedAdminRecord.email ?? 'No email on file'} • {selectedAdminRecord.phone ?? 'No phone on file'}
                    </span>
                  </div>
                </div>

                <div className="admin-customer-stage-badges">
                  <span className="badge neutral">{selectedAdminRecord.customerId}</span>
                  <span className={`status-pill ${selectedAdminRecord.status.toLowerCase()}`}>{selectedAdminRecord.status}</span>
                  <span className="badge negative">Risk {selectedAdminRecord.riskScore}/100</span>
                </div>
              </div>

              <div className="admin-user-spotlight-grid">
                <div className="glass-inset admin-user-spotlight-card">
                  <span>Total Balance</span>
                  <strong>{formatCurrency(selectedUserBalanceTotal)}</strong>
                  <small>{adminFundingAccounts.length} balance bucket{adminFundingAccounts.length === 1 ? '' : 's'} monitored</small>
                </div>
                <div className="glass-inset admin-user-spotlight-card">
                  <span>Open Cases</span>
                  <strong>{selectedUserOpenCases.length}</strong>
                  <small>Compliance, support, and service reviews</small>
                </div>
                <div className="glass-inset admin-user-spotlight-card">
                  <span>Pending Withdrawals</span>
                  <strong>{selectedUserPendingWithdrawals.length}</strong>
                  <small>Awaiting operations approval</small>
                </div>
                <div className="glass-inset admin-user-spotlight-card">
                  <span>Verification</span>
                  <strong>{selectedAdminRecord.verificationStatus}</strong>
                  <small>{selectedAdminRecord.segment} customer tier</small>
                </div>
              </div>
            </article>

            <div className="admin-user-workspace-tabs" role="tablist" aria-label="Customer workspace sections">
              {workspaceTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={adminUserWorkspaceTab === tab}
                  className={adminUserWorkspaceTab === tab ? 'admin-workspace-tab is-active' : 'admin-workspace-tab'}
                  onClick={() => onAdminUserWorkspaceTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <section className="admin-user-workspace-grid">
              {adminUserWorkspaceTab === 'Overview' ? (
                <>
                  <article className="glass-card admin-user-panel admin-user-panel-wide">
                    <div className="section-head compact">
                      <div>
                        <p className="eyebrow">Balance Buckets</p>
                        <h4>Live account portfolio</h4>
                      </div>
                    </div>

                    <div className="admin-account-bucket-grid">
                      {adminFundingAccounts.map((entry) => (
                        <div key={entry.label} className="glass-inset admin-account-bucket-card">
                          <span>{entry.label}</span>
                          <strong>{formatCurrency(entry.amount)}</strong>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="glass-card admin-user-panel">
                    <div className="section-head compact">
                      <div>
                        <p className="eyebrow">Profile Snapshot</p>
                        <h4>Identity and service posture</h4>
                      </div>
                    </div>

                    <div className="detail-stack">
                      <div className="detail-row">
                        <span>Account Number</span>
                        <strong>{selectedAdminRecord.accountNumber ? formatAccountNumber(selectedAdminRecord.accountNumber) : 'Not assigned'}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Last Activity</span>
                        <strong>{selectedAdminRecord.lastActivity}</strong>
                      </div>
                      <div className="detail-row">
                        <span>KYC Level</span>
                        <strong>{selectedAdminRecord.kycLevel}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Date Of Birth</span>
                        <strong>{selectedAdminRecord.dateOfBirth || 'Not provided'}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Gender</span>
                        <strong>{selectedAdminRecord.gender || 'Not provided'}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Password</span>
                        <strong>Managed securely on the server</strong>
                      </div>
                      <div className="detail-row">
                        <span>Daily Transfer Limit</span>
                        <strong>${selectedAdminRecord.transferLimit}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Card Spending Limit</span>
                        <strong>${selectedAdminRecord.cardLimit}</strong>
                      </div>
                    </div>
                  </article>

                  <article className="glass-card admin-user-panel">
                    <div className="section-head compact">
                      <div>
                        <p className="eyebrow">Live Controls</p>
                        <h4>Operational actions</h4>
                      </div>
                    </div>

                    <div className="button-grid admin-action-grid">
                      <button type="button" className="primary-button" onClick={() => onUserAction('activate')}>
                        Activate
                      </button>
                      <button type="button" className="secondary-button" onClick={() => onUserAction('suspend')}>
                        Suspend
                      </button>
                      {selectedAdminRecord.verificationStatus !== 'Verified' ? (
                        <button type="button" className="secondary-button" onClick={() => onUserAction('verify')}>
                          Verify Account
                        </button>
                      ) : null}
                      <button type="button" className="secondary-button" onClick={() => onUserAction('flag')}>
                        Flag Activity
                      </button>
                    </div>
                  </article>
                </>
              ) : null}

              {adminUserWorkspaceTab === 'Funding' ? (
                <article className="glass-card admin-user-panel admin-user-panel-featured admin-user-panel-wide">
                  <div className="section-head compact">
                    <div>
                      <p className="eyebrow">Funding Action</p>
                      <h4>Post money into a live account bucket</h4>
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <label className="input-shell admin-form-field">
                      <span>Target Account</span>
                      <select value={adminCreditForm.accountLabel} onChange={(event) => onAdminCreditFormChange('accountLabel', event.target.value)}>
                        {adminFundingAccounts.map((entry) => (
                          <option key={entry.label} value={entry.label}>
                            {entry.label} • {formatCurrency(entry.amount)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="input-shell admin-form-field">
                      <span>Amount</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={adminCreditForm.amount}
                        onChange={(event) => onAdminCreditFormChange('amount', event.target.value)}
                      />
                    </label>
                    <label className="input-shell admin-form-field admin-form-field-wide">
                      <span>Funding Note</span>
                      <input
                        placeholder="Optional memo for the customer notification"
                        value={adminCreditForm.note}
                        onChange={(event) => onAdminCreditFormChange('note', event.target.value)}
                      />
                    </label>
                    <button type="button" className="primary-button" onClick={onAdminAddFunds}>
                      Add Money
                    </button>
                  </div>

                  {adminFundingResult ? (
                    <div className={`admin-funding-result ${adminFundingResult.ok ? 'is-success' : 'is-failure'}`}>
                      <div className="section-head compact admin-funding-receipt-head">
                        <div>
                          <p className="eyebrow">Funding Outcome</p>
                          <h4>{adminFundingResult.title}</h4>
                        </div>
                        <span className={`badge ${adminFundingResult.ok ? 'positive' : 'negative'}`}>
                          {adminFundingResult.ok ? 'Success' : 'Failed'}
                        </span>
                      </div>

                      <p className="admin-funding-result-message">{adminFundingResult.message}</p>

                      <div className="admin-funding-result-meta">
                        <span>{adminFundingResult.auditLabel ?? (adminFundingResult.ok ? 'Audit Logged' : 'Needs Review')}</span>
                        <strong>{formatActionTimestamp(adminFundingResult.createdAt ?? new Date().toISOString())}</strong>
                      </div>

                      {adminFundingResult.transactionId ? (
                        <div className="detail-stack">
                          <div className="detail-row">
                            <span>Reference</span>
                            <strong>{adminFundingResult.transactionId}</strong>
                          </div>
                          <div className="detail-row">
                            <span>Customer</span>
                            <strong>{adminFundingResult.customerName}</strong>
                          </div>
                          <div className="detail-row">
                            <span>Credited Account</span>
                            <strong>{adminFundingResult.accountLabel}</strong>
                          </div>
                          <div className="detail-row">
                            <span>Amount</span>
                            <strong>{formatCurrency(adminFundingResult.amount)}</strong>
                          </div>
                        </div>
                      ) : null}

                      {!adminFundingResult.ok ? (
                        <div className="admin-funding-result-actions">
                          <button type="button" className="primary-button" onClick={onAdminAddFunds}>
                            Retry Funding
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="admin-funding-result-actions">
                            <button type="button" className="secondary-button" onClick={handleCopyAdminFundingConfirmation}>
                              Copy Confirmation
                            </button>
                            <button type="button" className="primary-button" onClick={handleDownloadAdminFundingConfirmation}>
                              Download Confirmation
                            </button>
                          </div>
                          {adminFundingUtilityFeedback ? <p className="action-utility-feedback">{adminFundingUtilityFeedback}</p> : null}
                        </>
                      )}
                    </div>
                  ) : null}

                  {activeFundingReceipt ? (
                    <div className="admin-funding-receipt">
                      <div className="section-head compact admin-funding-receipt-head">
                        <div>
                          <p className="eyebrow">Latest Receipt</p>
                          <h4>{formatCurrency(activeFundingReceipt.amount)} posted successfully</h4>
                        </div>
                        <span className="badge positive">Completed</span>
                      </div>

                      <div className="detail-stack">
                        <div className="detail-row">
                          <span>Customer</span>
                          <strong>{activeFundingReceipt.userName}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Credited Account</span>
                          <strong>{activeFundingReceipt.accountLabel}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Reference</span>
                          <strong>{activeFundingReceipt.transactionId}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Posted</span>
                          <strong>{new Date(activeFundingReceipt.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</strong>
                        </div>
                        {activeFundingReceipt.note ? (
                          <div className="detail-row admin-funding-receipt-note">
                            <span>Note</span>
                            <strong>{activeFundingReceipt.note}</strong>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <p className="muted-copy">Credits post instantly to the selected balance bucket and generate a customer notification.</p>
                  )}
                </article>
              ) : null}

              {adminUserWorkspaceTab === 'Controls' ? (
                <>
                  <article className="glass-card admin-user-panel">
                    <div className="section-head compact">
                      <div>
                        <p className="eyebrow">Profile Editor</p>
                        <h4>Identity and KYC updates</h4>
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <label className="input-shell admin-form-field">
                        <span>Segment</span>
                        <input value={userEditForm.segment} onChange={(event) => onUserEditChange('segment', event.target.value)} />
                      </label>
                      <label className="input-shell admin-form-field">
                        <span>KYC Level</span>
                        <input value={userEditForm.kycLevel} onChange={(event) => onUserEditChange('kycLevel', event.target.value)} />
                      </label>
                      <label className="input-shell admin-form-field admin-form-field-wide">
                        <span>Password</span>
                        <input
                          type="password"
                          placeholder="Leave blank to keep the current password"
                          value={userEditForm.password}
                          onChange={(event) => onUserEditChange('password', event.target.value)}
                        />
                      </label>
                      <button type="button" className="primary-button" onClick={onSaveUserProfileEdits}>
                        Save Profile Changes
                      </button>
                    </div>
                  </article>

                  <article className="glass-card admin-user-panel">
                    <div className="section-head compact">
                      <div>
                        <p className="eyebrow">Limits</p>
                        <h4>Spending and transfer controls</h4>
                      </div>
                    </div>

                    <div className="admin-form-grid admin-limit-grid">
                      <label className="input-shell admin-form-field">
                        <span>Daily Transfer Limit</span>
                        <input value={limitForm.transferLimit} onChange={(event) => onLimitFormChange('transferLimit', event.target.value)} />
                      </label>
                      <label className="input-shell admin-form-field">
                        <span>Card Spending Limit</span>
                        <input value={limitForm.cardLimit} onChange={(event) => onLimitFormChange('cardLimit', event.target.value)} />
                      </label>
                      <button type="button" className="secondary-button" onClick={onSaveUserLimits}>
                        Save Limits
                      </button>
                    </div>
                  </article>

                  <article className="glass-card admin-user-panel admin-user-panel-wide admin-danger-zone">
                    <p className="eyebrow">Danger Zone</p>
                    <h4>Delete {selectedAdminRecord.name}</h4>
                    <span>This removes the customer record from the system and keeps the action behind a confirmation step.</span>
                    <button type="button" className="secondary-button danger" onClick={() => onUserAction('delete')}>
                      Delete User Permanently
                    </button>
                  </article>
                </>
              ) : null}

              {adminUserWorkspaceTab === 'Activity' ? (
                <article className="glass-card admin-user-panel admin-user-panel-wide">
                  <div className="section-head compact">
                    <div>
                      <p className="eyebrow">Linked Activity</p>
                      <h4>Cases and withdrawal history</h4>
                    </div>
                  </div>

                  <div className="mini-table admin-case-list">
                    {selectedUserWithdrawals.length > 0 ? (
                      selectedUserWithdrawals.slice(0, 3).map((request) => (
                        <div key={request.id} className="mini-row admin-mini-row">
                          <div>
                            <strong>{request.id}</strong>
                            <span>
                              {request.amount} • {request.destination}
                            </span>
                          </div>
                          <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
                        </div>
                      ))
                    ) : (
                      <p className="muted-copy">No withdrawal requests linked to this customer yet.</p>
                    )}

                    {selectedUserCases.length > 0 ? (
                      selectedUserCases.map((entry) => (
                        <div key={entry.id} className="mini-row admin-mini-row">
                          <div>
                            <strong>{entry.subject}</strong>
                            <span>
                              {entry.priority} priority • {entry.assignee}
                            </span>
                          </div>
                          <div className="row-actions">
                            <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                            <button type="button" className="table-link" onClick={() => onCaseAction(entry.id, 'Resolved')}>
                              Clear
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="muted-copy">No active compliance or support cases for this customer.</p>
                    )}
                  </div>
                </article>
              ) : null}
            </section>
          </section>
        </div>
      );
    }

    return (
      <div className="admin-page-shell">
        <section className="glass-card admin-page-header-card">
          <div>
            <p className="eyebrow">Users Management</p>
            <h3>Choose a customer to open a dedicated workspace</h3>
            <span>Every selected customer opens on a separate operations page with funding, KYC, compliance, and account controls.</span>
          </div>
          <div className="admin-kpi-strip">
            <div className="glass-inset admin-kpi-pill">
              <span>Total users</span>
              <strong>{adminUserRecords.length}</strong>
            </div>
            <div className="glass-inset admin-kpi-pill">
              <span>Flagged</span>
              <strong>{flaggedUsers.length}</strong>
            </div>
            <div className="glass-inset admin-kpi-pill">
              <span>Suspended</span>
              <strong>{suspendedUsers.length}</strong>
            </div>
          </div>
        </section>

        <section className="analytics-grid admin-panels admin-users-workspace admin-users-directory-grid">
          <article className="glass-card users-card users-command-center">
            <div className="section-head">
              <div>
                <p className="eyebrow">Customer Directory</p>
                <h3>Accounts, identity, and operational controls</h3>
              </div>
              <div className="search-box inline-search">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search users"
                  value={adminSearch}
                  onChange={(event) => setAdminSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="admin-users-summary-strip">
              <div className="glass-inset admin-users-summary-item">
                <span>Visible users</span>
                <strong>{filteredAdminUsers.length}</strong>
              </div>
              <div className="glass-inset admin-users-summary-item">
                <span>Selected for action</span>
                <strong>{selectedAdminUserNames.length}</strong>
              </div>
              <div className="glass-inset admin-users-summary-item">
                <span>Flagged accounts</span>
                <strong>{flaggedUsers.length}</strong>
              </div>
              <div className="glass-inset admin-users-summary-item">
                <span>Workspace target</span>
                <strong>{selectedUser || 'Choose a customer'}</strong>
              </div>
            </div>

            <div className="admin-toolbar-row">
              <div className="filter-toolbar admin-filter-toolbar">
                <select value={adminUserStatusFilter} onChange={(event) => setAdminUserStatusFilter(event.target.value)}>
                  <option>All</option>
                  <option>Active</option>
                  <option>Suspended</option>
                  <option>Flagged</option>
                </select>
              </div>
              <div className="row-actions">
                <button type="button" className="secondary-button" onClick={() => onBulkUserAction('activate')}>
                  Bulk Activate
                </button>
                <button type="button" className="secondary-button" onClick={() => onBulkUserAction('suspend')}>
                  Bulk Suspend
                </button>
                <button type="button" className="secondary-button danger" onClick={() => onBulkUserAction('flag')}>
                  Bulk Flag
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Tier</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdminUsers.length > 0 ? (
                    paginatedAdminUsers.map((user) => (
                      <tr
                        key={user.name}
                        className={selectedUser === user.name ? 'admin-user-row is-selected' : 'admin-user-row'}
                        onClick={() => onReviewUser(user.name)}
                      >
                        <td data-label="Select">
                          <input
                            type="checkbox"
                            checked={selectedAdminUserNames.includes(user.name)}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() => onToggleAdminUserSelection(user.name)}
                          />
                        </td>
                        <td data-label="Customer">
                          <strong>{user.name}</strong>
                          <span>
                            {user.customerId} • {user.accountNumber ? formatAccountNumber(user.accountNumber) : user.lastActivity}
                          </span>
                        </td>
                        <td data-label="Contact">
                          <strong>{user.email ?? 'No email'}</strong>
                          <span>{user.phone ?? 'No phone'}</span>
                        </td>
                        <td data-label="Tier">
                          <strong>{user.segment}</strong>
                          <span>{user.kycLevel}</span>
                        </td>
                        <td data-label="Balance">{user.balance}</td>
                        <td data-label="Status">
                          <span className={`status-pill ${user.status.toLowerCase()}`}>{user.status}</span>
                        </td>
                        <td data-label="Action">
                          <div className="row-actions admin-row-actions">
                            <button type="button" className="table-link" onClick={() => onReviewUser(user.name)}>
                              Open Workspace
                            </button>
                            <button
                              type="button"
                              className="table-link"
                              onClick={(event) => {
                                event.stopPropagation();
                                onQuickUserAction(user.status === 'Suspended' ? 'activate' : 'suspend', user.accountId ?? user.name);
                              }}
                            >
                              {user.status === 'Suspended' ? 'Activate' : 'Suspend'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="empty-state-cell" colSpan="7">
                        No users match the current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination row-actions">
              <button type="button" className="secondary-button" onClick={onToggleSelectAllAdminUsers}>
                Select Page
              </button>
              <span>Page {adminUserPage} of {adminUserPageCount}</span>
              <button type="button" className="secondary-button" onClick={() => setAdminUserPage(Math.max(1, adminUserPage - 1))}>
                Previous
              </button>
              <button type="button" className="secondary-button" onClick={() => setAdminUserPage(Math.min(adminUserPageCount, adminUserPage + 1))}>
                Next
              </button>
            </div>
          </article>

          <article className="glass-card admin-user-launchpad">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Workspace Launchpad</p>
                <h3>{selectedAdminRecord ? selectedAdminRecord.name : 'No customer selected'}</h3>
              </div>
              {selectedAdminRecord ? <span className={`status-pill ${selectedAdminRecord.status.toLowerCase()}`}>{selectedAdminRecord.status}</span> : null}
            </div>

            {selectedAdminRecord ? (
              <>
                <div className="admin-user-launchpad-hero">
                  <div className="brand-mark admin-user-avatar admin-user-avatar-large">{selectedUserInitials}</div>
                  <div>
                    <p className="eyebrow">Ready For Review</p>
                    <h4>{selectedAdminRecord.name}</h4>
                    <span>
                      {selectedAdminRecord.segment} • {selectedAdminRecord.kycLevel} • {selectedAdminRecord.balance}
                    </span>
                  </div>
                </div>

                <div className="admin-user-launchpad-metrics">
                  <div className="glass-inset admin-user-launchpad-metric">
                    <span>Open Cases</span>
                    <strong>{selectedUserOpenCases.length}</strong>
                  </div>
                  <div className="glass-inset admin-user-launchpad-metric">
                    <span>Pending Withdrawals</span>
                    <strong>{selectedUserPendingWithdrawals.length}</strong>
                  </div>
                </div>

                <button type="button" className="primary-button" onClick={() => onReviewUser(selectedAdminRecord.name)}>
                  Open {selectedAdminRecord.name.split(' ')[0]}'s Workspace
                </button>
              </>
            ) : (
              <p className="muted-copy">Pick any customer from the directory to open their full service workspace.</p>
            )}
          </article>
        </section>
      </div>
    );
  };

  const renderTransactionsPage = () => (
    <div className="admin-page-shell">
      <section className="glass-card admin-page-header-card">
        <div>
          <p className="eyebrow">Transactions Desk</p>
          <h3>Dedicated payment monitoring page</h3>
          <span>Review flagged transfers, bulk resolve transaction queues, and escalate suspicious movement without leaving the desk.</span>
        </div>
        <div className="admin-kpi-strip">
          <div className="glass-inset admin-kpi-pill">
            <span>Total tracked</span>
            <strong>{adminTransactionRecords.length}</strong>
          </div>
          <div className="glass-inset admin-kpi-pill">
            <span>Needs review</span>
            <strong>{transactionReviewQueue.length}</strong>
          </div>
          <div className="glass-inset admin-kpi-pill">
            <span>Risk events</span>
            <strong>{riskEventCount}</strong>
          </div>
        </div>
      </section>

      <section className="admin-page-grid admin-transactions-grid">
        <article className="glass-card transactions-card admin-page-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Transaction Queue</p>
              <h3>Review transaction activity and intervene fast</h3>
            </div>
            <span className="badge neutral">{adminTransactionRecords.length} tracked</span>
          </div>

          <div className="admin-toolbar-row">
            <div className="filter-toolbar admin-filter-toolbar">
              <select value={adminTransactionStatusFilter} onChange={(event) => setAdminTransactionStatusFilter(event.target.value)}>
                <option>All</option>
                <option>Monitored</option>
                <option>Flagged</option>
                <option>Pending Review</option>
                <option>Reviewed</option>
                <option>Resolved</option>
              </select>
            </div>
            <div className="row-actions">
              <button type="button" className="secondary-button" onClick={() => onBulkTransactionAction('resolve')}>
                Bulk Resolve
              </button>
              <button type="button" className="secondary-button danger" onClick={() => onBulkTransactionAction('flag')}>
                Bulk Flag
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Reference</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Desk Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdminTransactions.map((entry) => (
                  <tr key={entry.id}>
                    <td data-label="Select">
                      <input
                        type="checkbox"
                        checked={selectedTransactionIds.includes(entry.id)}
                        onChange={() => onToggleTransactionSelection(entry.id)}
                      />
                    </td>
                    <td data-label="Reference">
                      <strong>{entry.id}</strong>
                      <span>{entry.date}</span>
                    </td>
                    <td data-label="Owner">{entry.owner}</td>
                    <td data-label="Type">{entry.type}</td>
                    <td data-label="Amount">{entry.amount}</td>
                    <td data-label="Status">
                      <span className={`status-pill ${entry.reviewStatus.toLowerCase().replace(/\s+/g, '-')}`}>{entry.reviewStatus}</span>
                    </td>
                    <td data-label="Desk Action">
                      <div className="row-actions">
                        <button type="button" className="table-link" onClick={() => onTransactionAction(entry.id, 'review')}>
                          Review
                        </button>
                        <button type="button" className="table-link reject" onClick={() => onTransactionAction(entry.id, 'flag')}>
                          Flag
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination row-actions">
            <button type="button" className="secondary-button" onClick={onToggleSelectAllTransactions}>
              Select Page
            </button>
            <span>Page {adminTransactionPage} of {adminTransactionPageCount}</span>
            <button type="button" className="secondary-button" onClick={() => setAdminTransactionPage(Math.max(1, adminTransactionPage - 1))}>
              Previous
            </button>
            <button type="button" className="secondary-button" onClick={() => setAdminTransactionPage(Math.min(adminTransactionPageCount, adminTransactionPage + 1))}>
              Next
            </button>
          </div>
        </article>

        <div className="admin-side-stack">
          <article className="glass-card monitoring-card admin-page-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Transaction Monitoring</p>
                <h3>Live feed and fraud signals</h3>
              </div>
              <span className="badge negative">{riskEventCount} risk events</span>
            </div>

            <div className="feed-list">
              {adminLiveEvents.map((event, index) => (
                <div key={`${event}-${index}`} className="feed-item">
                  <span className="pulse-dot" />
                  <p>{event}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card admin-page-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Fraud Case Queue</p>
                <h3>Fast response actions</h3>
              </div>
            </div>

            <div className="mini-table admin-case-list">
              {fraudCases.map((entry) => (
                <div key={entry.id} className="mini-row admin-mini-row">
                  <div>
                    <strong>{entry.subject}</strong>
                    <span>
                      {entry.owner} • {entry.assignee}
                    </span>
                  </div>
                  <div className="row-actions">
                    <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                    <button type="button" className="table-link reject" onClick={() => onCaseAction(entry.id, 'Escalated')}>
                      Escalate
                    </button>
                    <button type="button" className="table-link" onClick={() => onCaseAction(entry.id, 'Resolved')}>
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="fraud-meter">
              <div>
                <span>Automated fraud detection</span>
                <strong>92% confidence</strong>
              </div>
              <div className="goal-track">
                <div className="goal-fill" style={{ width: `${Math.min(96, Math.max(54, 60 + riskEventCount * 8))}%` }} />
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );

  const renderWithdrawalsPage = () => (
    <div className="admin-page-shell">
      <section className="glass-card admin-page-header-card">
        <div>
          <p className="eyebrow">Withdrawal Requests</p>
          <h3>Dedicated payout approvals page</h3>
          <span>Approve requests, issue payout codes, and keep every withdrawal decision in one visible queue.</span>
        </div>
        <div className="admin-kpi-strip">
          <div className="glass-inset admin-kpi-pill">
            <span>Pending</span>
            <strong>{queuedWithdrawals.length}</strong>
          </div>
          <div className="glass-inset admin-kpi-pill">
            <span>Approved</span>
            <strong>{adminWithdrawalRecords.filter((request) => request.status === 'Approved').length}</strong>
          </div>
          <div className="glass-inset admin-kpi-pill">
            <span>Rejected</span>
            <strong>{adminWithdrawalRecords.filter((request) => request.status === 'Rejected').length}</strong>
          </div>
        </div>
      </section>

      <section className="admin-page-grid admin-single-main-grid">
        <article className="glass-card withdrawal-admin-card admin-page-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Approval Workflow</p>
              <h3>Withdrawal queue and code issuance</h3>
            </div>
            <span className="badge neutral">{pendingWithdrawalCount} pending</span>
          </div>

          <div className="mini-table">
            {adminWithdrawalRecords.map((request) => (
              <div key={request.id} className="mini-row admin-mini-row admin-workflow-row">
                <div>
                  <strong>{request.id}</strong>
                  <span>
                    {request.requesterName ?? 'Customer'} • {request.amount} • {request.requested}
                  </span>
                  <small>{request.destination}</small>
                </div>
                <div className="row-actions admin-row-actions-wrap">
                  <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
                  <button type="button" className="table-link" onClick={() => onWithdrawalDecision(request.id, 'approve')}>
                    Approve & Issue Code
                  </button>
                  <button type="button" className="table-link reject" onClick={() => onWithdrawalDecision(request.id, 'reject')}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );

  const renderCardsPage = () => (
    <div className="admin-page-shell">
      <section className="glass-card admin-page-header-card">
        <div>
          <p className="eyebrow">Card Requests</p>
          <h3>Dedicated virtual card issuance page</h3>
          <span>Generate cards, regenerate active cards, and keep the issuance queue clean and accessible.</span>
        </div>
        <div className="admin-kpi-strip">
          <div className="glass-inset admin-kpi-pill">
            <span>Total requests</span>
            <strong>{adminCardRecords.length}</strong>
          </div>
          <div className="glass-inset admin-kpi-pill">
            <span>Active cards</span>
            <strong>{activeCards.length}</strong>
          </div>
          <div className="glass-inset admin-kpi-pill">
            <span>Pending issue</span>
            <strong>{adminCardRecords.filter((request) => request.status !== 'Active').length}</strong>
          </div>
        </div>
      </section>

      <section className="admin-page-grid admin-single-main-grid">
        <article className="glass-card card-admin-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Virtual Card Management</p>
              <h3>Request queue</h3>
            </div>
          </div>
          <div className="mini-table">
            {adminCardRecords.map((request) => (
              <div key={request.id} className="mini-row admin-mini-row admin-workflow-row">
                <div>
                  <strong>{request.id}</strong>
                  <span>{request.type}</span>
                </div>
                <div className="row-actions admin-row-actions-wrap">
                  <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
                  <button type="button" className="table-link" onClick={() => onGenerateCard(request.id)}>
                    {request.status === 'Active' ? 'Regenerate' : 'Generate Card'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );

  const renderLoansPage = () => (
    <div className="admin-page-shell">
      <section className="glass-card admin-page-header-card">
        <div>
          <p className="eyebrow">Loans & Investments</p>
          <h3>Portfolio supervision page</h3>
          <span>Track lending pressure, monitor portfolio movement, and route KYC or support cases affecting credit flows.</span>
        </div>
      </section>

      <section className="admin-page-grid admin-two-column-grid">
        <article className="glass-card loans-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Portfolio Supervision</p>
              <h3>Loan and investment overview</h3>
            </div>
          </div>
          <div className="detail-stack">
            <div className="detail-row">
              <span>Loan approvals pending</span>
              <strong>{loanCases.filter((entry) => entry.status === 'Open' || entry.status === 'Reviewing').length} applications</strong>
            </div>
            <div className="detail-row">
              <span>Investment flows today</span>
              <strong>{investmentCases.length} requests</strong>
            </div>
            <div className="detail-row">
              <span>High risk accounts</span>
              <strong>{flaggedUsers.length} flagged</strong>
            </div>
          </div>
        </article>

        <article className="glass-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Loan Requests</p>
              <h3>Customer lending queue</h3>
            </div>
          </div>
          <div className="mini-table admin-case-list">
            {loanCases.length > 0 ? (
              loanCases.map((entry) => (
                <div key={entry.id} className="mini-row admin-mini-row">
                  <div>
                    <strong>{entry.subject}</strong>
                    <span>
                      {entry.owner} • {entry.amountRequested ?? 'Amount pending'} • {entry.assignee}
                    </span>
                    {entry.adminNote ? <small>{entry.adminNote}</small> : null}
                    <small>{entry.id}</small>
                  </div>
                  <div className="row-actions">
                    <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                    <button type="button" className="table-link" onClick={() => onOpenCaseReviewDialog(entry, 'Reviewing')}>
                      Review
                    </button>
                    <button type="button" className="table-link" onClick={() => onOpenCaseReviewDialog(entry, 'Approved')}>
                      Approve
                    </button>
                    <button type="button" className="table-link reject" onClick={() => onOpenCaseReviewDialog(entry, 'Rejected')}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="mini-row admin-mini-row">
                <div>
                  <strong>No loan requests yet</strong>
                  <span>New customer loan submissions will appear here.</span>
                </div>
              </div>
            )}
          </div>
        </article>

        <article className="glass-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Investment Requests</p>
              <h3>Portfolio advisory queue</h3>
            </div>
          </div>
          <div className="mini-table admin-case-list">
            {investmentCases.length > 0 ? (
              investmentCases.map((entry) => (
                <div key={entry.id} className="mini-row admin-mini-row">
                  <div>
                    <strong>{entry.subject}</strong>
                    <span>
                      {entry.owner} • {entry.amountRequested ?? 'Amount pending'} • {entry.assignee}
                    </span>
                    {entry.adminNote ? <small>{entry.adminNote}</small> : null}
                    <small>{entry.id}</small>
                  </div>
                  <div className="row-actions">
                    <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                    <button type="button" className="table-link" onClick={() => onOpenCaseReviewDialog(entry, 'Reviewing')}>
                      Review
                    </button>
                    <button type="button" className="table-link" onClick={() => onOpenCaseReviewDialog(entry, 'Approved')}>
                      Approve
                    </button>
                    <button type="button" className="table-link reject" onClick={() => onOpenCaseReviewDialog(entry, 'Rejected')}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="mini-row admin-mini-row">
                <div>
                  <strong>No investment requests yet</strong>
                  <span>New customer investment submissions will appear here.</span>
                </div>
              </div>
            )}
          </div>
        </article>

        <article className="glass-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">KYC Cases</p>
              <h3>Customer onboarding blockers</h3>
            </div>
          </div>
          <div className="mini-table admin-case-list">
            {kycCases.map((entry) => (
              <div key={entry.id} className="mini-row admin-mini-row">
                <div>
                  <strong>{entry.subject}</strong>
                  <span>
                    {entry.owner} • {entry.assignee}
                  </span>
                </div>
                <div className="row-actions">
                  <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                  <button type="button" className="table-link" onClick={() => onCaseAction(entry.id, 'Resolved')}>
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );

  const renderReportsPage = () => (
    <div className="admin-page-shell">
      <section className="glass-card admin-page-header-card">
        <div>
          <p className="eyebrow">Reports & Analytics</p>
          <h3>Reporting and announcement page</h3>
          <span>Export operational reports, review platform health, and publish updates without searching through other sections.</span>
        </div>
      </section>

      <section className="analytics-grid admin-panels admin-reports-grid admin-page-grid">
        <article className="glass-card report-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Report Center</p>
              <h3>Generated exports</h3>
            </div>
            <span className="badge positive">{adminExportHistory.length} ready</span>
          </div>
          <div className="mini-table">
            {adminExportHistory.map((item) => (
              <div key={item.id} className="mini-row admin-mini-row">
                <div>
                  <strong>{item.label}</strong>
                  <span>
                    {item.id} • {item.createdAt}
                  </span>
                </div>
                <span className="status-pill completed">{item.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card report-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Risk & Cases</p>
              <h3>Operational summary</h3>
            </div>
          </div>
          <div className="detail-stack">
            <div className="detail-row">
              <span>Open cases</span>
              <strong>{openCaseCount}</strong>
            </div>
            <div className="detail-row">
              <span>Risk signals</span>
              <strong>{riskEventCount}</strong>
            </div>
            <div className="detail-row">
              <span>Pending approvals</span>
              <strong>{pendingWithdrawalCount}</strong>
            </div>
          </div>
        </article>

        <article className="glass-card notifications-card admin-page-card admin-page-card-wide">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Notifications System</p>
              <h3>Announcements and alerts</h3>
            </div>
          </div>
          <div className="admin-form-grid admin-announcement-grid">
            <label className="input-shell admin-form-field">
              <span>Announcement title</span>
              <input value={announcementDraft.title} onChange={(event) => onAnnouncementDraftChange('title', event.target.value)} />
            </label>
            <label className="input-shell admin-form-field">
              <span>Audience or specific user</span>
              <input
                list="admin-notification-audience-list"
                value={announcementDraft.audience}
                onChange={(event) => onAnnouncementDraftChange('audience', event.target.value)}
                placeholder="All retail users or Example User"
              />
              <small>Search by customer name, email, account ID, or account number.</small>
            </label>
            <label className="input-shell admin-form-field">
              <span>Channel</span>
              <input value={announcementDraft.channel} onChange={(event) => onAnnouncementDraftChange('channel', event.target.value)} />
            </label>
            <button type="button" className="primary-button" onClick={onSendAnnouncement}>
              Queue Announcement
            </button>
          </div>
          <div className="mini-table">
            {adminNotificationRecords.map((item) => (
              <div key={`${item.title}-${item.audience}`} className="mini-row admin-mini-row">
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.audience} • {item.channel}
                  </span>
                </div>
                <span className="status-pill completed">{item.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );

  const renderFraudPage = () => (
    <div className="admin-page-shell">
      <section className="glass-card admin-page-header-card">
        <div>
          <p className="eyebrow">Fraud Monitoring</p>
          <h3>Dedicated risk operations page</h3>
          <span>Keep risk signals, escalation actions, and admin security logs together for faster investigations.</span>
        </div>
      </section>

      <section className="admin-page-grid admin-two-column-grid">
        <article className="glass-card monitoring-card admin-page-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Live Feed</p>
              <h3>Fraud and anomaly watch</h3>
            </div>
            <span className="badge negative">{riskEventCount} risk events</span>
          </div>
          <div className="feed-list">
            {adminLiveEvents.map((event, index) => (
              <div key={`${event}-${index}`} className="feed-item">
                <span className="pulse-dot" />
                <p>{event}</p>
              </div>
            ))}
          </div>
          <div className="fraud-meter">
            <div>
              <span>Automated fraud detection</span>
              <strong>92% confidence</strong>
            </div>
            <div className="goal-track">
              <div className="goal-fill" style={{ width: `${Math.min(96, Math.max(54, 60 + riskEventCount * 8))}%` }} />
            </div>
          </div>
        </article>

        <div className="admin-side-stack">
          <article className="glass-card admin-page-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Fraud Cases</p>
                <h3>Escalation queue</h3>
              </div>
            </div>
            <div className="mini-table admin-case-list">
              {fraudCases.map((entry) => (
                <div key={entry.id} className="mini-row admin-mini-row">
                  <div>
                    <strong>{entry.subject}</strong>
                    <span>
                      {entry.owner} • {entry.assignee}
                    </span>
                  </div>
                  <div className="row-actions">
                    <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                    <button type="button" className="table-link reject" onClick={() => onCaseAction(entry.id, 'Escalated')}>
                      Escalate
                    </button>
                    <button type="button" className="table-link" onClick={() => onCaseAction(entry.id, 'Resolved')}>
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card security-card admin-page-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Security Features</p>
                <h3>Role access and activity logs</h3>
              </div>
            </div>
            <div className="detail-stack">
              <div className="detail-row">
                <span>Role-based access</span>
                <strong>Super Admin / Analyst / Support</strong>
              </div>
              <div className="detail-row">
                <span>Admin sessions</span>
                <strong>18 active, 2 elevated</strong>
              </div>
            </div>
            <div className="feed-list security-log">
              {adminActivityRecords.map((entry, index) => (
                <div key={`${entry}-${index}`} className="feed-item">
                  <span className="pulse-dot" />
                  <p>{entry}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );

  const renderSettingsPage = () => (
    <div className="admin-page-shell">
      <section className="glass-card admin-page-header-card">
        <div>
          <p className="eyebrow">Admin Settings</p>
          <h3>Operational controls and support page</h3>
          <span>Manage system toggles, queue announcements, and resolve customer support issues from a focused admin settings workspace.</span>
        </div>
      </section>

      <section className="analytics-grid admin-panels admin-settings-grid admin-page-grid">
        <article className="glass-card settings-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">System Settings</p>
              <h3>Admin controls</h3>
            </div>
          </div>
          <div className="mini-table">
            {[
              ['alerts', 'Instant alerts'],
              ['biometricApproval', 'Biometric approvals'],
              ['maintenanceMode', 'Maintenance mode'],
              ['autoFreeze', 'Auto-freeze risk accounts'],
            ].map(([key, label]) => (
              <div key={key} className="mini-row admin-mini-row">
                <div>
                  <strong>{label}</strong>
                  <span>Toggle operational availability</span>
                </div>
                <button type="button" className={adminSettings[key] ? 'chip active' : 'chip'} onClick={() => onSettingToggle(key)}>
                  {adminSettings[key] ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card notifications-card admin-page-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Notifications System</p>
              <h3>Announcements and alerts</h3>
            </div>
          </div>
          <div className="admin-form-grid admin-announcement-grid">
            <label className="input-shell admin-form-field">
              <span>Announcement title</span>
              <input value={announcementDraft.title} onChange={(event) => onAnnouncementDraftChange('title', event.target.value)} />
            </label>
            <label className="input-shell admin-form-field">
              <span>Audience or specific user</span>
              <input
                list="admin-notification-audience-list"
                value={announcementDraft.audience}
                onChange={(event) => onAnnouncementDraftChange('audience', event.target.value)}
                placeholder="All retail users or Example User"
              />
              <small>Search by customer name, email, account ID, or account number.</small>
            </label>
            <label className="input-shell admin-form-field">
              <span>Channel</span>
              <input value={announcementDraft.channel} onChange={(event) => onAnnouncementDraftChange('channel', event.target.value)} />
            </label>
            <button type="button" className="primary-button" onClick={onSendAnnouncement}>
              Queue Announcement
            </button>
          </div>
        </article>

        <article className="glass-card settings-card admin-page-card admin-page-card-wide">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Support Cases</p>
              <h3>Customer issue queue</h3>
            </div>
          </div>
          <div className="mini-table">
            {supportCases.map((entry) => (
              <div key={entry.id} className="mini-row admin-mini-row">
                <div>
                  <strong>{entry.subject}</strong>
                  <span>
                    {entry.owner} • {entry.assignee}
                  </span>
                  {entry.message ? <small>{entry.message}</small> : null}
                  {entry.adminNote ? <small>{entry.adminNote}</small> : null}
                </div>
                <div className="row-actions">
                  <span className={`status-pill ${entry.status.toLowerCase()}`}>{entry.status}</span>
                  <button type="button" className="table-link" onClick={() => onOpenCaseReviewDialog(entry, 'Reviewing')}>
                    Review
                  </button>
                  <button type="button" className="table-link" onClick={() => onOpenCaseReviewDialog(entry, 'Resolved')}>
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );

  const sectionContent = {
    Overview: renderOverviewPage(),
    'Users Management': renderUsersPage(),
    Transactions: renderTransactionsPage(),
    'Withdrawal Requests': renderWithdrawalsPage(),
    'Card Requests': renderCardsPage(),
    'Loans Management': renderLoansPage(),
    'Reports & Analytics': renderReportsPage(),
    'Fraud Monitoring': renderFraudPage(),
    Settings: renderSettingsPage(),
  };

  return (
    <div className="dashboard-grid admin-layout">
      <aside className="sidebar glass-card">
        <div className="brand-lockup">
          <div className="brand-mark">ADM</div>
          <div>
            <h2>Control Panel</h2>
            <p>Operational oversight</p>
          </div>
        </div>

        <nav className="nav-list">
          {adminNav.map((item) => (
            <button
              key={item}
              type="button"
              className={adminSection === item ? 'nav-item active' : 'nav-item'}
              onClick={() => onSectionChange(item)}
            >
              <span>{item}</span>
              {item === 'Transactions' && pendingTransferApprovals.length > 0 ? <small>{pendingTransferApprovals.length} Pending</small> : null}
              {item === 'Fraud Monitoring' && <small>Alert</small>}
            </button>
          ))}
        </nav>

        <div className="sidebar-promo glass-inset">
          <p>Role Access</p>
          <strong>{adminUser.segment}</strong>
          <span>Scoped controls, activity logs, and approvals workflow enabled.</span>
        </div>

        <div className="sidebar-promo glass-inset sidebar-promo-alert">
          <p>Pending Transfers</p>
          <strong>{pendingTransferApprovals.length}</strong>
          <span>
            {pendingTransferApprovals.length > 0
              ? 'Transfers are waiting for admin review and approval.'
              : 'No transfers are currently waiting for approval.'}
          </span>
          <button type="button" className="secondary-button compact-button sidebar-promo-action" onClick={() => onSectionChange('Transactions')}>
            Open Transactions
          </button>
        </div>
      </aside>

      <main className="content-area">
        <section className="topbar glass-card">
          <div>
            <p className="eyebrow">{activeSectionMeta.eyebrow}</p>
            <h2>{activeSectionMeta.title}</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="secondary-button compact-button" onClick={onOpenAnnouncementComposer}>
              Send Announcement
            </button>
            <button type="button" className="primary-button compact-button" onClick={onExportReports}>
              Export Reports
            </button>
          </div>
        </section>

        <section className="glass-card admin-direction-card">
          <div>
            <p className="eyebrow">Dashboard Access</p>
            <h3>Switch between user and admin views</h3>
          </div>
          <div className="mode-toggle admin-direction-toggle" role="tablist" aria-label="Dashboard access switcher">
            <button type="button" className={currentMode === 'user' ? 'active' : ''} onClick={onSwitchToUser}>
              User Dashboard
            </button>
            <button type="button" className={currentMode === 'admin' ? 'active' : ''} onClick={onSwitchToAdmin}>
              Admin Dashboard
            </button>
          </div>
        </section>

        <section className="glass-card admin-alert" aria-live="polite">
          <strong>Live Admin Update</strong>
          <span>{adminNotice}</span>
        </section>

        <datalist id="admin-notification-audience-list">
          {notificationAudienceOptions.map((entry) => (
            <option key={entry} value={entry} />
          ))}
        </datalist>

        {sectionContent[adminSection] ?? sectionContent.Overview}

        {announcementComposerOpen ? (
          <div className="admin-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Compose announcement">
            <div className="admin-dialog glass-card admin-dialog-wide">
              <p className="eyebrow">Announcement Composer</p>
              <h3>Write and target the announcement</h3>
              <p>Enter the message details here before sending it to all retail users or a selected customer.</p>
              <div className="admin-form-grid admin-announcement-grid admin-dialog-form-grid">
                <label className="input-shell admin-form-field">
                  <span>Announcement title</span>
                  <input value={announcementDraft.title} onChange={(event) => onAnnouncementDraftChange('title', event.target.value)} />
                </label>
                <label className="input-shell admin-form-field">
                  <span>Audience or specific user</span>
                  <input
                    list="admin-notification-audience-list"
                    value={announcementDraft.audience}
                    onChange={(event) => onAnnouncementDraftChange('audience', event.target.value)}
                    placeholder="All retail users or Example User"
                  />
                  <small>Search by customer name, email, account ID, or account number.</small>
                </label>
                <label className="input-shell admin-form-field">
                  <span>Channel</span>
                  <input value={announcementDraft.channel} onChange={(event) => onAnnouncementDraftChange('channel', event.target.value)} />
                </label>
              </div>
              <div className="admin-dialog-recipient-panel">
                <div className="section-head compact">
                  <div>
                    <p className="eyebrow">Recipients</p>
                    <h4>Select a customer or send to everyone</h4>
                  </div>
                </div>
                <label className="input-shell admin-form-field">
                  <span>Filter users</span>
                  <input
                    value={announcementRecipientFilter}
                    onChange={(event) => setAnnouncementRecipientFilter(event.target.value)}
                    placeholder="Search by name, email, account ID, or account number"
                  />
                </label>
                <div className="admin-recipient-grid">
                  <button
                    type="button"
                    className={announcementDraft.audience === 'All retail users' ? 'admin-recipient-card is-selected' : 'admin-recipient-card'}
                    onClick={() => onAnnouncementDraftChange('audience', 'All retail users')}
                  >
                    <strong>All retail users</strong>
                    <span>Broadcast this announcement to every retail account.</span>
                  </button>
                  {filteredNotificationRecipients.map((entry) => (
                    <button
                      key={entry.key}
                      type="button"
                      className={entry.selected ? 'admin-recipient-card is-selected' : 'admin-recipient-card'}
                      onClick={() => onAnnouncementDraftChange('audience', entry.audienceValue)}
                    >
                      <strong>{entry.name}</strong>
                      <span>{entry.email}</span>
                      <small>{entry.accountId}{entry.accountNumber ? ` • ${entry.accountNumber}` : ''}</small>
                    </button>
                  ))}
                </div>
                {!filteredNotificationRecipients.length ? <p className="admin-recipient-empty">No matching users found.</p> : null}
              </div>
              <div className="row-actions admin-dialog-actions">
                <button type="button" className="secondary-button" onClick={onCloseAnnouncementComposer}>
                  Cancel
                </button>
                <button type="button" className="primary-button" onClick={onSendAnnouncement}>
                  Queue Announcement
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {adminDialog.open && (
          <div className="admin-dialog-backdrop" role="dialog" aria-modal="true" aria-label={adminDialog.title}>
            <div className="admin-dialog glass-card">
              <p className="eyebrow">Confirmation</p>
              <h3>{adminDialog.title}</h3>
              <p>{adminDialog.message}</p>
              {adminDialog.customerMessage ? (
                <div className="admin-dialog-message-block">
                  <span>Customer message</span>
                  <p>{adminDialog.customerMessage}</p>
                </div>
              ) : null}
              {adminDialog.requiresNote ? (
                <label className="admin-dialog-note-field">
                  <span>Reviewer note</span>
                  <textarea
                    rows="4"
                    value={adminDialog.note}
                    onChange={(event) => onAdminDialogNoteChange(event.target.value)}
                    placeholder="Add next steps or the reason for this decision."
                  />
                </label>
              ) : null}
              <div className="row-actions admin-dialog-actions">
                <button type="button" className="secondary-button" onClick={onCloseDialog}>
                  Cancel
                </button>
                <button type="button" className="primary-button" onClick={onConfirmDialog}>
                  {adminDialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, meta }) {
  return (
    <article className="glass-card stat-card">
      <p className="eyebrow">{title}</p>
      <h3>{value}</h3>
      <span>{meta}</span>
    </article>
  );
}

function TrendChart() {
  const pointsA = incomeTrend.map((value, index) => `${index * 36},${130 - value}`).join(' ');
  const pointsB = expenseTrend.map((value, index) => `${index * 36},${130 - value}`).join(' ');

  return (
    <div className="trend-chart">
      <svg viewBox="0 0 396 150" preserveAspectRatio="none" aria-label="Income and expense trend chart">
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38d0c1" />
            <stop offset="100%" stopColor="#7a7cff" />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9a7cff" />
            <stop offset="100%" stopColor="#3bb2ff" />
          </linearGradient>
        </defs>
        <g className="grid-lines">
          {[20, 50, 80, 110].map((y) => (
            <line key={y} x1="0" x2="396" y1={y} y2={y} />
          ))}
        </g>
        <polyline fill="none" stroke="url(#incomeGradient)" strokeWidth="5" points={pointsA} />
        <polyline fill="none" stroke="url(#expenseGradient)" strokeWidth="5" points={pointsB} />
      </svg>
      <div className="chart-legend">
        <span>
          <i className="legend-income" /> Income
        </span>
        <span>
          <i className="legend-expense" /> Expense
        </span>
      </div>
    </div>
  );
}

export default App;