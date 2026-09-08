import type { Metadata } from 'next';
import Link from 'next/link';

import { QUESTIONS } from '@/lib/contenu/questions';

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description:
    'Gratuité, adresse, vérification d’identité, types de vélo, remise du vélo : les questions qu’on nous pose le plus souvent.',
};

export default function QuestionsFrequentes() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Questions fréquentes</p>
      <h1 className="titre-page">Les questions qu’on nous pose</h1>

      <dl className="questions">
        {QUESTIONS.map(({ question, reponse }) => (
          <div key={question}>
            <dt>{question}</dt>
            <dd>{reponse}</dd>
          </div>
        ))}
      </dl>

      <p className="discret questions__apres">
        Il manque la vôtre ?{' '}
        <Link href="/a-propos" className="lien">
          Écrivez-nous
        </Link>
        , nous complétons cette page au fil des messages.
      </p>
    </div>
  );
}
