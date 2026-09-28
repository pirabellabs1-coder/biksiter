import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { OngletsDeModeration } from '@/components/maquette/moderation/onglets';
import { signalements } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { ETATS_D_UN_SIGNALEMENT } from '@/lib/regles/moderation';
import { jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

import { avancerUnSignalement } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Signalements') };
}

export default async function Signalements({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const { etat: demande, erreur } = await searchParams;
  const onglet =
    ETATS_D_UN_SIGNALEMENT.find((e) => e.cle === demande) ??
    ETATS_D_UN_SIGNALEMENT[0];
  const liste = await signalements(onglet.cle);
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  const typeDeCible: Record<string, string> = {
    membre: p('Profil'),
    emplacement: p('Emplacement'),
    garde: p('Garde'),
    avis: p('Avis'),
  };

  return (
    <main id="contenu">
      <EnTeteDeModeration initiales={initiales} />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">FILE DES SIGNALEMENTS</span>
          <h1>{p('Signalements')}</h1>
          <p>
            {p(
              'Les profils, emplacements, gardes et avis qui ont fait l’objet d’une alerte. Chaque décision reste dans l’historique du compte concerné.',
            )}
          </p>
        </header>

        <OngletsDeModeration p={p} actif="signalements" />

        <nav className="puces" aria-label={p('État des signalements')}>
          {ETATS_D_UN_SIGNALEMENT.map((etat) => (
            <Link
              key={etat.cle}
              href={`/administration/signalements?etat=${etat.cle}`}
              className={etat.cle === onglet.cle ? 'puce active' : 'puce'}
              aria-current={etat.cle === onglet.cle ? 'page' : undefined}
            >
              {p(etat.titre)}
            </Link>
          ))}
        </nav>

        {erreur ? (
          <article className="mod-carte urgent" role="alert">
            <div className="mod-tete">
              <span className="mod-etat rouge">{p('Déjà changé')}</span>
            </div>
            <p className="gris">
              {p(
                'Ce signalement a déjà changé d’état, peut-être par une autre personne de l’équipe.',
              )}
            </p>
          </article>
        ) : null}

        {liste.length === 0 ? (
          <article className="mod-carte">
            <div className="mod-tete">
              <span className="mod-etat">
                {p('Aucun signalement à afficher')}
              </span>
            </div>
            <p className="vide-onglet">
              {p('Rien dans cette file pour le moment.')}
            </p>
          </article>
        ) : (
          liste.map((signalement) => (
            <article
              key={signalement.id}
              className={
                signalement.etat === 'ouvert' ? 'mod-carte urgent' : 'mod-carte'
              }
            >
              <div className="mod-tete">
                <span
                  className={
                    signalement.etat === 'ouvert' ? 'mod-etat attente' : 'mod-etat'
                  }
                >
                  {signalement.etat === 'traite'
                    ? `${p('Traité')}`
                    : signalement.etat === 'en_cours'
                      ? `${p('En cours')}`
                      : `${p('Nouveau')}`}
                </span>
                <span className="gris">
                  {p('signalé le {date}', {
                    date: jourAffiche(
                      jourABruxelles(new Date(signalement.creeLe)),
                    ),
                  })}
                </span>
              </div>
              <h3>{p(signalement.motif)}</h3>
              <p className="gris">
                {typeDeCible[signalement.cibleType]} ·{' '}
                {signalement.cibleLibelle ?? signalement.cible} ·{' '}
                {p('par {prenom}', {
                  prenom: signalement.auteur ?? p('un membre'),
                })}
              </p>
              {signalement.details ? (
                <p style={{ marginTop: 8 }}>« {signalement.details} »</p>
              ) : null}
              {signalement.note ? (
                <p className="gris" style={{ marginTop: 8 }}>
                  <b>{p('Note de modération :')}</b> {signalement.note}
                </p>
              ) : null}
              {signalement.lienDeLaCible ? (
                <div className="actions-fin">
                  <Link
                    href={signalement.lienDeLaCible}
                    className="outline"
                  >
                    {p('Voir la fiche concernée')}
                  </Link>
                </div>
              ) : null}
              {signalement.etat !== 'traite' ? (
                <form
                  action={avancerUnSignalement}
                  style={{ marginTop: 12, display: 'grid', gap: 8 }}
                >
                  <input
                    type="hidden"
                    name="signalement"
                    value={signalement.id}
                  />
                  <input type="hidden" name="onglet" value={onglet.cle} />
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span className="gris">
                      {p('Note de modération (facultative)')}
                    </span>
                    <textarea
                      name="note"
                      maxLength={600}
                      style={{
                        minHeight: 64,
                        borderRadius: 12,
                        border: '1px solid var(--line)',
                        padding: 10,
                        font: 'inherit',
                      }}
                    />
                  </label>
                  <div className="actions-fin" style={{ marginTop: 0 }}>
                    {signalement.etat === 'ouvert' ? (
                      <button
                        type="submit"
                        name="vers"
                        value="en_cours"
                        className="outline"
                      >
                        {p('Prendre en charge')}
                      </button>
                    ) : null}
                    <button
                      type="submit"
                      name="vers"
                      value="traite"
                      className="primary"
                    >
                      {p('Marquer traité')}
                    </button>
                  </div>
                </form>
              ) : null}
            </article>
          ))
        )}
      </div>
    </main>
  );
}
