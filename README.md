# HENOSIS

**Le territoire personnel de Samir / HENOK.**

Une interface éditoriale et symbolique entre territoire personnel, carte de connaissances et carnet de réflexion. Noir minéral, ivoire, cuivre, photographie et figures de passage.

## Développement

```sh
npm ci
npm run dev
npm run build
```

React 19, TypeScript, Vite, Three.js chargé à la demande, Lucide. Polices Manrope et Cormorant Garamond auto-hébergées via Fontsource. Déploiement automatique sur GitHub Pages par Actions.

## Contenu

`src/data.ts` rassemble trois chambres, cinq domaines, trois horizons et six fragments. Les fragments sont des pistes éditoriales, et non des résultats de recherche. Les horizons sont des intentions de création. La version actuelle se concentre sur Samir / HENOK et ne présente aucun projet ni site GitHub.

Les illustrations de `public/art` sont issues des références fournies par Samir pour ce site. Les auteurs originaux n'étaient pas renseignés avec ces fichiers. Aucun droit sur ces images n'est revendiqué ni concédé par ce dépôt ; conserver les éventuelles signatures visibles et compléter les attributions lorsque leur provenance est connue.

## Interaction et accessibilité

- Chambres : onglets accessibles avec flèches gauche/droite, Home et End ; navigation précédente/suivante.
- Recherche des domaines et fragments (Ctrl/⌘ K), insensible aux accents.
- Constellation interactive avec contenu textuel et navigation clavier.
- Lecteur de fragments avec fermeture Échap, navigation précédente/suivante et gestion native du focus par `dialog`.
- Favoris filtrables et préférence de mouvement stockés uniquement sur l'appareil.
- Respect initial de `prefers-reduced-motion` ; suspension manuelle.
- Repérage de la section active et indicateur de progression.
- Arrêt du rendu 3D hors écran ; absence de WebGL non bloquante.
- Aucun outil de suivi, compte, formulaire ou serveur.

Site : https://samirneo.github.io/henosis/

## UI Skills

L’interface a été affinée avec UI Skills : texte plus lisible, boutons mobiles de 44 px, menu natif, restauration du focus, transitions interruptibles et contrôle du rendu 3D hors écran. [Consignes et contrôles](docs/UI-SKILLS.md).

```sh
npm run ui:skills
npm run check:ui
```

Les tests d’interface nécessitent le serveur local sur le port 5174 et un navigateur Playwright installé. Les variables de configuration sont détaillées dans la documentation.
