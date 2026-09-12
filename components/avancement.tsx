/**
 * Un parcours en étapes, où l'on voit d'un coup ce qui est fait et ce qui
 * reste.
 *
 * La vérification tenait dans trois cartes plates suivies de deux formulaires
 * posés plus bas : on ne savait pas quel formulaire allait avec quelle carte.
 * Ici l'action est dans l'étape à laquelle elle appartient, et les étapes
 * franchies gardent leur place au lieu de disparaître — c'est ce qui rend le
 * chemin lisible quand on revient dessus deux jours plus tard.
 */
export type EtatDEtape = 'faite' | 'en-cours' | 'a-faire' | 'refusee';

const MENTION: Record<EtatDEtape, string> = {
  faite: 'Fait',
  'en-cours': 'En cours',
  'a-faire': 'À faire',
  refusee: 'À refaire',
};

const PASTILLE: Record<EtatDEtape, string> = {
  faite: 'pastille pastille--verifie',
  'en-cours': 'pastille pastille--attente',
  'a-faire': 'pastille pastille--neutre',
  refusee: 'pastille pastille--refus',
};

export function Avancement({ children }: { children: React.ReactNode }) {
  return <ol className="avancement">{children}</ol>;
}

export function Jalon({
  etat,
  titre,
  resume,
  mention,
  children,
}: {
  etat: EtatDEtape;
  titre: string;
  /** Où en est cette étape, en une phrase. */
  resume: React.ReactNode;
  /** Remplace la mention par défaut de la pastille. */
  mention?: string;
  /** Ce qu'il y a à faire ici, s'il y a quelque chose à faire. */
  children?: React.ReactNode;
}) {
  return (
    <li className={`avancement__etape avancement__etape--${etat}`}>
      <span className="avancement__jalon" aria-hidden="true">
        {etat === 'faite' ? '✓' : null}
      </span>

      <div className="avancement__corps">
        <div className="avancement__entete">
          <h3>{titre}</h3>
          <span className={PASTILLE[etat]}>{mention ?? MENTION[etat]}</span>
        </div>
        <p className="avancement__resume">{resume}</p>
        {children ? <div className="avancement__action">{children}</div> : null}
      </div>
    </li>
  );
}
