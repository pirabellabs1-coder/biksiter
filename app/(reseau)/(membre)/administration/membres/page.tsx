import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { OngletsDeModeration } from '@/components/maquette/moderation/onglets';
import { rechercherDesMembres } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { emailMasque } from '@/lib/regles/moderation';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Gestion des membres') };
}

const FILTRES = ['tous', 'actifs', 'suspendus'] as const;

export default async function GestionDesMembres({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const parametres = await searchParams;
  const q = typeof parametres.q === 'string' ? parametres.q : '';
  const demande = parametres.filtre;
  const filtre = FILTRES.find((f) => f === demande) ?? 'tous';
  const { membres, comptes } = await rechercherDesMembres(q, filtre);
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  const libelles: Record<(typeof FILTRES)[number], string> = {
    tous: p('Tous ({n})', { n: comptes.tous }),
    actifs: p('Actifs ({n})', { n: comptes.actifs }),
    suspendus: p('Suspendus ({n})', { n: comptes.suspendus }),
  };
  const lien = (f: string) =>
    `/administration/membres?${new URLSearchParams({ q, filtre: f }).toString()}`;

  return (
    <main id="contenu">
      <EnTeteDeModeration initiales={initiales} />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">GESTION DES MEMBRES</span>
          <h1>{p('Membres')}</h1>
          <p>
            {p(
              'Ouvrez la fiche d’un membre pour ajuster son statut ou corriger son solde de points. Chaque geste laisse une trace motivée.',
            )}
          </p>
        </header>

        <OngletsDeModeration p={p} actif="membres" />

        <form action="/administration/membres" method="get" role="search">
          <input type="hidden" name="filtre" value={filtre} />
          <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
            <span className="gris">{p('Rechercher un membre')}</span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              maxLength={80}
              placeholder={p('Prénom, nom ou e-mail')}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid var(--line)',
                font: 'inherit',
              }}
            />
          </label>
        </form>

        <nav className="puces" aria-label={p('Filtrer les membres')}>
          {FILTRES.map((f) => (
            <Link
              key={f}
              href={lien(f)}
              className={f === filtre ? 'puce active' : 'puce'}
              aria-current={f === filtre ? 'page' : undefined}
            >
              {libelles[f]}
            </Link>
          ))}
        </nav>

        {membres.length === 0 ? (
          <article className="mod-carte">
            <div className="mod-tete">
              <span className="mod-etat">
                {p('Aucun membre ne correspond')}
              </span>
            </div>
            <p className="vide-onglet">
              {p('Essayez un autre prénom, nom ou e-mail.')}
            </p>
          </article>
        ) : (
          <article className="mod-carte">
            <div className="mod-tete">
              <span className="mod-etat">
                {p(membres.length > 1 ? '{n} membres affichés' : '{n} membre affiché', { n: membres.length })}
              </span>
            </div>
            <ul className="liste-nette">
              {membres.map((membre) => (
                <li key={membre.id}>
                  <b>
                    <Link href={`/administration/membres/${membre.id}`}>
                      {membre.prenom} {membre.initiale}.
                    </Link>
                    {membre.suspendu
                      ? ` · ${p('suspendu')}`
                      : membre.moderateur
                        ? ` · ${p('modération')}`
                        : ''}
                  </b>
                  {/* L'adresse, à demi masquée, distingue deux homonymes ;
                      elle ne s'affiche en entier que sur la fiche. */}
                  <span className="membre-email">{emailMasque(membre.email)}</span>
                  <span>
                    {p('Membre depuis {annee}', { annee: membre.membreDepuis })}
                    {membre.verification === 'verifiee'
                      ? ` · ${p('identité vérifiée')}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </main>
  );
}
