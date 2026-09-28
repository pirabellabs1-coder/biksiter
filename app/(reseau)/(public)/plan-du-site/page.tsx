import type { Metadata } from 'next';
import Link from 'next/link';

import { textes } from '@/lib/i18n/langue';
import { membreConnecte } from '@/lib/session';
export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Plan du site') };
}

type Carte = { titre: string; detail: string; href: string };

/**
 * Le plan reprend les trois groupes de la maquette. Les écrans qui n'existent
 * que dans le fil d'une garde — le dépôt, la prolongation, le constat — ne
 * s'ouvrent que depuis la garde concernée : ils ne figurent donc pas ici,
 * mais dans « Mes gardes ».
 */
const GROUPES: { titre: string; classe?: string; cartes: Carte[] }[] = [
  {
    titre: 'Le site public',
    cartes: [
      {
        titre: 'Accueil',
        detail: 'Recherche, les six étapes, sécurité, questions fréquentes',
        href: '/',
      },
      {
        titre: 'Qui nous sommes',
        detail: 'L’association, le financement, la zone de lancement',
        href: '/a-propos',
      },
      {
        titre: 'Nos règles',
        detail: 'Les six règles non négociables',
        href: '/regles',
      },
      { titre: 'Nous écrire', detail: 'Formulaire et adresses', href: '/contact' },
      {
        titre: 'Mentions légales',
        detail: 'Conditions, données, cookies',
        href: '/mentions-legales',
      },
      {
        titre: 'Espace de modération',
        detail: 'Signalements, emplacements, comptes',
        href: '/administration',
      },
      {
        titre: 'Inscription',
        detail: 'Créer un compte, sur invitation',
        href: '/inscription',
      },
      {
        titre: 'Inviter un membre',
        detail: 'Code, quota et suivi des invitations',
        href: '/inviter',
      },
      {
        titre: 'Connexion',
        detail: 'Se connecter, mot de passe oublié',
        href: '/connexion',
      },
      {
        titre: 'Accès sur invitation',
        detail: 'Pourquoi c’est fermé, et comment entrer',
        href: '/invitation',
      },
    ],
  },
  {
    titre: 'Côté cycliste',
    classe: 'plan-cycliste',
    cartes: [
      {
        titre: 'Résultats de recherche',
        detail: 'Filtres, liste et carte',
        href: '/recherche',
      },
      {
        titre: 'Mes gardes',
        detail: 'À venir, demandes, terminées',
        href: '/gardes',
      },
      {
        titre: 'Messagerie',
        detail: 'Échanger avant et pendant la garde',
        href: '/messages',
      },
      {
        titre: 'Notifications',
        detail: 'Demandes, messages, points',
        href: '/notifications',
      },
      {
        titre: 'Mes avis',
        detail: 'Note, points forts, commentaire',
        href: '/profil/avis',
      },
      {
        titre: 'Progression et points',
        detail: 'Niveaux, badges, classement',
        href: '/progression',
      },
      {
        titre: 'Mon vélo',
        detail: 'Description, numéro de cadre, photos',
        href: '/profil/velos',
      },
      {
        titre: 'Bike Sitters enregistrés',
        detail: 'Ceux que vous avez mis de côté',
        href: '/favoris',
      },
      {
        titre: 'Mon compte',
        detail: 'Identité, langue, notifications, données',
        href: '/profil',
      },
      {
        titre: 'En cas de problème',
        detail: 'Ce qu’il faut faire, et qui prévenir',
        href: '/urgence',
      },
    ],
  },
  {
    titre: 'Côté Bike Sitter',
    cartes: [
      {
        titre: 'Espace Bike Sitter',
        detail: 'Demandes reçues et prochaine garde',
        href: '/accueil',
      },
      {
        titre: 'Les demandes reçues',
        detail: 'Qui demande, et pour quand',
        href: '/demandes',
      },
      {
        titre: 'Devenir Bike Sitter',
        detail: 'Première étape de la candidature',
        href: '/devenir-bike-sitter',
      },
      {
        titre: 'Décrire son emplacement',
        detail: 'Type, accès, capacité, photos',
        href: '/mes-lieux/ajouter',
      },
      {
        titre: 'Ses emplacements',
        detail: 'Jours, heures et durée maximale',
        href: '/mes-lieux',
      },
      {
        titre: 'Catalogue de récompenses',
        detail: 'Ce que les points offrent chez les commerces',
        href: '/catalogue',
      },
      {
        titre: 'Top Bike Sitters',
        detail: 'Le classement du jour, de la semaine et du mois',
        href: '/classement',
      },
    ],
  },
];

export default async function PlanDuSite() {
  // L'espace de modération ne s'affiche qu'aux personnes qui modèrent : pour
  // les autres, ce serait une porte fermée.
  const moderateur = (await membreConnecte())?.moderateur === true;
  const groupes = GROUPES.map((groupe) => ({
    ...groupe,
    cartes: groupe.cartes.filter(
      (carte) => moderateur || carte.href !== '/administration',
    ),
  }));

  return (
    <>
      <div className="page" id="contenu">
        <header className="page-tete">
          <span className="kicker">PLAN DU SITE</span>
          <h1>Toutes les pages du réseau.</h1>
          <p>
            Du premier clic sur la recherche jusqu’à la candidature d’un Bike
            Sitter. Chaque carte ouvre la page correspondante.
          </p>
        </header>

        <div className="page-grille">
          {groupes.map((groupe) => (
            <section
              className={
                groupe.classe ? `plan-groupe ${groupe.classe}` : 'plan-groupe'
              }
              key={groupe.titre}
            >
              <h2>{groupe.titre}</h2>
              <div className="plan-liste">
                {groupe.cartes.map((carte) => (
                  <Link className="plan-carte" href={carte.href} key={carte.titre}>
                    <b>{carte.titre}</b>
                    <span>{carte.detail}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
