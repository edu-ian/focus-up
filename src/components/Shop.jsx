import { Box, Card, CardContent, Typography, Button, Grid, Stack, Avatar } from '@mui/material';
import { ShoppingCart, Restaurant, FlashOn, ArrowBack, AttachMoney } from '@mui/icons-material';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const ITEMS = [
  { id: 'marmita', name: 'Marmita Caseira', price: 30, restore: 25, type: 'hunger', icon: <Restaurant />, desc: '+25 Fome' },
  { id: 'energetico', name: 'Energético Monster', price: 20, restore: 20, type: 'energy', icon: <FlashOn />, desc: '+20 Energia' },
  // Novo item adicionado
  { id: 'social_media', name: 'Tempo de Rede Social', price: 50, restore: 15, type: 'energy', icon: <ShoppingCart />, desc: '+15 Energia (Pausa)' },
];

export default function Shop({ userData, onBack, onPurchase, isDarkMode }) { // Adicionado isDarkMode como prop
  
  const theme = {
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f8fafc' : '#0f172a',
    border: isDarkMode ? '#334155' : '#cbd5e1'
  };
  const handleBuy = async (item) => {
    if ((userData.moedas || 0) < item.price) {
      alert("Moedas insuficientes!");
      return;
    }

    const userRef = doc(db, "users", userData.uid);
    
    // Calculamos o novo valor garantindo o teto de 100%
    const currentStatus = item.type === 'hunger' ? userData.hunger : userData.energy;
    const novoStatus = Math.min(100, (currentStatus || 0) + item.restore);

    try {
      await updateDoc(userRef, {
        moedas: increment(-item.price),
        [item.type]: novoStatus
      });
      alert(`Compraste ${item.name}!`);
      onPurchase(); // Atualiza a UI do Dashboard
    } catch (error) {
      console.error("Erro na compra:", error);
    }
  };

return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Button startIcon={<ArrowBack />} onClick={onBack}>Voltar</Button>
        <Typography variant="h4" fontWeight="900">Mercado do Foco</Typography>
      </Stack>

      {/* Card de Saldo com cores fixas para destaque, mas borda ajustada */}
      <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}> 
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AttachMoney sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6">Teu Saldo</Typography>
            <Typography variant="h3" fontWeight="900">{userData.moedas || 0}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {ITEMS.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            {/* Card com cores dinâmicas e bordas menos arredondadas (borderRadius: 2) */}
            <Card sx={{ 
              bgcolor: theme.cardBg, 
              color: theme.text, 
              borderRadius: 2, 
              border: `1px solid ${theme.border}`,
              transition: '0.3s', 
              '&:hover': { transform: 'translateY(-5px)' } 
            }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: isDarkMode ? '#334155' : '#f1f5f9', p: 1, color: 'primary.main' }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>{item.desc}</Typography>
                  </Box>
                </Stack>
                <Typography variant="h5" color="primary" fontWeight="bold" mb={2}>
                  ${item.price}
                </Typography>
                <Button 
                  fullWidth 
                  variant="contained" 
                  disabled={(userData.moedas || 0) < item.price}
                  onClick={() => handleBuy(item)}
                  sx={{ borderRadius: 1.5 }}
                >
                  Comprar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}