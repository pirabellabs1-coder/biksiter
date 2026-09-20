import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { Logo } from '@/components/app/logo';
import type { Textes } from '@/lib/i18n/langue';
import { ACCUEIL_DES_MEMBRES } from '@/lib/navigation';
import { membreConnecte } from '@/lib/session';

/**
 * L'en-tête du site public : la marque à gauche, les pages en toutes lettres
 * au centre, les actions d'entrée dans le réseau à droite.
 *
 * Elle n'est pas la barre latérale : celle-ci appartient à l'application, une
 * fois connecté. Sur l'accueil, l'en-tête flotte au-dessus du visuel plein
 * cadre — la classe `entete-site-clair` inverse alors le texte et les bords
 * pour qu'ils tiennent sur une photo.
 */
export async function EnTeteDuSite({
  p,
  retour,
  variante = 'ordinaire',
}: {
  p: Textes['p'];
  /** Sur téléphone, la flèche vers la page d'où l'on vient. */
  retour?: string;
  /** `clair` : posé sur un visuel, texte blanc, fond translucide. */
  variante?: 'ordinaire' | 'clair';
}) {
  const connecte = await estConnecte();

  const pages: readonly (readonly [string, string])[] = [
    [p('Comment ça marche'), '/comment-ca-marche'],
    [p('Sécurité'), '/securite'],
    [p('L’association'), '/a-propos'],
    [p('Questions'), '/faq'],
  ];

  return (
    <header
      className={
        variante === 'clair' ? 'entete-site entete-site-clair' : 'entete-site'
      }
      data-variante={variante}
    >
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

        <nav className="entete-site-pages" aria-label={p('Le site')}>
          {pages.map(([libelle, chemin]) => (
            <Link key={chemin} href={chemin}>
              {libelle}
            </Link>
          ))}
        </nav>

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
