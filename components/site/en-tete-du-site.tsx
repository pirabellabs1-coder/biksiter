import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { Logo } from '@/components/app/logo';
import type { Textes } from '@/lib/i18n/langue';
import { ACCUEIL_DES_MEMBRES } from '@/lib/navigation';
import { membreConnecte } from '@/lib/session';

/**
 * L'en-tête du site public : la marque, et l'entrée dans l'application.
 *
 * Le site public n'a pas de barre latérale : elle appartient à l'application,
 * une fois connecté. Pas de menu non plus : les pages du site se trouvent dans
 * le pied de page et au fil du contenu. Un membre déjà connecté retrouve son
 * espace en un clic.
 */
export async function EnTeteDuSite({
  p,
  retour,
}: {
  p: Textes['p'];
  /** Sur téléphone, la flèche vers la page d'où l'on vient. */
  retour?: string;
}) {
  const connecte = await estConnecte();

  return (
    <header className="entete-site">
      <div className="entete-site-interieur">
        {retour ? (
          <Link
            href={retour}
            className="entete-retour entete-site-retour"
            aria-label={p('Revenir')}
          >
            <Icone nom="retour" taille={24} />
          </Link>
        ) : null}
        <Link
          href="/"
          className="entete-marque"
          aria-label={p('Bike Sitters, accueil')}
        >
          <Logo taille={36} />
          <span>Bike Sitters</span>
        </Link>
        <nav className="entete-site-actions" aria-label={p('Votre compte')}>
          {connecte ? (
            <Link href={ACCUEIL_DES_MEMBRES} className="bouton plein">
              {p('Mon espace')}
              <Icone nom="chevron" taille={18} />
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="bouton contour">
                {p('Se connecter')}
              </Link>
              <Link
                href="/bienvenue"
                className="bouton plein entete-site-rejoindre"
              >
                {p('Rejoindre le réseau')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/**
 * Une page publique s'affiche même quand la base ne répond pas : on la montre
 * alors comme à un visiteur.
 */
async function estConnecte(): Promise<boolean> {
  try {
    return Boolean(await membreConnecte());
  } catch {
    return false;
  }
}
