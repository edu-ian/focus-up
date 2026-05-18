import { Box, Card, CardContent, Typography, Button, Grid, Stack, Avatar } from '@mui/material';
import { Restaurant, FlashOn, ArrowBack, AttachMoney } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNotify } from '../context/NotifyContext';
import { SHOP_CATALOG, clampStatus } from '../game/petBalance';

const ITEM_ICONS = {
  marmita: <Restaurant />,
  energetico: <FlashOn />,
};

export default function Shop({ userData, onBack, onPurchase }) {
  const notify = useNotify();

  const handleBuy = async (item) => {
    if ((userData.moedas || 0) < item.price) {
      notify.error('Moedas insuficientes!');
      return;
    }

    const userRef = doc(db, 'users', userData.uid);
    const currentStatus = item.type === 'hunger' ? userData.hunger : userData.energy;
    const novoStatus = clampStatus((currentStatus || 0) + item.restore);

    try {
      await updateDoc(userRef, {
        moedas: (userData.moedas || 0) - item.price,
        [item.type]: novoStatus,
      });
      notify.success(`Compraste ${item.name}!`);
      onPurchase();
    } catch (error) {
      console.error('Erro na compra:', error);
      notify.error('Não foi possível concluir a compra.');
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Button startIcon={<ArrowBack />} onClick={onBack}>
          Voltar
        </Button>
        <Typography variant="h4" fontWeight="900">
          Mercado do Foco
        </Typography>
      </Stack>

      <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 4 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AttachMoney sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6">Teu Saldo</Typography>
            <Typography variant="h3" fontWeight="900">
              {userData.moedas || 0}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {SHOP_CATALOG.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <Card sx={{ borderRadius: 4, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'background.default', p: 1, color: 'primary.main' }}>
                    {ITEM_ICONS[item.id]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="h5" color="primary" fontWeight="bold" mb={2}>
                  {item.price} moedas
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={(userData.moedas || 0) < item.price}
                  onClick={() => handleBuy(item)}
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
