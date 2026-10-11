import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const output=process.env.HENOSIS_OUTPUT||'work/qa';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[];
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(process.env.HENOSIS_URL||'http://127.0.0.1:4321/henosis/');await page.waitForTimeout(500);
 await page.screenshot({path:`${output}/henosis-${name}-dispersion.png`});
 await page.waitForTimeout(5500);await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);await page.screenshot({path:`${output}/henosis-${name}-unite.png`});
 await page.getByRole('link',{name:'Déployer les relations'}).click();await page.waitForTimeout(1800);
 await page.locator('[data-select]').first().click();await page.screenshot({path:`${output}/henosis-${name}-relations.png`,fullPage:true});
 await page.close();
}
await browser.close();await writeFile(`${output}/signature-errors.json`,JSON.stringify(errors,null,2));console.log(JSON.stringify({errors,output}));

