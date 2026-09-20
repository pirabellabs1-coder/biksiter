import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { offreEnGestion } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { CATEGORIES_D_OFFRE } from '@/lib/regles/catalogue';
import { exigerUnModerateur } from '@/lib/session';

import { enregistrerLOffre } from '../../actions';
import { FormulaireDOffre } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Avantage') };
}

const NOUVEL_AVANTAGE = 'nouvel-avantage';

export default async function AvantageEnGestion({ params }: { params: Promise<{ id: string }> }) {
  await exigerUnModerateur();
  const { p } = await textes();
  const { id } = await params;
  const nouveau = id === NOUVEL_AVANTAGE;
  const offre = nouveau ? null : await offreEnGestion(id);
  if (!nouveau && !offre) notFound();

  return (
    <main id="contenu">
      <EnTete p={p} retour="/administration/catalogue" cloche={false} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{nouveau ? p('Ajouter un avantage') : p('Modifier l’avantage')}</h1>
        {offre && offre.echanges > 0 ? (
          <p className="sous-titre">
            {p('Déjà échangé {n} fois : les bons émis restent valables, même si vous désactivez l’avantage.', {
              n: offre.echanges,
            })}
          </p>
        ) : null}
        <FormulaireDOffre
          action={enregistrerLOffre.bind(null, offre ? offre.id : null)}
          initial={{
            titre: offre?.titre ?? '',
            partenaire: offre?.partenaire ?? '',
            categorie: offre?.categorie ?? 'autre',
            description: offre?.description ?? '',
            retrait: offre?.retrait ?? '',
            cout: String(offre?.coutEnMaillons ?? ''),
            stock: String(offre?.stockRestant ?? ''),
            active: offre?.active ?? true,
          }}
          categories={CATEGORIES_D_OFFRE.map((c) => [c.cle, p(c.titre)] as const)}
          textes={{
            titre: p('Titre'),
            partenaire: p('Partenaire'),
            categorie: p('Catégorie'),
            description: p('Description'),
            retrait: p('Comment le retirer'),
            cout: p('Coût en points'),
            stock: p('Exemplaires disponibles'),
            active: p('Proposer dans le catalogue'),
            activeAide: p('Désactivé, l’avantage n’apparaît plus pour les membres.'),
            enregistrer: p('Enregistrer'),
            envoi: p('Enregistrement…'),
          }}
        />
      </div>
    </main>
  );
}
