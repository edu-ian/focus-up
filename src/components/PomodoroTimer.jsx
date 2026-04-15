import { useState, useEffect } from 'react';
import { 
  Card, CardContent, Typography, Button, Stack, Box, 
  IconButton, Slider, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { 
  PlayArrow, Pause, Stop, Settings, VolumeUp, VolumeDown 
} from '@mui/icons-material';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

// Configuração dos modos de tempo e recompensas
const MODOS = {
  rapido: { label: '10 min', focus: 10, break: 3, xp: 50, coins: 15 },
  padrao: { label: '25 min', focus: 25, break: 5, xp: 150, coins: 50 },
  profundo: { label: '50 min', focus: 50, break: 10, xp: 350, coins: 120 }
};

// 🎵 3 Tipos de Som disponíveis
const SONS = {
  sino: { nome: 'Sino Suave', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  digital: { nome: 'Alarme Digital', url: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
  retro: { nome: 'Moeda Retro (Game)', url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' }
};

export default function PomodoroTimer({ userId, onSessionComplete, isDarkMode }) {
  const [modoAtual, setModoAtual] = useState('padrao');
  const [timeLeft, setTimeLeft] = useState(MODOS.padrao.focus * 60); 
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // 🔊 Estados de Configuração de Som
  const [mostrarConfigSom, setMostrarConfigSom] = useState(false);
  const [volume, setVolume] = useState(0.7); // Volume padrão 70%
  const [somEscolhido, setSomEscolhido] = useState('sino'); // Som padrão

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Função para tocar o som
  const tocarAlarme = (testeSom = somEscolhido) => {
    try {
      const audio = new Audio(SONS[testeSom].url);
      audio.volume = volume;
      audio.play();
    } catch (e) {
      console.log("Erro ao reproduzir som", e);
    }
  };

  const handleTimerComplete = async () => {
    setIsActive(false);
    
    // 🔔 TOCA O SOM AQUI!
    tocarAlarme();

    const recompensas = MODOS[modoAtual];
    
    if (!isBreak) {
      alert(`Sessão concluída! Ganhaste ${recompensas.xp} XP e ${recompensas.coins} Moedas.`);
      
      if (userId) {
        const userRef = doc(db, "users", userId);
        const agora = new Date();
        
        try {
          const userSnap = await getDoc(userRef);
          let novaEnergia = 90; 
          let novaFome = 85;
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            novaEnergia = Math.max(0, (data.energy !== undefined ? data.energy : 100) - 10);
            novaFome = Math.max(0, (data.hunger !== undefined ? data.hunger : 100) - 15);
          }
          
          await setDoc(userRef, {
            xp_pet: increment(recompensas.xp),
            energy: novaEnergia, 
            hunger: novaFome,
            lastCategory: 'pomodoro',
            moedas: increment(recompensas.coins),
            pomodoros_feitos: increment(1),
            lastUpdate: agora
          }, { merge: true });
          
          const metricsRef = doc(db, "dashboard", "metrics");
          await setDoc(metricsRef, {
            total_pomodoros_app: increment(1)
          }, { merge: true });

          if(onSessionComplete) onSessionComplete();
        } catch (error) {
          console.error("Erro ao salvar progresso:", error);
        }
      }
      
      setIsBreak(true);
      setTimeLeft(recompensas.break * 60);
    } else {
      alert("Pausa terminada. De volta ao trabalho!");
      setIsBreak(false);
      setTimeLeft(recompensas.focus * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    const recompensas = MODOS[modoAtual];
    setTimeLeft(isBreak ? recompensas.break * 60 : recompensas.focus * 60);
  };

  const alterarModo = (chaveModo) => {
    if (isActive) {
      const confirmar = window.confirm("Mudar de modo irá resetar o temporizador atual. Deseja continuar?");
      if (!confirmar) return;
    }
    setModoAtual(chaveModo);
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(MODOS[chaveModo].focus * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textPrimary = isDarkMode ? '#fff' : '#0f172a';
  const borderColor = isDarkMode ? '#334155' : '#cbd5e1';

  return (
    <Card sx={{ 
      borderRadius: 4, textAlign: 'center', p: { xs: 2, md: 4 }, 
      bgcolor: cardBg, color: textPrimary, border: `1px solid ${borderColor}`,
      boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease', position: 'relative'
    }}>
      
      {/* Botão de Configuração de Som (Canto superior direito) */}
      <IconButton 
        onClick={() => setMostrarConfigSom(!mostrarConfigSom)}
        sx={{ position: 'absolute', top: 16, right: 16, color: textPrimary }}
      >
        <Settings />
      </IconButton>

      <CardContent>
        <Typography variant="overline" sx={{ color: isBreak ? '#10b981' : '#6366f1', fontWeight: '900', letterSpacing: 2 }}>
          {isBreak ? 'MODO DESCANSO' : 'MODO FOCO'}
        </Typography>

        {/* Botões de Seleção de Tempo */}
        {!isBreak && (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2, mb: 1, flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(MODOS).map(([chave, config]) => (
              <Button
                key={chave}
                size="small"
                variant={modoAtual === chave ? 'contained' : 'outlined'}
                onClick={() => alterarModo(chave)}
                sx={{
                  borderRadius: 2,
                  bgcolor: modoAtual === chave ? '#6366f1' : 'transparent',
                  color: modoAtual === chave ? '#fff' : textPrimary,
                  borderColor: '#6366f1',
                  '&:hover': {
                    bgcolor: modoAtual === chave ? '#4f46e5' : 'rgba(99, 102, 241, 0.1)',
                  }
                }}
              >
                {config.label}
              </Button>
            ))}
          </Stack>
        )}

        <Typography variant="h1" fontWeight="900" sx={{ my: 3, fontSize: {xs: '4rem', md: '5rem'}, color: textPrimary, transition: 'color 0.3s ease' }}>
          {formatTime(timeLeft)}
        </Typography>

        <Stack direction="row" justifyContent="center" spacing={2}>
          <Button 
            variant="contained" 
            onClick={toggleTimer}
            startIcon={isActive ? <Pause /> : <PlayArrow />}
            sx={{ 
              bgcolor: isActive ? '#f59e0b' : '#6366f1', 
              color: '#fff',
              px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold',
              '&:hover': { bgcolor: isActive ? '#d97706' : '#4f46e5' }
            }}
          >
            {isActive ? 'Pausar' : 'Focar'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={resetTimer}
            startIcon={<Stop />}
            sx={{ color: '#ef4444', borderColor: '#ef4444', borderRadius: 2, '&:hover': { borderColor: '#b91c1c', color: '#b91c1c', bgcolor: 'transparent' } }}
          >
            Reset
          </Button>
        </Stack>

        {/* 🎛️ Painel Oculto de Configurações de Som */}
        {mostrarConfigSom && (
          <Box sx={{ 
            mt: 4, p: 3, borderRadius: 3, 
            bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${borderColor}`
          }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>Configurações de Alarme</Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={3}>
              <FormControl fullWidth size="small" sx={{ textAlign: 'left' }}>
                <InputLabel sx={{ color: textPrimary }}>Som</InputLabel>
                <Select
                  value={somEscolhido}
                  label="Som"
                  onChange={(e) => setSomEscolhido(e.target.value)}
                  sx={{ color: textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor } }}
                >
                  {Object.entries(SONS).map(([chave, config]) => (
                    <MenuItem key={chave} value={chave}>{config.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                onClick={() => tocarAlarme()} 
                sx={{ color: textPrimary, borderColor, whiteSpace: 'nowrap' }}
              >
                Testar Som
              </Button>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <VolumeDown sx={{ color: textPrimary }} />
              <Slider 
                value={volume} 
                onChange={(e, newValue) => setVolume(newValue)} 
                step={0.1} min={0} max={1} 
                sx={{ color: '#6366f1' }}
              />
              <VolumeUp sx={{ color: textPrimary }} />
            </Stack>
          </Box>
        )}

      </CardContent>
    </Card>
  );
}