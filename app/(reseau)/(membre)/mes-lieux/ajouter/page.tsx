import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { textes } from '@/lib/i18n/langue';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { exigerUnMembre } from '@/lib/session';

import { enregistrerLeLieu } from '../actions';
import { FormulaireDuLieu } from '../formulaire-du-lieu';
import { optionsEtTextesDuLieu } from '../textes-du-lieu';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Ajouter un emplacement') };
}

export default async function AjouterUnLieu() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  if ((await nombreDEmplacements(membre.id)) >= EMPLACEMENTS_PAR_MEMBRE) {
    redirect('/mes-lieux');
  }
  const { options, textes: libelles } = optionsEtTextesDuLieu(p);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/mes-lieux" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <div className="etapes-app">
          <span>{p('Votre lieu')}</span>
          <span className="barre" aria-hidden="true">
            <span style={{ width: '33%' }} />
          </span>
          <span>1 / 3</span>
        </div>
        <h1 className="titre-ecran">{p('Ajouter un emplacement')}</h1>
        <p className="sous-titre">
          {p('L’espace où vous accueillez les vélos doit être privé, fermé et sécurisé. Vous en précisez ici le type et les caractéristiques.')}
        </p>
        <FormulaireDuLieu
          action={enregistrerLeLieu.bind(null, null)}
          valeurs={{
            type: '',
            adresse: '',
            quartier: '',
            acces: 'Plain-pied',
            verrouillage: 'cle',
            intemperie: 'interieur',
            ancrage: 'Ancrage mural',
            capacite: 2,
            velos: ['Ville', 'VTC', 'Électrique'],
            services: [],
            precisions: '',
            description: '',
          }}
          options={options}
          textes={libelles}
        />
      </div>
    </main>
  );
}
