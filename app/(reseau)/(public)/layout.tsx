import { textes } from '@/lib/i18n/langue';

/**
 * Le cadre des écrans accessibles sans compte.
 *
 * C'est le site : pas de barre latérale, qui appartient à l'application une
 * fois connecté. Chaque page porte son en-tête — celui du site, ou celui,
 * plus sobre, des écrans du compte — et le pied de page mène au reste.
 */
export default async function CadrePublic({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { p } = await textes();

  return (
    <div className="cadre-public">
      <a href="#contenu" className="evitement">
        {p('Aller au contenu')}
      </a>
      <div className="site">{children}</div>
    </div>
  );
}
