# Bike Sitters

Le site et l’application de l’association. Un réseau d’entraide entre cyclistes
à Bruxelles : des particuliers accueillent gratuitement le vélo de quelqu’un
chez eux, dans un emplacement privé.

Les règles du produit et les conventions de code sont dans [CLAUDE.md](CLAUDE.md).
Ce fichier-ci ne dit que comment faire tourner le projet.

## Démarrer

```bash
npm install
cp .env.example .env.local
docker compose up -d
npm run bd:migrer
npm run bd:semer
npm run dev
```

Le site tourne sur http://localhost:3000.

Sans base de données, le site démarre quand même : les pages éditoriales
fonctionnent, celles qui lisent des emplacements le disent au lieu d’afficher
de fausses données.

### Les comptes semés

`npm run bd:semer` crée quatre membres vérifiés (Thomas, Manoelle, Yanis,
Aïcha), leurs quatre emplacements publiés et deux invitations chacun. Le script
affiche le mot de passe commun et les codes d’invitation, et refuse de tourner
si la table `membre` n’est pas vide.

## Vérifier avant de livrer

```bash
npm run lint && npm run typecheck && npm test
```

Ne pas lancer `npm run build` pendant que `npm run dev` tourne : les deux
écrivent dans `.next` et se marchent dessus. Arrêter le serveur d’abord.

## Organisation

| Dossier | Ce qu’on y trouve |
|---|---|
| `app/` | Les routes, une par dossier. `page.tsx` rend, `actions.ts` valide et écrit, `formulaire.tsx` est la partie client quand il en faut une. |
| `app/systeme.css` | Le système de design en entier : jetons de couleur, typographie, tous les composants. Il n’y a pas d’autre feuille de style. |
| `components/` | Les briques partagées entre plusieurs pages. |
| `lib/regles/` | Les règles métier et les listes fermées. Chaque fichier a son test à côté. Rien de métier ne vit ailleurs. |
| `lib/depot/` | L’accès aux données. Une fonction par question posée à la base ; le SQL ne sort pas de ce dossier. |
| `lib/bd/` | La réserve de connexions et les utilitaires de requête. |
| `lib/securite/` | Hachage des mots de passe (scrypt), jetons de session, codes de remise. |
| `lib/contenu/` | Le texte éditorial et les listes de quartiers. |
| `migrations/` | Le schéma, en SQL, appliqué dans l’ordre des noms de fichiers. |
| `scripts/` | `bd:migrer` et `bd:semer`. |

## Les règles sont écrites deux fois, et c’est voulu

Les règles qui ne se négocient pas vivent à la fois dans `lib/regles/` et dans
le schéma. Une règle qui ne tient que dans le code applicatif tombe dès qu’un
script, une reprise de données ou un second service écrit dans la table.

- **Règle 1 (espace privé)** — la liste des quatorze types est un `CHECK`.
- **Règle 2 (identité avant publication)** — un déclencheur refuse la
  publication d’un emplacement dont le membre n’est pas vérifié.
- **Règle 4 (adresse après acceptation)** — toute lecture publique passe par la
  vue `emplacement_visible`, qui ne contient ni l’adresse ni la position
  exacte. L’adresse n’a qu’une porte de sortie, la fonction
  `adresse_apres_acceptation()`, qui vérifie elle-même l’acceptation.
- **Règle 5 (remise par code)** — quatre chiffres, six heures, trois essais,
  puis régénération.
- **Quota de deux emplacements** — un déclencheur.

## Ce qui n’est pas encore branché

- **Le géocodage.** L’adresse saisie n’est pas convertie en coordonnées : la
  position d’un emplacement est celle du centre de son quartier
  (`lib/contenu/quartiers.ts`). La dégradation va dans le bon sens — elle rend
  la zone plus floue, jamais plus précise.
- **L’envoi d’e-mails.** Rien n’est envoyé : ni confirmation d’inscription, ni
  avis de demande reçue. Les états existent en base, les messages non.
- **Le dépôt de la pièce d’identité.** Il demande un stockage chiffré et une
  file de relecture humaine. La page décrit le parcours, l’envoi n’est pas
  ouvert.
- **L’outil de modération.** `enregistrerLaVerification()` existe dans
  `lib/depot/membres.ts` ; l’écran qui l’appelle n’existe pas. En attendant,
  vérifier un membre se fait en SQL.
- **La Content-Security-Policy.** Les autres en-têtes de sécurité sont posés
  dans `next.config.ts` ; la CSP demande un middleware à nonce et n’a pas été
  bâclée.

## Vérifications qui restent à faire

Le schéma n’a **pas** été exécuté contre un vrai serveur : la machine de
développement n’avait ni Docker ni PostgreSQL. `npm run bd:migrer` sur une base
fraîche est donc la première chose à faire, et le premier endroit où chercher
si quelque chose ne passe pas.

## Valeurs à remplacer avant toute mise en ligne

- `lib/contenu/association.ts` — adresse de contact et numéro d’entreprise sont
  des exemples.
- `lib/contenu/chiffres.ts` — les chiffres du réseau viennent de la maquette,
  ce ne sont pas des mesures.
- `lib/contenu/quartiers.ts` — coordonnées indicatives, à remplacer par un
  géocodage réel.
- `app/conditions-generales/page.tsx` — texte à faire rédiger par un juriste.
