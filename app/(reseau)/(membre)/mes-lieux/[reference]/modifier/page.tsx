import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { lieuDuMembre } from '@/lib/depot/lieux';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { enregistrerLeLieu } from '../../actions';
import { FormulaireDuLieu } from '../../formulaire-du-lieu';
import { optionsEtTextesDuLieu } from '../../textes-du-lieu';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Modifier mon lieu') };
}

export default async function ModifierUnLieu({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { reference } = await params;
  const lieu = await lieuDuMembre(membre.id, reference);
  if (!lieu) notFound();
  const { options, textes: libelles } = optionsEtTextesDuLieu(p);

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/mes-lieux/${reference}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Modifier mon lieu')}</h1>
        <p className="sous-titre">
          {p('Les modifications s’appliquent aux prochaines demandes. Les gardes déjà acceptées ne sont pas affectées.')}
        </p>
        <FormulaireDuLieu
          action={enregistrerLeLieu.bind(null, reference)}
          valeurs={{
            type: lieu.type,
            adresse: lieu.adresseExacte,
            quartier: lieu.quartier,
            acces: lieu.acces,
            verrouillage: lieu.verrouillage,
            intemperie: lieu.intemperie,
            ancrage: lieu.ancrage ?? 'Autre',
            capacite: lieu.capacite,
            velos: lieu.velosAcceptes,
            services: lieu.services,
            precisions: lieu.precisions ?? '',
            description: lieu.description ?? '',
          }}
          options={options}
          textes={{ ...libelles, envoyer: p('Enregistrer') }}
        />
      </div>
    </main>
  );
}
