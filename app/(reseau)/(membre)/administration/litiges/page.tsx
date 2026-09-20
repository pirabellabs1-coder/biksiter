import type { Metadata } from 'next';
import Link from 'next/link';

import { NavigationDAdministration } from '@/components/app/administration';
import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { referenceDeGarde } from '@/components/membre/garde';
import { litigesEnCours } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Litiges') };
}

export default async function Litiges({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await exigerUnModerateur();
  const { p } = await textes();
  const [{ tranche }, litiges] = await Promise.all([searchParams, litigesEnCours()]);

  return (
    <main id="contenu">
      <EnTete p={p} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Gestion des litiges')}</h1>
        <p className="sous-titre">{p('Les gardes signalées, du plus urgent au plus ancien.')}</p>
        <NavigationDAdministration p={p} actif="litiges" />

        {tranche ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Litige tranché : les deux membres sont prévenus.')}</span>
          </div>
        ) : null}

        {litiges.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="bouclier" taille={30} className="texte-vert" />
            <strong>{p('Aucun litige en cours.')}</strong>
          </div>
        ) : (
          <ul className="pile" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {litiges.map((litige) => (
              <li key={litige.id}>
                <Link href={`/administration/litiges/${litige.id}`} className="carte ligne" style={{ alignItems: 'flex-start' }}>
                  <span className="ligne-texte">
                    <span className={litige.priorite === 'haute' ? 'pastille rouge' : 'pastille ambre'}>
                      {litige.priorite === 'haute' ? p('Priorité haute') : p('Priorité moyenne')}
                    </span>
                    <strong style={{ marginTop: 6 }}>{litige.motif ? p(litige.motif) : p('Signalement')}</strong>
                    <span>
                      {referenceDeGarde(litige.id)} · {litige.quartier}
                    </span>
                    <span>
                      {p('{cycliste} chez {bikeSitter}', {
                        cycliste: litige.prenomDuCycliste,
                        bikeSitter: litige.prenomDuBikeSitter,
                      })}
                    </span>
                  </span>
                  <span className="petit texte-doux" style={{ whiteSpace: 'nowrap' }}>
                    {jourAffiche(jourABruxelles(new Date(litige.ouvertLe)))} {heureABruxelles(new Date(litige.ouvertLe))}
                  </span>
                  <Icone nom="chevron" taille={20} className="texte-leger" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
