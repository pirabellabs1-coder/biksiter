import Link from 'next/link';

import { Icone } from '@/components/app/icone';

/**
 * Ce que le membre reçoit, et quand.
 *
 * Les avis de garde (demande, réponse, dépôt, reprise, messages) arrivent
 * dans l'application et par e-mail : ils font la garde, on ne les coupe pas.
 * Ce qui se règle vraiment, ce sont les heures de calme — il n'y a donc ici
 * aucun interrupteur qui ne changerait rien.
 */
export function ReglagesDeNotification({
  tranquillite,
}: {
  tranquillite: { de: string; a: string } | null;
}) {
  return (
    <ul className="groupe" role="list">
      <li className="rangee">
        <span className="rangee-icone" aria-hidden="true">
          <Icone nom="cloche" taille={18} strokeWidth={2} />
        </span>
        <span className="rangee-texte">
          <strong>Vos gardes</strong>
          <span>
            Demandes, réponses, dépôt, reprise et messages : dans
            l’application et par e-mail.
          </span>
        </span>
      </li>
      <li>
        <Link href="/profil/preferences" className="rangee">
          <span className="rangee-icone" aria-hidden="true">
            <Icone nom="horloge" taille={18} strokeWidth={2} />
          </span>
          <span className="rangee-texte">
            <strong>Heures de calme</strong>
            <span>
              {tranquillite
                ? `De ${tranquillite.de.replace(':', 'h')} à ${tranquillite.a.replace(':', 'h')} : les notifications attendent le matin.`
                : 'Aucune : les notifications arrivent à toute heure.'}
            </span>
          </span>
          <Icone nom="chevron" taille={18} className="rangee-chevron" />
        </Link>
      </li>
    </ul>
  );
}
