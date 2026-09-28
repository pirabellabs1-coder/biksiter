import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { heure } from '@/components/maquette/garde/dates';
import { DecisionNonRecuperee } from '@/components/maquette/gardes-difficiles/decision-non-recuperee';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { transitionPermise } from '@/lib/regles/garde';
import { exigerUnMembre } from '@/lib/session';
import { dePrenom } from '@/lib/texte/elision';

import { gesteAvecMotif } from '../actions';

export const metadata: Metadata = { title: 'Vélo non récupéré' };

export default async function NonRecupere({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id } = await params;

  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  const maintenant = new Date();
  // L'écran ne s'adresse qu'au bike sitter qui a encore le vélo, l'heure passée.
  if (
    garde.role !== 'bike_sitter' ||
    garde.fin > maintenant ||
    !transitionPermise(garde.etat, 'signaler', garde.role)
  ) {
    redirect(`/gardes/${id}`);
  }

  const prenom = garde.autre.prenom;

  return (
    <main id="contenu" data-cote="sitter">
      <div className="page page-etroite">
        <header className="page-tete">
          <span className="kicker">Vélo non récupéré</span>
          <h1>Le vélo est toujours chez vous</h1>
          <p>
            La garde {dePrenom(prenom)} {garde.autre.initiale}. se terminait à{' '}
            {heure(garde.fin)}. Un retard s’arrange souvent en un message :
            écrivez d’abord à {prenom}. Sans nouvelles, prévenez un
            modérateur, qui prend le relais pour joindre {prenom} et trouver
            une solution avec vous.
          </p>
        </header>

        <DecisionNonRecuperee
          action={gesteAvecMotif.bind(null, id, 'signaler')}
          prenom={prenom}
          conversation={`/messages/${id}`}
        />
      </div>
    </main>
  );
}
