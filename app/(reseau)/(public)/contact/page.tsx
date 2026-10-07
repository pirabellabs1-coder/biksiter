import type { Metadata } from 'next';

import { FormulaireDeContact } from '@/components/maquette/compte/formulaire-de-contact';
import { textes } from '@/lib/i18n/langue';

import { BlocDeCote, PagePublique } from '../page-publique';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Nous écrire') };
}

export default async function Contact() {
  const t = await textes();
  return (
    <PagePublique
      textes={t}
      surtitre="Nous écrire"
      titre="Une question, un problème, une envie d’aider ?"
      introduction="Nous sommes une petite équipe de bénévoles. On répond à tout, en général dans la journée."
      cote={
        <BlocDeCote titre="Autrement">
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
          <p className="mention">Association sans but lucratif · Bruxelles</p>
        </BlocDeCote>
      }
    >
      <FormulaireDeContact />
    </PagePublique>
  );
}
