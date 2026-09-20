import { Icone } from '@/components/app/icone';
import { Logo } from '@/components/app/logo';
import type { Textes } from '@/lib/i18n/langue';

/**
 * Un aperçu de l'application, dessiné avec ses propres composants : une garde
 * acceptée, son code de dépôt. C'est une illustration de l'écran, pas un
 * témoignage : aucun prénom, aucune date, aucun chiffre du réseau.
 */
export function ApercuDeLApplication({ p }: { p: Textes['p'] }) {
  return (
    <figure
      className="apercu"
      role="img"
      aria-label={p(
        'Aperçu de l’application : une garde acceptée, avec son code de dépôt.',
      )}
    >
      <div className="apercu-telephone" aria-hidden="true">
        <div className="apercu-ecran">
          <div className="apercu-barre">
            <Logo taille={24} />
            <span>Bike Sitters</span>
          </div>

          <div className="apercu-statut">
            <span className="apercu-rond">
              <Icone nom="coche" taille={18} strokeWidth={3} />
            </span>
            <span>
              <strong>{p('Demande acceptée')}</strong>
              <span>{p('Votre garde est confirmée !')}</span>
            </span>
          </div>

          <ul className="apercu-details">
            <li>
              <Icone nom="calendrier" taille={18} />
              {p('Aujourd’hui')} · 09:00 – 18:00
            </li>
            <li>
              <Icone nom="maison" taille={18} />
              {p('Garage privé fermé')}
            </li>
            <li className="bleu">
              <Icone nom="verifie" taille={18} />
              {p('Identité vérifiée')}
            </li>
          </ul>

          <div className="apercu-code">
            <span>
              <Icone nom="cadenas" taille={15} />
              {p('Code de dépôt')}
            </span>
            <strong>482 913</strong>
          </div>

          <span className="apercu-bouton">{p('Voir ma garde')}</span>
        </div>
      </div>
    </figure>
  );
}
