const FIREBASE_ENV_MAP = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

const DEV_FALLBACK = {
  apiKey: 'AIzaSyBHGvV9mj85dLc4GJaSillJfnaY8GZ_Hq4',
  authDomain: 'focus-up-2ecae.firebaseapp.com',
  projectId: 'focus-up-2ecae',
  storageBucket: 'focus-up-2ecae.firebasestorage.app',
  messagingSenderId: '316159837898',
  appId: '1:316159837898:web:254ed158fa2b18a8f89633',
};

export function getFirebaseConfig() {
  const config = {};
  for (const [key, envName] of Object.entries(FIREBASE_ENV_MAP)) {
    const v = import.meta.env[envName];
    config[key] = v || DEV_FALLBACK[key];
  }
  const hasEnv = !!import.meta.env.VITE_FIREBASE_API_KEY;
  if (import.meta.env.PROD && !hasEnv) {
    console.warn(
      '[Focus Up] Build de produção sem VITE_FIREBASE_* no ambiente — a usar valores de desenvolvimento embebidos. Defina .env antes do deploy público.'
    );
  }
  return config;
}

export function getAdminEmail() {
  return import.meta.env.VITE_ADMIN_EMAIL || 'admin@focusup.com';
}
