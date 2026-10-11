import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes=['','constellation','chambres/machines','chambres/marches','chambres/pouvoir','chambres/signes','chambres/formes','chambres/methode','fragments','fragments/deleguer','fragments/apprendre','fragments/confiance','fragments/decider','fragments/donner-forme','fragments/interpreter','oeuvres','a-propos','lecture'];
for(const route of routes)test(`HTML et accessibilité : /${route}`,async({page})=>{
 await page.goto(`/henosis/${route}${route?'/':''}`);
 await expect(page.locator('h1')).toBeVisible();
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://samirneo.github.io/henosis/${route}${route?'/':''}`);
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
});
test('Une relation a une raison, sélection clavier et tactile',async({page})=>{
 await page.goto('/henosis/constellation/');
 const graph=await (await page.request.get('/henosis/graph.json')).json();
 await expect(page.locator('[data-node]')).toHaveCount(graph.nodes.length);
 await expect(page.locator('[data-edge]')).toHaveCount(graph.links.length);
 await page.locator('[data-node]').first().focus();await expect(page.locator('[data-selection]')).toHaveText(graph.nodes[0].title);
 await expect(page.locator('[data-reasons] p').first()).toHaveText(graph.links.find((l:{source:string;target:string})=>l.source===graph.nodes[0].id||l.target===graph.nodes[0].id).why);
 await page.locator('[data-select]').last().click();await expect(page.locator('[data-select]').last()).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-node]').first().press('Enter');await expect(page).toHaveURL(new RegExp('/fragments/'+graph.nodes[0].id+'/'));
});
test('Le même canvas survit à la navigation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/henosis/');await page.waitForTimeout(6000);
 await page.locator('#henosis-canvas').evaluate(el=>(el as HTMLElement).dataset.identity='original');
 await page.getByRole('link',{name:'Déployer les relations'}).click();
 await expect(page.locator('#henosis-canvas')).toHaveAttribute('data-identity','original');
 await page.waitForTimeout(1400);expect(errors).toEqual([]);
 await page.getByRole('link',{name:'Fragments',exact:true}).first().click();await expect(page.locator('h1')).toContainText('Une question.');
 await page.goBack();await expect(page.locator('[data-graph]')).toBeVisible();
});
test('HTML complet sans JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 for(const route of routes){await page.goto(`/henosis/${route}${route?'/':''}`);await expect(page.locator('h1')).toBeVisible();expect(await page.locator('main').innerText()).not.toEqual('');}
 const graph=await (await page.request.get('/henosis/graph.json')).json();
 await page.goto('/henosis/');await page.getByRole('link',{name:'Déployer les relations'}).click();await expect(page.locator('.relation-list>li')).toHaveCount(graph.nodes.length);
 await context.close();
});
test('Réduction du mouvement : aucun téléchargement GPU',async({browser})=>{
 const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();const requested:string[]=[];page.on('request',r=>requested.push(r.url()));
 await page.goto('/henosis/');await page.waitForTimeout(4000);await expect(page.locator('html')).toHaveAttribute('data-motion','off');expect(requested.some(url=>/gpu\.|surface\./.test(url))).toBe(false);await expect(page.locator('.signature svg')).toBeVisible();
 await page.getByRole('link',{name:'Déployer les relations'}).click();await expect(page.locator('[data-select]').first()).toBeVisible();await context.close();
});
test('Sans WebGPU et sans WebGL : SVG et navigation utilisables',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'gpu',{value:undefined,configurable:true});const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type.includes('webgl'))return null;return original.apply(this,[type,...args] as Parameters<typeof original>)} as typeof original});
 await page.goto('/henosis/');await page.waitForTimeout(5500);await expect(page.locator('.signature svg')).toBeVisible();await expect(page.locator('html')).toHaveAttribute('data-gpu','fallback');
 await page.getByRole('link',{name:'Déployer les relations'}).click();await expect(page.locator('.relation-list')).toBeVisible();
});
test('WebGPU absent : repli WebGL2 automatique',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'gpu',{value:undefined,configurable:true}));
 await page.goto('/henosis/');await expect(page.locator('html')).toHaveAttribute('data-gpu','ready',{timeout:15000});
});
test('Save-Data : aucun téléchargement GPU',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));const requested:string[]=[];page.on('request',r=>requested.push(r.url()));
 await page.goto('/henosis/');await page.waitForTimeout(4000);await expect(page.locator('html')).toHaveAttribute('data-motion','off');expect(requested.some(url=>/gpu\.|surface\./.test(url))).toBe(false);
});
test('Lecture simple ne charge pas la 3D',async({page})=>{
 const requested:string[]=[];page.on('request',r=>requested.push(r.url()));await page.goto('/henosis/lecture/');await page.waitForTimeout(2800);expect(requested.some(url=>/gpu\.|surface\./.test(url))).toBe(false);await expect(page.locator('#relations')).toBeVisible();
});
test('Suspension du mouvement, état conservé après navigation',async({page})=>{
 await page.goto('/henosis/');await page.getByRole('button',{name:'Suspendre le mouvement'}).click();await expect(page.locator('html')).toHaveAttribute('data-motion','off');await page.getByRole('link',{name:'Déployer les relations'}).click();await expect(page.locator('html')).toHaveAttribute('data-motion','off');await page.getByRole('button',{name:'Activer le mouvement'}).click();await expect(page.locator('html')).toHaveAttribute('data-motion','on');
});
test('Graphe, RSS, llms.txt, sitemap et 404',async({request})=>{
 const graph=await (await request.get('/henosis/graph.json')).json();expect(graph.nodes.length).toBeGreaterThan(0);for(const link of graph.links){expect(link.why.length).toBeGreaterThan(14);expect(graph.nodes.some((n:{id:string})=>n.id===link.source)).toBe(true);expect(graph.nodes.some((n:{id:string})=>n.id===link.target)).toBe(true)}
 const rss=await request.get('/henosis/rss.xml');expect(rss.status()).toBe(200);expect((await rss.text()).match(/<item>/g)?.length??0).toBe(graph.nodes.filter((n:{status:string})=>n.status==='publie').length);
 const llms=await request.get('/henosis/llms.txt');expect(await llms.text()).toContain('## Relations');expect(await llms.text()).toContain('a-ecrire');
 expect((await request.get('/henosis/sitemap-index.xml')).status()).toBe(200);expect(await (await request.get('/henosis/404.html')).text()).toContain('Ce fragment');
});
for(const width of [320,390,768,1440])test(`Responsive ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});for(const route of ['','constellation','chambres/machines','fragments','a-propos','oeuvres','lecture']){await page.goto(`/henosis/${route}${route?'/':''}`);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true)}
});

