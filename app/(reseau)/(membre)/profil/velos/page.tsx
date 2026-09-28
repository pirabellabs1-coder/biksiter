import type { Metadata } from 'next';

import { FormulaireDuVelo } from '@/components/maquette/compte/formulaire-du-velo';
import { statistiquesDuBikeSitter } from '@/lib/depot/lieux';
import { velosDuMembre } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import { exigerUnMembre } from '@/lib/session';

import { supprimerUnVelo } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mon vélo') };
}

export default async function MonVelo({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const _mode = await modeCourant();
  const [velos, _nonLues, _stats] = await Promise.all([
    velosDuMembre(membre.id),
    nombreDeNotificationsNonLues(membre.id),
    statistiquesDuBikeSitter(membre.id),
  ]);
  const { velo } = await searchParams;

  return (
    <>
      <div className="page page-etroite" id="contenu">
        <header className="page-tete">
          <span className="kicker">MON VÉLO</span>
          <h1>Décrivez votre vélo.</h1>
          <p>
            Facultatif, et utile. Le Bike Sitter sait ce qu’il accueille, et en
            cas de litige le constat part d’une description faite avant la
            garde, pas après.
          </p>
        </header>

        {velo === 'ajoute' ? (
          <p className="mention" role="status">
            Vélo enregistré — il sera proposé à chaque demande.
          </p>
        ) : null}
        {velo === 'retire' ? (
          <p className="mention" role="status">
            Vélo supprimé.
          </p>
        ) : null}
        {velo === 'engage' ? (
          <p className="msg-erreur" role="alert">
            Ce vélo est engagé dans une garde en cours : il pourra être
            supprimé une fois la garde close.
          </p>
        ) : null}

        {/* La maquette ne décrit qu'un vélo ; un membre peut en enregistrer
            plusieurs, et doit pouvoir en retirer un. */}
        {velos.length > 0 ? (
          <section className="bloc">
            <h2>Vos vélos</h2>
            <ul className="verifs">
              {velos.map((v) => (
                <li key={v.id}>
                  <span className="vi" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <b>{v.nom}</b>
                    <span>
                      {[v.type, v.marque, v.couleur].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <form action={supprimerUnVelo}>
                    <input type="hidden" name="id" value={v.id} />
                    <button type="submit" className="lien">
                      Retirer
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <FormulaireDuVelo />
      </div>
    </>
  );
}
