import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, LinearProgress, Stack, CircularProgress, Chip } from '@mui/material';
import { Logout, Pets, Stars, Storefront, AttachMoney, Assignment, VolunteerActivism, Settings as SettingsIcon } from '@mui/icons-material';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import PomodoroTimer from './PomodoroTimer';
import Shop from './Shop';
import AccountSettings from './Settings';
import MySolicitations from './MySolicitations';
import MyDonations from './MyDonations';
import { applyIdleDecay, getLevelFromXp } from '../game/petBalance';

export default function UserDashboard({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
        const progress = getLevelFromXp(data.xp_pet || 0);
        let dadosAtualizados = {
          ...data,
          nivel_pet: progress.nivel,
          evolution: progress.evolution,
        };

        if (horasPassadas > 0) {
          const decayed = applyIdleDecay(data.energy, data.hunger, horasPassadas);
          dadosAtualizados.energy = decayed.energy;
          dadosAtualizados.hunger = decayed.hunger;
          dadosAtualizados.lastUpdate = agora;

          await updateDoc(userRef, {
            hunger: dadosAtualizados.hunger,
            energy: dadosAtualizados.energy,
            nivel_pet: dadosAtualizados.nivel_pet,
            evolution: dadosAtualizados.evolution,
            lastUpdate: agora,
          });
        } else if (
          data.nivel_pet !== progress.nivel ||
          data.evolution !== progress.evolution
        ) {
          await updateDoc(userRef, {
            nivel_pet: progress.nivel,
            evolution: progress.evolution,
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
          moedas: 0,
          perfil: 'aluno',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      ) : view === 'solicitacoes' ? (
        <MySolicitations user={user} userData={userData} onBack={() => setView('dashboard')} />
      ) : view === 'doacoes' ? (
        <MyDonations user={user} userData={userData} onBack={() => setView('dashboard')} />
      ) : view === 'settings' ? (
        <AccountSettings user={user} userData={userData} onBack={() => setView('dashboard')} onSaved={fetchUserData} />
      ) : (
        <>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2} mb={4}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                {userData?.nome?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="800">Olá, {userData?.nome}!</Typography>
                <Typography variant="subtitle1" color="text.secondary">O que vamos focar hoje?</Typography>
                <Chip size="small" sx={{ mt: 1 }} label={`Perfil: ${userData?.perfil || 'aluno'}`} variant="outlined" />
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
              <Button variant="outlined" startIcon={<Assignment />} onClick={() => setView('solicitacoes')} sx={{ borderRadius: 8 }}>
                Solicitações
              </Button>
              <Button variant="outlined" startIcon={<VolunteerActivism />} onClick={() => setView('doacoes')} sx={{ borderRadius: 8 }}>
                Contribuir
              </Button>
              <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setView('settings')} sx={{ borderRadius: 8 }}>
                Definições
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<Storefront />}
                onClick={() => setView('shop')}
                sx={{ borderRadius: 8, px: 2, fontWeight: 'bold' }}
              >
                Mercado
              </Button>
              <Button variant="outlined" color="error" startIcon={<Logout />} onClick={onLogout} sx={{ borderRadius: 8 }}>
                Sair
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <PomodoroTimer userId={user.uid} onSessionComplete={fetchUserData} />
            </Grid>

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