import type { Metadata } from 'next';
import Link from 'next/link';

import Appel from '@/components/appel';
import BandeauDePage from '@/components/bandeau-de-page';
import SectionEditoriale from '@/components/section-editoriale';
import { QUESTIONS } from '@/lib/contenu/questions';

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description:
    'Gratuité, adresse, vérification d’identité, types de vélo, remise du vélo : les questions qu’on nous pose le plus souvent.',
};

export default function QuestionsFrequentes() {
  return (
    <>
      <BandeauDePage
        surtitre="Questions fréquentes"
        titre="Les questions qu’on nous pose."
        chapeau="Gratuité, confidentialité de l’adresse, vérification d’identité, remise du vélo : les réponses aux questions les plus fréquentes."
        scene="ensemble"
      />

      <SectionEditoriale
        id="reponses"
        titre="Les réponses courtes"
        chapeau={
          <>
            Il manque la vôtre ?{' '}
            <Link href="/a-propos" className="lien">
              Écrivez-nous
            </Link>
            , nous enrichissons cette page au fil de vos questions.
          </>
        }
      >
        <dl className="questions">
          {QUESTIONS.map(({ question, reponse }) => (
            <div key={question}>
              <dt>{question}</dt>
              <dd>{reponse}</dd>
            </div>
          ))}
        </dl>
      </SectionEditoriale>

      <Appel
        surtitre="Le reste"
        titre="Tout le fonctionnement, pas à pas."
        chapeau="Du dépôt à la reprise, découvrez le rôle du cycliste, celui du bike sitter et celui du service."
        actions={
          <>
            <Link href="/fonctionnement" className="bouton bouton--principal">
              Comment ça marche
            </Link>
            <Link href="/emplacements" className="bouton bouton--discret">
              Trouver un emplacement
            </Link>
          </>
        }
      />
    </>
  );
}
