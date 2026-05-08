import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sgMail from '@sendgrid/mail';

const app = express();
const port = Number(process.env.PORT ?? 8787);
const host = '0.0.0.0';
const dataDir = path.resolve(process.cwd(), 'server', 'data');
const accountsFile = path.join(dataDir, 'accounts.json');
const adminWorkspaceFile = path.join(dataDir, 'admin-workspace.json');
const distDir = path.resolve(process.cwd(), 'dist');
const eventClients = new Set();

// ...existing code...

function getSendGridConfig() {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || 'no-reply@apex.bank';
  if (!apiKey) return null;
  return { apiKey, from };
}

function getSendGridClient() {
  const config = getSendGridConfig();
  if (!config) return null;
  sgMail.setApiKey(config.apiKey);
  return { sgMail, from: config.from };
}

async function sendWelcomeEmail({ name, email, accountNumber }) {
  const mailer = getSendGridClient();
  if (!mailer) {
    return {
      ok: false,
      configured: false,
      message: 'SendGrid is not configured on the server.',
    };
  }
  const subject = 'Welcome to Apex Bank';
  const text = `Hello ${name},\n\nYour Apex Bank account has been created successfully.\nAccount number: ${accountNumber}\nRouting number: 031100089\n\nYour account may require verification before certain incoming transfers can be released.\nIf you need help, contact customer support.\n\nApex Bank`;
  const html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;"><h2 style="margin-bottom: 12px;">Welcome to Apex Bank</h2><p>Hello ${name},</p><p>Your Apex Bank account has been created successfully.</p><p><strong>Account number:</strong> ${accountNumber}<br /><strong>Routing number:</strong> 031100089</p><p>Your account may require verification before certain incoming transfers can be released.</p><p>If you need help, contact customer support.</p><p style="margin-top: 24px;">Apex Bank</p></div>`;
  await mailer.sgMail.send({
    to: email,
    from: mailer.from,
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

// ...existing code...
