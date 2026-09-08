import {
  ERREUR_GENERALE as GENERALE,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';

/**
 * Le retour d’un formulaire, annoncé aux lecteurs d’écran.
 *
 * `role="status"` plutôt que `role="alert"` : le message arrive après une
 * action volontaire du membre, il n’a pas à interrompre sa lecture.
 */
export default function MessageDeFormulaire({
  etat,
}: {
  etat: EtatDuFormulaire;
}) {
  if (etat.statut === 'vierge') {
    return <div role="status" aria-live="polite" />;
  }

  if (etat.statut === 'valide') {
    return (
      <div role="status" aria-live="polite" className="encart">
        <p>{etat.message}</p>
      </div>
    );
  }

  const champs = Object.entries(etat.erreurs);
  const nombreDeChamps = champs.filter(([champ]) => champ !== GENERALE).length;

  return (
    <div role="status" aria-live="polite" className="encart encart--refus">
      <p>
        <strong>
          {nombreDeChamps === 0
            ? 'Votre demande n’a pas pu être envoyée.'
            : nombreDeChamps === 1
              ? 'Un champ demande une correction.'
              : `${nombreDeChamps} champs demandent une correction.`}
        </strong>
      </p>
      <ul className="liste-erreurs">
        {champs.map(([champ, message]) => (
          <li key={champ}>
            {/* Une erreur générale ne vise aucun champ : la transformer en lien
                enverrait vers une ancre qui n'existe pas. */}
            {champ === GENERALE ? message : <a href={`#${champ}`}>{message}</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}
