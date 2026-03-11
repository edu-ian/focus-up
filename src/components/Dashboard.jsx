import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, LinearProgress, Stack } from '@mui/material';
import { PeopleAlt, Speed, VerifiedUser, Logout, Pets, Stars, BarChart, BookmarkBorder } from '@mui/icons-material';
import logo from '../assets/focus.png';

// Cores mais saturadas para combinar com a logo e o design "spacious"
const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#a1cfff', '#cbd5e1'];

export default function Dashboard({ onLogout }) {
  const [metrics, setMetrics] = useState({ usuarios_ativos: 0, total_pomodoros_app: 0, leads_instagram: 0, leads_linkedin: 0 });
  const [petData, setPetData] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect permanece o mesmo para buscar os dados...
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Tentar buscar as métricas
        const metricsRef = doc(db, "dashboard", "metrics");
        let metricsSnap = await getDoc(metricsRef);

        // 2. Se as métricas NÃO existirem, rodamos o seed automático
        if (!metricsSnap.exists()) {
          console.log("⚠️ Banco vazio detectado! Iniciando auto-seed...");
          await runAutoSeed();
          // Recarregar o snapshot após o seed
          metricsSnap = await getDoc(metricsRef);
        }
        
        setMetrics(metricsSnap.data());

        // 3. Buscar os usuários (que agora certamente existem)
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        
        const usersList = userSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Mantendo os dados de RPG aleatórios para a apresentação
          hunger: Math.floor(Math.random() * 100), 
          energy: Math.floor(Math.random() * 100), 
          evolution: Math.random() > 0.5 ? 'Adulto' : 'Filhote',
          lastCategory: Math.random() > 0.5 ? 'Estudos (TCC)' : 'Trabalho'
        }));
        
        setPetData(usersList);
      } catch (error) {
        console.error("❌ Erro fatal ao sincronizar Firebase:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Função Auxiliar para criar os dados caso o Firebase esteja limpo
  async function runAutoSeed() {
    try {
      const { setDoc, addDoc, collection, doc } = await import('firebase/firestore');
      
      // Criar métricas globais
      await setDoc(doc(db, "dashboard", "metrics"), {
        usuarios_ativos: 154,
        total_pomodoros_app: 8902,
        leads_instagram: 1150,
        leads_linkedin: 850
      });

      // Criar usuários iniciais
      const seedUsers = [
        { nome: "Eduardo", origem: "LinkedIn", nivel_pet: 15, xp_pet: 8500 },
        { nome: "Ana Paula", origem: "Instagram", nivel_pet: 8, xp_pet: 2300 },
        { nome: "Carlos Lima", origem: "WhatsApp", nivel_pet: 3, xp_pet: 450 }
      ];

      for (const u of seedUsers) {
        await addDoc(collection(db, "users"), u);
      }
      console.log("✅ Auto-seed concluído com sucesso!");
    } catch (e) {
      console.error("Falha no auto-seed:", e);
    }
  }
  const leadData = [
    { name: 'Instagram', value: metrics.leads_instagram || 1150 },
    { name: 'LinkedIn', value: metrics.leads_linkedin || 850 },
    { name: 'WhatsApp', value: 350 },
    { name: 'Outros', value: 210 },
  ];

  const accessData = [
    { name: 'Seg', acessos: 1120 }, { name: 'Ter', acessos: 2250 },
    { name: 'Qua', acessos: 1680 }, { name: 'Qui', acessos: 3320 },
    { name: 'Sex', acessos: 4110 }, { name: 'Sáb', acessos: 2990 },
    { name: 'Dom', acessos: 1450 },
  ];

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h5" color="primary" sx={{ mt: 3, fontWeight: 600 }}>
          Sincronizando com Focus Up Cloud...
        </Typography>
      </Box>
    );
  }

  return (
    // Aumentado maxWidth para 1600 para dar respiro em telas grandes
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1600, margin: '0 auto', bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* Navbar - Logo Aumentada */}
      <Card sx={{ mb: 6, borderRadius: '100px', p: 3, border: 'none', shadow: 'none', bgcolor: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={4}>
            {/* Logo salta de 48 para 100px */}
            <Avatar src={logo} alt="Focus Up Logo" sx={{ width: 100, height: 100, bgcolor: 'transparent', borderRadius: 0 }} />
            <Stack>
              <Typography variant="h3" fontWeight="900" color="primary">Focus Up</Typography>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Painel do Administrador Geral</Typography>
            </Stack>
          </Box>
          <Button variant="outlined" color="error" size="large" startIcon={<Logout />} onClick={onLogout} sx={{ borderRadius: '50px', px: 5, py: 1.5 }}>
            Sair do Painel
          </Button>
        </Box>
      </Card>

      {/* Cards de Métricas - Aumentados e Spaced */}
      <Grid container spacing={5} sx={{ mb: 6 }}>
        {[
          { title: "Total de Usuários", value: metrics.usuarios_ativos + petData.length, icon: <PeopleAlt fontSize="inherit" color="primary" /> },
          { title: "Usuários Simultâneos", value: "42", icon: <Speed fontSize="inherit" sx={{ color: '#10b981' }} /> },
          { title: "Sessões de Foco", value: metrics.total_pomodoros_app, icon: <VerifiedUser fontSize="inherit" sx={{ color: '#6366f1' }} /> }
        ].map((card, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.03)', boxShadow: '0 12px 48px rgba(0,0,0,0.1)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 4, p: 5 }}>
                <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 6, fontSize: '3rem', display: 'flex' }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>{card.title}</Typography>
                  {/* Número saltou de h4 para h2 */}
                  <Typography variant="h2" fontWeight="900" color="text.primary" sx={{ tracking: '-1px' }}>{card.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Gráficos - Layout "Spacious" (XS=12 em ambos, altura 500px) */}
      <Grid container spacing={5} sx={{ mb: 6 }}>
        
        {/* Gráfico de Linha - Ocupa largura total */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="800">Tendência de Acessos Semanais</Typography>
                <Chip icon={<BarChart />} label="Dados em Tempo Real" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
              </Box>
              {/* Altura saltou de 300 para 500px */}
              <Box sx={{ height: 500, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accessData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 16}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 16}} />
                    <Tooltip cursor={{ stroke: '#bfdbfe', strokeWidth: 2 }} contentStyle={{ borderRadius: 20, border: 'none', p: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 30, fontSize: 16, fontWeight: 600 }} />
                    {/* Linha mais grossa e suave */}
                    <Line type="monotone" name="Acessos Totais" dataKey="acessos" stroke="#2563eb" strokeWidth={6} dot={{r: 6, strokeWidth: 3, fill: 'white'}} activeDot={{r: 10, fill: '#2563eb', strokeWidth: 0}} isAnimationActive={true} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Pizza - Ocupa largura total (centralizado) */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 5 }}>
              <Typography variant="h4" fontWeight="800" gutterBottom>Distribuição de Captação (Leads)</Typography>
              {/* Altura saltou de 300 para 500px, centralizado */}
              <Box sx={{ height: 500, mt: 3, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    {/* Raio maior para gráficos maiores */}
                    <Pie data={leadData} cx="50%" cy="50%" innerRadius={120} outerRadius={180} paddingAngle={8} dataKey="value" isAnimationActive={true} animationDuration={1500} labelLine={false} label={({name, value}) => `${name}: ${value}`}>
                      {leadData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={3} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 20, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 30, fontSize: 16, fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Tabela de Pets Gamificada (RPG Status) */}
      <Card sx={{ borderRadius: 8 }}>
        <CardContent sx={{ p: 5 }}>
          <Typography variant="h4" fontWeight="800" mb={5}>Monitoramento RPG: Pets Evolutivos</Typography>
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Usuário / ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Nível & XP</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>RPG Stats (Fome/Energia)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Estágio</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Última Categoria de Foco</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {petData.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: COLORS[Math.floor(Math.random() * COLORS.length)], fontWeight: 'bold' }}>
                          {/* {row.nome.substring(0,2).toUpperCase()} */}
                        </Avatar>
                        <Stack>
                          <Typography variant="h6" fontWeight={700}>{row.nome}</Typography>
                          <Typography variant="body2" color="text.secondary">{row.origem}</Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: '#eff6ff', color: '#2563eb', border: '2px solid #bfdbfe' }}>
                          <Stars fontSize="small" />
                        </Avatar>
                        <Stack>
                          <Typography variant="h6" fontWeight={800} color="primary">Lvl {row.nivel_pet || 1}</Typography>
                          <Typography variant="body2" color="text.secondary">{row.xp_pet || 0} / {row.xp_para_proximo_nivel || 10000} XP</Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack gap={1} sx={{ maxWidth: 200, margin: '0 auto' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>Fome: {row.hunger}%</Typography>
                          <LinearProgress variant="determinate" value={row.hunger} color={row.hunger < 30 ? 'error' : 'primary'} sx={{ height: 8, borderRadius: 5, bgcolor: '#e2e8f0' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>Energia: {row.energy}%</Typography>
                          <LinearProgress variant="determinate" value={row.energy} color={row.energy < 20 ? 'warning' : 'success'} sx={{ height: 8, borderRadius: 5, bgcolor: '#e2e8f0' }} />
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip icon={<Pets />} label={row.evolution} variant="filled" color={row.evolution === 'Adulto' ? 'secondary' : 'default'} sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="left">
                      <Stack direction="row" alignItems="center" gap={1}>
                        <BookmarkBorder color="action" />
                        <Typography variant="body1" fontWeight={500} color="text.primary">{row.lastCategory}</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

    </Box>
  );
}