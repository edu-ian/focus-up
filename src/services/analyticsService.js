import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function logDailyAccess() {
  const key = dateKey(new Date());
  const ref = doc(db, 'analytics_daily', key);
  await setDoc(ref, { accessos: increment(1), updatedAt: new Date() }, { merge: true });
}

export async function fetchLastNDaysAccess(n = 7) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const snap = await getDoc(doc(db, 'analytics_daily', key));
    const acessos = snap.exists() ? Number(snap.data().accessos || 0) : 0;
    out.push({ name: dias[d.getDay()], acessos });
  }
  return out;
}
