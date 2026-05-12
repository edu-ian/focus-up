import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotifyContext = createContext(null);

export function NotifyProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', severity: 'info' });

  const show = useCallback((message, severity = 'info') => {
    setState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo(() => ({ show, success: (m) => show(m, 'success'), error: (m) => show(m, 'error') }), [show]);

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <Snackbar open={state.open} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={state.severity} variant="filled" sx={{ width: '100%' }}>
          {state.message}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook partilhado com a app
export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) return { show: () => {}, success: () => {}, error: () => {} };
  return ctx;
}
