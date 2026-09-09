# CLAUDE.md — Bike Sitters

Instructions permanentes pour le développement. À lire avant toute modification.

## Ce qu'est le projet

Un réseau d'entraide entre cyclistes : des particuliers accueillent gratuitement le
vélo de quelqu'un chez eux, pour quelques heures ou quelques jours. Ce n'est pas une
place de marché — personne ne paie, personne n'est classé.

**Association sans but lucratif, gratuité totale, Bruxelles.** Chaque décision de
produit découle de ces trois faits.

## Vocabulaire — à respecter à la lettre

| Terme | Sens | Ne jamais écrire |
|---|---|---|
| **membre** | Ce qu'on est dans le réseau | « utilisateur » dans l'interface |
| **cycliste** | Celui qui dépose son vélo, dans un stationnement donné | — |
| **bike sitter** | Celui qui accueille, dans un stationnement donné | « hôte » |
| **emplacement** | Le lieu où le vélo est rangé | « espace » |
| **stationnement** | Une garde, du dépôt à la reprise | « réservation », « booking » |

Un membre est cycliste **et** bike sitter selon le moment. Le compte est unique :
proposer un emplacement est une action, jamais un statut à demander.

## Les règles qui ne se négocient pas

1. **L'espace privé.** Un emplacement n'est publiable que s'il est inaccessible au
   public et aux autres résidents de l'immeuble. La règle est portée par la liste des
   quatorze types proposés, pas par une question qu'on poserait à l'utilisateur.
2. **L'identité avant la publication.** Personne ne publie un emplacement sans avoir
   été vérifié par un humain. C'est ce qui rend acceptable d'ouvrir sa porte.
3. **Aucun classement entre membres.** Ni palmarès, ni tri par popularité, ni filtre
   par note. Un classement dans un réseau de bénévoles crée des perdants et pousse à
   accepter des gardes qu'on aurait dû refuser.
4. **L'adresse exacte n'existe qu'après acceptation.** Ni sur la fiche, ni dans la
   réponse de l'API. Avant, une zone approximative.
5. **Le vélo ne change d'état qu'avec un code.** Celui qui remet le vélo détient le
   code, celui qui le reçoit le saisit. Trois essais, puis régénération.
6. **Une couleur, un sens.** Quatre sens, et la teinte dit le sens tandis que
   le remplissage dit s'il y a quelque chose à cliquer :
   - **vert sapin plein** = action (c'est aussi la marque) ;
   - **vert clair teinté** = confirmé — identité vérifiée, demande acceptée,
     vélo actuellement gardé, emplacement disponible ;
   - **ambre** = en attente d'une réponse ;
   - **rosé** = refusé, annulé, erreur.
   Aucune couleur décorative dans l'interface.
   *Une pastille d'état porte toujours une puce colorée en plus de sa teinte :
   entre l'ambre et le vert clair, la teinte seule ne suffit pas à tout le
   monde.*
   *Une seule exception à la règle, tenue à part : les illustrations ont leur
   propre palette (`--dessin-*`), qui ne sort jamais de `.illustration`. Un
   dessin ne porte aucune information, il ne peut donc pas se tromper de sens.*

## Ce qui a été écarté, et pourquoi

Ne pas les reproposer sans raison nouvelle.

- **QR code et Bluetooth** pour la remise : le code à quatre chiffres se dicte à voix
  haute, fonctionne dans une cave sans réseau, avec des gants.
- **Notes en étoiles sur un emplacement** : la note appartient à la personne.
- **SMS pour les rappels** : coût par message en Belgique ; réservé à la vérification.
- **Notifications push** : imposeraient une application native.
- **Points, badges, niveaux** : cela fonctionne entre inconnus, pas entre voisins.
- **Chat en temps réel** : crée une attente de réponse que des bénévoles ne tiennent pas.

## Stack

- Next.js 15, TypeScript strict, App Router
- PostgreSQL avec PostGIS, hébergé dans l'Union européenne
- Rendu serveur par défaut ; composants client seulement quand c'est nécessaire
- Pas de bibliothèque de composants : le système de design tient en un fichier

## Conventions de code

- **Le code et les commentaires sont en français**, comme le produit et l'équipe.
- Un commentaire explique **pourquoi**, jamais **quoi**. Si le quoi n'est pas évident,
  c'est le nom de la fonction qu'il faut corriger.
- Pas de `any`. Pas de `console.log` dans le code livré.
- Les règles métier vivent dans `/lib/regles/`, jamais dans un composant.
- Chaque règle métier a un test qui la nomme en français.

## Vérifications avant de livrer

```bash
npm run lint && npm run typecheck && npm test
```

Les tests doivent nommer la règle qu'ils vérifient :
`test("un emplacement sans jour d'accueil n'est pas réservable", ...)`.

## Les valeurs de référence

| Constante | Valeur | Où |
|---|---|---|
| Emplacements par membre | 2 | `lib/regles/emplacements.ts` |
| Marge entre stationnements | 30 minutes | `lib/regles/capacite.ts` |
| Validité d'un code | 6 heures | `lib/regles/remise.ts` |
| Essais par code | 3 | `lib/regles/remise.ts` |
| Seuil de désistement tardif | 12 heures | `lib/regles/annulation.ts` |

## Les listes fermées

Ces listes sont des règles, pas des données de configuration.

- **Types d'emplacement privé** (14) : Garage privé fermé, Box de garage individuel, Cave privative, Intérieur du logement, Pièce dédiée, Débarras ou cellier, Local privatif, Abri de jardin ou remise, Jardin privé clôturé, Cour privée, Terrasse privée, Balcon ou loggia, Véranda fermée, Autre espace privé
- **Types de vélo** (12) : Ville, Route, VTT, VTC, Gravel, Pliant, Électrique, Cargo, Longtail, Tandem, Enfant, Avec remorque
- **Verrouillage** : cle, code, autre, aucun
- **Intempéries** : interieur, abri, partiel, dehors
- **Accès** : Plain-pied, Quelques marches, Escalier, Ascenseur, Rampe, Passage par l'intérieur du logement, Passage étroit, Autre
- **Ancrage** : Ancrage mural, Ancrage au sol, Râtelier fixe, Arceau ou barre fixe, Autre
- **Services** : Recharge VAE, Gonflage des pneus, Petit outillage à disposition

## Où chercher le reste

- `bike-sitters-cahier-des-charges.pdf` — la référence complète, 78 pages
- `bike-sitters-perimetre-beta.md` — ce qu'on construit maintenant, et ce qui attend
- `bike-sitters-app.html` — le prototype : les règles y sont exécutables et testées

**En cas de doute, le prototype fait foi.** Il porte 743 vérifications automatiques ;
le document décrit, le prototype prouve.
