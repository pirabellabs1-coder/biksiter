import type { Textes } from '@/lib/i18n/langue';

import { BarreDeTitre } from './barre-de-titre';
import { SuiviDEnvoi } from './envoi';

/**
 * Un écran de formulaire sans compte : inscription, connexion, liste
 * d'attente.
 *
 * Sur téléphone, les actions restent en bas de l'écran. Sur grand écran, le
 * titre est à gauche et le formulaire à droite, dans une carte. Les boutons
 * d'action vivent hors du `<form>` pour cette mise en page : ils le désignent
 * par son identifiant (attribut `form`), ce qui fonctionne sans JavaScript.
 */
export function EcranDeFormulaire({
  titre,
  retour,
  textes,
  enTete,
  sousLeTitre,
  actions,
  children,
}: {
  titre: string;
  retour?: string;
  textes: Pick<Textes, 'p'>;
  /** Ce qui s'affiche à droite du titre : l'étape en cours, par exemple. */
  enTete?: React.ReactNode;
  /** Ce qui suit la barre de titre : la barre d'avancement, par exemple. */
  sousLeTitre?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="ecran">
      <SuiviDEnvoi>
        <main id="contenu" className="ecran-formulaire">
          <BarreDeTitre titre={titre} retour={retour} p={textes.p}>
            {enTete}
          </BarreDeTitre>
          {sousLeTitre}
          <div className="pad">{children}</div>
          {actions ? <div className="footer">{actions}</div> : null}
        </main>
      </SuiviDEnvoi>
    </div>
  );
}

/** Les erreurs d'un formulaire, ensemble, comme une seule annonce. */
export function ListeDErreurs({
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
    <div id={id} className="banner alert" role="alert">
      {erreurs.map((erreur, rang) => (
        <span key={erreur}>
          {rang > 0 ? <br /> : null}
          {erreur}
        </span>
      ))}
    </div>
  );
}
