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

const col = () => collection(db, 'doacoes');

export async function criarDoacao({ userId, nomeUsuario, tipo, descricao, detalhe }) {
  await addDoc(col(), {
    userId,
    nomeUsuario: nomeUsuario || '',
    tipo,
    descricao,
    detalhe: detalhe || '',
    status: 'pendente',
    createdAt: new Date(),
    historico: [{ status: 'pendente', em: new Date().toISOString(), nota: 'Registada' }],
  });
}

export async function listarMinhasDoacoes(userId) {
  const q = query(col(), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listarDoacoesAdmin(filtroTipo) {
  let q;
  if (filtroTipo && filtroTipo !== 'todos') {
    q = query(col(), where('tipo', '==', filtroTipo), orderBy('createdAt', 'desc'));
  } else {
    q = query(col(), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function atualizarStatusDoacao(id, novoStatus, notaAdmin, emailAdmin) {
  const ref = doc(db, 'doacoes', id);
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
