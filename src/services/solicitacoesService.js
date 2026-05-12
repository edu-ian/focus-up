import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  where,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase';

const col = () => collection(db, 'solicitacoes');

export async function criarSolicitacao({ userId, nomeUsuario, titulo, descricao }) {
  await addDoc(col(), {
    userId,
    nomeUsuario: nomeUsuario || '',
    titulo,
    descricao,
    status: 'pendente',
    createdAt: new Date(),
    historico: [{ status: 'pendente', em: new Date().toISOString(), nota: 'Criada' }],
  });
}

export async function listarMinhasSolicitacoes(userId) {
  const q = query(col(), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listarTodasSolicitacoesAdmin() {
  const q = query(col(), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function atualizarStatusSolicitacao(id, novoStatus, notaAdmin, emailAdmin) {
  const ref = doc(db, 'solicitacoes', id);
  await updateDoc(ref, {
    status: novoStatus,
    historico: arrayUnion({
      status: novoStatus,
      em: new Date().toISOString(),
      por: emailAdmin || 'admin',
      nota: notaAdmin || '',
    }),
  });
}
