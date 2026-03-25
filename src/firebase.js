// CONFIGURAÇÃO FIREBASE: Inicialização e credenciais do BaaS
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // CLOUD FIRESTORE: Importação do banco de dados NoSQL

// VARIÁVEIS DE AMBIENTE: Segurança e chaves de API do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyBHGvV9mj85dLc4GJaSillJfnaY8GZ_Hq4",
  authDomain: "focus-up-2ecae.firebaseapp.com",
  projectId: "focus-up-2ecae",
  storageBucket:  "focus-up-2ecae.firebasestorage.app",
  messagingSenderId: "316159837898",
  appId: "1:316159837898:web:254ed158fa2b18a8f89633"
};

// INSTÂNCIA FIREBASE: Conexão com os serviços da nuvem
const app = initializeApp(firebaseConfig);

// SERVIÇO DE AUTENTICAÇÃO: Exportação do módulo de login/registro
export const auth = getAuth(app);

// OAUTH PROVIDER: Exportação do provedor de login social do Google
export const googleProvider = new GoogleAuthProvider();

// DATABASE INSTANCE: Exportação da conexão com o banco de dados para o Dashboard
export const db = getFirestore(app);