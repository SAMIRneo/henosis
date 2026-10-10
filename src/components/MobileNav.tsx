import {useRef} from 'react';
import {ArrowUpRight, X} from 'lucide-react';
import {useDialog} from '../hooks/useDialog';

export const navigation = [['chambres','Les chambres'],['constellation','Constellation'],['fragments','Fragments'],['horizons','Horizons']] as const;

export function MobileNav({open, close, active}: {open: boolean; close: () => void; active: string}) {
  const ref = useRef<HTMLDialogElement>(null);
  useDialog(ref, open, '#menu-trigger');
  return <dialog ref={ref} id="mobile-navigation" className="mobile-navigation" aria-labelledby="mobile-nav-title" onCancel={event => {event.preventDefault();close();}} onClick={event => {if (event.target === event.currentTarget) close();}}>
    <div className="mobile-nav-inner">
      <div className="mobile-nav-top"><span id="mobile-nav-title">Les passages</span><button className="icon-button" aria-label="Fermer le menu" onClick={close} data-autofocus><X size={20}/></button></div>
      <nav aria-label="Navigation mobile">{navigation.map(([id,label],index)=><a href={`#${id}`} key={id} aria-current={active===id?'location':undefined} onClick={close}><span>0{index+1}</span>{label}<ArrowUpRight size={24}/></a>)}</nav>
      <span className="mobile-nav-signature">HENOSIS / LE TERRITOIRE D’HENOK</span>
    </div>
  </dialog>;
}
