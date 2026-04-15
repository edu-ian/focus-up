import React from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Stack, Avatar } from '@mui/material';
import { 
  Restaurant, 
  FlashOn, 
  ArrowBack, 
  AttachMoney, 
  LocalCafe, 
  Fastfood,
  Smartphone 
} from '@mui/icons-material';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const ITEMS = [
  { id: 'cafe', name: 'Café Expresso', price: 10, restore: 15, type: 'energy', icon: <LocalCafe />, desc: '+15 Energia' },
  { id: 'cachorro_quente', name: 'Cachorro Quente', price: 25, restore: 30, type: 'hunger', icon: <Fastfood />, desc: '+30 Fome' },
  { id: 'touro_vermelho', name: 'Touro Vermelho', price: 35, restore: 40, type: 'energy', icon: <FlashOn />, desc: '+40 Energia' },
  { id: 'marmita', name: 'Marmita Caseira', price: 50, restore: 60, type: 'hunger', icon: <Restaurant />, desc: '+60 Fome' },
  { id: 'social_media', name: 'Tempo de Rede Social', price: 50, restore: 15, type: 'energy', icon: <Smartphone />, desc: '+15 Energia (Pausa)' },
];

export default function Shop({ userData, onBack, onPurchase, isDarkMode }) { 
  
  const theme = {
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f8fafc' : '#0f172a',
    textSec: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    primary: '#2563eb' 
  };

  const handleBuy = async (item) => {
    if ((userData.moedas || 0) < item.price) {
      alert("Saldo insuficiente!");
      return;
    }
    try {
      const userRef = doc(db, "users", userData.uid);
      const campo = item.type === 'hunger' ? 'hunger' : 'energy';
      const novoValor = Math.min(100, (userData[campo] || 0) + item.restore);
      await updateDoc(userRef, { moedas: increment(-item.price), [campo]: novoValor });
      alert(`${item.name} comprado!`);
      onPurchase();
    } catch (e) { console.error(e); }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={onBack} 
          sx={{ color: theme.text, textTransform: 'none' }} // CORRIGIDO: Agora usa theme.text
        >
          Voltar
        </Button>
        <Typography variant="h4" fontWeight="900" sx={{ color: theme.primary }}>
          Mercado do Foco
        </Typography>
      </Stack>

      <Card sx={{ mb: 4, bgcolor: theme.primary, color: 'white', borderRadius: 4 }}> 
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 3 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}><AttachMoney sx={{ fontSize: 35 }} /></Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Seu Saldo</Typography>
            <Typography variant="h3" fontWeight="900">{userData.moedas || 0}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {ITEMS.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ 
              bgcolor: theme.cardBg, 
              color: theme.text, 
              borderRadius: 2, 
              border: `1px solid ${theme.border}`,
              transition: '0.3s'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: isDarkMode ? '#334155' : '#f1f5f9', color: theme.primary }}>{item.icon}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="body2" sx={{ color: theme.textSec }}>{item.desc}</Typography>
                  </Box>
                </Stack>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Typography variant="h5" fontWeight="900" sx={{ color: theme.primary }}>${item.price}</Typography>
                  <Button variant="contained" onClick={() => handleBuy(item)} disabled={(userData.moedas || 0) < item.price} sx={{ borderRadius: 2, bgcolor: theme.primary }}>
                    Comprar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}