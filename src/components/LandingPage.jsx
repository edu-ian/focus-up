import React from 'react';
import { Box, Typography, Button, Container, Grid, TextField, AppBar, Toolbar } from '@mui/material';
import { motion } from 'framer-motion';

// IMPORTAÇÃO DA LOGO
import focusLogo from '../assets/focus.png'; 

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 2.5, ease: "easeOut" } }
};

export default function LandingPage({ onNavigateToLogin }) {
  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', display: 'block' }}>
      
      {/* HEADER COM A LOGO */}
      <AppBar position="fixed" sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', boxShadow: 'none', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: '1200px', width: '100%', mx: 'auto' }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box 
              component="img" 
              src={focusLogo} 
              alt="Logo Focus-UP" 
              sx={{ height: 40, width: 'auto', objectFit: 'contain' }} 
            />
            <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: '900', letterSpacing: '-0.5px' }}>
              Focus-UP
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: { xs: 1, md: 3 }, alignItems: 'center' }}>
            <Button href="#sobre" sx={{ color: '#475569', textTransform: 'none', fontWeight: 500 }}>Sobre</Button>
            <Button href="#suporte" sx={{ color: '#475569', textTransform: 'none', fontWeight: 500 }}>Suporte</Button>
            <Button variant="contained" onClick={onNavigateToLogin} sx={{ bgcolor: '#2563eb', textTransform: 'none', borderRadius: '24px', px: 3, fontWeight: 'bold' }}>
              Entrar
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* HERO SECTION */}
      <Box sx={{ pt: 20, pb: 10, textAlign: 'center' }}>
        <Container maxWidth="md">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, color: '#1e293b', letterSpacing: '-1px' }}>
              Domine seu tempo com o <Box component="span" sx={{ color: '#2563eb' }}>Focus-UP</Box>
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', mb: 5, px: { xs: 2, md: 10 } }}>
              A solução definitiva contra a procrastinação, unindo ciência e gamificação.
            </Typography>
            <Button variant="contained" size="large" onClick={onNavigateToLogin} sx={{ bgcolor: '#2563eb', px: 5, py: 1.8, borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none' }}>
              Começar Agora
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* SOBRE SECTION */}
      <Box id="sobre" sx={{ py: 15, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
                <Typography variant="overline" sx={{ color: '#2563eb', fontWeight: 'bold', letterSpacing: 1.5 }}>
                  Por que o Focus-UP?
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: '800', color: '#1e293b', mt: 1, mb: 3, letterSpacing: '-0.5px' }}>
                  Uma resposta direta à procrastinação
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
                  A procrastinação é uma falha autorregulatória onde adiamos tarefas voluntariamente. O avanço tecnológico criou um ambiente propício para distrações constantes.
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
                  Nossa plataforma utiliza elementos de <strong>gamificação</strong> para oferecer reforço positivo, ajudando você a construir hábitos produtivos de forma leve e recompensadora.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
                  <Box 
                    component="img" 
                    src={focusLogo} 
                    alt="Logo Focus-UP Detalhada" 
                    sx={{ width: '100%', maxWidth: '350px', objectFit: 'contain', filter: 'drop-shadow(0px 20px 30px rgba(37, 99, 235, 0.15))' }} 
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SUPORTE SECTION DE VOLTA! */}
      <Box id="suporte" sx={{ py: 15, bgcolor: '#f8fafc' }}>
        <Container maxWidth="sm">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="overline" sx={{ color: '#2563eb', fontWeight: 'bold', letterSpacing: 1.5 }}>Suporte</Typography>
              <Typography variant="h3" sx={{ fontWeight: '800', color: '#1e293b', mt: 1, letterSpacing: '-0.5px' }}>Como podemos ajudar?</Typography>
            </Box>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 4, bgcolor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <TextField label="Nome" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              <TextField label="E-mail" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              <TextField label="Mensagem" fullWidth multiline rows={4} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              <Button variant="contained" size="large" sx={{ bgcolor: '#2563eb', py: 1.8, borderRadius: '12px', mt: 2, fontWeight: 'bold', textTransform: 'none', fontSize: '1.1rem' }}>
                Enviar
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

    </Box>
  );
}