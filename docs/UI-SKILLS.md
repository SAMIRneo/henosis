# UI Skills — HENOSIS

Cette amélioration utilise le routeur [UI Skills](https://github.com/ibelick/ui-skills), CLI `0.2.4`, et trois modules sélectionnés pour ce site :

- [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better/tree/main/skills/make-interfaces-feel-better) : typography, surfaces, icons and interaction polish.
- [better-accessibility](https://github.com/jakubkrehel/skills/tree/main/skills/better-accessibility) : keyboard, focus, accessible names and reduced motion.
- [animate](https://github.com/emilkowalski/skills/tree/main/skills/animate) : restrained motion, transitions, durations and interruption.

## Application

Le système CSS existant reste la base. Les durées et courbes sont centralisées dans `src/style.css`. Les interactions au clavier ont une réponse immédiate ; les changements par pointeur peuvent utiliser une transition. Les images des chambres restent montées pour éviter les redémarrages de chargement et la perte du focus des commandes.

Les overlays utilisent le `dialog` natif. `useDialog` gère le transfert et la restauration du focus, y compris entre recherche et lecture. `useMotion` respecte la préférence système, même lorsqu'une ancienne préférence locale autorisait les animations. La constellation dispose d'une commande de pause adjacente et ne conserve aucune boucle de rendu hors écran.

## Reproduire les contrôles

```sh
npm ci
npm run dev -- --port 5174
```

Dans un deuxième terminal :

```sh
npm run check:ui
npm run ui:skills
```

Les tests utilisent Microsoft Edge en mode headless. `UI_BROWSER_CHANNEL` permet de sélectionner un autre canal Playwright installé, `UI_TEST_URL` une autre URL, et `UI_QA_DIR` le dossier de rapports. Les résultats par défaut se trouvent dans `test-results/ui` et sont exclus de Git.

`node tools/check-motion.mjs` inspecte le changement de chambre au ralenti. Après un déploiement réussi, `node tools/verify-live.mjs` compare les fichiers publics au build local. Les fins de ligne sont normalisées uniquement pour HTML et SVG ; les bundles, polices et images sont comparés octet pour octet.

Les tests automatisés ne remplacent pas une vérification avec un lecteur d'écran ni une campagne sur appareils physiques.
