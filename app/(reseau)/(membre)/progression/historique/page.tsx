import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { enPoints } from '@/components/app/progression';
import { soldeDuMembre } from '@/lib/depot/maillons';
import { journalDesPoints, type LigneDuJournal } from '@/lib/depot/progression';
import { textes, type Textes } from '@/lib/i18n/langue';
import { FILTRES_DU_JOURNAL } from '@/lib/regles/progression';
import { enJour } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Historique des points') };
}

function titreDeLaLigne(p: Textes['p'], ligne: LigneDuJournal): string {
  if (ligne.nature === 'correction') return p('Correction de l’équipe');
  if (ligne.nombre < 0) return ligne.offreTitre ?? p('Échange au catalogue');
  if (ligne.cyclistePrenom) return p('Garde avec {prenom}', { prenom: ligne.cyclistePrenom });
  return p('Garde menée à bien');
}

export default async function HistoriqueDesPoints({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { filtre: demande } = await searchParams;
  const filtre = FILTRES_DU_JOURNAL.find((f) => f.cle === demande) ?? FILTRES_DU_JOURNAL[0];
  const [solde, lignes] = await Promise.all([
    soldeDuMembre(membre.id),
    journalDesPoints(membre.id, filtre.cle),
  ]);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/progression" />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Historique des points')}</h1>

        <div className="encart solde-encart">
          <span className="rond-etat" style={{ width: 48, height: 48, boxShadow: 'none' }} aria-hidden="true">
            <Icone nom="etoile" taille={24} plein />
          </span>
          <span>
            <strong>{enPoints(p, solde.acquis)}</strong>
            {p('disponibles')}
            {solde.enAttente > 0 ? (
              <span className="petit" style={{ display: 'block' }}>
                {p('{n} points en attente', { n: solde.enAttente })}
              </span>
            ) : null}
          </span>
        </div>

        <nav className="puces" aria-label={p('Filtrer l’historique')}>
          {FILTRES_DU_JOURNAL.map((f) => (
            <Link
              key={f.cle}
              href={f.cle === 'tous' ? '/progression/historique' : `/progression/historique?filtre=${f.cle}`}
              className={f.cle === filtre.cle ? 'puce active' : 'puce'}
              aria-current={f.cle === filtre.cle ? 'page' : undefined}
            >
              {p(f.titre)}
            </Link>
          ))}
        </nav>

        {lignes.length === 0 ? (
          <div className="carte vide-liste" style={{ marginTop: 14 }}>
            <Icone nom="document" taille={30} className="texte-leger" />
            <strong>{p('Aucun élément à afficher pour le moment.')}</strong>
            <span className="texte-doux">
              {p('Vos points apparaissent ici dès la fin d’une garde.')}
            </span>
          </div>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0, marginTop: 14 }}>
            {lignes.map((ligne) => {
              const enAttente = ligne.etat === 'en_attente';
              const contenu = (
                <>
                  <span
                    className={`chiffre-rond${ligne.nombre < 0 ? ' depense' : enAttente ? ' attente' : ''}`}
                    aria-hidden="true"
                  >
                    {enAttente ? (
                      <Icone nom="horloge" taille={22} />
                    ) : ligne.nombre > 0 ? (
                      `+${ligne.nombre}`
                    ) : (
                      `−${Math.abs(ligne.nombre)}`
                    )}
                  </span>
                  <span className="ligne-texte">
                    <strong>
                      {enAttente
                        ? p('+{n} points en attente', { n: ligne.nombre })
                        : titreDeLaLigne(p, ligne)}
                    </strong>
                    {enAttente ? <span>{titreDeLaLigne(p, ligne)}</span> : null}
                    {ligne.nature === 'correction' && ligne.motif ? (
                      <span>{ligne.motif.replace(/^Correction : /, '')}</span>
                    ) : null}
                    <span>{enJour(new Date(ligne.creeLe))}</span>
                  </span>
                  <span className="lecteur">
                    {ligne.nombre > 0
                      ? p('{n} points gagnés', { n: ligne.nombre })
                      : p('{n} points utilisés', { n: Math.abs(ligne.nombre) })}
                  </span>
                </>
              );
              return (
                <li key={ligne.id}>
                  {ligne.stationnementId ? (
                    <Link href={`/gardes/${ligne.stationnementId}`} className="ligne">
                      {contenu}
                      <Icone nom="chevron" taille={20} className="texte-leger" />
                    </Link>
                  ) : (
                    <div className="ligne ligne-info">{contenu}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
