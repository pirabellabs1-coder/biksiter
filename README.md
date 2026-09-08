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
| `lib/geocodage/` | La transformation d’une adresse en coordonnées. |
| `lib/courriel/` | Les modèles de messages et la file d’attente sortante. |
| `migrations/` | Le schéma, en SQL, appliqué dans l’ordre des noms de fichiers. |
| `scripts/` | `bd:migrer`, `bd:semer` et `bd:courriels`. |

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

## Le géocodage

L’adresse d’un emplacement est transformée en coordonnées par Nominatim
(OpenStreetMap) au moment de la création. Une adresse hors de la région
bruxelloise est refusée — c’est une règle, testée dans
`lib/regles/territoire.ts`. Si le service ne répond pas ou ne trouve rien,
l’emplacement est créé quand même avec le centre du quartier : la zone devient
plus floue, jamais plus précise, et un géocodeur en panne ne bloque pas un bike
sitter.

**Vie privée.** Géocoder envoie l’adresse du domicile d’un membre à un tiers.
C’est le seul moment où elle sort de nos serveurs. `GEOCODEUR_URL` permet de
pointer vers une instance Nominatim auto-hébergée et de n’envoyer l’adresse à
personne ; seule l’adresse est transmise, jamais le nom ni l’e-mail.

## Les courriels

Rien n’est envoyé depuis une requête web. Un message est écrit dans la table
`courriel` **dans la même transaction** que le changement qu’il annonce : il ne
peut donc ni parler d’un stationnement qui n’a pas été enregistré, ni se perdre
parce que le serveur de messagerie redémarrait. Un script draine la file :

```bash
npm run bd:courriels
```

Sans `SMTP_URL`, le script affiche les messages en attente au lieu de les
expédier, et ne les marque pas comme envoyés — on relit ce qu’on écrit sans
déranger personne.

Les messages sont en texte brut : pas de HTML, donc pas de pixel de suivi et
rien qui casse chez un destinataire sur trois. Une association qui demande à
des gens d’ouvrir leur porte n’a pas besoin de savoir qui a ouvert son courrier.

## Ce qui n’est pas encore branché

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

Le géocodage, lui, a été vérifié contre le vrai service. Ces vérifications
appellent le réseau et ne tournent donc que sur demande, pour qu’une coupure
chez OpenStreetMap ne fasse pas échouer la suite de quelqu’un qui travaille sur
autre chose :

```bash
VERIFIER_LE_GEOCODAGE=1 npm test
```

## Valeurs à remplacer avant toute mise en ligne

- `lib/contenu/association.ts` — adresse de contact et numéro d’entreprise sont
  des exemples.
- `lib/contenu/chiffres.ts` — les chiffres du réseau viennent de la maquette,
  ce ne sont pas des mesures.
- `lib/contenu/quartiers.ts` — coordonnées indicatives des centres de quartier.
  Elles ne servent plus qu’au repli quand le géocodage échoue.
- `app/conditions-generales/page.tsx` — texte à faire rédiger par un juriste.
