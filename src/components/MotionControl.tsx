import {Pause, Play} from 'lucide-react';

export function MotionControl({still, systemReduced, toggle, local = false}: {
  still: boolean; systemReduced: boolean; toggle: () => void; local?: boolean;
}) {
  if (systemReduced) return <span className="motion-preference"><Pause size={14} aria-hidden="true"/>Mouvement réduit<span className="sr-only"> selon les réglages de ton appareil</span></span>;
  return <button className={local ? 'map-motion' : 'footer-motion'} onClick={toggle} aria-pressed={!still} aria-controls="constellation">
    <span className="state-icons" data-active={!still} aria-hidden="true"><Play className="state-off" size={14}/><Pause className="state-on" size={14}/></span>
    {local ? (still ? 'Animer la constellation' : 'Mettre en pause la constellation') : (still ? 'Activer le mouvement' : 'Suspendre le mouvement')}
  </button>;
}
