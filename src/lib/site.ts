export const base='/henosis';
export const href=(path='')=>`${base}/${path.replace(/^\/+|\/+$/g,'')}${path&&!path.includes('.')?'/':''}`;
export const origin='https://samirneo.github.io';
export const thesis='[À ÉCRIRE PAR SAMIR : en une phrase, quel lien unit ce que tu apprends et ce que tu construis ?]';
export const dateLabel=(date:Date)=>new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Paris'}).format(date);
export const xml=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
