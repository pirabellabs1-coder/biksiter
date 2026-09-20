import type { Metadata } from 'next';

import { baseConfiguree } from '@/lib/bd/client';
import { nombreDInscrits } from '@/lib/depot/liste-attente';
import { textes } from '@/lib/i18n/langue';

import { EcranDeCompte } from '../ecran-de-compte';
import { FormulaireDeLaListe } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p("Liste d'attente") };
}

/** La ville proposée par défaut sur l'accueil n'est pas un quartier. */
const VILLE_PAR_DEFAUT = 'bruxelles';

export default async function ListeDAttente({
  searchParams,
}: {
  searchParams: Promise<{ ville?: string }>;
}) {
  const { p } = await textes();
  const ville = ((await searchParams).ville ?? '').trim().slice(0, 80);
  const quartierPropose = ville.toLowerCase() === VILLE_PAR_DEFAUT ? '' : ville;

  let inscrits = 0;
  if (baseConfiguree()) {
    try {
      inscrits = await nombreDInscrits();
    } catch {
      // Le nombre accompagne la page sans en être le sujet.
    }
  }

  return (
    <EcranDeCompte p={p} retour="/invitation">
      <h1 className="titre-ecran">{p("Liste d'attente")}</h1>
      <p className="sous-titre">
        {p(
          "Nous ouvrons un quartier quand il y a assez de bike sitters pour qu'un cycliste y trouve une place à chaque fois. Votre inscription nous dit où ouvrir ensuite.",
        )}
      </p>
      <FormulaireDeLaListe
        quartierPropose={quartierPropose}
        libelles={{
          email: p('Votre e-mail'),
          quartier: p('Votre quartier'),
          plutot: p('Vous seriez plutôt'),
          roles: [
            ['cycliste', p('Cycliste')],
            ['bike_sitter', p('Bike sitter')],
            ['les_deux', p('Les deux')],
          ],
          conseil: p(
            "Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent l'ouverture d'un quartier, pas les cyclistes.",
          ),
          inscrire: p("M'inscrire"),
          enCours: p('Envoi…'),
          retour: p('Revenir à l’accueil'),
        }}
      />
      {inscrits > 0 ? (
        <p className="petit texte-doux centre" style={{ margin: '14px 0 0' }}>
          {inscrits > 1
            ? p('{nombre} personnes déjà inscrites sur la liste.', {
                nombre: inscrits,
              })
            : p('Une personne déjà inscrite sur la liste.')}
        </p>
      ) : null}
    </EcranDeCompte>
  );
}
