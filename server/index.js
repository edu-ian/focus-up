import 'dotenv/config';
import { readFileSync } from 'node:fs';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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
    'Defina FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_PATH para o servidor acessar o Firestore.'
  );
}

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

function createApp() {
  initFirebaseAdmin();
  const db = admin.firestore();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.post('/api/login', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
      const snap = await db
        .collection('admin_users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snap.empty) {
        return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
      }

      const doc = snap.docs[0];
      const data = doc.data();
      const hash = data.passwordHash;
      if (!hash || typeof hash !== 'string') {
        return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
      }

      const ok = await bcrypt.compare(password, hash);
      if (!ok) {
        return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
      }

      const token = jwt.sign(
        { sub: doc.id, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        token,
        user: {
          id: doc.id,
          email,
        },
      });
    } catch (err) {
      console.error('[login]', err);
      return res.status(500).json({ message: 'Erro ao processar o login.' });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  return app;
}

if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error('Defina JWT_SECRET no .env (mínimo 16 caracteres).');
  process.exit(1);
}

const app = createApp();
app.listen(PORT, () => {
  console.log(`API em http://localhost:${PORT}`);
});
