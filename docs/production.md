# Mise en production

Ce que fait ce document : la suite exacte pour brancher la plateforme sur une
base Postgres hébergée (Supabase, Neon ou équivalent en Union européenne) et
publier sur Vercel. Rien d'exotique — l'application est un Next.js 15 branché
sur `pg` par `DATABASE_URL`.

## 1 · La base

L'hébergement doit se situer dans l'Union européenne. Deux options éprouvées :

### Supabase (recommandé pour démarrer)

1. Créer un projet sur [supabase.com](https://supabase.com) — **région
   `eu-central-1` (Frankfurt)** ou `eu-west-1` (Ireland).
2. Dans « Project Settings → Database », copier la
   **Connection string (URI)** en mode `Session pooler` :
   `postgres://postgres.<ref>:<mot-de-passe>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`.
3. Dans « Database → Extensions », activer **`postgis`** (les migrations en
   ont besoin pour l'index GiST de proximité).

### Neon

1. Créer un projet — **région `eu-central-1`**.
2. Copier la `DATABASE_URL` depuis le tableau de bord.
3. Depuis le SQL Editor : `create extension if not exists postgis;`

## 2 · Les migrations

Depuis le poste de développement :

```bash
DATABASE_URL="postgres://…" DATABASE_SSL=requis npm run bd:migrer
```

Les 22 migrations passent chacune dans leur transaction et s'inscrivent dans
`migration_appliquee`. Rejouer la commande est idempotent.

## 3 · Les variables d'environnement Vercel

Dans « Project Settings → Environment Variables », onglet **Production** :

| Nom | Valeur | Notes |
|---|---|---|
| `DATABASE_URL` | l'URI copiée à l'étape 1 | Sans elle, chaque page SSR échoue. |
| `DATABASE_SSL` | `requis` | L'hébergeur impose TLS. |
| `ADRESSE_DU_SITE` | `https://bike-sitters.vercel.app` (ou votre domaine) | Sert aux liens des courriels. Sans elle, pas de reset de mot de passe. |
| `CLE_DES_PIECES` | 32 octets hex | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Sans elle, le dépôt de pièce d'identité reste fermé. |
| `COURRIEL_EXPEDITEUR` | `Bike Sitters <bonjour@bikesitters.be>` | Le « From » des courriels. |
| `SMTP_URL` | `smtps://user:pass@smtp.eu.mailgun.org:465` | Absent = courriels en file, non expédiés. |
| `GEOCODEUR_URL` | vide | Vide = Nominatim OSM. À terme, préférer une instance auto-hébergée. |
| `GEOCODEUR_CONTACT` | `Bike Sitters (association, Bruxelles) — bonjour@bikesitters.be` | Nominatim l'exige. |
| `SMS_URL` + `SMS_JETON` | passerelle SMS belge | Absent = SMS en file, non expédiés. |

**Ne pas coller `.env.local`** dans Vercel : la base de dev locale est
différente de la base de prod.

## 4 · Le déploiement

Une fois les variables en place, dans `C:\Users\HP\Bikesitter` :

```bash
vercel deploy --prod --yes --token <votre-token>
```

Au premier déploiement, la CLI demande le scope, le nom du projet (`bike-sitters`
suffit), et détecte automatiquement Next.js.

## 5 · Après le premier déploiement

- Vérifier `/` (site public) — les pages de texte doivent rendre sans base.
- Vérifier `/accueil` (dashboard) — nécessite `DATABASE_URL` et une session.
  Sans session, redirige vers `/bienvenue`.
- Créer un premier compte via `/inscription`, puis dans Supabase SQL Editor :
  `update membre set moderateur = true, identite_verifiee = true where email = 'vous@…';`
- Sur Supabase, activer la « Point-in-time recovery » (plan Pro) — la base
  porte des identités vérifiées et des messages entre membres.

## 6 · Domaine

Ajouter `bikesitters.be` (ou équivalent) dans « Project Settings → Domains »
sur Vercel. Vercel gère le certificat TLS automatiquement. Une fois le
domaine actif, mettre à jour `ADRESSE_DU_SITE` en conséquence, puis
redéployer.

## 7 · Ce qu'on n'a pas fait ici, à faire quand ça devient utile

- Copies de sauvegarde chiffrées hebdomadaires vers un stockage indépendant
  (S3-compatible en UE).
- Journal d'audit des connexions modérateur (déjà partiellement dans la table
  `action_de_moderation`).
- Migration progressive vers un géocodeur auto-hébergé (une instance Nominatim
  Docker suffit et évite d'envoyer les adresses des membres à OSM).
