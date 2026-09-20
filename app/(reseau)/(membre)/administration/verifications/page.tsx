import type { Metadata } from 'next';
import Link from 'next/link';

import { NavigationDAdministration } from '@/components/app/administration';
import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { candidaturesEnAttente, dossiersAVerifier } from '@/lib/depot/moderation';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { joursAvantSuppression } from '@/lib/regles/pieces';
import { jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

import { classerUneCandidature } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Vérifications') };
}

export default async function Verifications({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await exigerUnModerateur();
  const { p } = await textes();
  const [{ decision }, dossiers, candidatures] = await Promise.all([
    searchParams,
    dossiersAVerifier(),
    candidaturesEnAttente(),
  ]);
  const maintenant = new Date();

  return (
    <main id="contenu">
      <EnTete p={p} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Vérifications d’identité')}</h1>
        <p className="sous-titre">
          {p('Chaque pièce est examinée par une personne, puis supprimée dès la décision.')}
        </p>
        <NavigationDAdministration p={p} actif="verifications" />

        {decision ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>
              {decision === 'verifiee'
                ? p('Identité vérifiée. La pièce est supprimée et le membre est prévenu.')
                : p('Refus enregistré. La pièce est supprimée et le membre reçoit le motif.')}
            </span>
          </div>
        ) : null}

        {dossiers.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="verifie" taille={30} className="texte-vert" />
            <strong>{p('Aucune pièce en attente.')}</strong>
          </div>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
            {dossiers.map((dossier) => {
              const restants = joursAvantSuppression(new Date(dossier.deposeeLe), maintenant);
              return (
                <li key={dossier.membreId}>
                  <Link href={`/administration/verifications/${dossier.membreId}`} className="ligne">
                    <span className="avatar-app" aria-hidden="true">
                      {dossier.prenom.charAt(0)}
                    </span>
                    <span className="ligne-texte">
                      <strong>
                        {dossier.prenom} {dossier.nom}
                      </strong>
                      <span>
                        {p('Déposée le {date}', { date: jourAffiche(jourABruxelles(new Date(dossier.deposeeLe))) })}
                      </span>
                    </span>
                    <span className="pastille ambre">
                      {restants === 0
                        ? p('Supprimée aujourd’hui')
                        : p('Supprimée dans {n} j', { n: restants })}
                    </span>
                    <Icone nom="chevron" taille={20} className="texte-leger" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {candidatures.length > 0 ? (
          <>
            <h2 className="titre-section">{p('Candidatures reçues par le site')}</h2>
            <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
              {candidatures.map((candidature) => (
                <li key={candidature.id} className="ligne ligne-info">
                  <span className="ligne-texte">
                    <strong>
                      {candidature.prenom} · {p(candidature.type)}
                    </strong>
                    <span>
                      {[candidature.quartier, p('{n} vélo(s)', { n: candidature.capacite })]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <form action={classerUneCandidature}>
                    <input type="hidden" name="candidature" value={candidature.id} />
                    <button type="submit" className="bouton contour" style={{ minHeight: 38 }}>
                      {p('Classer')}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </main>
  );
}
