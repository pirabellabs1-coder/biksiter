import Link from 'next/link';

import type { RubriqueAffichee } from '@/lib/contenu/questions';
import type { Textes } from '@/lib/i18n/langue';

import { Icone } from './icone';

/**
 * Des rubriques de questions, repliées : on lit les titres d'un coup d'œil, on
 * ouvre celle qui répond à sa question. Une recherche les ouvre toutes.
 */
export function RubriquesDeQuestions({
  p,
  rubriques,
  ouverte,
  recherche,
}: {
  p: Textes['p'];
  rubriques: readonly RubriqueAffichee[];
  /** La rubrique à ouvrir d'emblée, quand un lien y mène. */
  ouverte?: string;
  recherche: boolean;
}) {
  return (
    <div className="pile">
      {rubriques.map((rubrique) => (
        <details
          key={rubrique.cle}
          id={rubrique.cle}
          className="carte rubrique-d-aide"
          open={recherche || ouverte === rubrique.cle}
        >
          <summary className="ligne sans-cadre" style={{ padding: 0, listStyle: 'none' }}>
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom={rubrique.icone} taille={24} />
            </span>
            <span className="ligne-texte">
              <strong>{p(rubrique.titre)}</strong>
              <span>{p(rubrique.description)}</span>
            </span>
            <Icone nom="chevron" taille={20} className="texte-leger" />
          </summary>
          <dl style={{ margin: '12px 0 0' }}>
            {rubrique.questions.map((question) => (
              <div
                key={question.question}
                style={{ padding: '10px 0', borderTop: '1px solid var(--bord)' }}
              >
                <dt style={{ fontWeight: 700, fontSize: 15 }}>{question.question}</dt>
                <dd
                  className="texte-doux"
                  style={{ margin: '4px 0 0', fontSize: 14.5, lineHeight: 1.5 }}
                >
                  {question.reponse}
                  {question.lien ? (
                    <>
                      {' '}
                      <Link href={question.lien.href} className="lien-souligne">
                        {p(question.lien.libelle)}
                      </Link>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
    </div>
  );
}
