# HENOSIS : décisions de refonte

## Audit (11 lignes)
1. Le dépôt `SAMIRneo/henosis` est propre, local et distant à `9b96432` avant intervention.
2. Le site actuel et MONO répondent HTTP 200 le 11 octobre 2026.
3. Je garde l’identité Samir / HENOK et le nom HENOSIS.
4. Je garde `veil.webp` comme référence de matière, avec sa signature visible.
5. Je retire le démarrage React et le HTML vide sans JavaScript.
6. Je retire les trois chambres anciennes et les textes personnels non validés.
7. Je retire les deux scènes WebGL indépendantes et les shaders GLSL.
8. Je retire les favoris : ils ne servent pas la démonstration Un / Multiple.
9. Je remplace les liens décoratifs par des relations éditoriales explicites.
10. Je remplace la page unique par Astro, MDX et des routes statiques.
11. Je conserve GitHub Pages et le sous-chemin `/henosis/`.

## Choix

- **Thèse** : aucune phrase personnelle inventée. Le champ réservé est affiché et documenté. « Le multiple. Une forme. » décrit le dispositif, sans prétendre remplacer la thèse de Samir.
- **Six chambres** : Machines / délégation, Marchés / confiance, Pouvoir / décision, Signes / interprétation, Formes / perception, Méthode / preuve. Un fragment peut appartenir à plusieurs chambres : ce sont des tensions, pas des silos.
- **Signature** : chaque éclat représente un fragment réel de la collection, y compris une note explicitement à écrire. Ils forment un fuseau divisé, puis deviennent les nœuds du graphe. Pas de population de particules arbitraire.
- **Relations** : une phrase explique chaque lien. Les relations vers un slug inexistant, les liens réflexifs et les chambres inconnues font échouer le build. Les deux directions d’une relation sont préservées quand elles expriment deux raisons différentes.
- **Contenu** : les six notes sont des consignes précises à Samir, pas des témoignages écrits à sa place. Leur date est la date de préparation éditoriale, pas celle d’une recherche accomplie. Le RSS ne diffuse que les notes validées.
- **Œuvres** : MONO est réel et accessible. Son attribution à Samir est établie par le travail antérieur et le dépôt. Aucune arène ou outil Hermes / Brain OS n’est présenté comme réalisé avant preuve et confirmation.
- **Astro** : npm annonce Astro 7.3.8, mais le brief exige 6.x. Je fixe la dernière stable de la branche demandée, 6.4.8, et MDX 5.0.6 compatible. Les autres versions sont fixes et vérifiées par npm.
- **Palette** : le noir existant et le voile donnent charbon végétal, ivoire, gris sauge et un seul accent laiton. Tokens OKLCH. Pas de couleur différente par chambre.
- **Typographie** : Newsreader variable latin/latin-ext, JetBrains Mono variable latin. Noto Serif grec étendu sert seulement les caractères grecs polytoniques par unicode-range. Deux préchargements de Newsreader (normal et italique). Sous-ensembles français supplémentaires dans src/assets/fonts, avec axes variables et licences conservés.
- **3D** : WebGPURenderer et TSL uniquement. Le renderer est unique, initialisé après le premier rendu et conservé par `transition:persist`. Les animations éditoriales sont GSAP ; Lenis reste une amélioration différée.
- **Modes sobres** : SVG et HTML sont la version complète par défaut. Réduction du mouvement, Save-Data et refus du GPU empêchent le chargement 3D. La lecture simple n’initialise jamais la scène.
- **Références étudiées** : [Bruno Simon](https://bruno-simon.com/) pour un lieu qui porte une action ; [Codrops](https://tympanus.net/codrops/category/tutorials/) pour les techniques de transition ; [Awwwards WebGL](https://www.awwwards.com/websites/webgl/) pour les rapports entre profondeur et lecture. Aucune conduite automobile ni vitrine de cartes reprise.
- **Documentation technique** : [Astro collections](https://docs.astro.build/en/guides/content-collections/), [WebGPURenderer](https://threejs.org/docs/pages/WebGPURenderer.html), [TSL](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language). La skill GLSL consultée sert de contexte ; le brief TSL prévaut sur ses exemples GLSL.

