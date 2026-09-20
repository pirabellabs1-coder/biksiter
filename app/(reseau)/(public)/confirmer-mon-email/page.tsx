import type { Metadata } from 'next';

import { Icone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';

import { EcranDeCompte } from '../ecran-de-compte';
import { confirmerMonAdresse } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return {
    title: p('Confirmer mon adresse'),
    // Le jeton est dans l'adresse de la page : il ne doit partir nulle part
    // dans l'en-tête Referer.
    referrer: 'no-referrer',
  };
}

/** L'écran ouvert depuis le lien de confirmation reçu par courriel. */
export default async function ConfirmerMonEmail({
  searchParams,
}: {
  searchParams: Promise<{ jeton?: string }>;
}) {
  const { p } = await textes();
  const jeton = ((await searchParams).jeton ?? '').slice(0, 100);

  return (
    <EcranDeCompte p={p} retour="/">
      <div className="centre-vertical">
        <span className="rond-etat grand" aria-hidden="true">
          <Icone nom="enveloppe" taille={42} strokeWidth={2} />
        </span>
        <h1 className="titre-ecran centre">{p('Confirmer mon adresse')}</h1>
        <p className="sous-titre centre">
          {p(
            'Pour terminer, confirmez que cette adresse e-mail est bien la vôtre. C’est elle qui recevra les demandes et les réponses des autres membres.',
          )}
        </p>
        {/* La confirmation passe par ce bouton, jamais par l'ouverture du
            lien : voir `confirmerMonAdresse`. */}
        <form action={confirmerMonAdresse}>
          <input type="hidden" name="jeton" value={jeton} />
          <button type="submit" className="bouton plein">
            {p('Confirmer mon adresse')}
          </button>
        </form>
      </div>
    </EcranDeCompte>
  );
}
