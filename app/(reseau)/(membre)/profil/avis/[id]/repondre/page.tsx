import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { textes } from '@/lib/i18n/langue';

import { repondre } from '../../../actions';
import { FormulaireDeTexte } from '../formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Répondre à un avis') };
}

export default async function RepondreAUnAvis({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { p } = await textes();
  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/avis" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Répondre à un avis')}</h1>
        <p className="sous-titre">
          {p(
            'Votre réponse s’affiche sous l’avis, sur votre profil. Une seule réponse est possible : prenez le temps de la relire.',
          )}
        </p>
        <FormulaireDeTexte
          action={repondre.bind(null, id)}
          nom="reponse"
          longueurMaximale={600}
          retour="/profil/avis"
          textes={{
            libelle: p('Votre réponse'),
            exemple: p('Merci pour votre retour…'),
            envoyer: p('Publier la réponse'),
            envoi: p('Publication…'),
            revenir: p('Revenir'),
          }}
        />
      </div>
    </main>
  );
}
