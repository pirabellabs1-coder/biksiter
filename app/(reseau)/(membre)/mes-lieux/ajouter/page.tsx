import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { CAPACITE_MAXIMALE } from '@/lib/formulaires/emplacement';
import { textes } from '@/lib/i18n/langue';
import { ACCES } from '@/lib/regles/caracteristiques';
import {
  EMPLACEMENTS_PAR_MEMBRE,
  TYPES_EMPLACEMENT_PRIVE,
} from '@/lib/regles/emplacements';
import { TYPES_VELO } from '@/lib/regles/velos';
import { exigerUnMembre } from '@/lib/session';

import { enregistrerLeLieu } from '../actions';
import { FormulaireDuLieu } from '../formulaire-du-lieu';
import { optionsEtTextesDuLieu } from '../textes-du-lieu';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Ajouter un emplacement') };
}

/**
 * Les choix faits à l'étape précédente (« Votre espace ») arrivent dans
 * l'adresse. On ne garde que ceux qui figurent dans les listes fermées : une
 * valeur inconnue retombe sur le choix par défaut.
 */
function choixDeLEtapePrecedente(parametres: Record<string, string | string[] | undefined>) {
  const un = (cle: string) => {
    const valeur = parametres[cle];
    return Array.isArray(valeur) ? valeur[0] : valeur;
  };
  const plusieurs = (cle: string) => {
    const valeur = parametres[cle];
    return valeur === undefined ? [] : Array.isArray(valeur) ? valeur : [valeur];
  };
  const type = un('type');
  const acces = un('acces');
  const capacite = Number.parseInt(un('capacite') ?? '', 10);
  const velos = plusieurs('velosAcceptes').filter((v) =>
    (TYPES_VELO as readonly string[]).includes(v),
  );
  return {
    type:
      type && (TYPES_EMPLACEMENT_PRIVE as readonly string[]).includes(type)
        ? type
        : '',
    acces:
      acces && (ACCES as readonly string[]).includes(acces) ? acces : 'Plain-pied',
    capacite:
      Number.isInteger(capacite) && capacite >= 1 && capacite <= CAPACITE_MAXIMALE
        ? capacite
        : 2,
    velos: velos.length > 0 ? velos : ['Ville', 'VTC', 'Électrique'],
  };
}

export default async function AjouterUnLieu({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const choix = choixDeLEtapePrecedente(await searchParams);
  const { p } = await textes();
  if ((await nombreDEmplacements(membre.id)) >= EMPLACEMENTS_PAR_MEMBRE) {
    redirect('/mes-lieux');
  }
  const { options, textes: libelles } = optionsEtTextesDuLieu(p);

  return (
    <main id="contenu">
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
          {p('L’emplacement où vous accueillez les vélos doit être privé, fermé et sécurisé. Vous en précisez ici le type et les caractéristiques.')}
        </p>
        <FormulaireDuLieu
          action={enregistrerLeLieu.bind(null, null)}
          valeurs={{
            type: choix.type,
            adresse: '',
            quartier: '',
            acces: choix.acces,
            verrouillage: 'cle',
            intemperie: 'interieur',
            ancrage: 'Ancrage mural',
            capacite: choix.capacite,
            velos: choix.velos,
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
