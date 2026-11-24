import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import { ScheduleProvider } from './store/useScheduleStore';

createRoot(document.getElementById('root')!).render(<StrictMode><ScheduleProvider><App /></ScheduleProvider></StrictMode>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(error => console.warn('Offline cache unavailable', error));
}
