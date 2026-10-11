import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:30000,workers:1,use:{baseURL:process.env.HENOSIS_ORIGIN||'http://127.0.0.1:4322',channel:process.env.HENOSIS_BROWSER||'msedge',headless:true},reporter:[['list'],['json',{outputFile:(process.env.HENOSIS_OUTPUT||'work/qa')+'/playwright.json'}]]});
