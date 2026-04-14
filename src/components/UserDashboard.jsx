import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, LinearProgress, Stack, CircularProgress } from '@mui/material';
import { Logout, Pets, Stars } from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import PomodoroTimer from './PomodoroTimer';

export default function UserDashboard({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        // Se o utilizador logou mas não tem documento no Firestore, podemos criar um estado inicial por defeito
        setUserData({
          nome: user.displayName || user.email.split('@')[0],
          nivel_pet: 1,
          xp_pet: 0,
          hunger: 100,
          energy: 100,
          evolution: 'Ovo'
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do utilizador:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Header do Utilizador */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Stack direction="row" alignItems="center" gap={2}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            {userData?.nome?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="800">Olá, {userData?.nome}!</Typography>
            <Typography variant="subtitle1" color="text.secondary">Pronto para focar hoje?</Typography>
          </Box>
        </Stack>
        <Button variant="outlined" color="error" startIcon={<Logout />} onClick={onLogout}>
          Sair
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: O Cronómetro */}
        <Grid item xs={12} md={7}>
          <PomodoroTimer userId={user.uid} onSessionComplete={fetchUserData} />
        </Grid>

        {/* Lado Direito: Status do Pet Gamificado */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 6, height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                <Pets color="primary" /> Seu Pet Virtual
              </Typography>
              
              <Box textAlign="center" mb={4}>
                 {/* Aqui futuramente pode entrar uma imagem real do Pet baseada na evolução */}
                <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#f1f5f9', color: '#94a3b8' }}>
                  <Pets sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">Estágio: {userData?.evolution}</Typography>
                
                <Stack direction="row" justifyContent="center" alignItems="center" gap={1} mt={1}>
                  <Stars color="warning" />
                  <Typography variant="body1" fontWeight="600">Nível {userData?.nivel_pet} ({userData?.xp_pet} XP)</Typography>
                </Stack>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">Energia</Typography>
                    <Typography variant="body2" fontWeight="bold">{userData?.energy}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={userData?.energy || 0} color={userData?.energy < 20 ? 'error' : 'success'} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
                
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">Fome (Saciedade)</Typography>
                    <Typography variant="body2" fontWeight="bold">{userData?.hunger}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={userData?.hunger || 0} color={userData?.hunger < 30 ? 'warning' : 'primary'} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
              </Stack>
              
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}