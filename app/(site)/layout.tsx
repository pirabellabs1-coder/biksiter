import EnTete from '@/components/en-tete';
import PiedDePage from '@/components/pied-de-page';

/**
 * L'enveloppe du site public : en-tête de marque, contenu, grand pied de page.
 *
 * Elle ne sert pas à l'espace du membre, qui n'a ni la même navigation ni le
 * même besoin — on ne lit pas la FAQ pendant qu'on répond à une demande.
 */
export default function MiseEnPageDuSite({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="evitement" href="#contenu">
        Aller au contenu
      </a>
      <EnTete />
      <main id="contenu">{children}</main>
      <PiedDePage />
    </>
  );
}
