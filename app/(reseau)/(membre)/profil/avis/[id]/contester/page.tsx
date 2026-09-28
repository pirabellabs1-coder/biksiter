import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Icone } from '@/components/app/icone';
import { avisDuMembre } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { contester } from '../../../actions';
import { CarteDAvisPublie } from '../../carte-d-avis';
import { FormulaireDeTexte } from '../formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Contester un avis') };
}

export default async function ContesterUnAvis({
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
  if (!avis || avis.conteste) redirect('/profil/avis');
  return (
    <main id="contenu">
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Contester un avis')}</h1>
        <div className="encart bleu" style={{ margin: '14px 0 6px' }}>
          <Icone nom="bouclier" taille={22} />
          <span>
            {p(
              'Un modérateur relit l’avis avec l’historique de la garde. S’il ne respecte pas la charte, il est masqué. L’auteur ne sait pas que vous l’avez contesté.',
            )}
          </span>
        </div>
        <CarteDAvisPublie p={p} avis={avis} />
        <FormulaireDeTexte
          action={contester.bind(null, id)}
          nom="motif"
          longueurMaximale={1000}
          retour="/profil/avis"
          textes={{
            libelle: p('Ce qui ne va pas'),
            exemple: p('Cet avis semble décrire une autre garde.'),
            envoyer: p('Envoyer à la modération'),
            envoi: p('Envoi…'),
            revenir: p('Revenir'),
          }}
        />
      </div>
    </main>
  );
}
