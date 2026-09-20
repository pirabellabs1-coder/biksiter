import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { textes } from '@/lib/i18n/langue';
import {
  CRITERES,
  DELAI_POUR_DEPOSER_JOURS,
  onPeutEncoreDeposer,
} from '@/lib/regles/avis-de-garde';
import { exigerUnMembre } from '@/lib/session';

import { FormulaireDAvis } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Avis') };
}

export default async function Avis({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { id } = await params;
  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  if (garde.etat !== 'termine' || garde.avis.deposeParMoi)
    redirect(`/gardes/${id}`);

  const fin =
    garde.evenements.find((e) => e.etape === 'termine')?.faitLe ?? garde.fin;
  if (!onPeutEncoreDeposer(new Date(fin), new Date())) {
    return (
      <main id="contenu">
        <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
        <div className="ecran-app ecran-parcours">
          <div className="carte vide-liste">
            <Icone nom="etoile" taille={30} />
            <strong>{p('Le délai pour laisser un avis est passé.')}</strong>
            <span>
              {p('Il court pendant {n} jours après la fin de la garde.', {
                n: DELAI_POUR_DEPOSER_JOURS,
              })}
            </span>
          </div>
        </div>
      </main>
    );
  }

  const sens =
    garde.role === 'cycliste'
      ? 'cycliste_vers_bike_sitter'
      : 'bike_sitter_vers_cycliste';

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
      <h1 className="titre-ecran">{p('Comment s’est passée la garde ?')}</h1>
      <p className="sous-titre">
        {p('Partagez votre expérience avec {prenom} pour aider la communauté.', {
          prenom: garde.autre.prenom,
        })}
      </p>
      <div className="carte personne-de-garde">
        <span className="avatar-app" aria-hidden="true">
          {garde.autre.prenom.charAt(0)}
        </span>
        <span className="ligne-texte">
          <strong>
            {garde.autre.prenom} {garde.autre.initiale}.
          </strong>
          <span>
            {garde.role === 'cycliste' ? p('Votre Bike Sitter') : p('Cycliste')}
          </span>
        </span>
        <Icone nom="velo" taille={30} className="texte-vert" />
      </div>
      <FormulaireDAvis
        id={id}
        criteres={CRITERES[sens].map((c) => [c, p(c)] as const)}
        textes={{
          note: p('Votre note'),
          detail: p('Dans le détail (facultatif)'),
          question: p('Votre avis (facultatif)'),
          placeholder: p(
            "Ce qui s'est bien passé, ce qui pourrait aider le prochain cycliste…",
          ),
          generale: p('Note générale'),
          sur: p('sur 5'),
          bandeau: p(
            "Votre avis reste invisible tant que {prenom} n'a pas déposé le sien. Publication automatique après 7 jours.",
            { prenom: garde.autre.prenom },
          ),
          obligatoire: p('Donnez une note générale.'),
          publier: p('Publier mon avis'),
          envoi: p('Envoi…'),
        }}
      />
      </div>
    </main>
  );
}
