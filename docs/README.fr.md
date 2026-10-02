# Agent Black Box

**Votre agent IA a échoué. Comprenez ce qui s'est passé.**

Un outil local pour examiner les sessions d'agents de programmation. Cette première version importe des journaux Claude Code JSONL et un format JSON normalisé.

[Télécharger v0.1.0](https://github.com/HafidIdrissi/agent-black-box/releases/tag/v0.1.0) · [Voir la démo de 30 secondes](https://github.com/HafidIdrissi/agent-black-box/releases/download/v0.1.0/agent-black-box-demo.mp4) · [Huit premières contributions](first-contribution.md#eight-places-to-start) · [Textes pour présenter le projet](launch.md)

La démo montre six vues réelles de l’application avec un journal fictif : import, appels répétés, erreur de permission et export du rapport.

## Démarrage

Node.js 22 ou plus récent suffit. Après avoir cloné le dépôt et ouvert son dossier :

```sh
npm start
```

Ouvrez http://127.0.0.1:8787/web/ puis choisissez **Explore a failed run**. L'interface est actuellement en anglais. Aucun compte, aucune clé API et aucune installation de dépendance ne sont nécessaires.

Vous pouvez rechercher les événements, filtrer les outils et les erreurs, repérer des appels identiques répétés et exporter un rapport HTML autonome.

## Ligne de commande

```sh
node bin/agent-black-box.mjs analyze examples/permission-loop.jsonl --format html --output demo-report.html
npm run check
npm test
```

Les fichiers importés restent dans la mémoire du navigateur. Le masquage des données sensibles est indicatif : vérifiez toujours le contenu avant de le partager. Limites actuelles : 10 Mio et 20 000 événements.

## Participer

Consultez le [guide de contribution](../CONTRIBUTING.md), le [premier parcours](first-contribution.md) et les [120 propositions](backlog.md). Les tâches ont des critères de réussite et des dépendances explicites. Documentation, tests, accessibilité et retours reproductibles sont utiles.

Le projet est sous [licence MIT](../LICENSE).
