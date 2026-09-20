import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';
import { POINTS_PAR_GARDE, POINTS_PAR_JOUR_SUPPLEMENTAIRE } from '@/lib/regles/maillons';
import { NIVEAUX } from '@/lib/regles/progression';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Comment fonctionnent les points ?') };
}

export default async function ReglesDesPoints() {
  const { p } = await textes();

  const principes: [NomDIcone, string, string][] = [
    [
      'etoile',
      p('Gagnez des points en gardant des vélos'),
      p('{base} points par garde menée à terme, et {jour} de plus par jour entamé au-delà du premier. Un vélo encombrant (cargo, longtail, tandem, remorque) compte double.', {
        base: POINTS_PAR_GARDE,
        jour: POINTS_PAR_JOUR_SUPPLEMENTAIRE,
      }),
    ],
    [
      'horloge',
      p('Des points acquis à la reprise du vélo'),
      p('Les points arrivent quand le cycliste a repris son vélo. Si la garde fait l’objet d’un signalement, ils attendent la décision de l’équipe.'),
    ],
    [
      'cadeau',
      p('Utilisez vos points dans le catalogue'),
      p('Échangez vos points contre des avantages proposés par des partenaires du vélo.'),
    ],
    [
      'progression',
      p('Un classement si vous le souhaitez'),
      p('Vous apparaissez dans le Top Bike Sitters seulement si vous l’avez choisi. Votre adresse et votre quartier n’y figurent jamais.'),
    ],
    [
      'coeur',
      p('Pas d’argent entre membres'),
      p('Les points ne s’achètent pas, ne se convertissent pas en argent et ne se transfèrent pas à un autre membre. Faire garder son vélo reste entièrement gratuit.'),
    ],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/progression" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Comment fonctionnent les points ?')}</h1>

        <div className="encart" style={{ flexDirection: 'column', gap: 6 }}>
          <strong style={{ fontSize: 17 }}>{p('Les points récompensent les Bike Sitters')}</strong>
          <span>
            {p('Vous gagnez des points lorsque vous gardez des vélos. Ils témoignent de votre engagement et donnent accès à des avantages dans le catalogue.')}
          </span>
        </div>

        <ul className="liste" style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          {principes.map(([icone, titre, texte]) => (
            <li key={titre} className="ligne ligne-info" style={{ alignItems: 'flex-start' }}>
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom={icone} taille={24} />
              </span>
              <span className="ligne-texte">
                <strong>{titre}</strong>
                <span>{texte}</span>
              </span>
            </li>
          ))}
        </ul>

        <h2 className="titre-section">{p('Les niveaux')}</h2>
        <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
          {NIVEAUX.map((niveau) => (
            <li key={niveau.cle} className="ligne ligne-info">
              <span className="ligne-texte">
                <strong>{p(niveau.titre)}</strong>
              </span>
              <span className="pastille">
                {niveau.seuil === 0
                  ? p('Dès l’inscription')
                  : p('{n} points gagnés', { n: niveau.seuil })}
              </span>
            </li>
          ))}
        </ul>
        <p className="petit texte-doux" style={{ marginTop: 8 }}>
          {p('Le niveau suit les points gagnés au fil des gardes : utiliser des points au catalogue ne le fait pas baisser.')}
        </p>

        <div className="boutons" style={{ marginTop: 16 }}>
          <Link href="/progression" className="bouton plein">
            {p('Compris !')}
          </Link>
        </div>
      </div>
    </main>
  );
}
