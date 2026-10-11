import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const output=process.env.HENOSIS_OUTPUT||'work/qa';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});
const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await page.addInitScript(()=>{window.__events=[];new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.interactionId)window.__events.push({name:e.name,duration:e.duration,id:e.interactionId})}).observe({type:'event',buffered:true,durationThreshold:16})});
await page.goto('http://127.0.0.1:4322/henosis/constellation/');await page.waitForTimeout(4500);
for(let pass=0;pass<2;pass++)for(let i=0;i<6;i++){await page.locator('[data-select]').nth(i).click();await page.waitForTimeout(100)}
await page.locator('[data-node]').first().focus();await page.keyboard.press('Enter');await page.waitForTimeout(500);await page.getByRole('link',{name:'Tous les fragments'}).click();
const timings=await page.evaluate(()=>window.__events);const maximum=Math.max(0,...timings.map(e=>e.duration));const result={environment:'Chromium mobile 390px, CPU ×4; Event Timing, interactions de test, pas de données terrain',events:timings,maxInteractionMs:maximum,budget:200,pass:maximum<200};await writeFile(output+'/interactions.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();if(!result.pass)process.exit(1);
