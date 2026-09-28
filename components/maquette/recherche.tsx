'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Icone } from '@/components/app/icone';
import { lieuLePlusProche } from '@/lib/contenu/lieux';

import {
  DUREE_MAX_PAR_DEFAUT_HEURES,
  HORIZON_JOURS,
  ajouterJours,
  depotsPossibles,
  heureDe,
  heureFrancaise,
  heureDuLendemain,
  reprisesPossibles,
} from '@/lib/regles/creneau';
import { DUREE_MAXIMALE_EN_BETA_HEURES } from '@/lib/regles/tarifs';

/**
 * Le formulaire de recherche de l'accueil.
 *
 * Un champ de date natif suit la langue du navigateur : sur un navigateur
 * anglais, « 09/14/2026 » et « 02:00 PM ». On pose donc nos propres listes,
 * en français et par quarts d'heure.
 *
 * Le dépôt et la reprise se choisissent dans deux menus qui déroulent les
 * créneaux suivants — « 14 sept., 14h00 » — plutôt que dans trois champs
 * séparés. Les jours au-delà d'aujourd'hui s'atteignent par le calendrier,
 * qui vient se poser dans le menu du dépôt.
 */

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

// Les abréviations françaises ne se coupent pas toutes au même endroit :
// « septembre » donne « sept. », pas « sep. ».
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
] as const;

function cle(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function dateDe(jour: string): Date {
  const [annee = 0, mois = 1, quantieme = 1] = jour.split('-').map(Number);
  return new Date(annee, mois - 1, quantieme);
}

/** « 14 sept. » — ce qui tient dans un demi-écran. */
function dateCourte(date: Date): string {
  return `${date.getDate()} ${MOIS_COURTS[date.getMonth()]}`;
}

function ajouter(jour: string, jours: number): Date {
  const date = dateDe(jour);
  date.setDate(date.getDate() + jours);
  return date;
}

/** Une recherche déjà faite, pour rouvrir le formulaire tel qu'on l'a laissé. */
export type RechercheInitiale = {
  destination: string;
  jour: string;
  /** « 14:00 » */
  depot: string;
  jourFin: string;
  /** « 17:00 » */
  reprise: string;
};

const minutesDeLHeure = (heure: string) => {
  const [h, m] = heure.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export function Recherche({
  initiale = null,
}: {
  initiale?: RechercheInitiale | null;
} = {}) {
  const router = useRouter();
  // Ce qu'il reste à reprendre de la recherche initiale, une fois les listes
  // de jours et d'heures connues (elles dépendent de l'horloge du navigateur).
  const aReprendre = useRef(initiale);

  // Le rendu serveur ne connaît pas le jour du visiteur : on attend le montage
  // pour ne pas livrer un calendrier qui contredirait l'horloge du navigateur.
  const [aujourdhui, setAujourdhui] = useState<string | null>(null);
  const [minutesCourantes, setMinutesCourantes] = useState(0);
  const [jour, setJour] = useState<string | null>(null);
  const [moisAffiche, setMoisAffiche] = useState<Date | null>(null);
  const [depot, setDepot] = useState<number | null>(null);
  const [reprise, setReprise] = useState<number | null>(null);
  const [destination, setDestination] = useState(initiale?.destination ?? '');
  const [localisation, setLocalisation] = useState<
    'repos' | 'en-cours' | 'refusee'
  >('repos');

  // « Autour de moi » : la position du téléphone choisit le quartier connu le
  // plus proche. Elle ne quitte pas le navigateur.
  function autourDeMoi() {
    if (!('geolocation' in navigator)) {
      setLocalisation('refusee');
      return;
    }
    setLocalisation('en-cours');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDestination(
          lieuLePlusProche(position.coords.latitude, position.coords.longitude)
            .nom,
        );
        setLocalisation('repos');
      },
      () => setLocalisation('refusee'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  }
  const [menu, setMenu] = useState<'depot' | 'reprise' | null>(null);
  const [calendrierDansMenu, setCalendrierDansMenu] = useState(false);

  useEffect(() => {
    const maintenant = new Date();
    const jourCourant = cle(maintenant);
    setAujourdhui(jourCourant);
    setMinutesCourantes(maintenant.getHours() * 60 + maintenant.getMinutes());
    const jourVoulu = aReprendre.current?.jour;
    const jourRetenu =
      jourVoulu && jourVoulu >= jourCourant ? jourVoulu : jourCourant;
    setJour(jourRetenu);
    const base = dateDe(jourRetenu);
    setMoisAffiche(new Date(base.getFullYear(), base.getMonth(), 1));
  }, []);

  const depots = useMemo(() => {
    if (jour === null || aujourdhui === null) return [];
    return depotsPossibles(jour === aujourdhui, minutesCourantes);
  }, [jour, aujourdhui, minutesCourantes]);

  // Le dépôt choisi doit rester possible quand on change de jour.
  useEffect(() => {
    if (depots.length === 0) {
      setDepot(null);
      return;
    }
    setDepot((actuel) => {
      if (actuel !== null && depots.includes(actuel)) return actuel;
      const voulu = aReprendre.current
        ? minutesDeLHeure(aReprendre.current.depot)
        : null;
      if (voulu !== null && depots.includes(voulu)) return voulu;
      return depots.includes(14 * 60) ? 14 * 60 : depots[0]!;
    });
  }, [depots]);

  // Pendant la bêta, une garde dure cinq heures au plus : on ne propose pas
  // une reprise qu'aucun bike sitter ne pourrait accepter.
  const reprises = useMemo(
    () =>
      depot === null
        ? []
        : reprisesPossibles(depot).filter(
            (minutes) => minutes - depot <= DUREE_MAXIMALE_EN_BETA_HEURES * 60,
          ),
    [depot],
  );

  // On garde l'heure de reprise choisie quand elle reste possible : quelqu'un
  // qui sait à quelle heure il repasse ne change pas d'avis parce qu'il dépose
  // un quart d'heure plus tard.
  useEffect(() => {
    if (reprises.length === 0) {
      setReprise(null);
      return;
    }
    setReprise((actuelle) => {
      if (actuelle !== null && reprises.includes(actuelle)) return actuelle;
      const initial = aReprendre.current;
      if (initial && jour) {
        const jours = Math.round(
          (dateDe(initial.jourFin).getTime() - dateDe(jour).getTime()) / 86_400_000,
        );
        const voulue = jours * 24 * 60 + minutesDeLHeure(initial.reprise);
        // Une seule fois : ensuite, les choix du membre l'emportent.
        aReprendre.current = null;
        if (reprises.includes(voulue)) return voulue;
      }
      const parDefaut = (depot ?? 0) + DUREE_MAX_PAR_DEFAUT_HEURES * 60;
      return reprises.includes(parDefaut) ? parDefaut : reprises.at(-1)!;
    });
  }, [reprises, depot, jour]);

  // Le voile assombrit la page tant qu'un menu est ouvert.
  useEffect(() => {
    if (menu === null) return;
    document.body.classList.add('menu-ouvert');

    function auClavier(evenement: KeyboardEvent) {
      if (evenement.key === 'Escape') fermer();
    }
    document.addEventListener('keydown', auClavier);
    return () => {
      document.body.classList.remove('menu-ouvert');
      document.removeEventListener('keydown', auClavier);
    };
  }, [menu]);

  function fermer() {
    setMenu(null);
    setCalendrierDansMenu(false);
  }

  function basculer(lequel: 'depot' | 'reprise') {
    setCalendrierDansMenu(false);
    setMenu((ouvert) => (ouvert === lequel ? null : lequel));
  }

  function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (jour === null || depot === null || reprise === null) return;
    // Les noms et les formats que lit la page de résultats
    // (`lireLaRecherche`) : la reprise peut tomber le lendemain.
    const parametres = new URLSearchParams({
      lieu: destination.trim(),
      jour,
      de: heureDe(depot),
      jourFin: ajouterJours(jour, Math.floor(reprise / (24 * 60))),
      a: heureDuLendemain(reprise),
    });
    router.push(`/recherche?${parametres.toString()}`);
  }

  const jourDuDepot = jour === null ? null : dateDe(jour);

  const libelleDepot =
    jourDuDepot === null || depot === null
      ? '—'
      : `${dateCourte(jourDuDepot)}, ${heureFrancaise(heureDe(depot))}`;

  const libelleReprise =
    jour === null || reprise === null
      ? '—'
      : `${dateCourte(ajouter(jour, Math.floor(reprise / (24 * 60))))}, ${heureFrancaise(
          heureDuLendemain(reprise),
        )}`;

  const calendrier = useMemo(() => {
    if (moisAffiche === null || aujourdhui === null) return null;

    const premier = new Date(
      moisAffiche.getFullYear(),
      moisAffiche.getMonth(),
      1,
    );
    const nbJours = new Date(
      moisAffiche.getFullYear(),
      moisAffiche.getMonth() + 1,
      0,
    ).getDate();
    // La semaine commence le lundi : dimanche vaut 0 en JavaScript.
    const decalage = (premier.getDay() + 6) % 7;

    const debut = dateDe(aujourdhui);
    const fin = ajouter(aujourdhui, HORIZON_JOURS);

    const cases: React.ReactNode[] = [];
    for (let i = 0; i < decalage; i += 1) {
      cases.push(<span className="vide" aria-hidden="true" key={`vide-${i}`} />);
    }
    for (let n = 1; n <= nbJours; n += 1) {
      const date = new Date(
        moisAffiche.getFullYear(),
        moisAffiche.getMonth(),
        n,
      );
      const valeur = cle(date);
      const possible = date >= debut && date <= fin;
      cases.push(
        <button
          type="button"
          key={valeur}
          disabled={!possible}
          aria-pressed={valeur === jour}
          onClick={() => {
            setJour(valeur);
            setCalendrierDansMenu(false);
          }}
        >
          {n}
        </button>,
      );
    }

    const debutDuMois =
      moisAffiche.getMonth() === debut.getMonth() &&
      moisAffiche.getFullYear() === debut.getFullYear();
    const finDeLHorizon =
      moisAffiche.getMonth() === fin.getMonth() &&
      moisAffiche.getFullYear() === fin.getFullYear();

    return (
      <div className="cal cal-dans-menu" role="dialog" aria-label="Choisir une date">
        <div className="cal-tete">
          <button
            type="button"
            className="cal-nav"
            aria-label="Mois précédent"
            disabled={debutDuMois}
            onClick={() =>
              setMoisAffiche(
                new Date(moisAffiche.getFullYear(), moisAffiche.getMonth() - 1, 1),
              )
            }
          >
            ‹
          </button>
          <b>{`${MOIS[moisAffiche.getMonth()]} ${moisAffiche.getFullYear()}`}</b>
          <button
            type="button"
            className="cal-nav"
            aria-label="Mois suivant"
            disabled={finDeLHorizon}
            onClick={() =>
              setMoisAffiche(
                new Date(moisAffiche.getFullYear(), moisAffiche.getMonth() + 1, 1),
              )
            }
          >
            ›
          </button>
        </div>
        <div className="cal-jours">
          <span>L</span>
          <span>M</span>
          <span>M</span>
          <span>J</span>
          <span>V</span>
          <span>S</span>
          <span>D</span>
        </div>
        <div className="cal-grille">{cases}</div>
        <p className="cal-note">
          Une garde se demande jusqu’à sept jours à l’avance.
        </p>
      </div>
    );
  }, [moisAffiche, aujourdhui, jour]);

  return (
    <>
      <form className="search-card" onSubmit={envoyer}>
        <div className="field destination">
          <div className="barre-rech-champ">
            <span className="cell-txt">
              <span className="cell-lab">Destination</span>
              <input
                value={destination}
                onChange={(evenement) => setDestination(evenement.target.value)}
                placeholder="Quartier, commune ou adresse"
                aria-label="Destination"
              />
              <button
                type="button"
                className="autour"
                aria-label="Autour de moi"
                aria-busy={localisation === 'en-cours'}
                onClick={autourDeMoi}
              >
                <Icone nom="position" taille={17} strokeWidth={2} />
              </button>
            </span>
          </div>
        </div>

        {localisation === 'refusee' ? (
          <p className="loc-refusee" role="status">
            Votre position n’est pas disponible. Saisissez un quartier ou une
            commune.
          </p>
        ) : null}

        <div className="quand-mobile">
          <div className="qm-bloc">
            <button
              type="button"
              className="qm"
              aria-haspopup="listbox"
              aria-expanded={menu === 'depot'}
              aria-label="Date et heure du dépôt"
              onClick={() => basculer('depot')}
            >
              <span className="qm-txt">
                <span className="qm-lab">Vous déposez</span>
                <b>{libelleDepot}</b>
              </span>
            </button>
            <div
              className="qm-menu"
              role="listbox"
              aria-label="Choisir le dépôt"
              hidden={menu !== 'depot'}
            >
              {calendrierDansMenu ? (
                calendrier
              ) : (
                <>
                  <p className="sep">
                    {jourDuDepot === null ? '' : dateCourte(jourDuDepot)}
                  </p>
                  {depots.length === 0 ? (
                    <div className="vide">Plus de créneau aujourd’hui.</div>
                  ) : (
                    depots.map((minutes) => (
                      <button
                        type="button"
                        key={minutes}
                        role="option"
                        aria-selected={minutes === depot}
                        onClick={() => {
                          setDepot(minutes);
                          fermer();
                        }}
                      >
                        {jourDuDepot === null ? '' : dateCourte(jourDuDepot)},{' '}
                        {heureFrancaise(heureDe(minutes))}
                      </button>
                    ))
                  )}
                  <p className="sep">Un autre jour</p>
                  <button
                    type="button"
                    onClick={() => setCalendrierDansMenu(true)}
                  >
                    Un autre jour…
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="qm-bloc">
            <button
              type="button"
              className="qm"
              aria-haspopup="listbox"
              aria-expanded={menu === 'reprise'}
              aria-label="Date et heure de la reprise"
              onClick={() => basculer('reprise')}
            >
              <span className="qm-txt">
                <span className="qm-lab">Vous reprenez</span>
                <b>{libelleReprise}</b>
              </span>
            </button>
            <div
              className="qm-menu"
              role="listbox"
              aria-label="Choisir la reprise"
              hidden={menu !== 'reprise'}
            >
              {reprises.length === 0 ? (
                <div className="vide">Trop tard aujourd’hui</div>
              ) : (
                reprises.map((minutes) => (
                  <button
                    type="button"
                    key={minutes}
                    role="option"
                    aria-selected={minutes === reprise}
                    onClick={() => {
                      setReprise(minutes);
                      fermer();
                    }}
                  >
                    {jour === null
                      ? ''
                      : dateCourte(
                          ajouter(jour, Math.floor(minutes / (24 * 60))),
                        )}
                    , {heureFrancaise(heureDuLendemain(minutes))}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="chercher">
          Rechercher
        </button>
      </form>

      <div className="voile" hidden={menu === null} onClick={fermer} />
    </>
  );
}
