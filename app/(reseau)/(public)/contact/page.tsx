import type { Metadata } from 'next';

import { FormulaireDeContact } from '@/components/maquette/compte/formulaire-de-contact';
import { textes } from '@/lib/i18n/langue';
export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Nous écrire') };
}

export default async function Contact() {
  return (
    <>
      <div className="page" id="contenu">
        <header className="page-tete">
          <span className="kicker">NOUS ÉCRIRE</span>
          <h1>Une question, un problème, une envie d&apos;aider ?</h1>
          <p>
            Nous sommes une petite équipe de bénévoles. On répond à tout, en
            général dans la journée.
          </p>
        </header>

        <div className="page-grille contact-grille">
          <FormulaireDeContact />

          <aside className="bloc">
            <h2>Autrement</h2>
            <dl className="infos">
              <div className="info">
                <dt>E-mail</dt>
                <dd>
                  <b>bonjour@bikesitters.org</b>
                  <span>Pour tout le reste.</span>
                </dd>
              </div>
              <div className="info">
                <dt>Signalement</dt>
                <dd>
                  <b>Depuis la garde</b>
                  <span>
                    Le bouton « Signaler un problème » alerte un modérateur.
                  </span>
                </dd>
              </div>
              <div className="info">
                <dt>Presse</dt>
                <dd>
                  <b>presse@bikesitters.org</b>
                  <span>Dossier et visuels sur demande.</span>
                </dd>
              </div>
            </dl>
            <p className="mention">
              Association sans but lucratif · Bruxelles
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
