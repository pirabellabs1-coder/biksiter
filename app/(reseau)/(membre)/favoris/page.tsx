import type { Metadata } from 'next';
import Link from 'next/link';

import { Avatar } from '@/components/app/avatar';
import { Icone } from '@/components/app/icone';
import { photoDeLEspace } from '@/components/maquette/resultats/modele';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { mesFavoris } from '@/lib/depot/favoris';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes favoris') };
}

export default async function MesFavoris() {
  const membre = await exigerUnMembre();
  const [favoris, _nonLues, _mesEmplacements] = await Promise.all([
    mesFavoris(membre.id),
    nombreDeNotificationsNonLues(membre.id),
    nombreDEmplacements(membre.id),
  ]);

  return (
    <main id="contenu">
      <section className="app-screen active" id="favoris">
        <div className="page page-etroite">
          <header className="page-tete">
            <span className="kicker">ENREGISTRÉS</span>
            <h1>Vos bike sitters</h1>
            <p>
              Ceux chez qui vous êtes déjà allé, ou que vous avez mis de côté.
              Une garde chez quelqu’un qu’on connaît se demande en trois
              secondes.
            </p>
          </header>

          {favoris.length > 0 ? (
            <div className="favoris" id="listeFavoris">
              {favoris.map((favori, rang) => (
                <article className="fav" key={favori.reference}>
                  {/* Le visage du bike sitter s'il en a mis un, sinon la photo
                    de son emplacement : on reconnaît une personne, puis un lieu. */}
                  {favori.photo ? (
                    <Avatar
                      membreId={favori.bikeSitterId}
                      prenom={favori.prenom}
                      version={favori.photo}
                      taille={56}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      loading="lazy"
                      alt=""
                      width={56}
                      height={56}
                      src={
                        favori.nombreDePhotos > 0
                          ? `/emplacements/${favori.reference}/photo/0`
                          : photoDeLEspace(rang)
                      }
                    />
                  )}
                  <div>
                    <b>
                      {favori.prenom} {favori.initialeDuNom}.
                    </b>
                    <span>
                      {favori.type} à {favori.quartier}
                    </span>
                    <span>
                      {favori.noteMoyenne !== null
                        ? `★ ${favori.noteMoyenne.toFixed(1).replace('.', ',')} · `
                        : ''}
                      {favori.gardesMenees === 0
                        ? 'Nouveau sur le réseau'
                        : `${favori.gardesMenees} garde${favori.gardesMenees > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="fav-actions">
                    <Link
                      className="rc-btn"
                      href={`/demande/${favori.reference}`}
                    >
                      Redemander
                    </Link>
                    <Link
                      className="rc-carte"
                      href={`/emplacements/${favori.reference}`}
                    >
                      Voir la fiche
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            // La feuille de la maquette réserve cet encart au compte tout neuf ;
            // ici, c'est la liste vide qui le fait apparaître.
            <div
              className="etat-vide"
              data-vide="favoris"
              style={{ display: 'block' }}
            >
              <span className="ev-i" aria-hidden="true">
                <Icone nom="coeur" taille={26} />
              </span>
              <h3>Aucun bike sitter enregistré</h3>
              <p>
                Touchez le cœur sur la fiche d’un bike sitter : il se range ici,
                prêt pour votre prochaine demande.
              </p>
              {/* La maquette mettait cette action en bleu ; le bleu ne dit que
                « vérifié » (règle 6), les actions restent vertes. */}
              <Link className="primary" href="/recherche">
                Chercher un Bike Sitter
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
