import React, { useState } from 'react';
import { Box, Typography, Button, Container, Grid, TextField, AppBar, Toolbar, Paper } from '@mui/material';
import { motion } from 'framer-motion';

// IMPORTAÇÃO DA LOGO
import focusLogo from '../assets/focus.png'; 

// IMPORTAÇÕES DO FIREBASE (necessárias para o suporte)
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 2.5, ease: "easeOut" } }
};

export default function LandingPage({ onNavigateToLogin }) {
  // === ESTADOS PARA O SUPORTE ===
  const [suporteTexto, setSuporteTexto] = useState('');
  const [suporteFeedback, setSuporteFeedback] = useState('');
  const [enviandoSuporte, setEnviandoSuporte] = useState(false);

  // === FUNÇÃO PARA ENVIAR SUPORTE ===
  const handleEnviarSuporteVisitante = async () => {
    if (!suporteTexto.trim()) {
      setSuporteFeedback('Por favor, digite uma mensagem.');
      return;
    }
    setEnviandoSuporte(true);
    setSuporteFeedback('A enviar a sua mensagem...');

    try {
      await addDoc(collection(db, "suporte"), {
        tipo: "visitante", // Identifica que veio da Landing Page
        mensagem: suporteTexto,
        data: new Date(),
        status: 'novo'
      });
      setSuporteFeedback('✅ Mensagem enviada com sucesso!');
      setSuporteTexto('');
    } catch (error) {
      console.error("Erro ao enviar suporte:", error);
      setSuporteFeedback('❌ Erro ao enviar. Verifique a sua ligação.');
    } finally {
      setEnviandoSuporte(false);
    }
  };

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
             Foca Aqui
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: { xs: 1, md: 3 }, alignItems: 'center' }}>
            <Button href="#sobre" sx={{ color: '#475569', textTransform: 'none', fontWeight: 500 }}>Sobre</Button>
            <Button href="#support" sx={{ color: '#475569', textTransform: 'none', fontWeight: 500 }}>Suporte</Button>
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
              Domine seu tempo com o <Box component="span" sx={{ color: '#2563eb' }}>Foca Aqui</Box>
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
                  Por que o Foca Aqui?
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

      {/* SEÇÃO DE SUPORTE */}
      <Box id="support" sx={{ py: 8, bgcolor: '#f8fafc' }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4} sx={{ color: '#1e293b' }}>
            Precisa de Ajuda?
          </Typography>
          <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Escreva a sua dúvida ou sugestão aqui..."
              value={suporteTexto}
              onChange={(e) => setSuporteTexto(e.target.value)}
              disabled={enviandoSuporte}
              sx={{ mb: 2 }}
            />

            {/* FEEDBACK VISUAL */}
            {suporteFeedback && (
              <Typography 
                textAlign="center" 
                mb={2}
                fontWeight="bold"
                color={suporteFeedback.includes('❌') ? 'error.main' : (suporteFeedback.includes('✅') ? 'success.main' : 'text.secondary')}
              >
                {suporteFeedback}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleEnviarSuporteVisitante}
              disabled={enviandoSuporte || !suporteTexto.trim()}
              sx={{ bgcolor: '#2563eb', fontWeight: 'bold' }}
            >
              {enviandoSuporte ? 'A ENVIAR...' : 'ENVIAR MENSAGEM'}
            </Button>

          </Paper>
        </Container>
      </Box> 

    </Box>
  );      
}