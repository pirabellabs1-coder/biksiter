import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { lieuDuMembre } from '@/lib/depot/lieux';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { retirerLeLieu } from '../../actions';
import { FormulaireDeRetrait } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Retirer ce lieu') };
}

export default async function RetirerUnLieu({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { reference } = await params;
  const lieu = await lieuDuMembre(membre.id, reference);
  if (!lieu) notFound();

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/mes-lieux/${reference}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Retirer ce lieu')}</h1>
        <p className="sous-titre">
          {p('{type} · {quartier}', { type: p(lieu.type), quartier: lieu.quartier })}
        </p>
        <div className="encart rouge" style={{ marginBottom: 12 }}>
          <Icone nom="alerte" taille={22} />
          <span>
            {p('Le retrait est définitif : la fiche, ses photos et l’historique de ses gardes disparaissent. Pour faire une pause, il suffit de mettre le lieu en pause.')}
          </span>
        </div>
        <FormulaireDeRetrait
          action={retirerLeLieu.bind(null, reference)}
          retour={`/mes-lieux/${reference}`}
          textes={{
            confirmation: p('Je comprends que ce retrait est définitif.'),
            retirer: p('Retirer définitivement'),
            envoi: p('Retrait…'),
            annuler: p('Annuler'),
          }}
        />
      </div>
    </main>
  );
}
