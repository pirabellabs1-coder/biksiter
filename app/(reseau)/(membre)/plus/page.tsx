import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone, type NomDIcone } from '@/components/app/icone';
import { membreAUnEmplacement } from '@/lib/depot/lieux';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { exigerUnMembre } from '@/lib/session';

import { seDeconnecterDeLEspace } from '../profil/actions';

export const metadata: Metadata = { title: 'Plus' };

type Rangee = {
  href: string;
  icone: NomDIcone;
  titre: string;
  detail?: string;
  valeur?: string;
};

/**
 * L'onglet « Plus » : tout ce qui n'a pas sa place dans la barre du bas.
 *
 * Il menait au plan du site public, avec l'en-tête du site : le membre
 * quittait l'application sans le vouloir, et n'y trouvait ni ses messages ni
 * la déconnexion. Ici, tout reste dans l'application, rangé par usage.
 */
export default async function Plus() {
  const membre = await exigerUnMembre();
  const [nonLues, estBikeSitter] = await Promise.all([
    nombreDeNotificationsNonLues(membre.id),
    membreAUnEmplacement(membre.id),
  ]);

  const groupes: { cle: string; titre: string; rangees: Rangee[] }[] = [
    {
      cle: 'quotidien',
      titre: 'Au quotidien',
      rangees: [
        { href: '/messages', icone: 'messages', titre: 'Messages' },
        {
          href: '/notifications',
          icone: 'cloche',
          titre: 'Notifications',
          valeur: nonLues > 0 ? String(nonLues) : undefined,
        },
        { href: '/gardes', icone: 'gardes', titre: 'Mes gardes' },
        { href: '/favoris', icone: 'coeur', titre: 'Favoris' },
      ],
    },
    {
      cle: 'compte',
      titre: 'Mon compte',
      rangees: [
        {
          href: '/profil',
          icone: 'profil',
          titre: 'Profil et vérifications',
        },
        { href: '/profil/velos', icone: 'velo', titre: 'Mes vélos' },
        { href: '/profil/avis', icone: 'etoile', titre: 'Mes avis' },
        { href: '/inviter', icone: 'enveloppe', titre: 'Inviter un proche' },
      ],
    },
    {
      cle: 'bike-sitter',
      titre: 'Bike sitter',
      rangees: estBikeSitter
        ? [
            { href: '/accueil', icone: 'demandes', titre: 'Mes demandes' },
            { href: '/mes-lieux', icone: 'maison', titre: 'Mes emplacements' },
            { href: '/progression', icone: 'progression', titre: 'Progression et badges' },
            { href: '/catalogue', icone: 'cadeau', titre: 'Catalogue des points' },
          ]
        : [
            {
              href: '/devenir-bike-sitter',
              icone: 'maison',
              titre: 'Accueillir un vélo chez vous',
              detail: 'Proposez un emplacement, à votre rythme',
            },
          ],
    },
    {
      cle: 'aide',
      titre: 'Aide',
      rangees: [
        { href: '/aide', icone: 'aide', titre: 'Centre d’aide' },
        { href: '/regles', icone: 'document', titre: 'Règles du réseau' },
        { href: '/urgence', icone: 'alerte', titre: 'Un problème pendant une garde' },
      ],
    },
  ];

  if (membre.moderateur) {
    groupes.push({
      cle: 'association',
      titre: 'Association',
      rangees: [
        {
          href: '/administration',
          icone: 'bouclier',
          titre: 'Espace de modération',
        },
      ],
    });
  }

  return (
    <main id="contenu" className="ecran">
      <header className="ecran-tete">
        <h1>Plus</h1>
      </header>

      {groupes.map((groupe) => (
        <section key={groupe.cle} aria-labelledby={`plus-${groupe.cle}`}>
          <h2 className="titre-section" id={`plus-${groupe.cle}`}>
            {groupe.titre}
          </h2>
          <ul className="groupe" role="list">
            {groupe.rangees.map((rangee) => (
              <li key={rangee.href}>
                <Link href={rangee.href} className="rangee">
                  <span className="rangee-icone" aria-hidden="true">
                    <Icone nom={rangee.icone} taille={18} strokeWidth={2} />
                  </span>
                  <span className="rangee-texte">
                    <strong>{rangee.titre}</strong>
                    {rangee.detail ? <span>{rangee.detail}</span> : null}
                  </span>
                  {rangee.valeur ? (
                    <span className="rangee-valeur">{rangee.valeur}</span>
                  ) : null}
                  <Icone nom="chevron" taille={18} className="rangee-chevron" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <form action={seDeconnecterDeLEspace} className="plus-deconnexion">
        <button type="submit" className="rangee rangee-deconnexion">
          <span className="rangee-icone" aria-hidden="true">
            <Icone nom="deconnexion" taille={18} strokeWidth={2} />
          </span>
          <span className="rangee-texte">
            <strong>Se déconnecter</strong>
          </span>
        </button>
      </form>
    </main>
  );
}
