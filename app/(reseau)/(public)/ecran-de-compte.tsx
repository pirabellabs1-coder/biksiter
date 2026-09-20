import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icone } from '@/components/app/icone';
import { Logo } from '@/components/app/logo';
import { VisuelDuCompte } from '@/components/site/visuel-du-compte';
import type { Textes } from '@/lib/i18n/langue';

/**
 * Le cadre des écrans du compte : bienvenue, connexion, inscription, mot de
 * passe.
 *
 * Sur téléphone, un écran plein format. Sur ordinateur, deux volets : le
 * visuel de la marque à gauche, le formulaire à droite, qui garde une largeur
 * de formulaire — étiré sur toute la largeur, il se lirait mal.
 *
 * La marque mène à l'accueil public et non à celui des membres : la personne
 * qui arrive ici n'est souvent pas connectée, et `/accueil` la renverrait vers
 * la page de bienvenue.
 */
export function EcranDeCompte({
  p,
  retour,
  children,
}: {
  p: Textes['p'];
  /** L'écran d'où l'on vient ; sans lui, pas de flèche de retour. */
  retour?: string;
  children: ReactNode;
}) {
  return (
    <main id="contenu" className="ecran-de-compte">
      <VisuelDuCompte p={p} />
      <div className="compte-volet">
        <EnTetePublique p={p} retour={retour} />
        <div className="ecran-app compte-formulaire">{children}</div>
      </div>
    </main>
  );
}

/** La marque, et la flèche vers l'écran d'où l'on vient, s'il y en a un. */
export function EnTetePublique({
  p,
  retour,
}: {
  p: Textes['p'];
  retour?: string;
}) {
  return (
    <header className="entete">
      {retour ? (
        <Link href={retour} className="entete-retour" aria-label={p('Revenir')}>
          <Icone nom="retour" taille={24} />
        </Link>
      ) : null}
      <Link href="/" className="entete-marque">
        <Logo taille={retour ? 34 : 40} />
        Bike Sitters
      </Link>
    </header>
  );
}

/** Le nombre d'écrans de l'inscription : le compte, les coordonnées, l'identité. */
const ETAPES_DE_L_INSCRIPTION = 3;

/**
 * L'avancement de l'inscription. La barre et « 2 / 3 » sont pour les yeux ;
 * un lecteur d'écran entend la phrase entière.
 */
export function EtapesDeLInscription({
  p,
  etape,
  titre,
}: {
  p: Textes['p'];
  etape: 1 | 2 | 3;
  titre: string;
}) {
  const total = ETAPES_DE_L_INSCRIPTION;
  return (
    <div className="etapes-app">
      <span>{titre}</span>
      <span className="barre" aria-hidden="true">
        <span style={{ width: `${Math.round((etape / total) * 100)}%` }} />
      </span>
      <span aria-hidden="true">
        {etape} / {total}
      </span>
      <span className="lecteur">
        {p('Étape {etape} sur {total}', { etape, total })}
      </span>
    </div>
  );
}

/**
 * Le bord d'un champ refusé. Il double le message écrit, sans le remplacer :
 * la couleur ne porte jamais seule l'information.
 */
export const BORD_EN_ERREUR = { borderColor: 'var(--alert)' } as const;

/** Les erreurs d'un formulaire, ensemble, comme une seule annonce. */
export function EncartDErreurs({
  id,
  erreurs,
}: {
  id?: string;
  erreurs: readonly string[];
}) {
  if (erreurs.length === 0) {
    return null;
  }
  return (
    <div id={id} className="encart rouge" role="alert">
      <Icone nom="alerte" taille={20} />
      <span>
        {erreurs.map((erreur) => (
          <span key={erreur} className="motif">
            {erreur}
          </span>
        ))}
      </span>
    </div>
  );
}
