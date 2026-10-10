import {useEffect, useState} from 'react';

export function useMotion() {
  const [systemReduced, setSystemReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('henosis-motion') === 'off'; } catch { return false; }
  });
  const still = systemReduced || paused;
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => { document.documentElement.dataset.motion = still ? 'off' : 'on'; }, [still]);
  const toggle = () => {
    if (systemReduced) return;
    setPaused(value => {
      try { localStorage.setItem('henosis-motion', value ? 'on' : 'off'); } catch { /* Storage can be unavailable. */ }
      return !value;
    });
  };
  return {still, systemReduced, toggle};
}
