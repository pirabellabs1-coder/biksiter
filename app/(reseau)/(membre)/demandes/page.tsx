import type { Metadata } from 'next';
import Link from 'next/link';

import { CarteDeGarde } from '@/components/app/garde';
import { Icone } from '@/components/app/icone';
import { gardesDuMembre } from '@/lib/depot/accueil';
import { statistiquesDuBikeSitter } from '@/lib/depot/lieux';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { EXPIRATION_D_UNE_DEMANDE_HEURES, type EtatDeGarde } from '@/lib/regles/garde';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Demandes') };
}

const ONGLETS: readonly { cle: string; titre: string; etats: readonly EtatDeGarde[] }[] = [
  { cle: 'a-traiter', titre: 'À traiter', etats: ['demande'] },
  // Un litige se suit avec les gardes en cours, comme côté cycliste : le vélo
  // peut encore être chez le bike sitter.
  { cle: 'acceptees', titre: 'Acceptées', etats: ['accepte', 'arrivee', 'en_cours', 'reprise_demandee', 'litige'] },
  { cle: 'terminees', titre: 'Terminées', etats: ['termine'] },
  // Une annulation n'est pas un refus : l'onglet réunit ce qui n'a pas eu
  // lieu, sans dire qui l'a décidé.
  { cle: 'refusees', titre: 'Sans suite', etats: ['refuse', 'expire', 'annule'] },
];

/** Ce que dit un onglet vide : chacun a sa raison de l'être. */
const VIDE_DE_L_ONGLET: Record<string, readonly [string, string]> = {
  'a-traiter': [
    'Aucune demande en attente.',
    'Vous recevez une notification dès qu’un cycliste vous écrit.',
  ],
  acceptees: [
    'Aucune garde à venir.',
    'Les demandes que vous acceptez apparaissent ici jusqu’à la reprise du vélo.',
  ],
  terminees: [
    'Aucune garde terminée pour l’instant.',
    'Chaque garde menée à son terme s’ajoute ici, avec les points qu’elle vous a rapportés.',
  ],
  refusees: [
    'Aucune demande sans suite.',
    'Les demandes déclinées, annulées ou restées sans réponse se rangent ici.',
  ],
};

/** Les demandes reçues par le bike sitter, pour y répondre dans le délai. */
export default async function Demandes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { t, p } = await textes();
  const { onglet: demande } = await searchParams;
  const [gardes, _nonLues, stats] = await Promise.all([
    gardesDuMembre(membre.id),
    nombreDeNotificationsNonLues(membre.id),
    statistiquesDuBikeSitter(membre.id),
  ]);
  const recues = gardes.filter((g) => g.role === 'bike_sitter');
  const onglet = ONGLETS.find((o) => o.cle === demande) ?? ONGLETS[0]!;
  const liste = recues.filter((g) => onglet.etats.includes(g.etat));
  if (onglet.cle === 'a-traiter') {
    liste.sort((a, b) => new Date(a.demandeLe).getTime() - new Date(b.demandeLe).getTime());
  } else if (onglet.cle === 'acceptees') {
    // Un litige demande de l'attention : il passe devant les gardes à venir.
    liste.sort(
      (a, b) =>
        Number(b.etat === 'litige') - Number(a.etat === 'litige') ||
        new Date(a.debut).getTime() - new Date(b.debut).getTime(),
    );
  } else if (onglet.cle === 'terminees') {
    liste.sort((a, b) => new Date(b.fin).getTime() - new Date(a.fin).getTime());
  }

  return (
    <main id="contenu">
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Demandes')}</h1>
        <p className="sous-titre">
          {p('Répondez avant l’heure du dépôt, et au plus tard sous {n} heures : sans réponse, la demande expire.', {
            n: EXPIRATION_D_UNE_DEMANDE_HEURES,
          })}
        </p>

        {stats.lieux === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="maison" taille={30} />
            <strong>{p('Vous n’accueillez pas encore de vélos.')}</strong>
            <span>{p('Vous pouvez proposer un emplacement privé pour recevoir des demandes de garde.')}</span>
            <Link href="/devenir-bike-sitter" className="bouton plein petit">
              {p('Devenir Bike Sitter')}
            </Link>
          </div>
        ) : (
          <>
            <nav className="onglets-haut" aria-label={p('Demandes')}>
              {ONGLETS.map((o) => {
                const combien = recues.filter((g) => o.etats.includes(g.etat)).length;
                return (
                  <Link
                    key={o.cle}
                    href={`/demandes?onglet=${o.cle}`}
                    aria-current={o.cle === onglet.cle ? 'page' : undefined}
                  >
                    {p(o.titre)}
                    {combien > 0 && (o.cle === 'a-traiter' || o.cle === 'acceptees') ? (
                      <span className="compteur">{combien}</span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
            {!stats.accepteLesDemandes ? (
              <div className="encart ambre" style={{ marginBottom: 12 }}>
                <Icone nom="horloge" taille={22} />
                <span>
                  {p('Vos lieux sont en pause : aucune nouvelle demande n’arrive.')}{' '}
                  <Link href="/profil" className="lien-souligne">
                    {p('Reprendre')}
                  </Link>
                </span>
              </div>
            ) : null}
            {liste.length === 0 ? (
              <div className="carte vide-liste">
                <Icone nom="demandes" taille={30} />
                <strong>{p(VIDE_DE_L_ONGLET[onglet.cle]?.[0] ?? 'Aucune demande ici.')}</strong>
                <span>
                  {p(
                    VIDE_DE_L_ONGLET[onglet.cle]?.[1] ??
                      'Vous recevez une notification dès qu’un cycliste vous écrit.',
                  )}
                </span>
              </div>
            ) : (
              <div className="pile">
                {liste.map((garde) => (
                  <CarteDeGarde
                    key={garde.id}
                    t={t}
                    p={p}
                    garde={garde}
                    vignette="personne"
                    href={
                      garde.etat === 'demande'
                        ? `/demande/${garde.id}`
                        : `/gardes/${garde.id}`
                    }
                  />
                ))}
              </div>
            )}
            <Link href="/mes-lieux" className="ligne carte" style={{ marginTop: 16 }}>
              <span className="ligne-icone fond-vert">
                <Icone nom="maison" taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>{p('Mes lieux de garde')}</strong>
                <span>
                  {stats.lieux > 1
                    ? p('{n} lieux', { n: stats.lieux })
                    : p('Un lieu')}
                </span>
              </span>
              <Icone nom="chevron" taille={20} className="texte-leger" />
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
