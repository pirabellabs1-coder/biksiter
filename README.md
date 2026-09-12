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

## Deux enveloppes, deux groupes de routes

`app/` est coupé en deux, et les parenthèses ne changent rien aux adresses :

- **`app/(site)/`** — le site public. En-tête de marque, grand pied de page,
  pages qui se lisent. C'est là que vivent l'accueil, la recherche, la FAQ,
  l'inscription et le catalogue.
- **`app/(espace)/`** — l'espace du membre. Une colonne de navigation qui reste
  à l'écran, pas de pied de page, un contenu qui défile seul. Tableau de bord,
  stationnements, emplacements, profil, modération.

`app/layout.tsx` ne pose plus que le document : chaque groupe a son enveloppe.
`app/not-found.tsx` reste à la racine — c'est elle que Next rend pour une
adresse qui ne correspond à rien — et porte donc l'enveloppe publique
elle-même.

### Les primitives de l'espace

| Classe | Ce qu'elle fait |
|---|---|
| `.espace` / `.rail` | La coque et sa colonne de navigation. |
| `.entete-de-page` | Surtitre, titre, phrase, actions. La même sur chaque écran. |
| `.tuiles` / `.tuile` | Les chiffres en tête d'écran. |
| `.panneau` | Un bloc à en-tête, corps et pied. |
| `.lignes` / `.ligne` | Une liste d'objets, avec état et actions à droite. |
| `.a-faire` | Ce qui attend une réponse, en tête du tableau de bord. |
| `.vide` | Un panneau vide qui dit pourquoi il l'est. |

**Ce qui n'est pas dans la navigation** : aucun compteur de gardes réussies,
aucun classement, aucun palmarès. Les compteurs du rail disent ce qui attend
quelqu'un, jamais ce que quelqu'un a accompli (règle 3).

**L'ambre est réservé à une seule chose** : un vélo actuellement gardé. Une
demande sans réponse n'est pas un vélo gardé — son compteur est donc neutre et
contrasté, pas ambre. Et une identité en cours de vérification n'est ni un
refus ni une erreur : elle n'est pas rouge.

## L'administration

`/administration` est réservée aux modérateurs, comme `/moderation` : un membre
ordinaire y est renvoyé vers son tableau de bord, et les deux entrées
n'apparaissent pas dans sa colonne de navigation. Vérifié en retirant puis en
rendant le drapeau `moderateur` en base.

L'écran répond à une question par panneau :

- **L'état du réseau** — membres vérifiés, emplacements publiés, quartiers
  ouverts, gardes en cours et terminées, liste d'attente.
- **Où ouvrir ensuite** — la liste d'attente par quartier, classée par bike
  sitters. Le seuil vit dans `lib/regles/ouverture.ts`, il est testé, et il se
  change sur une ligne : `BIKE_SITTERS_POUR_OUVRIR = 5`.
- **La file d'envoi** — c'est le seul organe qui peut tomber en panne sans que
  rien ne casse à l'écran : les messages s'empilent, et quelqu'un attend devant
  une porte l'adresse qu'il n'a jamais reçue. D'où le compteur d'attente en
  heures.
- **Le catalogue et les dons** — des nombres, rien de plus.

### Ce que l'administration ne voit pas

`lib/depot/administration.ts` ne sélectionne, nulle part :

- **aucune adresse** — la règle 4 ne fait pas d'exception pour les
  administrateurs ; une adresse ne sort que par `adresse_apres_acceptation()` ;
- **aucun corps de message** — la file se compte, elle ne se lit pas, parce
  qu'un message d'acceptation contient exactement l'adresse que le reste du
  produit protège ;
- **aucun donateur** — des annonces et une somme, jamais un prénom ;
- **aucun classement de membres** (règle 3). Le seul tri du fichier porte sur
  des quartiers : un quartier n'est pas quelqu'un.

Vérifié sur la page servie : ni les adresses de la base, ni les adresses e-mail
de la liste d'attente, ni celle du message en échec n'y apparaissent.

## Le système de design

Il tient toujours dans `app/systeme.css`. Les primitives écrites pour la page
d'accueil sont volontairement génériques, parce qu'elles serviront aussi aux
tableaux de bord :

| Classe | Ce qu'elle fait |
|---|---|
| `.section` / `.section--claire` | Une bande pleine largeur. Le rythme vertical vient de l'alternance des deux fonds, jamais d'une teinte. |
| `.section__interieur` | Recentre le contenu sur `--largeur-page`. |
| `.entete-de-section` | Surtitre, titre, chapeau. Variante `--centree`. |
| `.parcours` | Une suite d'étapes numérotées reliées par un trait. |
| `.bandeau` | L'ouverture des pages intérieures : le fond de l'accueil, le propos à gauche, un dessin à droite. |
| `.colonnes-editoriales` | Une section en deux colonnes : le titre, qui reste à l'écran, puis le détail. |
| `.appel` | La bande qui ferme une page, avec ses deux boutons. |
| `.carte--illustree` / `.carte--profil` | Les deux formes de carte de la page. |
| `.apparait` | L'apparition au défilement. |

**Le mouvement n'utilise pas de JavaScript.** Il est porté par
`animation-timeline: view()` et `scroll()`, sous un double garde-fou :
`@media (prefers-reduced-motion: no-preference)` et `@supports`. Là où le
navigateur ne sait pas faire, le contenu est simplement là — et comme
`opacity: 0` ne vit que dans l'image-clé et jamais dans la règle de base,
aucun contenu ne peut rester invisible si l'animation ne se déclenche pas.

C'est aussi ce qui évite d'avoir à autoriser un script de plus dans la
Content-Security-Policy.

## La recherche par créneau

La barre de recherche de l'accueil envoie une destination, un jour et deux
heures à `/emplacements`, qui filtre pour de vrai : un emplacement dont les
stationnements acceptés atteignent la capacité sur le créneau demandé n'est pas
affiché, marge de trente minutes comprise.

La règle est donc écrite deux fois, comme les autres : `laPlaceEstLibre` dans
`lib/regles/capacite.ts`, et la même chose en SQL dans `emplacementsPublies`.

Deux listes vides différentes en découlent, et elles ne disent pas la même
chose : « ce quartier n'est pas encore ouvert » envoie sur la liste d'attente,
« rien de libre sur ce créneau » propose de changer d'heure.

## Les chiffres affichés

Aucun chiffre du site n’est saisi à la main. `lib/depot/chiffres.ts` les compte
dans la base, `lib/regles/chiffres.ts` décide de ce qui s’affiche, et la règle
tient en deux points : **un chiffre à zéro ne s’affiche pas**, et rien n’est
arrondi ni précédé d’un « plus de ». Un réseau qui n’a encore rien fait ne
montre donc pas de bandeau du tout, plutôt que trois zéros alignés.

Ce qui a été écarté : « aucun vélo volé pendant une garde », qui figurait sur la
maquette. Rien dans le produit n’enregistre d’incident, donc personne ici ne
peut l’affirmer. La phrase pourra revenir le jour où une déclaration d’incident
existera — avec le compteur derrière.

Même logique pour les témoignages de la page d’accueil : ce sont les deux
derniers avis réellement écrits, les plus récents et non les meilleurs (règle
3). Tant qu’il n’y en a aucun, la page le dit.

## Ce qui n’est pas encore branché

- **L’envoi réel des SMS.** La file existe et le code y est déposé ; il manque
  un contrat chez un opérateur et l’adresse de sa passerelle (`SMS_URL`). Sans
  elle, `npm run bd:messages` affiche le SMS au lieu de l’expédier.

## Ce qui a été vérifié, et comment

Le schéma a été appliqué sur un vrai PostgreSQL 16 avec PostGIS 3.4, et les
contraintes ont été mises à l’épreuve une par une : un emplacement publié par
un membre non vérifié est refusé par le déclencheur de la règle 2, un troisième
emplacement par le même membre est refusé par le quota, et la vue
`emplacement_visible` ne rend jamais autre chose qu’un point posé sur la maille
de cinq cents mètres.

Le géocodage, lui, a été vérifié contre le vrai service. Ces vérifications
appellent le réseau et ne tournent donc que sur demande, pour qu’une coupure
chez OpenStreetMap ne fasse pas échouer la suite de quelqu’un qui travaille sur
autre chose :

```bash
VERIFIER_LE_GEOCODAGE=1 npm test
```

## Ce qui n’existe pas encore ne s’affiche pas

L’ASBL n’est pas constituée. Plutôt que d’afficher un numéro d’entreprise de
zéros et un IBAN de démonstration, `lib/contenu/association.ts` porte `null`
pour les trois valeurs qui n’existent pas — contact, numéro d’entreprise,
IBAN — et le site s’adapte :

| Ce qui est `null` | Ce que le site fait |
|---|---|
| `contact` | Pas de bouton « Nous écrire », pas d’adresse au pied de page ; les courriels invitent à répondre au message. |
| `numeroDEntreprise` | Le pied de page et la page « Qui sommes-nous » disent « en cours de constitution ». |
| `iban` | Les dons sont fermés : la page l’explique, et l’action serveur refuse aussi (`lesDonsSontOuverts`). |

C’est une décision, pas un provisoire mal fini : un numéro d’entreprise de
façade au bas de chaque page ferait perdre à l’association exactement ce
qu’elle demande par ailleurs, et un IBAN faux ferait partir un don chez
quelqu’un d’autre.

**Pour rouvrir tout cela, il suffit de remplacer les trois `null`** par les
vraies valeurs dans `lib/contenu/association.ts`. Rien d’autre à modifier.

Un test garantit qu’aucun message ne peut partir avec l’un de ces trous
dedans : `lib/courriel/modeles.test.ts` refuse « null », « undefined » et
« 0000 » dans le corps de tous les messages.

## Les écrans portés depuis la maquette

Quatre écrans ont été maquettés avec Google Stitch, et portés ici structure par
structure. Le texte a été revu — vocabulaire, chiffres réels, contraintes du
produit — mais la disposition est celle de la maquette.

| Écran | Ce qui en vient |
|---|---|
| Accueil | Le panneau vert plein « ce qui rend serein d'ouvrir sa porte » |
| Recherche | Les filtres en pilules, les cartes d'emplacement, la jauge de mobilisation d'un quartier |
| Fiche | La galerie qui défile, l'en-tête à jetons, le mot d'accueil, les créneaux ligne par ligne, le périmètre, les récits |
| Mes stationnements | Le code de remise en tuiles, le fil d'échanges en bulles |

**Les filtres de la recherche sont des adresses, pas des cases à cocher.** Ils
se partagent, se mettent en favori et reviennent avec le bouton « précédent »,
sans une ligne de script.

**La frise horizontale a disparu.** Elle se lisait d'un coup d'œil mais ne se
lisait qu'à l'œil : les heures y étaient minuscules et rien n'y était
énonçable. `components/creneaux-du-jour.tsx` dit « 08h30 à 13h00, complet » en
toutes lettres, et nomme le battement de trente minutes plutôt que de le
laisser passer pour un trou.

**Ce qui n'a pas été porté** : les photographies de personnes générées, les
chiffres inventés, et le vert des zones cartographiques — une zone d'accueil
n'est ni une action ni un état confirmé, elle reste grise.

### Regarder l'écran de modération

Il n'existe que s'il y a un document à relire, et déposer un vrai document sur
un poste de développement serait exactement ce qu'il ne faut pas faire :

```bash
npm run bd:piece -- <uuid du membre>
```

L'image générée dit en toutes lettres qu'elle n'est pas une pièce d'identité.
Elle est chiffrée par le même chemin que le dépôt réel.

## L'en-tête et le pied de page

Les deux sont verts et encadrent la page comme une reliure encadre un livre.
C'est une **surface de marque, pas un signal** : rien ne s'y clique parce que
c'est vert, et les actions qui s'y trouvent se distinguent par leur forme
pleine et claire, exactement comme partout ailleurs. Le bouton principal s'y
inverse — clair sur fond vert — pour rester le seul élément plein de la barre.

Les jetons `--marque-fond` et `--marque-encre*` ne servent qu'à ces deux
surfaces, à la console d'administration et au panneau de rassurance de
l'accueil. Contrastes mesurés sur `#12291f` : blanc 15,4 : 1, texte adouci
9,3 : 1, étiquettes 5,6 : 1.

Le logo prend la couleur du texte qui l'entoure (`currentColor`) : il vit sur
deux fonds, et un vert écrit en dur disparaîtrait sur le second.

**La navigation ne se replie jamais sur deux lignes, elle défile.** Un menu qui
change de hauteur selon la largeur fait sauter tout ce qui est en dessous, et
une barre d'en-tête doit garder la même hauteur.

## Les couleurs

| Couleur | Sens | Où |
|---|---|---|
| Vert sapin **plein** | Action — ce qu'on clique, et la marque | boutons, liens |
| Vert clair **teinté** | Confirmé | identité vérifiée, demande acceptée, vélo gardé, emplacement libre |
| Ambre | En attente d'une réponse | demande sans réponse, maillon retenu |
| Rosé | Refusé, annulé, erreur | refus, désistement, messages d'erreur |

La teinte dit le sens, le remplissage dit s'il y a quelque chose à cliquer :
un rectangle vert foncé plein est un bouton, une pilule vert clair est un état.
C'est ce qui permet à l'action et au « confirmé » de partager une famille sans
se confondre.

**Une pastille d'état porte toujours une puce colorée en plus de sa teinte.**
Entre l'ambre et le vert clair, la teinte seule ne suffit pas à tout le monde ;
avec la puce, le mot et la position, la couleur devient facultative.

La palette, les deux familles typographiques (Plus Jakarta Sans / Inter), les
rayons et les ombres viennent d'un maquettage fait avec Google Stitch, dont
l'export est resté hors du dépôt (`stich/`, ignoré par git).

**Les illustrations font exception, et c'est tenu.** Elles ont leurs propres
jetons `--dessin-*`, qui ne servent que dans `.illustration`. Un dessin ne
porte aucune information : sa couleur ne peut donc pas se tromper de sens. Si
l'un de ces jetons apparaît un jour sur un bouton ou une pastille, c'est une
erreur.

**Le site est clair, chez tout le monde.** `color-scheme: light`, et il n'y a
pas de mode sombre. Il y en a eu un, gardé en réserve sans être branché : un
thème qu'aucun réglage n'active et que personne ne relit finit toujours par
diverger du thème réel, et il a été retiré plutôt que laissé vieillir.

## Les images du site

Il n’y a pas de photographies, et `components/illustration.tsx` explique
pourquoi : une photo de banque d’images montrerait le garage de quelqu’un qui
n’est pas membre. Les dessins prolongent le trait des pictogrammes, sont gris
pour la même raison que la figure cartographique (règle 6), et disparaîtront le
jour où des membres nous confieront leurs propres photos.

## Valeurs à remplacer avant toute mise en ligne

- `lib/contenu/quartiers.ts` — coordonnées indicatives des centres de quartier.
  Elles ne servent plus qu’au repli quand le géocodage échoue.
- `app/conditions-generales/page.tsx` — texte à faire rédiger par un juriste.
