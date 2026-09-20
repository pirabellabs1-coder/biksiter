import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { amenagementsDeLaGarde } from '@/lib/depot/amenagements';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { textes } from '@/lib/i18n/langue';
import {
  LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT,
  RETARDS_ANNONCABLES,
  retardAnnoncable,
} from '@/lib/regles/amenagements';
import { heureABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { prevenirDUnRetard } from '../amenagements';
import { FormulaireDeRetard } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Je serai en retard') };
}

export default async function JeSeraiEnRetard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { id } = await params;
  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();

  const phase = retardAnnoncable(garde.etat, garde, new Date());
  const { retards } = await amenagementsDeLaGarde(garde.id);
  const dejaAnnonce = retards.some((r) => r.acteur === garde.role && r.phase === phase);
  if (!phase || dejaAnnonce) redirect(`/gardes/${id}`);

  const autre = garde.autre.prenom;
  const reference = phase === 'depot' ? garde.debut : garde.fin;

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <span className="rond-etat" aria-hidden="true" style={{ margin: '4px 0 16px' }}>
          <Icone nom="horloge" taille={30} strokeWidth={2.2} />
        </span>
        <h1 className="titre-ecran">{p('Je serai en retard')}</h1>
        <p className="sous-titre">
          {phase === 'depot'
            ? p('Le dépôt est prévu à {heure}. Prévenez {prenom} pour que l’attente se passe bien.', {
                heure: heureABruxelles(reference),
                prenom: autre,
              })
            : p('La reprise est prévue à {heure}. Prévenez {prenom} pour que l’attente se passe bien.', {
                heure: heureABruxelles(reference),
                prenom: autre,
              })}
        </p>

        <FormulaireDeRetard
          action={prevenirDUnRetard.bind(null, garde.id)}
          durees={RETARDS_ANNONCABLES.map((minutes) => [
            minutes,
            minutes === 60 ? p('+ 1 h') : p('+ {n} min', { n: minutes }),
          ] as const)}
          longueur={LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT}
          textes={{
            combien: p('De combien de temps ?'),
            information: p('Nous prévenons {prenom} tout de suite, avec l’heure à laquelle vous pensez arriver.', {
              prenom: autre,
            }),
            mot: p('Ajouter un message (facultatif)'),
            exemple: p('Ex. : je suis dans les transports, j’arrive dans 15 minutes. Merci pour votre patience !'),
            prevenir: p('Prévenir {prenom}', { prenom: autre }),
            envoi: p('Envoi…'),
          }}
        />
      </div>
    </main>
  );
}
