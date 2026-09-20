import Link from 'next/link';

import type { Velo } from '@/lib/depot/membre-espace';
import type { EmplacementTrouve } from '@/lib/depot/reseau';
import { LIEUX } from '@/lib/contenu/lieux';
import type { Textes } from '@/lib/i18n/langue';
import {
  ajouterJours,
  jourDeLaSemaine,
  joursReservables,
} from '@/lib/regles/creneau';
import { DISTANCES, libelleDeDistance } from '@/lib/regles/distance';
import { nombreDeFiltresActifs } from '@/lib/regles/recherche';
import { HEURES, type RechercheCourante } from '@/lib/recherche-courante';

import { Icone } from './icone';

type P = Textes['p'];

const JOURS_COURTS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MOIS_COURTS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

/** « Sam. 20 sept. » */
export function jourLisible(p: P, jour: string): string {
  const [, mois, date] = jour.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  return `${p(JOURS_COURTS[jourDeLaSemaine(jour)]!)} ${date} ${p(MOIS_COURTS[mois - 1]!)}`;
}

/**
 * « Trouver un Bike Sitter » : le lieu, le jour, le dépôt et la récupération,
 * le vélo. Un formulaire GET : la recherche vit dans l'adresse de la page.
 */
export function FormulaireDeRecherche({
  p,
  recherche,
  velos,
}: {
  p: P;
  recherche: RechercheCourante;
  velos: readonly Velo[];
}) {
  const { creneau } = recherche;
  const jours = joursReservables(recherche.aujourdhui);
  const retours = Array.from({ length: 8 }, (_, rang) =>
    ajouterJours(creneau.jourDepot, rang),
  );
  return (
    <form action="/recherche" method="get" className="pile">
      <label className="champ-app">
        <Icone nom="epingle" taille={22} />
        <span className="lecteur">{p('Lieu')}</span>
        <input
          name="lieu"
          list="lieux-de-recherche"
          defaultValue={recherche.texte}
          placeholder={p('Quartier, place ou commune')}
          autoComplete="off"
          required
        />
        <datalist id="lieux-de-recherche">
          {LIEUX.map((lieu) => (
            <option key={lieu.nom} value={lieu.nom} />
          ))}
        </datalist>
      </label>

      <label className="champ-app">
        <Icone nom="calendrier" taille={22} />
        <span className="lecteur">{p('Jour du dépôt')}</span>
        <select name="jour" defaultValue={creneau.jourDepot}>
          {jours.map((jour) => (
            <option key={jour} value={jour}>
              {jourLisible(p, jour)}
            </option>
          ))}
        </select>
      </label>

      <div className="deux-colonnes">
        <label className="champ-app">
          <Icone nom="horloge" taille={22} />
          <span className="champ-empile">
            <small>{p('Dépôt')}</small>
            <select name="de" defaultValue={creneau.heureDepot}>
              {HEURES.map((heure) => (
                <option key={heure}>{heure}</option>
              ))}
            </select>
          </span>
        </label>
        <label className="champ-app">
          <Icone nom="horloge" taille={22} />
          <span className="champ-empile">
            <small>{p('Récupération')}</small>
            <select name="a" defaultValue={creneau.heureReprise}>
              {HEURES.map((heure) => (
                <option key={heure}>{heure}</option>
              ))}
            </select>
          </span>
        </label>
      </div>

      <label className="champ-app">
        <Icone nom="calendrier" taille={22} />
        <span className="champ-empile">
          <small>{p('Jour de la récupération')}</small>
          <select name="jourFin" defaultValue={creneau.jourReprise}>
            {retours.map((jour, rang) => (
              <option key={jour} value={jour}>
                {rang === 0 ? p('Le même jour') : jourLisible(p, jour)}
              </option>
            ))}
          </select>
        </span>
      </label>

      <label className="champ-app">
        <Icone nom="velo" taille={22} />
        <span className="lecteur">{p('Vélo')}</span>
        <select name="velo" defaultValue={recherche.filtres.typeVelo ?? ''}>
          <option value="">{p('Tous les vélos')}</option>
          {velos.map((velo) => (
            <option key={velo.id} value={velo.type}>
              {velo.nom} · {p(velo.type)}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="bouton plein">
        {p('Rechercher')}
        <Icone nom="chevron" taille={20} />
      </button>

      <div className="encart">
        <Icone nom="cadenas" taille={24} />
        <span>{p('Adresse exacte révélée après acceptation.')}</span>
      </div>
    </form>
  );
}

/** Les puces de filtres au-dessus des résultats : elles ouvrent l'écran des filtres. */
export function PucesDeFiltres({
  p,
  recherche,
  query,
}: {
  p: P;
  recherche: RechercheCourante;
  query: string;
}) {
  const f = recherche.filtres;
  const distance = DISTANCES.find((d) => d.metres === f.distanceMax);
  const actifs = nombreDeFiltresActifs(f);
  const puces: [string, boolean][] = [
    [distance ? p(distance.libelle) : p('Distance'), Boolean(distance)],
    [
      f.typeDEmplacement ? p(f.typeDEmplacement) : p('Type d’espace'),
      Boolean(f.typeDEmplacement),
    ],
    [f.noteMin !== null ? `★ ${f.noteMin}+` : p('Note'), f.noteMin !== null],
  ];
  return (
    <div className="puces" role="list">
      <Link
        href={`/recherche/filtres?${query}`}
        className="puce"
        role="listitem"
      >
        <Icone nom="filtre" taille={16} />
        {actifs > 0 ? p('Filtres ({n})', { n: actifs }) : p('Filtres')}
      </Link>
      {puces.map(([libelle, actif]) => (
        <Link
          key={libelle}
          href={`/recherche/filtres?${query}`}
          className={actif ? 'puce active' : 'puce'}
          role="listitem"
        >
          {libelle}
          <Icone nom="chevron" taille={14} className="puce-chevron" />
        </Link>
      ))}
    </div>
  );
}

/** Un bike sitter trouvé : sa photo d'espace, qui il est, où, et quand il est là. */
export function CarteDeBikeSitter({
  p,
  e,
  query,
  complet = false,
}: {
  p: P;
  e: EmplacementTrouve;
  query: string;
  complet?: boolean;
}) {
  return (
    <Link
      href={`/emplacements/${e.reference}?${query}`}
      className="carte carte-bike-sitter"
    >
      <div className="vignette-app">
        {e.nombreDePhotos > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/emplacements/${e.reference}/photo/0`} alt="" />
        ) : (
          <Icone nom="maison" taille={34} />
        )}
      </div>
      <div className="carte-de-garde-corps">
        <strong className="carte-de-garde-personne">
          {e.prenom} {e.initialeDuNom}.
          {e.identiteVerifiee ? (
            <Icone
              nom="verifie"
              taille={17}
              className="texte-verifie"
              role="img"
              aria-label={p('Identité vérifiée')}
            />
          ) : null}
        </strong>
        <span className="carte-de-garde-detail">
          <Icone nom="epingle" taille={16} />
          {p('À {distance}', { distance: libelleDeDistance(e.distance) })}
        </span>
        <span className="carte-de-garde-detail">
          <Icone nom="maison" taille={16} />
          {p(e.type)}
        </span>
        <span className="carte-de-garde-detail">
          <Icone nom="profil" taille={16} />
          {complet
            ? p('Complet sur ce créneau')
            : p('Présent sur votre créneau')}
        </span>
        <span className="carte-de-garde-detail note">
          <Icone nom="etoile" taille={16} plein />
          {e.noteMoyenne !== null
            ? p('{note} · {n} gardes', {
                note: e.noteMoyenne.toFixed(1).replace('.', ','),
                n: e.gardesMenees,
              })
            : e.gardesMenees > 0
              ? p('{n} gardes', { n: e.gardesMenees })
              : p('Nouveau Bike Sitter')}
        </span>
      </div>
      <Icone nom="chevron" taille={20} className="texte-leger" />
    </Link>
  );
}
