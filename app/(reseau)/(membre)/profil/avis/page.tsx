import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { Confirmation } from '@/components/maquette/confirmation';
import { gardesDuMembre } from '@/lib/depot/accueil';
import { avisDuMembre } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { onPeutEncoreDeposer } from '@/lib/regles/avis-de-garde';
import { exigerUnMembre } from '@/lib/session';
import { enJour } from '@/lib/temps';

import { CarteDAvisPublie } from './carte-d-avis';

export const metadata: Metadata = { title: 'Mes avis' };

const CONFIRMATIONS: Record<string, string> = {
  reponse: 'Votre réponse est publiée sous l’avis.',
  contestation:
    'Votre demande est transmise à la modération. Vous serez prévenu de sa décision.',
};

/**
 * Les avis d'un membre, dans les deux sens.
 *
 * En tête, les gardes qui attendent encore son avis : c'est la seule chose à
 * faire sur cet écran. Viennent ensuite les avis reçus, auxquels on peut
 * répondre ou qu'on peut contester, puis ceux qu'on a écrits.
 */
export default async function AvisDuMembre({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const [{ p }, parametres, gardes, avis] = await Promise.all([
    textes(),
    searchParams,
    gardesDuMembre(membre.id),
    avisDuMembre(membre.id),
  ]);

  const maintenant = new Date();
  // La liste des gardes dit déjà si l'avis a été donné : pas besoin de
  // relire chaque garde en détail.
  const aNoter = gardes.filter(
    (garde) =>
      garde.etat === 'termine' &&
      !garde.avisDonne &&
      onPeutEncoreDeposer(new Date(garde.fin), maintenant),
  );

  const confirmation =
    parametres.reponse === 'publiee'
      ? CONFIRMATIONS.reponse
      : parametres.contestation === 'envoyee'
        ? CONFIRMATIONS.contestation
        : null;

  return (
    <main id="contenu" className="ecran">
      {confirmation ? <Confirmation texte={confirmation} /> : null}

      <header className="ecran-tete">
        <p className="kicker">Mes avis</p>
        <h1>Vos avis</h1>
        <p className="ecran-intro">
          Après chaque garde, les deux membres peuvent laisser un avis. Les
          deux sont publiés ensemble, pour que chacun écrive librement.
        </p>
      </header>

      {aNoter.length > 0 ? (
        <section aria-labelledby="titre-a-noter">
          <h2 className="titre-section" id="titre-a-noter">
            À donner
            <span className="titre-compteur">{aNoter.length}</span>
          </h2>
          <ul className="groupe" role="list">
            {aNoter.map((garde) => (
              <li key={garde.id}>
                <Link href={`/gardes/${garde.id}/avis`} className="rangee">
                  <span className="rangee-icone" aria-hidden="true">
                    <Icone nom="etoile" taille={18} strokeWidth={2} />
                  </span>
                  <span className="rangee-texte">
                    <strong>
                      {garde.autrePrenom} {garde.autreInitiale}.
                    </strong>
                    <span>
                      Garde du {enJour(new Date(garde.debut))} ·{' '}
                      {garde.role === 'cycliste'
                        ? 'votre bike sitter'
                        : 'cycliste accueilli'}
                    </span>
                  </span>
                  <Icone nom="chevron" taille={18} className="rangee-chevron" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="titre-recus">
        <h2 className="titre-section" id="titre-recus">
          Reçus
          {avis.recus.length > 0 ? (
            <span className="titre-compteur">{avis.recus.length}</span>
          ) : null}
        </h2>
        {avis.recus.length === 0 ? (
          <p className="prog-note">
            Les avis arrivent après vos premières gardes menées à leur terme.
          </p>
        ) : (
          <div className="pile-cartes">
            {avis.recus.map((recu) => (
              <CarteDAvisPublie key={recu.id} p={p} avis={recu} actions />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="titre-donnes">
        <h2 className="titre-section" id="titre-donnes">
          Donnés
          {avis.donnes.length > 0 ? (
            <span className="titre-compteur">{avis.donnes.length}</span>
          ) : null}
        </h2>
        {avis.donnes.length === 0 ? (
          <p className="prog-note">Vous n’avez pas encore laissé d’avis.</p>
        ) : (
          <ul className="groupe" role="list">
            {avis.donnes.map((donne) => (
              <li key={donne.id} className="rangee rangee-avis-donne">
                <span className="rangee-texte">
                  <strong>
                    Pour {donne.ciblePrenom} · {donne.note}/5
                  </strong>
                  {donne.texte ? <span>{donne.texte}</span> : null}
                  <span>
                    {enJour(new Date(donne.ecritLe))}
                    {' · '}
                    <span className={donne.publie ? 'status' : 'status status-attente'}>
                      {donne.publie
                        ? 'Publié'
                        : 'Publication à venir'}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
