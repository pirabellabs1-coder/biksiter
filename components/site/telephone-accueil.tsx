import { Icone } from '@/components/app/icone';
import type { Textes } from '@/lib/i18n/langue';

/**
 * La maquette téléphone du hero : posée en biais, elle montre l'écran de
 * recherche sur une carte de Bruxelles, avec des épingles et une fiche
 * d'emplacement au premier plan. C'est un aperçu, jamais des données
 * réelles ; la mise en page suit celle de l'application.
 */
export function TelephoneAccueil({ p }: { p: Textes['p'] }) {
  return (
    <div className="telephone-accueil" aria-hidden="true">
      <div className="telephone-halo" />
      <div className="telephone-cadre">
        <div className="telephone-encoche" />
        <div className="telephone-ecran">
          {/* La carte. */}
          <div className="telephone-carte">
            <CarteBruxelles />
            <div className="telephone-carte-degrade" />

            {/* Les épingles. */}
            <span className="telephone-epingle telephone-epingle-1">
              <span className="telephone-epingle-rond">
                <Icone nom="velo" taille={14} />
              </span>
            </span>
            <span className="telephone-epingle telephone-epingle-2">
              <span className="telephone-epingle-rond">
                <Icone nom="velo" taille={14} />
              </span>
            </span>
            <span className="telephone-epingle telephone-epingle-3">
              <span className="telephone-epingle-rond bleu">
                <Icone nom="verifie" taille={14} />
              </span>
            </span>
            <span className="telephone-epingle telephone-epingle-4">
              <span className="telephone-epingle-rond">
                <Icone nom="velo" taille={14} />
              </span>
            </span>

            {/* La barre « N résultats » au-dessus de la fiche. */}
            <div className="telephone-barre-resultats">
              <span className="telephone-barre-poignee" />
              <p className="telephone-barre-titre">
                {p('{n} emplacements', { n: 12 })}
              </p>
            </div>
          </div>

          {/* La fiche au premier plan. */}
          <div className="telephone-fiche">
            <div className="telephone-fiche-photo">
              <Icone nom="maison" taille={30} />
              <span className="telephone-fiche-pastille">
                {p('Disponible')}
              </span>
              <span className="telephone-fiche-coeur" aria-hidden="true">
                <Icone nom="coeur" taille={16} />
              </span>
            </div>
            <div className="telephone-fiche-corps">
              <strong>{p('Garage privé fermé')}</strong>
              <span className="telephone-fiche-adresse">
                {p('Ixelles · à 650 m')}
              </span>
              <div className="telephone-fiche-bas">
                <span className="telephone-fiche-note">
                  <Icone nom="etoile" taille={12} plein />
                  4,8 · 24 {p('avis')}
                </span>
                <span className="telephone-fiche-prix">{p('Gratuit')}</span>
              </div>
            </div>
          </div>

          {/* La barre d'onglets. */}
          <nav className="telephone-onglets" aria-label={p('Application')}>
            {(
              [
                ['accueil', p('Accueil')],
                ['gardes', p('Gardes')],
                ['recherche', p('Rechercher')],
                ['messages', p('Messages')],
                ['profil', p('Profil')],
              ] as const
            ).map(([nom, libelle], rang) => (
              <span
                key={nom}
                className={rang === 2 ? 'telephone-onglet actif' : 'telephone-onglet'}
              >
                <Icone nom={nom} taille={18} />
                <small>{libelle}</small>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

/**
 * Une carte stylisée de Bruxelles : quartiers en teintes douces, quelques
 * rues à main levée. Pas de tuiles satellite, pas de dépendance à un tiers
 * qui verrait la moitié des visites du site.
 */
function CarteBruxelles() {
  return (
    <svg
      viewBox="0 0 300 380"
      xmlns="http://www.w3.org/2000/svg"
      className="telephone-carte-fond"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="carteFond" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eaf3e6" />
          <stop offset="1" stopColor="#e5edea" />
        </linearGradient>
      </defs>
      <rect width="300" height="380" fill="url(#carteFond)" />
      {/* Quartiers. */}
      <path d="M0 60 L120 40 L180 90 L120 160 L40 140 Z" fill="#d8e9db" opacity="0.85" />
      <path d="M120 160 L220 130 L260 200 L200 260 L140 240 Z" fill="#d3e6d8" opacity="0.9" />
      <path d="M0 240 L120 240 L140 320 L60 360 L0 340 Z" fill="#dde8d9" opacity="0.85" />
      <path d="M200 260 L300 240 L300 380 L180 380 Z" fill="#d8e0dc" opacity="0.85" />
      {/* Plans d'eau (canal). */}
      <path d="M0 180 Q40 175 80 190 T180 200 Q220 210 260 200" fill="none" stroke="#c9d8db" strokeWidth="10" opacity="0.85" />
      {/* Rues principales. */}
      <g stroke="#ffffff" strokeWidth="2.4" fill="none" opacity="0.85">
        <path d="M0 100 L300 130" />
        <path d="M40 0 L120 380" />
        <path d="M200 0 L240 380" />
        <path d="M0 260 L300 230" />
      </g>
      {/* Rues secondaires. */}
      <g stroke="#ffffff" strokeWidth="1.4" fill="none" opacity="0.55">
        <path d="M60 40 L180 80" />
        <path d="M80 60 L100 200" />
        <path d="M160 40 L200 220" />
        <path d="M20 200 L200 260" />
        <path d="M120 300 L280 330" />
      </g>
      {/* Petits repères de parc. */}
      <circle cx="230" cy="90" r="18" fill="#c6dfc9" opacity="0.7" />
      <circle cx="80" cy="300" r="22" fill="#c6dfc9" opacity="0.7" />
    </svg>
  );
}
