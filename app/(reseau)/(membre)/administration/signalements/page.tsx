import type { Metadata } from 'next';
import Link from 'next/link';

import { NavigationDAdministration } from '@/components/app/administration';
import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
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
  await exigerUnModerateur();
  const { p } = await textes();
  const { etat: demande, erreur } = await searchParams;
  const onglet = ETATS_D_UN_SIGNALEMENT.find((e) => e.cle === demande) ?? ETATS_D_UN_SIGNALEMENT[0];
  const liste = await signalements(onglet.cle);

  const typeDeCible: Record<string, string> = {
    membre: p('Profil'),
    emplacement: p('Lieu'),
    garde: p('Garde'),
    avis: p('Avis'),
  };

  return (
    <main id="contenu">
      <EnTete p={p} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Signalements')}</h1>
        <p className="sous-titre">{p('Les profils, lieux et avis signalés par les membres.')}</p>
        <NavigationDAdministration p={p} actif="signalements" />

        <nav className="puces" aria-label={p('État des signalements')} style={{ marginTop: 0, marginBottom: 12 }}>
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
          <div className="encart rouge" role="alert" style={{ marginBottom: 12 }}>
            <Icone nom="alerte" taille={22} />
            <span>{p('Ce signalement a déjà changé d’état, peut-être par une autre personne.')}</span>
          </div>
        ) : null}

        {liste.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="drapeau" taille={30} className="texte-leger" />
            <strong>{p('Aucun signalement ici.')}</strong>
          </div>
        ) : (
          <ul className="pile" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {liste.map((signalement) => (
              <li key={signalement.id} className="carte pile" style={{ gap: 8 }}>
                <div className="ligne sans-cadre" style={{ padding: 0, minHeight: 0, alignItems: 'flex-start' }}>
                  <span className="ligne-icone texte-rouge" aria-hidden="true">
                    <Icone nom="drapeau" taille={22} />
                  </span>
                  <span className="ligne-texte">
                    <strong>{p(signalement.motif)}</strong>
                    <span>
                      {typeDeCible[signalement.cibleType]} · {signalement.cibleLibelle ?? signalement.cible}
                    </span>
                    <span>
                      {p('Signalé le {date} par {prenom}', {
                        date: jourAffiche(jourABruxelles(new Date(signalement.creeLe))),
                        prenom: signalement.auteur ?? p('un membre'),
                      })}
                    </span>
                  </span>
                  <span className={signalement.etat === 'traite' ? 'pastille' : signalement.etat === 'en_cours' ? 'pastille ambre' : 'pastille rouge'}>
                    {signalement.etat === 'traite' ? p('Traité') : signalement.etat === 'en_cours' ? p('En cours') : p('Nouveau')}
                  </span>
                </div>
                {signalement.details ? (
                  <p className="texte-doux" style={{ margin: 0, whiteSpace: 'pre-line' }}>
                    « {signalement.details} »
                  </p>
                ) : null}
                {signalement.note ? (
                  <p className="petit" style={{ margin: 0 }}>
                    <strong>{p('Note :')}</strong> {signalement.note}
                  </p>
                ) : null}
                {signalement.lienDeLaCible ? (
                  <Link href={signalement.lienDeLaCible} className="lien-souligne">
                    {p('Voir la fiche concernée')}
                  </Link>
                ) : null}
                {signalement.etat !== 'traite' ? (
                  <form action={avancerUnSignalement} className="pile" style={{ gap: 8 }}>
                    <input type="hidden" name="signalement" value={signalement.id} />
                    <input type="hidden" name="onglet" value={onglet.cle} />
                    <label className="champ-texte">
                      <span>{p('Note de modération (facultative)')}</span>
                      <textarea name="note" maxLength={600} style={{ minHeight: 64 }} />
                    </label>
                    <div className="deux-colonnes">
                      {signalement.etat === 'ouvert' ? (
                        <button type="submit" name="vers" value="en_cours" className="bouton contour">
                          {p('Prendre en charge')}
                        </button>
                      ) : (
                        <span />
                      )}
                      <button type="submit" name="vers" value="traite" className="bouton plein">
                        {p('Marquer traité')}
                      </button>
                    </div>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
