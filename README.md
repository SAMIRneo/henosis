# HENOSIS

**Le territoire personnel de Samir / HENOK. Un esprit, plusieurs mondes.**

Une interface éditoriale et symbolique entre portfolio, carte de connaissances et carnet de recherche. Noir minéral, ivoire, cuivre, photographie et figures de passage. Sans dégradés décoratifs.

## Développement

```sh
npm ci
npm run dev
npm run build
```

React 19, TypeScript, Vite, Three.js chargé à la demande, Lucide. Polices Manrope et Cormorant Garamond auto-hébergées via Fontsource. Déploiement automatique sur GitHub Pages par Actions.

## Contenu

`src/data.ts` rassemble les projets, les cinq domaines et les fragments. Les fragments sont des pistes éditoriales inaugurales, et non des publications scientifiques ou des résultats de recherche. Modifier ce fichier pour enrichir le carnet. Les projets locaux ou en prototype sont explicitement présentés comme tels.

Les illustrations de `public/art` sont issues des références fournies par Samir pour ce site. Les auteurs originaux n'étaient pas renseignés avec ces fichiers. Aucun droit sur ces images n'est revendiqué ni concédé par ce dépôt ; conserver les éventuelles signatures visibles et compléter les attributions lorsque leur provenance est connue.

## Interaction et accessibilité

- Filtres de projets et recherche (Ctrl/⌘ K).
- Constellation interactive avec équivalent textuel et navigation clavier.
- Lecteur de fragments avec fermeture Échap et gestion native du focus par `dialog`.
- Favoris stockés uniquement sur l'appareil ; aucun compte requis.
- Respect de `prefers-reduced-motion` et commande manuelle de suspension.
- Arrêt du rendu 3D hors écran ; absence de WebGL non bloquante.
- Aucun outil de suivi, formulaire factice, serveur ou secret nécessaire.

Site : https://samirneo.github.io/henosis/
