import type { Metadata } from 'next';
import Link from 'next/link';

import { NavigationDAdministration } from '@/components/app/administration';
import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { rechercherDesMembres } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Membres') };
}

const FILTRES = ['tous', 'actifs', 'suspendus'] as const;

export default async function GestionDesMembres({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await exigerUnModerateur();
  const { p } = await textes();
  const parametres = await searchParams;
  const q = typeof parametres.q === 'string' ? parametres.q : '';
  const demande = parametres.filtre;
  const filtre = FILTRES.find((f) => f === demande) ?? 'tous';
  const { membres, comptes } = await rechercherDesMembres(q, filtre);
  const libelles: Record<(typeof FILTRES)[number], string> = {
    tous: p('Tous ({n})', { n: comptes.tous }),
    actifs: p('Actifs ({n})', { n: comptes.actifs }),
    suspendus: p('Suspendus ({n})', { n: comptes.suspendus }),
  };
  const lien = (f: string) => `/administration/membres?${new URLSearchParams({ q, filtre: f }).toString()}`;

  return (
    <main id="contenu">
      <EnTete p={p} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Gestion des membres')}</h1>
        <p className="sous-titre">{p('Recherchez un compte, suspendez-le ou réactivez-le, corrigez ses points.')}</p>
        <NavigationDAdministration p={p} actif="membres" />

        <form action="/administration/membres" method="get" role="search">
          <input type="hidden" name="filtre" value={filtre} />
          <label className="champ-app champ-recherche">
            <Icone nom="recherche" taille={20} />
            <span className="lecteur">{p('Rechercher un membre')}</span>
            <input type="search" name="q" defaultValue={q} maxLength={80} placeholder={p('Prénom, nom ou e-mail')} />
          </label>
        </form>

        <nav className="puces" aria-label={p('Filtrer les membres')} style={{ marginBottom: 12 }}>
          {FILTRES.map((f) => (
            <Link key={f} href={lien(f)} className={f === filtre ? 'puce active' : 'puce'} aria-current={f === filtre ? 'page' : undefined}>
              {libelles[f]}
            </Link>
          ))}
        </nav>

        {membres.length === 0 ? (
          <div className="carte vide-liste">
            <strong>{p('Aucun membre ne correspond.')}</strong>
          </div>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
            {membres.map((membre) => (
              <li key={membre.id}>
                <Link href={`/administration/membres/${membre.id}`} className="ligne">
                  <span className="avatar-app" aria-hidden="true" style={{ width: 40, height: 40, fontSize: 16 }}>
                    {membre.prenom.charAt(0)}
                  </span>
                  <span className="ligne-texte">
                    <strong>
                      {membre.prenom} {membre.initiale}.
                    </strong>
                    <span>
                      {p('Membre depuis {annee}', { annee: membre.membreDepuis })}
                      {membre.verification === 'verifiee' ? ` · ${p('Identité vérifiée')}` : ''}
                      {membre.moderateur ? ` · ${p('Modération')}` : ''}
                    </span>
                  </span>
                  <span className={membre.suspendu ? 'pastille rouge' : 'pastille'}>
                    {membre.suspendu ? p('Suspendu') : p('Actif')}
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
