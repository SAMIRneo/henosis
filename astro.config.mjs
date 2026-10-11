import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
 site:'https://samirneo.github.io',base:'/henosis',trailingSlash:'always',
 integrations:[mdx(),sitemap()],build:{inlineStylesheets:'auto'},
 vite:{build:{sourcemap:true,rollupOptions:{output:{manualChunks(id){
  if(id.includes('/three/'))return 'gpu';
  if(id.includes('/gsap/')||id.includes('/lenis/'))return 'motion';
 }}}}}
});
