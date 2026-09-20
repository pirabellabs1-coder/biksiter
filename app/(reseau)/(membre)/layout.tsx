import Link from 'next/link';

import { BasculeDeMode } from '@/components/app/bascule-de-mode';
import { Logo } from '@/components/app/logo';
import {
  BarreDOnglets,
  BarreLaterale,
  type Onglet,
} from '@/components/app/navigation';
import { ChoixDeLangue } from '@/components/site/choix-de-langue';
import { reglagesDAffichage } from '@/lib/affichage';
import { demandesEnAttenteDeReponse } from '@/lib/depot/gardes';
import { signalerLaPresence } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import { exigerUnMembre } from '@/lib/session';

/**
 * Le cadre de l'espace membre.
 *
 * Sur téléphone, les cinq onglets du bas ; sur ordinateur, les mêmes entrées
 * dans une barre latérale. Les onglets suivent le mode choisi : on cherche une
 * place en cycliste, on répond aux demandes en bike sitter.
 */
export default async function CadreDuMembre({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const membre = await exigerUnMembre();
  const { p, langue } = await textes();
  const mode = await modeCourant();

  const [, aRepondre, nonLues, affichage] = await Promise.all([
    signalerLaPresence(membre.id),
    demandesEnAttenteDeReponse(membre.id),
    nombreDeNotificationsNonLues(membre.id),
    reglagesDAffichage(),
  ]);

  const accueil: Onglet = {
    href: '/accueil',
    libelle: p('Accueil'),
    icone: 'accueil',
    prefixes: ['/accueil', '/explorer'],
  };
  const gardes: Onglet = {
    href: '/gardes',
    libelle: p('Gardes'),
    icone: 'gardes',
    prefixes: ['/gardes', '/activite'],
  };
  const profil: Onglet = {
    href: '/profil',
    libelle: p('Profil'),
    icone: 'profil',
    prefixes: ['/profil', '/notifications', '/signaler', '/aide', '/urgence', '/regles'],
  };

  const onglets: Onglet[] =
    mode === 'bike_sitter'
      ? [
          accueil,
          {
            href: '/demandes',
            libelle: p('Demandes'),
            icone: 'demandes',
            prefixes: ['/demandes', '/mes-lieux'],
            pastille: aRepondre > 0,
          },
          gardes,
          {
            href: '/progression',
            libelle: p('Progression'),
            icone: 'progression',
            prefixes: ['/progression', '/classement', '/catalogue'],
          },
          profil,
        ]
      : [
          accueil,
          {
            href: '/recherche',
            libelle: p('Rechercher'),
            icone: 'recherche',
            prefixes: [
              '/recherche',
              '/carte',
              '/emplacements',
              '/demande',
              '/membres',
              '/favoris',
            ],
          },
          { ...gardes, pastille: aRepondre > 0 },
          {
            href: '/messages',
            libelle: p('Messages'),
            icone: 'messages',
            prefixes: ['/messages'],
          },
          profil,
        ];

  return (
    <div
      className="app app-membre"
      data-affichage={affichage.length > 0 ? affichage.join(' ') : undefined}
    >
      <a href="#contenu" className="evitement">
        {p('Aller au contenu')}
      </a>
      <BarreLaterale
        onglets={[
          ...(mode === 'bike_sitter'
            ? [...onglets.slice(0, 4), messagesDuRail(p), onglets[4]!]
            : onglets),
          {
            href: '/notifications',
            libelle: p('Notifications'),
            icone: 'cloche',
            prefixes: ['/notifications'],
            pastille: nonLues > 0,
          },
          ...(membre.moderateur
            ? [
                {
                  href: '/administration',
                  libelle: p('Administration'),
                  icone: 'bouclier',
                  prefixes: ['/administration'],
                } satisfies Onglet,
              ]
            : []),
        ]}
        libelle={p('Navigation principale')}
        marque={
          <Link href="/accueil" className="entete-marque">
            <Logo taille={38} />
            Bike Sitters
          </Link>
        }
        avant={<BasculeDeMode mode={mode} p={p} />}
        apres={
          <div className="rail-pied">
            <ChoixDeLangue langue={langue} />
          </div>
        }
      />
      <div className="site">{children}</div>
      <BarreDOnglets onglets={onglets} libelle={p('Navigation principale')} />
    </div>
  );
}

/** Sur ordinateur, la place ne manque pas : les messages restent à portée. */
function messagesDuRail(p: (texte: string) => string): Onglet {
  return {
    href: '/messages',
    libelle: p('Messages'),
    icone: 'messages',
    prefixes: ['/messages'],
  };
}
