# Bike Sitters

Le site de l’association. Un réseau d’entraide entre cyclistes à Bruxelles : des
particuliers accueillent gratuitement le vélo de quelqu’un chez eux, dans un
emplacement privé.

Les règles du produit et les conventions de code sont dans [CLAUDE.md](CLAUDE.md).
Ce fichier-ci ne dit que comment faire tourner le projet.

## Démarrer

```bash
npm install
npm run dev
```

Le site tourne sur http://localhost:3000.

## Vérifier avant de livrer

```bash
npm run lint && npm run typecheck && npm test
```

Ne pas lancer `npm run build` pendant que `npm run dev` tourne : les deux
écrivent dans `.next` et se marchent dessus. Arrêter le serveur d’abord.

## Organisation

| Dossier | Ce qu’on y trouve |
|---|---|
| `app/` | Les routes, une par dossier. `page.tsx` rend, `actions.ts` valide, `formulaire.tsx` est la partie client quand il en faut une. |
| `app/systeme.css` | Le système de design en entier : jetons de couleur, typographie, tous les composants. Il n’y a pas d’autre feuille de style. |
| `components/` | Les briques partagées entre plusieurs pages. |
| `lib/regles/` | Les règles métier et les listes fermées. Chaque fichier a son test à côté. Rien de métier ne vit ailleurs. |
| `lib/contenu/` | Le texte éditorial : navigation, questions fréquentes, mentions de l’association. |
| `lib/donnees/` | Les données de démonstration, en attendant PostgreSQL. |

## Ce qui n’est pas encore branché

- **La persistance.** Les formulaires valident réellement leurs entrées, mais
  aucune donnée n’est écrite : le schéma PostgreSQL / PostGIS n’existe pas. Les
  points de raccordement sont marqués `TODO(persistance)` dans les
  `actions.ts`, et le message rendu au membre dit qu’il ne s’est rien passé.
- **L’authentification.** `lib/session.ts` renvoie toujours un visiteur dont
  l’identité n’est pas vérifiée. C’est volontairement le cas le plus fermé :
  demander un stationnement et publier un emplacement sont donc refusés.
- **La cartographie.** Les zones affichées sont des taches décoratives. Le
  composant `ZoneApproximative` ne sait recevoir que des zones, jamais un point
  d’adresse — c’est cette signature qu’il faut garder quand une vraie carte
  arrivera.
- **La Content-Security-Policy.** Les autres en-têtes de sécurité sont posés
  dans `next.config.ts` ; la CSP demande un middleware à nonce et n’a pas été
  bâclée.

## Valeurs à remplacer avant toute mise en ligne

- `lib/contenu/association.ts` — adresse de contact et numéro d’entreprise sont
  des exemples.
- `lib/contenu/chiffres.ts` — les chiffres du réseau viennent de la maquette,
  ce ne sont pas des mesures.
- `app/conditions-generales/page.tsx` — texte à faire rédiger par un juriste.
