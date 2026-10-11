# Vérifications typographiques

Les sous-ensembles Fontsource sont reconstruits par `tools/subset-fonts.py` (fonttools 4.66.1, brotli 1.2.0). Les glyphes français et les axes variables wght sont vérifiés avant sauvegarde. Newsreader normal : 40 108 octets ; italique : 44 984 octets ; JetBrains Mono : 32 968 octets.

Les fichiers et leurs licences sont dans `src/assets/fonts`. Le CSS les limite par unicode-range. Les polices Newsreader de titres sont les deux seuls préchargements. Noto Serif grec et grec étendu prennent seulement les plages U+0370–03FF et U+1F00–1FFF. Le français conserve notamment œ et É. Le grec polytonique ἕνωσις est vérifié visuellement et via la table cmap de Noto.

Les mentions techniques ont été relevées à 12 px sur mobile. Les chiffres du graphe ont un équivalent textuel complet ; les étiquettes SVG constituent un repérage supplémentaire.
