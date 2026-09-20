import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { EmblemeDeBadge, resteDuBadge } from '@/components/app/progression';
import { progressionDuMembre } from '@/lib/depot/progression';
import { textes } from '@/lib/i18n/langue';
import { etatDesBadges, niveauPour } from '@/lib/regles/progression';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes badges') };
}

export default async function MesBadges() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const progression = await progressionDuMembre(membre.id);
  const niveau = niveauPour(progression.pointsGagnes);
  const badges = etatDesBadges(progression.activite);
  const obtenus = badges.filter((badge) => badge.obtenu).length;

  return (
    <main id="contenu">
      <EnTete p={p} retour="/progression" />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Mes badges')}</h1>
        <p className="sous-titre">
          {p('Vos gardes vous permettent de débloquer des badges. {n} sur {total} obtenus.', {
            n: obtenus,
            total: badges.length,
          })}
        </p>

        {niveau.suivant ? (
          <Link href="/progression/objectifs" className="encart lien-encart" style={{ marginTop: 0, marginBottom: 12 }}>
            <Icone nom="progression" taille={28} />
            <span>
              <span className="petit">{p('Niveau suivant :')}</span>
              <strong>{p(niveau.suivant.titre)}</strong>
              <span className="petit">
                {p('Encore {n} points pour y accéder', { n: niveau.manquants })}
              </span>
            </span>
            <Icone nom="chevron" taille={20} />
          </Link>
        ) : null}

        <ul className="grille-badges" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {badges.map((badge) => (
            <li key={badge.cle} className="badge-carte">
              <EmblemeDeBadge badge={badge} />
              <strong>{p(badge.titre)}</strong>
              <span>{badge.obtenu ? p(badge.description) : resteDuBadge(p, badge)}</span>
              <span className="lecteur">
                {badge.obtenu ? p('Badge obtenu') : p('Badge à débloquer')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
