import { REGLES_DE_LA_COMMUNAUTE } from '@/lib/contenu/regles';
import type { Textes } from '@/lib/i18n/langue';

import { Icone } from './icone';

/** Les règles de la communauté, en liste : la même aux membres et aux visiteurs. */
export function ListeDesRegles({ p }: { p: Textes['p'] }) {
  return (
    <ul className="liste" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {REGLES_DE_LA_COMMUNAUTE.map((regle) => (
        <li
          key={regle.titre}
          className="ligne ligne-info"
          style={{ alignItems: 'flex-start' }}
        >
          <span className="ligne-icone" aria-hidden="true">
            <Icone nom={regle.icone} taille={24} />
          </span>
          <span className="ligne-texte">
            <strong>{p(regle.titre)}</strong>
            <span>{p(regle.texte, regle.valeurs)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
