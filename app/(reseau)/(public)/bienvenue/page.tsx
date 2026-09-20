import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';

import { EcranDeCompte } from '../ecran-de-compte';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Bienvenue') };
}

/**
 * L'entrée des membres.
 *
 * C'est là qu'arrive un visiteur qui ouvre un écran réservé aux membres : les
 * bike sitters ne sont visibles qu'une fois connecté, et la page explique
 * pourquoi avant de proposer de s'inscrire ou de se connecter.
 */
export default async function Bienvenue() {
  const { t, p } = await textes();

  return (
    <EcranDeCompte p={p}>
      <h1 className="titre-ecran" style={{ fontSize: 34 }}>
        {p('Votre vélo n’est jamais seul.')}
      </h1>
      <p className="sous-titre">{p('Un espace fermé. Une personne présente.')}</p>

      {/* La même illustration que « Devenir Bike Sitter » : un lieu fermé, un
          vélo, un cadenas. Aucune photo de personne. */}
      <div className="illustration-devenir" aria-hidden="true">
        <Icone nom="maison" taille={70} strokeWidth={1.4} />
        <span className="illustration-velo">
          <Icone nom="velo" taille={44} strokeWidth={1.6} />
        </span>
        <span className="illustration-cadenas">
          <Icone nom="cadenas" taille={24} strokeWidth={2} />
        </span>
      </div>

      <div className="encart ambre">
        <Icone nom="cadenas" taille={20} />
        <span>{t('g.closed')}</span>
      </div>

      <div className="boutons" style={{ marginTop: 16 }}>
        <Link href="/invitation" className="bouton plein">
          {p('Créer un compte')}
          <Icone nom="chevron" taille={20} />
        </Link>
        <Link href="/connexion" className="bouton contour">
          {p('Se connecter')}
        </Link>
      </div>

      <p className="petit texte-doux centre" style={{ margin: '14px 0 0' }}>
        {t('g.needinvite')}{' '}
        <Link href="/liste-attente" className="lien-souligne texte-vert">
          {t('g.noinvite')}
        </Link>
      </p>

      <div className="carte" style={{ marginTop: 22 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
          {t('g.title')}
        </h2>
        <p
          className="petit texte-doux"
          style={{ margin: '6px 0 0', lineHeight: 1.55 }}
        >
          {t('g.body')}
        </p>
      </div>

      <p className="petit centre" style={{ margin: '14px 0 0' }}>
        <Link href="/comment-ca-marche" className="lien-souligne texte-vert">
          {t('g.how')}
        </Link>
        <span className="texte-doux" aria-hidden="true">
          {' · '}
        </span>
        <Link href="/faq" className="lien-souligne texte-vert">
          {t('g.faq')}
        </Link>
      </p>
    </EcranDeCompte>
  );
}
