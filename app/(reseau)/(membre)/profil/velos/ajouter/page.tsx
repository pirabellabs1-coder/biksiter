import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { textes } from '@/lib/i18n/langue';
import { TYPES_VELO } from '@/lib/regles/velos';

import { FormulaireDeVelo } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Ajouter un vélo') };
}

export default async function AjouterUnVelo() {
  const { p } = await textes();
  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/velos" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Ajouter un vélo')}</h1>
        <p className="sous-titre">
          {p('Décrivez votre vélo : le bike sitter saura ce qu’il accueille.')}
        </p>
        <FormulaireDeVelo
          types={TYPES_VELO.map((type) => [type, p(type)] as const)}
          textes={{
            nom: p('Nom'),
            nomExemple: p('Mon vélo de ville'),
            marque: p('Marque'),
            type: p('Type'),
            couleur: p('Couleur'),
            couleurExemple: p('Bleu'),
            cadre: p('Numéro de cadre (facultatif)'),
            cadreExplication: p(
              "Le numéro de cadre n'est jamais affiché publiquement. Il sert uniquement à retrouver un vélo déclaré volé.",
            ),
            enregistrer: p('Enregistrer le vélo'),
            envoi: p('Enregistrement…'),
          }}
        />
      </div>
    </main>
  );
}
