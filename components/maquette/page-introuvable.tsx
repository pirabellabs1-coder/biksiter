import Link from 'next/link';

import { Icone } from '@/components/app/icone';

/**
 * Ce qu'on voit quand une adresse ne mène nulle part : où l'on est, pourquoi
 * c'est probablement arrivé, et deux chemins pour repartir.
 */
export function PageIntrouvable({ membre }: { membre: boolean }) {
  return (
    <main id="contenu" className="ecran introuvable">
      <span className="introuvable-icone" aria-hidden="true">
        <Icone nom="recherche" taille={30} strokeWidth={1.8} />
      </span>
      <h1>Cette page n’est pas disponible</h1>
      <p className="ecran-intro">
        Le lien est peut-être ancien, ou ce que vous cherchiez a changé
        entre-temps — une demande retirée, une garde terminée.
      </p>
      <div className="introuvable-actions">
        <Link className="primary" href={membre ? '/mon-espace' : '/'}>
          {membre ? 'Revenir à mon espace' : 'Revenir à l’accueil'}
        </Link>
        <Link className="outline" href={membre ? '/recherche' : '/plan-du-site'}>
          {membre ? 'Chercher un Bike Sitter' : 'Voir le plan du site'}
        </Link>
      </div>
    </main>
  );
}
