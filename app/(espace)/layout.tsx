import Link from 'next/link';

import BoutonDeDeconnexion from '@/components/bouton-de-deconnexion';
import Rail from '@/components/espace/rail';
import IconeCaracteristique from '@/components/icone-caracteristique';
import Logo from '@/components/logo';
import { baseConfiguree } from '@/lib/bd/client';
import {
  ESPACE_ANNEXE,
  ESPACE_DU_MEMBRE,
  ESPACE_DU_MODERATEUR,
} from '@/lib/contenu/espace';
import { demandesRecues, mesStationnements } from '@/lib/depot/stationnements';
import { exigerUnMembre } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * La coque de l'espace du membre.
 *
 * Elle a sa propre enveloppe, différente du site public : une colonne de
 * navigation qui reste à l'écran, pas de grand pied de page, et un contenu qui
 * défile seul. On ne quitte pas une application pour passer d'un écran à un
 * autre — c'est toute la différence avec une suite de pages.
 *
 * Elle exige un membre. Chaque page le refait de son côté : la mise en page
 * décide de ce qu'on affiche, jamais de qui a le droit d'entrer.
 */
export default async function MiseEnPageDeLEspace({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const membre = await exigerUnMembre();

  // Les compteurs du rail. Ils disent ce qui attend quelqu'un, jamais ce que
  // quelqu'un a accompli : un compteur de gardes réussies dans la navigation
  // serait un classement qui ne dit pas son nom (règle 3).
  const [recues, miennes] = baseConfiguree()
    ? await Promise.all([demandesRecues(membre.id), mesStationnements(membre.id)])
    : [[], []];

  const compteurs = {
    demandesAAnswerer: recues.filter(({ etat }) => etat === 'demande').length,
    gardesEnCours: [...recues, ...miennes].filter(
      ({ etat }) => etat === 'en_cours',
    ).length,
  };

  const entrees = [
    ...ESPACE_DU_MEMBRE,
    ...ESPACE_ANNEXE,
    ...(membre.moderateur ? ESPACE_DU_MODERATEUR : []),
  ];

  return (
    <div className="espace">
      <a className="evitement" href="#contenu">
        Aller au contenu
      </a>

      <aside className="rail">
        <div className="rail__interieur">
          <Link href="/" className="marque rail__marque">
            <Logo taille={24} />
            Bike Sitters
          </Link>

          <div className="rail__identite">
            <span className="jeton-initiale" aria-hidden="true">
              {membre.prenom.charAt(0)}
            </span>
            <div className="rail__qui">
              <strong>{membre.prenom}</strong>
              {membre.verification === 'verifiee' ? (
                <span className="pastille pastille--verifie">
                  Identité vérifiée
                </span>
              ) : (
                <span className="pastille pastille--neutre">
                  Vérification en attente
                </span>
              )}
            </div>
          </div>

          <nav aria-label="Mon espace" className="rail__navigation">
            <Rail entrees={entrees} compteurs={compteurs} />
          </nav>

          <div className="rail__pied">
            <Link href="/" className="rail__lien rail__lien--discret">
              <IconeCaracteristique pictogramme="sortie" />
              <span className="rail__libelle">Retour au site</span>
            </Link>
            <BoutonDeDeconnexion />
          </div>
        </div>
      </aside>

      <main id="contenu" className="espace__contenu">
        {children}
      </main>
    </div>
  );
}
