import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { avisDuMembre } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { repondre } from '../../../actions';
import { CarteDAvisPublie } from '../../carte-d-avis';
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
  const membre = await exigerUnMembre();
  const { id } = await params;
  const [{ p }, { recus }] = await Promise.all([
    textes(),
    avisDuMembre(membre.id),
  ]);
  // On répond à un avis qu'on a sous les yeux : il s'affiche en tête.
  const avis = recus.find((recu) => recu.id === id);
  if (!avis || avis.reponse) redirect('/profil/avis');
  return (
    <main id="contenu">
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Répondre à un avis')}</h1>
        <p className="sous-titre">
          {p(
            'Votre réponse s’affiche sous l’avis, sur votre profil. Une seule réponse est possible : prenez le temps de la relire.',
          )}
        </p>
        <CarteDAvisPublie p={p} avis={avis} />
        <FormulaireDeTexte
          action={repondre.bind(null, id)}
          nom="reponse"
          longueurMaximale={600}
          retour="/profil/avis"
          textes={{
            libelle: p('Votre réponse'),
            exemple: p('Merci pour votre avis. Au plaisir d’une prochaine garde.'),
            envoyer: p('Publier la réponse'),
            envoi: p('Publication…'),
            revenir: p('Revenir'),
          }}
        />
      </div>
    </main>
  );
}
