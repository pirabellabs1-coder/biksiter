import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { mesLieux, type LieuDeLaListe } from '@/lib/depot/lieux';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes lieux de garde') };
}

type P = Awaited<ReturnType<typeof textes>>['p'];

/** Règle 6 : actif en vert, brouillon et pause en ambre, avec leur nom en toutes lettres. */
function EtatDuLieu({ p, lieu }: { p: P; lieu: LieuDeLaListe }) {
  if (lieu.publie) return <span className="pastille">{p('Actif')}</span>;
  if (lieu.enPause) return <span className="pastille ambre">{p('En pause')}</span>;
  if (lieu.joursDAccueil === 0) return <span className="pastille ambre">{p('Brouillon')}</span>;
  return <span className="pastille ambre">{p('En attente de vérification')}</span>;
}

export default async function MesLieux({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { retire } = await searchParams;
  const [lieux, nonLues] = await Promise.all([
    mesLieux(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Mes lieux de garde')}</h1>
        <p className="sous-titre">
          {p('Gérez vos lieux de garde et partagez-les avec la communauté Bike Sitters.')}
        </p>

        {retire ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Le lieu est retiré.')}</span>
          </div>
        ) : null}

        <div className="pile grille-lieux">
          {lieux.map((lieu) => (
            <Link key={lieu.reference} href={`/mes-lieux/${lieu.reference}`} className="carte carte-lieu">
              <span className="carte-lieu-photo">
                {lieu.nombreDePhotos > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/emplacements/${lieu.reference}/photo/0`} alt="" />
                ) : (
                  <Icone nom="maison" taille={40} />
                )}
                <span className="carte-lieu-etat">
                  <EtatDuLieu p={p} lieu={lieu} />
                </span>
              </span>
              <span className="carte-lieu-corps">
                <strong>{p(lieu.type)}</strong>
                <span className="carte-de-garde-detail">
                  <Icone nom="epingle" taille={16} />
                  {lieu.quartier}
                </span>
                <span className="faits-du-lieu">
                  <span>
                    <Icone nom="velo" taille={18} />
                    {lieu.capacite > 1
                      ? p('{n} vélos', { n: lieu.capacite })
                      : p('Un vélo')}
                  </span>
                  <span>
                    <Icone nom="calendrier" taille={18} />
                    {lieu.joursDAccueil > 0
                      ? p('{n} jours par semaine', { n: lieu.joursDAccueil })
                      : p('Disponibilités à régler')}
                  </span>
                  {lieu.demandesEnAttente > 0 ? (
                    <span>
                      <Icone nom="demandes" taille={18} />
                      {p('{n} demande(s)', { n: lieu.demandesEnAttente })}
                    </span>
                  ) : null}
                </span>
                <span className="bouton contour petit carte-lieu-bouton">
                  {p('Voir les détails')}
                  <Icone nom="chevron" taille={18} />
                </span>
              </span>
            </Link>
          ))}

          {lieux.length < EMPLACEMENTS_PAR_MEMBRE ? (
            <Link href="/mes-lieux/ajouter" className="carte ajouter-un-lieu">
              <span className="rond-plus" aria-hidden="true">
                <Icone nom="plus" taille={28} strokeWidth={2.4} />
              </span>
              <strong>{p('Ajouter un lieu de garde')}</strong>
              <span>
                {p('Partagez un nouvel espace privé et aidez d’autres cyclistes à rouler sereinement.')}
              </span>
            </Link>
          ) : (
            <p className="petit texte-doux centre">
              {p('Vous proposez {n} lieux, le maximum par membre.', { n: EMPLACEMENTS_PAR_MEMBRE })}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
