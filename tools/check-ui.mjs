import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const url=process.env.UI_TEST_URL||'http://127.0.0.1:5174/henosis/';
const output=process.env.UI_QA_DIR||'test-results/ui';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.UI_BROWSER_CHANNEL||'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.addInitScript(()=>{
  window.__uiFrames=0;window.__uiWebgl=0;
  const request=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=callback=>{window.__uiFrames++;return request(callback)};
  const get=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2')window.__uiWebgl++;return get.call(this,type,...args)};
});
const page=await context.newPage(),checks=[],errors=[],audits=[];
page.on('pageerror',error=>errors.push(error.message));
const check=(value,label)=>{if(!value)throw new Error(label);checks.push(label)};
const audit=async(state,target=page)=>{
  const result=await new AxeBuilder({page:target}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']).analyze();
  audits.push({state,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incompleteRules:result.incomplete.map(v=>v.id)});
  check(result.violations.length===0,`Audit axe : ${state}`);
};
try{
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  check(await page.locator('a[href*="github"]').count()===0,'Aucun projet ni site GitHub présenté');
  await page.getByRole('button',{name:'Traverser le voile'}).click();
  check(await page.locator('.hero-art').getAttribute('class').then(value=>value.includes('beyond')),'Passage visuel');
  await page.getByRole('button',{name:'Revenir au seuil'}).click();
  await page.getByRole('tab',{name:'II La recherche'}).click();
  await page.keyboard.press('ArrowRight');
  check(await page.getByRole('tab',{name:'III Le devenir'}).getAttribute('aria-selected')==='true','Onglets au clavier');
  check(await page.locator('.chamber-rail').evaluate(el=>getComputedStyle(el).transitionDuration)==='0s','Navigation clavier sans animation');
  await page.keyboard.press('Home');
  await page.getByRole('button',{name:'Chambre suivante'}).click();
  check(await page.getByRole('button',{name:'Chambre suivante'}).evaluate(el=>el===document.activeElement),'Focus conservé après changement de chambre');
  check(await page.locator('.chamber-picture img').count()===3,'Illustrations des chambres persistantes');

  await page.getByRole('button',{name:'Invisible',exact:false}).click();
  await page.getByRole('button',{name:'Ouvrir le fragment associé'}).click();
  check(await page.getByRole('dialog',{name:'Le symbole est un passage.'}).isVisible(),'Lecteur nommé et fragment associé');
  await page.getByRole('button',{name:'Suivant',exact:true}).click();
  check(await page.locator('#reader-title').evaluate(el=>el===document.activeElement),'Le nouveau fragment reçoit le focus');
  await page.keyboard.press('Escape');
  check(await page.getByRole('button',{name:'Ouvrir le fragment associé'}).evaluate(el=>el===document.activeElement),'Focus rendu au déclencheur du lecteur');

  await page.locator('.fragment-open').first().click();
  await page.getByRole('button',{name:'Garder ce fragment',exact:true}).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Gardés',exact:false}).click();
  check(await page.locator('.fragment-row').count()===1,'Favoris filtrables');
  await page.reload();
  check(await page.locator('.save-button').first().getAttribute('aria-pressed')==='true','Favoris persistants');

  await page.keyboard.press('Control+k');
  check(await page.getByRole('dialog',{name:'Trouver un passage'}).isVisible(),'Recherche nommée');
  check(await page.locator('#search').evaluate(el=>el===document.activeElement),'Recherche immédiatement prête à saisir');
  await page.locator('#search').fill('theologies');
  check(await page.locator('.search-results a').count()===1,'Recherche sans accents');
  await page.locator('#search').fill('liberte');
  await page.locator('.search-result').first().click();
  check(await page.locator('dialog[open]').count()===1,'Un seul dialogue lors du passage recherche-lecture');
  await page.keyboard.press('Escape');
  check(await page.locator('#search-trigger').evaluate(el=>el===document.activeElement),'Focus restauré après recherche-lecture');
  await page.locator('#search-trigger').click();await page.locator('#search').fill('zzznothing');
  check(await page.locator('.search-results').innerText().then(value=>value.includes('Aucun passage')),'Recherche vide');
  await page.keyboard.press('Escape');

  await page.locator('.map-field').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  const gl=await page.evaluate(()=>window.__uiWebgl),start=await page.evaluate(()=>window.__uiFrames);
  await page.waitForTimeout(250);
  check(await page.evaluate(()=>window.__uiFrames)>start,'Constellation animée dans le viewport');
  await page.getByRole('button',{name:'Mettre en pause la constellation'}).click();await page.waitForTimeout(250);
  const pausedFrames=await page.evaluate(()=>window.__uiFrames);await page.waitForTimeout(250);
  check(await page.evaluate(()=>window.__uiFrames)===pausedFrames,'Aucune boucle de rendu en pause');
  await page.getByRole('button',{name:'Animer la constellation'}).click();
  check(await page.evaluate(()=>window.__uiWebgl)===gl,'Aucune recréation WebGL lors de la pause');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(250);
  const offscreen=await page.evaluate(()=>window.__uiFrames);await page.waitForTimeout(250);
  check(await page.evaluate(()=>window.__uiFrames)===offscreen,'Aucune boucle de rendu hors écran');
  await page.getByRole('button',{name:'Suspendre le mouvement'}).click();await page.reload();
  check(await page.locator('html').getAttribute('data-motion')==='off','Préférence de mouvement persistante');

  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    for(const id of ['seuil','chambres','constellation','fragments','horizons','regard']){
      await page.locator('#'+id).scrollIntoViewIfNeeded();
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Reflow ${width}px / ${id}`);
    }
  }
  await page.setViewportSize({width:1280,height:900});
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Texte agrandi à 200 % sans débordement');
  await page.evaluate(()=>document.documentElement.style.removeProperty('font-size'));

  await page.setViewportSize({width:390,height:844});
  check(await page.locator('button').evaluateAll(buttons=>buttons.every(button=>{const r=button.getBoundingClientRect();return !r.width||!r.height||(r.width>=44&&r.height>=44)})),'Boutons visibles de 44 × 44 px au minimum');
  check(await page.locator('#search').evaluate(el=>getComputedStyle(el).fontSize)==='16px','Champ de recherche 16 px sur mobile');
  await page.locator('#menu-trigger').click();
  check(await page.getByRole('dialog',{name:'Les passages'}).isVisible(),'Menu mobile natif et nommé');
  for(let index=0;index<10;index++)await page.keyboard.press('Tab');
  check(await page.evaluate(()=>!!document.activeElement.closest('#mobile-navigation')),'Focus contenu dans le menu mobile');
  await audit('menu mobile');
  await page.keyboard.press('Escape');
  check(await page.locator('#menu-trigger').evaluate(el=>el===document.activeElement),'Focus rendu au bouton du menu');
  await audit('page mobile');
  await page.locator('.fragment-open').first().click();await audit('lecteur mobile');await page.keyboard.press('Escape');
  await page.locator('#search-trigger').click();await audit('recherche mobile');await page.keyboard.press('Escape');
  await page.setViewportSize({width:1440,height:1000});await audit('page desktop');

  const reducedContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reducedContext.addInitScript(()=>localStorage.setItem('henosis-motion','on'));
  const reduced=await reducedContext.newPage();await reduced.goto(url);
  check(await reduced.locator('html').getAttribute('data-motion')==='off','Réduction système respectée même avec une ancienne préférence');
  await page.emulateMedia({reducedMotion:'reduce'});
  check(await page.locator('html').getAttribute('data-motion')==='off','Préférence système appliquée en cours de session');

  for(const [width,name] of [[1440,'desktop'],[390,'mobile']]){
    await page.setViewportSize({width,height:1000});
    for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=650){await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(30)}
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:path.join(output,`henosis-ui-skills-${name}.png`),fullPage:true});
    await page.screenshot({path:path.join(output,`henosis-ui-skills-${name}-accueil.png`)});
  }
  check(errors.length===0,'Aucune erreur JavaScript');
  await writeFile(path.join(output,'henosis-ui-skills-verification.json'),JSON.stringify({url,date:new Date().toISOString(),checks,audits,errors},null,2));
  console.log(`${checks.length} contrôles réussis ; ${audits.length} états analysés par axe, aucune violation détectée.`);
}catch(error){
  await writeFile(path.join(output,'henosis-ui-skills-failure.json'),JSON.stringify({message:error.message,checks,audits,errors},null,2));
  await page.screenshot({path:path.join(output,'henosis-ui-skills-failure.png'),fullPage:true});
  throw error;
}finally{await browser.close()}
