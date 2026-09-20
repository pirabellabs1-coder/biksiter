# Bike Sitters — brief pour v0

v0 ne peut pas lire le prototype : 600 Ko dans un seul fichier, très au-delà de
ce qu'il accepte. Ce document contient ce qu'il attend — un cadre, puis un
prompt par écran.

**Méthode** : collez d'abord le § 1 dans un nouveau projet v0. Puis, un écran à
la fois, collez le prompt correspondant. Ne demandez jamais plusieurs écrans
d'un coup : v0 les bâcle tous les deux.

---

## 1. À coller en premier — le cadre

```
Je construis Bike Sitters, une application web pour un réseau d'entraide entre
voisins à Bruxelles. Un cycliste confie son vélo quelques heures à un habitant
du quartier, qui le range dans un garage ou une cave fermée. C'est gratuit.

Stack : Next.js App Router, TypeScript, Tailwind, shadcn/ui.
Mobile d'abord — l'écran de référence fait 390 px de large.
Langue de l'interface : français.

Charte, à mettre dans globals.css comme variables CSS :
  --ink: #10231A          texte principal
  --slate: #587065        texte secondaire
  --paper: #F5F6F1        fond de page
  --raised: #FFFFFF       cartes
  --line: #DCE5DD         bordures
  --green: #017628        actions : boutons, liens, focus
  --green-deep: #005B20   survol
  --green-wash: #EAF7EE   bandeaux d'information
  --blue: #1677E8         UNIQUEMENT les vérifications d'identité
  --amber: #C97A12        un vélo actuellement gardé
  --coral: #C0432C        refus, erreur, litige

Typographie : titres en Source Serif 4 (700), texte en Manrope (400/600).
Rayons : 18px pour les cartes, 12px pour les champs et boutons.
Bordures fines, 1px, jamais d'ombre portée marquée.

Trois règles de style à ne pas enfreindre :
1. Le vert porte toutes les actions. Le bleu ne dit qu'une chose : identité
   vérifiée. Si tu emploies le bleu ailleurs, il ne signale plus rien.
2. Aucun dégradé.
3. Le focus clavier est visible : outline 3px vert, offset 2px.
```

---

## 2. Le modèle de données

```
Types principaux, en TypeScript :

type Member = {
  id: string
  firstName: string          // affiché comme « Thomas R. »
  lastName: string           // jamais public
  email: string              // jamais public
  phone: string              // visible seulement pendant une garde acceptée
  city: string
  verified: ('email' | 'phone' | 'identity')[]
  status: 'pending' | 'active' | 'suspended'
  invitesLeft: number        // 3 au départ
}

type Spot = {
  id: string
  ownerId: string
  type: string               // 14 types, voir § 5
  capacity: number
  address: string            // jamais affichée avant acceptation
  approxArea: string         // « à environ 300 m de Bruxelles-Central »
  photos: string[]
  bikeTypes: string[]
  lockable: boolean
  sheltered: boolean
  anchor: boolean
  openDays: number[]         // 0 = dimanche
  openFrom: string           // « 07:30 »
  openTo: string             // « 20:00 »
  maxHours: 1 | 3 | 8 | 24
  status: 'draft' | 'review' | 'published' | 'paused'
}

type Stay = {
  id: string
  cyclistId: string
  hostId: string
  spotId: string
  bikeId: string
  date: string
  from: string               // par quarts d'heure
  to: string
  status: StayStatus
  message?: string
  codes: { dropoff: string; pickup: string }   // 4 chiffres, usage unique
  checks: { dropoff?: Check; pickup?: Check }
}

type StayStatus =
  | 'PENDING' | 'ACCEPTED' | 'ARRIVAL' | 'BIKE_RECEIVED' | 'ACTIVE'
  | 'RETURN_REQUESTED' | 'BIKE_RETURNED' | 'COMPLETED'
  | 'DECLINED' | 'CANCELLED' | 'EXPIRED' | 'DISPUTED'

type Check = {
  state: 'ok' | 'wear' | 'defect' | 'battery'
  note: string
  photos: number             // exactement 2, obligatoires
  by: string
  at: string
}
```

---

## 3. Les écrans, un prompt chacun

### 3.1 Recherche — écran d'accueil connecté

```
Écran d'accueil d'un membre connecté, mobile.

En haut : « Bonjour Lucas » en serif, et dessous en petit gris « Trouvez où
laisser votre vélo ».

Si un vélo est actuellement gardé, un bandeau ambre clair : « Vélo actuellement
stationné · Chez Manoelle V. · 05/09/2026 · 09:00 → 17:00 ».

Puis une carte de recherche sur fond vert très pâle, avec :
- un champ destination avec une icône loupe
- deux champs côte à côte : date + heure de dépôt, date + heure de retour
- une ligne « Filtres · Distance, vélo, sécurité… » avec un bouton rond +
- un bouton vert pleine largeur en pilule : « Chercher un bike sitter »

Les heures se choisissent dans une liste par quarts d'heure, format 24 h.
N'utilise PAS <input type="time"> : il suit la langue du navigateur et
afficherait « 02:00 PM ».

Dessous, « Emplacements récents » : des cartes avec le type de lieu, le prénom
du bike sitter, la capacité, la distance et les vélos acceptés.

Barre d'onglets en bas : Explorer, Carte, Messages, Activité, Profil.
```

### 3.2 Résultats de recherche

```
Liste des emplacements libres sur un créneau, mobile.

En haut, la destination et le créneau choisis, avec un lien « Modifier ».
Puis une rangée de filtres en pastilles avec un compteur : « moins de 500 m 1 »,
« moins de 2 km 2 », « Ville 2 », « Électrique 1 ».

Une carte illustrative avec des cercles verts flous — pas de points précis — et
la mention « Zones approximatives ».

Puis « BIKE SITTERS · 2 disponibles » et les résultats : initiale dans un rond
vert pâle, prénom, note, type de lieu, distance, « à l'intérieur · fermé à clé ·
point d'ancrage », et une pastille verte « 3 places libres ».

Quand il n'y a rien : un message qui explique, et des pistes — élargir l'horaire,
essayer une zone voisine, être prévenu à l'ouverture.
```

### 3.3 Fiche d'un emplacement

```
Fiche d'un emplacement, mobile.

Photo en haut avec un bouton retour en rond blanc et un compteur « 1/1 ».
Titre en serif : « Garage privé fermé ». Dessous, en gris : « à environ 300 m de
Bruxelles-Central ».

Bandeau vert pâle : « Disponible sur votre créneau · 05/09/2026 · 14:00 → 19:00 »
et « 3 places libres sur 3. »

Carte du bike sitter : initiale, prénom « Thomas R. », « Membre depuis 2025 ·
34 gardes », note en étoile à droite, puis des pastilles de vérification —
« E-mail vérifié » et « Identité vérifiée » en BLEU, « Téléphone renseigné » en
gris.

Puis des cartes d'information : Capacité, Distance, Vélos acceptés, Rythme
d'accueil, Disponibilités, Sécurité.

L'adresse exacte n'apparaît PAS. Un encart l'explique : elle est communiquée
après acceptation.

En bas, un bouton vert : « Demander une garde ».
```

### 3.4 Formulaire de demande

```
Formulaire de demande de garde, mobile.

Bandeau vert pâle : « Créneau repris de votre recherche. Vous pouvez encore
l'ajuster. »

Champs : date du dépôt, date du retour, heure du dépôt, heure du retour — tous
en listes déroulantes, jamais en champs natifs.

« Vélo concerné » : des cartes sélectionnables avec la photo, le nom, le type et
la couleur. Celle qui est choisie porte une bordure verte et le mot « Choisi ».

Un champ message facultatif.

Un récapitulatif en lignes : Dépôt, Retour, Durée, Durée acceptée, Places
restantes, et une ligne « Adresse · communiquée après acceptation ».

Les erreurs s'affichent au-dessus du bouton, en corail, et le bouton reste
désactivé tant qu'il en reste. Règles à vérifier :
- une garde dure au moins 1 heure
- on ne demande pas plus de 7 jours à l'avance
- le créneau doit tomber dans les horaires de l'emplacement
- le même vélo ne peut pas être confié à deux endroits au même moment
```

### 3.5 Détail d'une garde

```
Détail d'une garde, mobile, côté cycliste.

En haut, une pastille d'état colorée selon le statut : vert pour « Acceptée »,
ambre pour « Vélo actuellement stationné », corail pour « Litige en cours ».

Carte du bike sitter avec son prénom, sa note, et — seulement si la garde est
acceptée — son adresse exacte et son numéro cliquable.

Un récapitulatif : date, horaire, vélo, type de lieu.

Un déroulé vertical avec une pastille verte par étape : « Demande envoyée ·
hier 21:14 », « Acceptée · hier 21:38 », etc.

Les constats apparaissent quand ils existent : « Constat au dépôt · 09:08 · Bon
état · 2 photos · établi par Manoelle V. »

En bas, les actions possibles selon l'état : « Je suis arrivé », « J'ai récupéré
mon vélo », « Signaler un problème », « Annuler ».
```

### 3.6 Remise par code

```
Écran de remise du vélo, mobile.

Bandeau vert pâle : « Vous remettez le vélo. Lisez ce code à voix haute à
Thomas R. : c'est en le saisissant qu'il confirme la remise, et vous gardez la
trace de ce que vous lui avez confié. »

Au centre, une grande carte blanche avec le code à quatre chiffres en très
gros, espacé, et dessous en petit « Valable 6 heures ».

Un bouton discret « Générer un nouveau code ».

Côté bike sitter, le même écran affiche un champ de saisie à quatre chiffres et
un bouton « Confirmer la remise ». Trois essais, puis un nouveau code est
généré automatiquement.
```

### 3.7 Constat d'état

```
Constat d'état du vélo, mobile.

Bandeau vert pâle : « Ce constat protège les deux parties. Il est horodaté,
visible par vous deux, et ne peut plus être modifié une fois validé. »

AU RETOUR SEULEMENT, une comparaison sur deux colonnes qui restent côte à côte
même sur téléphone :
  gauche  — « Au dépôt · 05/09/2026 », deux vignettes photo, l'état constaté
  droite  — « Au retour · maintenant », deux vignettes, l'état en cours de saisie

Puis « Photos du vélo » : deux emplacements, et un bouton « Ajouter une photo
(0 / 2) ». Les deux photos sont obligatoires.

« État constaté » : quatre pastilles à choisir —
  Bon état, rien à signaler / Traces d'usage habituelles / Défaut visible /
  Batterie inquiétante — gonflée, chaude ou odorante

Un champ note facultatif.

Le bouton « Valider le constat » reste désactivé tant que les deux photos et
l'état manquent. Un message en corail dit ce qui manque.
```

### 3.8 Profil membre

```
Profil d'un membre, mobile.

Avatar rond vert pâle avec l'initiale, prénom « Lucas D. », « Membre depuis
2026 · 12 gardes », et une pastille « Membre ».

Les pastilles de vérification : « E-mail vérifié » et « Identité vérifiée » en
bleu, « Téléphone renseigné » en gris.

Une carte « 1 vélo confié » avec le compteur.

Puis un menu en lignes cliquables : Mes vélos, Mes invitations, Mes alertes,
Mes avis, Nous joindre, Mes vérifications, Paramètres.

Si la personne propose un emplacement, une carte d'accès à son espace bike
sitter apparaît au-dessus du menu.

En bas, discrètement : « Exporter mes données » et « Supprimer mon compte ».
```

### 3.9 Espace bike sitter

```
Espace bike sitter, mobile — distinct du profil de membre.

En haut : « Demandes à traiter » avec le nombre, puis les demandes en attente
avec le prénom du demandeur, le créneau et le délai d'expiration.

« Gardes en cours » : les vélos actuellement accueillis, avec leur jalon.

« Mes emplacements » : les emplacements proposés avec leur état — Publié,
En validation, En pause — et un accès aux disponibilités.

Une carte de statistiques discrète : vélos accueillis, note moyenne par critère
(accueil, communication, qualité du lieu).

Important : les notes affichées ici sont celles reçues COMME BIKE SITTER
uniquement. Ne jamais mélanger avec les notes reçues comme cycliste.
```

### 3.10 Disponibilités d'un emplacement

```
Écran des disponibilités, mobile.

Le nom de l'emplacement et sa zone approximative en haut.

« Jours d'accueil » : sept ronds L M M J V S D, verts quand ils sont actifs.

« Dépôt à partir de » et « Retour jusqu'à » : deux listes d'heures par quarts
d'heure. Une note explique : « Le dépôt et la récupération doivent tomber dans
ces heures. Entre les deux, le vélo reste sur place. »

« Fermetures exceptionnelles » : un calendrier du mois. Les jours ouverts sont
en vert pâle et cliquables, les jours de fermeture habituels sont grisés.

« Durée maximale acceptée » : quatre pastilles — 1 heure, 3 heures, 8 heures,
la journée entière.
```

---

## 4. Les règles à ne pas perdre

v0 les oubliera si vous ne les rappelez pas dans le prompt concerné.

| Règle | Où elle s'applique |
|---|---|
| L'adresse exacte n'apparaît qu'après acceptation | fiche, résultats, détail |
| Le téléphone se referme à la clôture | détail |
| Une garde dure au moins 1 heure | formulaire de demande |
| On ne demande pas plus de 7 jours à l'avance | recherche, formulaire |
| Les heures vont par quarts d'heure, jamais de champ natif | tous les écrans |
| Deux photos obligatoires par constat | constat |
| Les notes de bike sitter et de cycliste ne se mélangent jamais | profils |
| Le bleu ne sert qu'à l'identité vérifiée | partout |
| Un vélo, une garde à la fois | formulaire de demande |

---

## 5. Les quatorze types d'emplacement

Garage privé fermé · Box de garage individuel · Cave privative · Intérieur du
logement · Pièce dédiée · Débarras ou cellier · Local privatif · Abri de jardin
ou remise · Jardin privé clôturé · Cour privée · Terrasse privée · Balcon ou
loggia · Véranda fermée · Autre espace privé

**Jamais acceptés** : local vélo collectif, hall ou couloir commun, cave
commune, parking collectif ouvert, cour ou jardin collectif, autres parties
communes.

---

## 6. Ce que v0 ne fera pas

v0 produit des écrans. Il ne produira ni la logique de capacité, ni la machine
à états, ni les codes à usage unique, ni l'envoi d'e-mails.

**Gardez le prototype comme référence** : il contient ces règles, écrites et
testées. Ouvrez-le à côté de v0 pour vérifier chaque comportement.
