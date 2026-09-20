import type { Metadata } from 'next';

import { textes } from '@/lib/i18n/langue';

import { EcranDeCompte } from '../ecran-de-compte';
import { FormulaireDOubli } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mot de passe oublié') };
}

export default async function MotDePasseOublie() {
  const { p } = await textes();

  return (
    <EcranDeCompte p={p} retour="/connexion">
      <h1 className="titre-ecran">{p('Mot de passe oublié')}</h1>
      <p className="sous-titre">
        {p(
          'Entrez votre e-mail. Vous recevrez un lien pour définir un nouveau mot de passe.',
        )}
      </p>
      <FormulaireDOubli
        libelles={{
          email: p('E-mail'),
          envoyer: p('Envoyer le lien'),
          enCours: p('Envoi…'),
          retour: p('Revenir à la connexion'),
        }}
      />
    </EcranDeCompte>
  );
}
