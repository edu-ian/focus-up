import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, LinearProgress, Stack } from '@mui/material';
import { PeopleAlt, VerifiedUser, Logout, Pets, Stars, BarChart, BookmarkBorder } from '@mui/icons-material';
import logo from '../assets/focus.png';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#a1cfff', '#cbd5e1'];

export default function Dashboard({ onLogout }) {
  const [metrics, setMetrics] = useState({ total_pomodoros_app: 0 });
  const [petData, setPetData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Métrica Global
        const metricsRef = doc(db, "dashboard", "metrics");
        const metricsSnap = await getDoc(metricsRef);
        if (metricsSnap.exists()) {
          setMetrics(metricsSnap.data());
        } else {
          await setDoc(metricsRef, { total_pomodoros_app: 0 });
        }
        
        // 2. Utilizadores Reais
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setPetData(usersList);
      } catch (error) {
        console.error("Erro no Admin:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Gráfico de Pizza Dinâmico
  const evolutionCounts = petData.reduce((acc, user) => {
    const stage = user.evolution || 'Ovo';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});
  
  const dynamicPieData = Object.keys(evolutionCounts).map(key => ({ name: key, value: evolutionCounts[key] }));

  // Gráfico de Acessos Mock
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
        <Typography variant="h5" color="primary" sx={{ mt: 3, fontWeight: 600 }}>A sincronizar dados reais...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1600, margin: '0 auto', bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* Navbar Bonita */}
      <Card sx={{ mb: 6, borderRadius: '100px', p: 3, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={4}>
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

      {/* Cards de Métricas Reais com Hover Effects */}
      <Grid container spacing={5} sx={{ mb: 6 }}>
        {[
          { title: "Total de Utilizadores Registados", value: petData.length, icon: <PeopleAlt fontSize="inherit" color="primary" /> },
          { title: "Sessões de Foco Globais", value: metrics.total_pomodoros_app || 0, icon: <VerifiedUser fontSize="inherit" sx={{ color: '#6366f1' }} /> },
          { title: "Média de Nível dos Pets", value: petData.length > 0 ? Math.round(petData.reduce((acc, user) => acc + (user.nivel_pet || 1), 0) / petData.length) : 0, icon: <Stars fontSize="inherit" sx={{ color: '#f59e0b' }} /> }
        ].map((card, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.03)', boxShadow: '0 12px 48px rgba(0,0,0,0.1)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 4, p: 5 }}>
                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 6, fontSize: '3rem', display: 'flex' }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>{card.title}</Typography>
                  <Typography variant="h2" fontWeight="900" color="text.primary">{card.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Gráficos Reais e Estilizados */}
      <Grid container spacing={5} sx={{ mb: 6 }}>
        {/* Gráfico de Acessos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 6, height: '100%' }}>
            <CardContent sx={{ p: 5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="800">Tendência de Acessos</Typography>
                <Chip icon={<BarChart />} label="Mock" color="default" variant="outlined" sx={{ fontWeight: 600 }} />
              </Box>
              <Box sx={{ height: 400, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accessData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
                    <Tooltip cursor={{ stroke: '#bfdbfe', strokeWidth: 2 }} contentStyle={{ borderRadius: 20, border: 'none', p: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" name="Acessos" dataKey="acessos" stroke="#2563eb" strokeWidth={5} dot={{r: 5, fill: 'white'}} activeDot={{r: 8, fill: '#2563eb'}} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Pizza Real */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 6, height: '100%' }}>
            <CardContent sx={{ p: 5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="800">Estágios da Comunidade</Typography>
                <Chip icon={<Pets />} label="Dados Reais" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
              </Box>
              <Box sx={{ height: 400, mt: 3, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dynamicPieData} cx="50%" cy="50%" innerRadius={90} outerRadius={140} paddingAngle={5} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                      {dynamicPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 20, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Pets Estilizada */}
      <Card sx={{ borderRadius: 8 }}>
        <CardContent sx={{ p: 5 }}>
          <Typography variant="h4" fontWeight="800" mb={5}>Monitoramento dos Utilizadores</Typography>
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Utilizador</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Nível & XP</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Status do Pet</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Estágio</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 16 }}>Última Atividade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {petData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{py: 5}}>Nenhum utilizador registado ainda.</TableCell></TableRow>
                ) : (
                  petData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: COLORS[Math.floor(Math.random() * COLORS.length)] }}>
                            {row.nome ? row.nome.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                          <Typography variant="h6" fontWeight={700}>{row.nome || 'Sem Nome'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: '#eff6ff', color: '#2563eb' }}>
                            <Stars fontSize="small" />
                          </Avatar>
                          <Stack>
                            <Typography variant="h6" fontWeight={800} color="primary">Lvl {row.nivel_pet || 1}</Typography>
                            <Typography variant="body2" color="text.secondary">{row.xp_pet || 0} XP</Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack gap={1} sx={{ maxWidth: 200, margin: '0 auto' }}>
                          <Box>
                            <Typography variant="caption" fontWeight={600}>Fome: {row.hunger || 0}%</Typography>
                            <LinearProgress variant="determinate" value={row.hunger || 0} color={row.hunger < 30 ? 'error' : 'primary'} sx={{ height: 8, borderRadius: 5 }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" fontWeight={600}>Energia: {row.energy || 0}%</Typography>
                            <LinearProgress variant="determinate" value={row.energy || 0} color={row.energy < 20 ? 'warning' : 'success'} sx={{ height: 8, borderRadius: 5 }} />
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip icon={<Pets />} label={row.evolution || 'Ovo'} color="secondary" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="left">
                        <Stack direction="row" alignItems="center" gap={1}>
                          <BookmarkBorder color="action" />
                          <Typography variant="body1" fontWeight={500}>{row.lastCategory || 'Foco Geral'}</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}