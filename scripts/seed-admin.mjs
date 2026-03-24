/**
 * Cria ou atualiza um usuário admin no Firestore com senha hasheada (bcrypt).
 *
 * Uso:
 *   node scripts/seed-admin.mjs seu@email.com suaSenhaSegura
 *
 * Requer as mesmas variáveis de credencial do Firebase que o servidor (FIREBASE_SERVICE_ACCOUNT_JSON ou arquivo).
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import bcrypt from 'bcrypt';
import admin from 'firebase-admin';

function initFirebaseAdmin() {
  if (admin.apps.length > 0) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const path =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (json) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(json)),
    });
    return;
  }
  if (path) {
    const serviceAccount = JSON.parse(readFileSync(path, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return;
  }
  throw new Error(
    'Defina FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_PATH.'
  );
}

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

const [, , emailArg, passwordArg] = process.argv;
const email = normalizeEmail(emailArg);
const password = passwordArg;

if (!email || !password) {
  console.error('Uso: node scripts/seed-admin.mjs <email> <senha>');
  process.exit(1);
}

const SALT_ROUNDS = 10;

async function main() {
  initFirebaseAdmin();
  const db = admin.firestore();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const existing = await db
    .collection('admin_users')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (existing.empty) {
    await db.collection('admin_users').add({
      email,
      passwordHash,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Admin criado:', email);
  } else {
    const ref = existing.docs[0].ref;
    await ref.update({
      passwordHash,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Senha do admin atualizada:', email);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
