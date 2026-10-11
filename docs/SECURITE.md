# Dépendances et portée du déploiement

État du 11 octobre 2026. Astro 6.4.8 est conservé conformément au brief. La dernière branche disponible est Astro 7. Les avis npm ne sont pas déclarés résolus par le seul fait d’utiliser un site statique.

- Sharp est forcé à **0.35.5** : l’avis [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2) décrit le traitement d’AVIF malveillants et situe la correction de sa bibliothèque à Sharp 0.35.4. Le site traite seulement le WebP local fourni ; il n’accepte pas de téléversement ni d’URL d’image distante.
- esbuild est forcé à **0.28.2** ; le serveur de développement est lié à `127.0.0.1`.
- Les avis Astro liés aux noms d’attributs étalés et aux propriétés de transitions restent signalés sur cette version. Aucun nom d’attribut ou directive de transition ne vient d’une entrée visiteur. Les textes du graphe sont affectés via `textContent`, et les données JSON sont protégées contre la fermeture d’une balise script.
- GitHub Pages sert uniquement le répertoire `dist`. Il n’exécute ni serveur Astro, ni optimisation d’image à la demande, ni route authentifiée. Les contrôles de base sur des routes serveur ne constituent donc pas une protection utilisée ici.
- Les dépendances Lighthouse CI comportent aussi des avis de développement. Leurs bibliothèques Node ne sont pas servies aux visiteurs.

`docs/AUDIT-PRODUCTION.json` conserve le résultat npm brut. Il continue d’associer les avis Astro à la version 6 même après les overrides. Pour supprimer les avis de version restant, une migration vers la branche Astro corrigée est nécessaire. Elle n’est pas faite implicitement contre l’exigence 6.x.
