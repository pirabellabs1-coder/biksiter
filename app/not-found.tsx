import Link from 'next/link';

import BandeauDePage from '@/components/bandeau-de-page';
import EnTete from '@/components/en-tete';
import PiedDePage from '@/components/pied-de-page';

/**
 * La page 404 vit à la racine, hors des deux groupes de routes : c'est elle
 * que Next rend pour une adresse qui ne correspond à rien du tout, et elle ne
 * passe donc par aucune des deux mises en page.
 *
 * Elle porte l'enveloppe du site public elle-même. Une page d'erreur sans
 * navigation est un cul-de-sac, et c'est précisément le moment où quelqu'un a
 * le plus besoin d'un chemin de sortie.
 */
export default function PageIntrouvable() {
  return (
    <>
      <a className="evitement" href="#contenu">
        Aller au contenu
      </a>
      <EnTete />
      <main id="contenu">
        <BandeauDePage
          surtitre="Erreur 404"
          titre="Cette page n’existe pas."
          chapeau="Le lien est peut-être ancien, ou l’emplacement que vous cherchiez n’est plus proposé. Vous trouverez sûrement une autre place à proximité."
          scene="la-rue"
          actions={
            <>
              <Link href="/" className="bouton bouton--principal">
                Retour à l’accueil
              </Link>
              <Link href="/emplacements" className="bouton bouton--discret">
                Voir les emplacements
              </Link>
            </>
          }
        />
      </main>
      <PiedDePage />
    </>
  );
}
