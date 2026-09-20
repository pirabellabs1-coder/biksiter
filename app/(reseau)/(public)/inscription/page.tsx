import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { baseConfiguree } from '@/lib/bd/client';
import { invitationPresentee } from '@/lib/depot/membres';
import { textes } from '@/lib/i18n/langue';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';
import { membreConnecte } from '@/lib/session';

import { EcranDeCompte, EtapesDeLInscription } from '../ecran-de-compte';
import { FormulaireDInscription } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Créer votre compte') };
}

/** Première étape de l'inscription : le compte. */
export default async function Inscription({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  if (await membreConnecte()) {
    redirect('/inscription/telephone');
  }

  const { p } = await textes();
  const code = ((await searchParams).code ?? '').trim().toUpperCase();

  // Pendant le lancement, on n'arrive ici qu'avec une invitation valable :
  // sans elle, l'écran d'invitation explique ce qui manque.
  if (INSCRIPTION_SUR_INVITATION && baseConfiguree()) {
    const invitation = code ? await invitationPresentee(code) : null;
    if (!invitation) {
      redirect(
        code ? `/invitation?code=${encodeURIComponent(code)}` : '/invitation',
      );
    }
  }

  const retour = code
    ? `/invitation?code=${encodeURIComponent(code)}`
    : '/invitation';

  return (
    <EcranDeCompte p={p} retour={retour}>
      <EtapesDeLInscription p={p} etape={1} titre={p('Compte')} />
      <h1 className="titre-ecran">{p('Créer votre compte')}</h1>
      <p className="sous-titre">
        {p(
          "Vous rejoignez le réseau comme membre. Vous cherchez une place quand vous en avez besoin, et vous devenez bike sitter si vous décidez d'en proposer une — même personne, même compte.",
        )}
      </p>

      <FormulaireDInscription
        code={code}
        libelles={{
          prenom: p('Prénom'),
          nom: p('Nom'),
          email: p('E-mail'),
          motDePasse: p('Mot de passe'),
          motDePasseAide: p('8 caractères minimum'),
          conditionsAvant: p('En continuant, vous acceptez les'),
          cgu: p('CGU'),
          conditionsEntre: p('et la'),
          confidentialite: p('politique de confidentialité'),
          continuer: p('Continuer'),
          enCours: p('Création…'),
        }}
      />

      <p className="centre texte-doux" style={{ margin: '20px 0 0', fontSize: 15 }}>
        {p('Déjà un compte ?')}{' '}
        <Link href="/connexion" className="lien-souligne texte-vert">
          {p('Se connecter')}
        </Link>
      </p>
    </EcranDeCompte>
  );
}
