import { EnTete } from '@/components/maquette/en-tete';
import { Pied } from '@/components/maquette/pied';
import { textes } from '@/lib/i18n/langue';
import { membreConnecte } from '@/lib/session';

/**
 * Le cadre des écrans accessibles sans compte.
 *
 * C'est le site : pas de barre latérale, qui appartient à l'application une
 * fois connecté. L'en-tête et le pied sortent ici, une seule fois, pour éviter
 * qu'une page les oublie — c'est ce qui garantit que la marque, la navigation
 * et le hamburger sont identiques partout.
 */
export default async function CadrePublic({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { p } = await textes();
  const membre = await membreConnecte();

  return (
    <div className="cadre-public">
      <a href="#contenu" className="evitement">
        {p('Aller au contenu')}
      </a>
      <EnTete membre={membre} />
      <div className="site">{children}</div>
      <Pied membre={membre} />
    </div>
  );
}
