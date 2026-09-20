import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';

import { contester } from '../../../actions';
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
  const { id } = await params;
  const { p } = await textes();
  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/avis" cloche={false} />
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
        <FormulaireDeTexte
          action={contester.bind(null, id)}
          nom="motif"
          longueurMaximale={1000}
          retour="/profil/avis"
          textes={{
            libelle: p('Ce qui ne va pas'),
            exemple: p('Cet avis décrit une autre garde…'),
            envoyer: p('Envoyer à la modération'),
            envoi: p('Envoi…'),
            revenir: p('Revenir'),
          }}
        />
      </div>
    </main>
  );
}
