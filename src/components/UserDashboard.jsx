import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, LinearProgress, Stack, CircularProgress, Chip } from '@mui/material';
import { Logout, Pets, Stars, Storefront, AttachMoney } from '@mui/icons-material';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import PomodoroTimer from './PomodoroTimer';
import Shop from './Shop'; // Importamos a loja

export default function UserDashboard({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ESTADO DA TELA: Controla se vemos o Dashboard ou a Loja
  const [view, setView] = useState('dashboard'); 

  const fetchUserData = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const agora = new Date();

      if (userSnap.exists()) {
        const data = userSnap.data();
        
        // LÓGICA DE DECAIMENTO
        const ultimaAtualizacao = data.lastUpdate ? data.lastUpdate.toDate() : agora;
        const horasPassadas = Math.floor((agora - ultimaAtualizacao) / (1000 * 60 * 60));
        let dadosAtualizados = { ...data };

        if (horasPassadas > 0) {
          const perda = Math.round(horasPassadas * 2.5);
          dadosAtualizados.hunger = Math.max(0, (data.hunger || 100) - perda);
          dadosAtualizados.energy = Math.max(0, (data.energy || 100) - perda);
          dadosAtualizados.lastUpdate = agora;

          await updateDoc(userRef, {
            hunger: dadosAtualizados.hunger,
            energy: dadosAtualizados.energy,
            lastUpdate: agora
          });
        }
        setUserData(dadosAtualizados);
      } else {
        const novosDados = {
          nome: user.displayName || user.email.split('@')[0],
          nivel_pet: 1,
          xp_pet: 0,
          hunger: 100,
          energy: 100,
          moedas: 0, // Inicia com 0 moedas
          evolution: 'Ovo',
          lastUpdate: agora
        };
        await setDoc(userRef, novosDados);
        setUserData(novosDados);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
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
      
      {/* ROTEAMENTO CONDICIONAL: Se view for 'shop', mostra a loja. Senão, mostra o Dashboard. */}
      {view === 'shop' ? (
        <Shop 
          userData={{ ...userData, uid: user.uid }} 
          onBack={() => setView('dashboard')} 
          onPurchase={fetchUserData} 
        />
      ) : (
        <>
          {/* Header do Utilizador */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                {userData?.nome?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="800">Olá, {userData?.nome}!</Typography>
                <Typography variant="subtitle1" color="text.secondary">O que vamos focar hoje?</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<Storefront />}
                onClick={() => setView('shop')}
                sx={{ borderRadius: 8, px: 3, fontWeight: 'bold' }}
              >
                Mercado
              </Button>
              <Button variant="outlined" color="error" startIcon={<Logout />} onClick={onLogout} sx={{ borderRadius: 8 }}>
                Sair
              </Button>
            </Stack>
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
                  
                  {/* Título e Saldo de Moedas */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                      <Pets color="primary" /> Seu Pet
                    </Typography>
                    <Chip 
                      icon={<AttachMoney />} 
                      label={`${userData?.moedas || 0} Moedas`} 
                      color="success" 
                      variant="outlined" 
                      sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2.5, px: 1 }}
                    />
                  </Box>
                  
                  <Box textAlign="center" mb={4}>
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
                        <Typography variant="body2" fontWeight="600">Energia</Typography>
                        <Typography variant="body2" fontWeight="bold">{userData?.energy}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={userData?.energy || 0} color={userData?.energy < 20 ? 'error' : 'success'} sx={{ height: 10, borderRadius: 5 }} />
                    </Box>
                    
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight="600">Fome</Typography>
                        <Typography variant="body2" fontWeight="bold">{userData?.hunger}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={userData?.hunger || 0} color={userData?.hunger < 30 ? 'warning' : 'primary'} sx={{ height: 10, borderRadius: 5 }} />
                    </Box>
                  </Stack>
                  
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}