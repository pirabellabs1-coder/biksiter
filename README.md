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
# Produire la clé de chiffrement des pièces d’identité et la coller
# dans .env.local sous CLE_DES_PIECES :
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
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

**Thomas modère.** Connectez-vous avec lui pour voir `/moderation` : sans au
moins une personne qui relit les pièces, la règle 2 bloque tout le monde.

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
| `lib/courriel/` | Les modèles de messages. |
| `lib/envois/` | La file d’attente sortante, courriels et SMS. |
| `migrations/` | Le schéma, en SQL, appliqué dans l’ordre des noms de fichiers. |
| `scripts/` | `bd:migrer`, `bd:semer`, `bd:messages` et `bd:purger`. |

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
npm run bd:messages
```

La même file porte les SMS. Sans `SMTP_URL` (ou sans `SMS_URL`), le script
affiche les messages en attente sur ce canal au lieu de les
expédier, et ne les marque pas comme envoyés — on relit ce qu’on écrit sans
déranger personne.

Les messages sont en texte brut : pas de HTML, donc pas de pixel de suivi et
rien qui casse chez un destinataire sur trois. Une association qui demande à
des gens d’ouvrir leur porte n’a pas besoin de savoir qui a ouvert son courrier.

## La pièce d’identité

Le document est chiffré (AES-256-GCM) avant de toucher la base : la clé vit
dans l’environnement, donc qui repart avec une sauvegarde repart avec des
octets illisibles. Sans `CLE_DES_PIECES`, le dépôt est **fermé** — on ne stocke
pas une pièce en clair en attendant que quelqu’un configure la clé.

Le site promet que le document est supprimé dès la vérification, et au plus
tard après sept jours même si personne ne l’a regardé. Une promesse écrite sur
un site doit avoir un exécutant : c’est `lib/regles/pieces.ts` pour la règle,
la transaction de modération pour la suppression immédiate, et `npm run
bd:purger` pour le filet de sécurité — à lancer une fois par jour.

Le document n’est servi qu’à un modérateur, par une route qui répond 404 à tout
le monde d’autre (un « accès refusé » confirmerait que ce membre a déposé une
pièce), sans cache et sous une CSP qui n’autorise rien à s’exécuter.

## La modération

`/moderation` liste les pièces à relire, les candidatures d’emplacement et le
journal des décisions. Un membre non modérateur est renvoyé sur son compte.

Un refus se motive — la contrainte est dans la base, pas seulement dans le
formulaire. Le motif part au membre, qui peut redéposer une pièce sans limite
de tentatives.

Le journal survit au document : on garde ce qui a été décidé et pourquoi,
jamais la pièce qui l’a fondé. C’est ce que promettent les conditions
générales.

Un modérateur se pose à la main, jamais depuis l’application :

```sql
update membre set moderateur = true where email = 'quelqu-un@exemple.be';
```

## La Content-Security-Policy

Elle vit dans `middleware.ts` et autorise les scripts par un nonce qui change à
chaque requête — pas d’`unsafe-inline` en production.

**Conséquence assumée : tout le site est rendu à la requête.** Une page
prérendue à la compilation ne peut pas porter un nonce ; elle partirait avec
tous ses scripts bloqués. Le choix était entre garder une dizaine de pages
éditoriales statiques et affaiblir la politique pour tout le monde, ou rendre à
la requête et garder une politique stricte partout. Ces pages ne touchent pas
la base et coûtent quelques millisecondes.

## Corriger, mettre en pause, retirer

Trois gestes distincts, et la distinction compte.

**Corriger** ne touche pas aux stationnements déjà acceptés : le bike sitter
s’est engagé, le cycliste s’est organisé. La seule chose qu’on refuse est de
descendre la capacité sous ce qui a déjà été promis — la règle est dans
`lib/regles/capacite.ts` et vérifiée dans la transaction, contre les créneaux
acceptés.

**Mettre en pause** dépublie : l’emplacement disparaît de la carte, ne reçoit
plus de demande, et laisse vivre ce qui est déjà convenu. C’est ce qu’on
propose à quelqu’un qui part en vacances, et c’est réversible.

**Retirer** efface, y compris les stationnements passés de cet emplacement —
c’est dit au membre, qui doit le confirmer. Le retrait est refusé tant qu’un
stationnement est en cours, accepté, ou en attente de réponse : le vélo est
physiquement là, ou quelqu’un attend qu’on lui réponde.

L’adresse exacte apparaît dans le formulaire de correction, et c’est normal :
la règle 4 protège l’adresse des autres membres, pas de celui qui l’a saisie.

## Le téléphone

Un code à six chiffres par SMS, valable dix minutes, trois essais. On garde
l’empreinte du code et non le code : dix minutes suffisent pour qu’une fuite
serve à quelqu’un, et on n’a jamais besoin de le relire.

Seuls les mobiles belges sont acceptés — un code envoyé sur une ligne fixe
n’arrive nulle part, et mieux vaut le dire à la saisie que laisser quelqu’un
attendre. Les six façons d’écrire un numéro belge sont toutes reconnues.

C’est le seul usage du SMS dans ce produit. Les rappels passent par courriel :
le coût par message en Belgique rend le reste déraisonnable.

## Les échanges

Ce qui remplace le chat en temps réel, écarté parce qu’il crée une attente de
réponse que des bénévoles ne tiennent pas. Un message s’écrit sur la page du
stationnement et part par courriel.

Pas d’accusé de lecture, pas de compteur de messages non lus, pas d’heure de
dernière connexion, pas d’indicateur de saisie. Rien qui permette de reprocher
à quelqu’un d’avoir répondu le lendemain.

On peut écrire dès la demande — un bike sitter a souvent une question avant
d’accepter — et jusqu’après la reprise. Un refus ou une annulation referment le
fil : laisser un fil ouvert sur un refus, c’est inviter à le contester.

## Les dons

Par virement, pas par carte. Un prestataire de paiement prend deux à trois pour
cent de chaque don ; sur les petits montants qui font vivre une association,
c’est un mois de fonctionnement par an. Un virement ne prend rien.

Le formulaire ne fait qu’une chose : produire une communication structurée au
format belge — dix chiffres et deux de contrôle, modulo 97 — que la banque du
donateur sait recopier et qui permet de rapprocher le versement. Tout y est
facultatif, y compris le montant : un don anonyme reste un don, et demander une
identité pour en accepter un serait une façon de classer les gens.

**Aucune donnée bancaire ne passe par ce site, et il ne faut pas en ajouter.**

## Ce qui n’est pas encore branché

- **L’envoi réel des SMS.** La file existe et le code y est déposé ; il manque
  un contrat chez un opérateur et l’adresse de sa passerelle (`SMS_URL`). Sans
  elle, `npm run bd:messages` affiche le SMS au lieu de l’expédier.

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
- `lib/contenu/association.ts` — l’IBAN aussi : un IBAN faux fait partir un don
  chez quelqu’un d’autre.
- `app/conditions-generales/page.tsx` — texte à faire rédiger par un juriste.
