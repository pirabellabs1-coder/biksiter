'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { Avatar } from '@/components/app/avatar';
import { Icone } from '@/components/app/icone';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import { ACCES } from '@/lib/regles/caracteristiques';
import { TYPES_EMPLACEMENT_PRIVE } from '@/lib/regles/emplacements';
import { TYPES_VELO } from '@/lib/regles/velos';

import { Recherche, type RechercheInitiale } from '../recherche';

import { CarteDesZones } from './carte';
import type { BikeSitterAffiche } from './modele';

/**
 * Les résultats d'une recherche : la barre, le volet de filtres, la liste et
 * le plan.
 *
 * Tout se décide ici, dans un seul état : les pastilles rapides de la barre et
 * les cases du volet écrivent au même endroit et se relisent depuis lui. Deux
 * systèmes en parallèle finiraient par se contredire à l'écran.
 */

/*
 * La recherche s'arrête à trois kilomètres (RAYON_DE_RECHERCHE_METRES) :
 * proposer 10 ou 50 km promettait des résultats qui n'existent pas.
 */
const PALIERS_RAYON = [0.5, 1, 2, 3] as const;
const RAYON_PAR_DEFAUT = PALIERS_RAYON.length - 1;

/*
 * Les filtres reprennent les listes fermées du réseau (CLAUDE.md) : douze
 * types de vélo, quatorze types d'emplacement privé, huit accès. Un filtre
 * hors liste ne trouverait jamais personne.
 */
const TYPES_DE_VELO = TYPES_VELO;
const TYPES_DE_LIEU = TYPES_EMPLACEMENT_PRIVE;
const CONDITIONS_D_ACCES = ACCES;

const PASTILLES_RAPIDES = [
  ['', 'Voir tout'],
  ['Garage', 'Garage'],
  ['Cave', 'Cave'],
  ['Cour', 'Cour'],
  ['Box', 'Box'],
  ['Local', 'Local vélo'],
  ['Jardin', 'Jardin'],
] as const;


const OPTIONS_DE_SECURITE: Readonly<
  Record<string, (s: BikeSitterAffiche) => boolean>
> = {
  ferme: (s) => s.ferme,
  abri: (s) => s.abrite,
  ancrage: (s) => s.ancrage,
};

function accepte(s: BikeSitterAffiche, velo: string): boolean {
  return s.velosAcceptes.some(
    (accepte) => accepte.toLowerCase() === velo.toLowerCase(),
  );
}

function bascule(liste: readonly string[], valeur: string): string[] {
  return liste.includes(valeur)
    ? liste.filter((x) => x !== valeur)
    : [...liste, valeur];
}

export function ListeDesResultats({
  sitters,
  lieu,
  depot,
  reprise,
  dureeHeures,
  rechercheInitiale,
  creneauCache,
  destination,
  requete,
}: {
  sitters: readonly BikeSitterAffiche[];
  lieu: string;
  depot: string;
  reprise: string;
  dureeHeures: number;
  /** La recherche en cours, pour rouvrir le formulaire pré-rempli. */
  rechercheInitiale: RechercheInitiale;
  creneauCache: Readonly<Record<string, string>>;
  /** Le point cherché, pour centrer la carte. */
  destination: { latitude: number; longitude: number } | null;
  /**
   * La recherche en cours, reprise dans le lien vers chaque fiche : la fiche
   * mesure la même distance et propose le même créneau que la liste.
   */
  requete: string;
}) {
  const [velos, setVelos] = useState<readonly string[]>([]);
  const [lieux, setLieux] = useState<readonly string[]>([]);
  const [acces, setAcces] = useState<readonly string[]>([]);
  const [securite, setSecurite] = useState<readonly string[]>([]);
  const [rayon, setRayon] = useState<number>(RAYON_PAR_DEFAUT);
  const [capacite, setCapacite] = useState(1);
  const [vue, setVue] = useState<'liste' | 'carte'>('liste');
  const [voletOuvert, setVoletOuvert] = useState(false);
  // Le formulaire de recherche, rouvert tel qu'on l'a laissé : c'est là
  // qu'on change de lieu, de jour ou d'heures. Il remplace la barre au lieu
  // de s'y ajouter, reprend la destination tapée, et se referme de lui-même
  // quand la nouvelle recherche arrive (la requête a changé).
  const champDuLieu = useRef<HTMLInputElement>(null);
  const [modification, setModification] = useState<{
    pour: string;
    destination: string;
  } | null>(null);
  const modifier = modification?.pour === requete;
  const ouvrirLaModification = () => {
    setVoletOuvert(false);
    setModification({
      pour: requete,
      destination:
        champDuLieu.current?.value.trim() || rechercheInitiale.destination,
    });
    window.scrollTo({ top: 0 });
  };
  const [apercu, setApercu] = useState<string | null>(null);
  const [plan, setPlan] = useState<'Plan' | 'Satellite'>('Plan');

  const rayonKm = PALIERS_RAYON[rayon];
  const auMoinsUnFiltre =
    velos.length > 0 ||
    lieux.length > 0 ||
    acces.length > 0 ||
    securite.length > 0 ||
    rayon !== RAYON_PAR_DEFAUT ||
    capacite > 1;

  const visibles = useMemo(() => {
    // Entre sections : ET. Entre catégories d'une même section : OU.
    const passe = (s: BikeSitterAffiche) => {
      if (velos.length && !velos.some((v) => accepte(s, v))) return false;
      if (
        lieux.length &&
        !lieux.some((l) => s.espace.toLowerCase().includes(l.toLowerCase()))
      )
        return false;
      if (acces.length && !acces.includes(s.acces)) return false;
      for (const option of securite) {
        const regle = OPTIONS_DE_SECURITE[option];
        if (regle && !regle(s)) return false;
      }
      if (s.distanceKm > rayonKm) return false;
      if (s.places < capacite) return false;
      return true;
    };
    return sitters.filter(passe).sort((x, y) => x.distanceKm - y.distanceKm);
  }, [
    sitters,
    velos,
    lieux,
    acces,
    securite,
    rayonKm,
    capacite,
  ]);

  const libelle = `${visibles.length} Bike Sitter${
    visibles.length > 1 ? 's' : ''
  } trouvé${visibles.length > 1 ? 's' : ''}`;

  const pastilleActive = (categorie: string) => {
    if (categorie === '') return lieux.length === 0;
    return lieux.includes(categorie);
  };

  const cliquerPastille = (categorie: string) => {
    if (categorie === '') {
      setLieux([]);
      return;
    }
    setLieux((actuels) => bascule(actuels, categorie));
  };

  const toutEffacer = () => {
    setVelos([]);
    setLieux([]);
    setAcces([]);
    setSecurite([]);
    setRayon(RAYON_PAR_DEFAUT);
    setCapacite(1);
  };

  const montrerSurLePlan = (reference: string) => {
    setApercu(reference);
    setVue('carte');
  };

  const choisi = visibles.find((s) => s.reference === apercu) ?? null;

  return (
    <>
      <div className="rech-barre">
        <div className="rb-int" hidden={modifier}>
          <form className="rb-carte" action="/recherche" method="get">
            <label className="rb-cell rb-lieu">
              <span className="rb-lab">Votre destination</span>
              <input
                type="text"
                id="whereR"
                ref={champDuLieu}
                name="lieu"
                defaultValue={lieu}
                aria-label="Destination"
                placeholder="Où souhaitez-vous garder votre vélo ?"
              />
            </label>
            <button
              type="button"
              className="rb-cell rb-cell-bouton"
              onClick={ouvrirLaModification}
              aria-label={`Vous déposez ${depot}. Modifier le jour ou l’heure`}
            >
              <span className="rb-lab">Vous déposez</span>
              <b id="rrDe">{depot}</b>
            </button>
            <button
              type="button"
              className="rb-cell rb-cell-bouton"
              onClick={ouvrirLaModification}
              aria-label={`Vous reprenez ${reprise}. Modifier le jour ou l’heure`}
            >
              <span className="rb-lab">Vous reprenez</span>
              <b id="rrA">{reprise}</b>
            </button>
            <button type="submit" className="rb-go" id="editSearch">
              <Icone nom="recherche" taille={18} strokeWidth={2.2} />
              Rechercher
            </button>
            {/* En dernier : un champ caché avant les cellules décalerait la
                grille de la barre, réglée sur l'ordre des enfants. */}
            {Object.entries(creneauCache).map(([nom, valeur]) => (
              <input key={nom} type="hidden" name={nom} value={valeur} />
            ))}
          </form>
        </div>
        {modifier ? (
          <section className="panneau-modifier" aria-label="Modifier la recherche">
            <div className="panneau-modifier-tete">
              <h2>Modifier la recherche</h2>
              <button
                type="button"
                className="lien"
                onClick={() => setModification(null)}
              >
                Fermer
              </button>
            </div>
            <Recherche
              initiale={{
                ...rechercheInitiale,
                destination:
                  modification?.destination ?? rechercheInitiale.destination,
              }}
            />
          </section>
        ) : null}
        <div className="chips-rapides" role="group" aria-label="Filtres rapides">
          {PASTILLES_RAPIDES.map(([categorie, texte]) => (
            <button
              key={texte}
              type="button"
              className={pastilleActive(categorie) ? 'cr actif' : 'cr'}
              aria-pressed={pastilleActive(categorie)}
              onClick={() => cliquerPastille(categorie)}
            >
              {texte}
            </button>
          ))}
          <button
            type="button"
            className="cr cr-filtres"
            id="ouvrirFiltres"
            aria-expanded={voletOuvert}
            onClick={() => setVoletOuvert(true)}
          >
            ▤ Tous les filtres
          </button>
        </div>
      </div>

        <div className="bascule" role="group" aria-label="Affichage des résultats">
          {(['liste', 'carte'] as const).map((choix) => (
            <button
              key={choix}
              type="button"
              className={vue === choix ? 'bascule-btn actif' : 'bascule-btn'}
              aria-pressed={vue === choix}
              onClick={() => setVue(choix)}
            >
              {choix === 'liste' ? 'Liste' : 'Carte'}
            </button>
          ))}
        </div>

      <div className={`rech-page vue-${vue}`}>
        <aside className={voletOuvert ? 'filtres-col ouvert' : 'filtres-col'}>
          <div className="fc-tete">
            <h2>Filtres</h2>
            <button
              type="button"
              className="lien"
              id="resetFiltres"
              hidden={!auMoinsUnFiltre}
              onClick={toutEffacer}
            >
              Réinitialiser
            </button>
            <button
              type="button"
              className="fc-fermer"
              id="fermerFiltres"
              aria-label="Fermer les filtres"
              onClick={() => setVoletOuvert(false)}
            >
              ×
            </button>
          </div>

          <section className="fc-bloc">
            <h3>Distance</h3>
            <p className="fc-sous">
              Dans un rayon de{' '}
              <b id="rayonV">{String(rayonKm).replace('.', ',')}</b> km
            </p>
            <input
              type="range"
              id="rayon"
              min="0"
              max={PALIERS_RAYON.length - 1}
              step="1"
              value={rayon}
              onChange={(e) => setRayon(Number(e.target.value))}
              aria-label="Rayon de recherche"
              aria-valuetext={`${String(rayonKm).replace('.', ',')} km`}
            />
            <div className="fc-paliers">
              {PALIERS_RAYON.map((palier) => (
                <span key={palier}>{String(palier).replace('.', ',')}</span>
              ))}
            </div>
          </section>

          <section className="fc-bloc">
            <h3>Jour et heures</h3>
            <p className="fc-sous">
              Les résultats suivent le créneau de votre recherche.
            </p>
            <button type="button" className="outline" onClick={ouvrirLaModification}>
              Changer de jour ou d’heure
            </button>
          </section>

          <div className="barre-filtres" id="barreFiltres">
            <div className="gf" data-groupe="velo">
              <span className="gf-lab">Types de vélos accept&eacute;s</span>
              <div className="gf-chips">
                {TYPES_DE_VELO.map((velo) => (
                  <button
                    key={velo}
                    type="button"
                    className="chip"
                    aria-pressed={velos.includes(velo)}
                    onClick={() => setVelos((v) => bascule(v, velo))}
                  >
                    {velo}
                  </button>
                ))}
              </div>
            </div>
            <div className="gf" data-groupe="lieu">
              <span className="gf-lab">Type d’emplacement</span>
              <div className="gf-chips">
                {TYPES_DE_LIEU.map((texte) => (
                  <button
                    key={texte}
                    type="button"
                    className="chip"
                    aria-pressed={lieux.includes(texte)}
                    onClick={() => setLieux((l) => bascule(l, texte))}
                  >
                    {texte}
                  </button>
                ))}
              </div>
            </div>

            <div className="gf" data-groupe="acces">
              <span className="gf-lab">Accès à l’emplacement</span>
              <div className="gf-chips">
                {CONDITIONS_D_ACCES.map((texte) => (
                  <button
                    key={texte}
                    type="button"
                    className="chip"
                    aria-pressed={acces.includes(texte)}
                    onClick={() => setAcces((a) => bascule(a, texte))}
                  >
                    {texte}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section className="fc-bloc">
            <h3>Capacité</h3>
            <select
              className="fc-select"
              aria-label="Capacité"
              value={capacite}
              onChange={(e) => setCapacite(Number(e.target.value))}
            >
              <option value={1}>Au moins 1 vélo</option>
              <option value={2}>Au moins 2 vélos</option>
              <option value={3}>Au moins 3 vélos</option>
            </select>
          </section>

          <section className="fc-bloc">
            <h3>Options de sécurité</h3>
            <ul className="reglages">
              {(
                [
                  ['ferme', 'Emplacement fermé', 'Porte qui ferme à clé'],
                  ['abri', 'Abri couvert', 'À l’abri de la pluie'],
                  ['ancrage', 'Point d’ancrage', 'De quoi attacher le cadre'],
                ] as const
              ).map(([cle, titre, detail]) => (
                <li key={cle} className="rangee-interrupteur">
                  <label htmlFor={`securite-${cle}`}>
                    <b>{titre}</b>
                    <span>{detail}</span>
                  </label>
                  <input
                    id={`securite-${cle}`}
                    type="checkbox"
                    role="switch"
                    checked={securite.includes(cle)}
                    aria-checked={securite.includes(cle)}
                    onChange={() => setSecurite((s) => bascule(s, cle))}
                  />
                </li>
              ))}
            </ul>
          </section>


          <div className="fc-pied">
            <button
              type="button"
              className="bleu"
              id="voirResultats"
              onClick={() => setVoletOuvert(false)}
            >
              Voir les <span id="nbResultats">{visibles.length}</span> résultats
            </button>
          </div>
        </aside>

        <div className="rech-liste">
          <div className="rl-tete">
            <h2 id="resCount">{libelle}</h2>
            <span className="rl-mention" id="rlLieu">
              {lieu ? `à ${lieu} · ` : ''}emplacements approximatifs
            </span>
          </div>
          <p id="querySummary" className="vh">
            {lieu}, {depot} → {reprise}, {dureeHeures} h
          </p>
          <div className="result-list" id="resultList">
            {visibles.length > 0 ? (
              visibles.map((s, rang) => (
                <article
                  key={s.reference}
                  className={rang === 0 ? 'result-card rc selected' : 'result-card rc'}
                >
                  {/* Le visage du bike sitter s'il en a mis un, sinon la
                      vraie photo de son lieu, sinon son initiale — jamais
                      une image d'ambiance qu'on prendrait pour lui. */}
                  {s.photo && !s.photoDuBikeSitter ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="rc-photo"
                      loading="lazy"
                      alt=""
                      width={62}
                      height={62}
                      src={s.photo}
                    />
                  ) : (
                    <span className="rc-photo rc-photo-visage">
                      <Avatar
                        membreId={s.bikeSitterId}
                        prenom={s.prenom}
                        version={s.photoDuBikeSitter}
                        taille={84}
                      />
                    </span>
                  )}
                  <div className="rc-corps">
                    <div className="rc-haut">
                      <div>
                        <h3>
                          {s.nom}{' '}
                          {s.identiteVerifiee ? (
                            <span className="v-check" aria-label="Vérifié">
                              ✓
                            </span>
                          ) : null}
                        </h3>
                        <p className="rc-verif">
                          <span className="rc-verifie">Identité vérifiée</span>
                          <span
                            className={
                              s.disponibleMaintenant && s.aDeLaPlace
                                ? 'pastille-dispo maintenant'
                                : 'pastille-dispo'
                            }
                          >
                            ●{' '}
                            {!s.aDeLaPlace
                              ? 'Complet'
                              : s.disponibleMaintenant
                                ? 'Disponible maintenant'
                                : 'Disponible'}
                          </span>
                        </p>
                      </div>
                      <div className="rc-prix libre">
                        <b>Gratuit</b>
                        <span className="rc-duree">pour {dureeHeures} h</span>
                      </div>
                    </div>
                    <p className="rc-titre">{s.titre}</p>
                    <p className="rc-meta">
                      {s.nombreDAvis >= AVIS_POUR_AFFICHER_UNE_NOTE && s.note !== null ? (
                        <>
                          <b className="rc-etoile">
                            ★ {s.note.toFixed(1).replace('.', ',')}
                          </b>
                          <span>{s.nombreDAvis} avis</span>
                        </>
                      ) : s.nombreDAvis > 0 ? (
                        <span>{s.nombreDAvis} avis</span>
                      ) : (
                        <span className="etiq-neuf">Nouveau</span>
                      )}
                      <span>{s.zone.replace('À ', '')}</span>
                      {/* « Nouveau » dit déjà qu'aucune garde n'a eu lieu. */}
                      {s.gardesMenees > 0 ? (
                        <span>
                          {s.gardesMenees} garde{s.gardesMenees > 1 ? 's' : ''}
                        </span>
                      ) : null}
                    </p>
                    <div className="rc-trois">
                      <div>
                        <Icone nom="maison" taille={16} className="rc-i" />
                        {s.espace}
                      </div>
                      <div>
                        <Icone nom="velo" taille={16} className="rc-i" />
                        {s.velosAcceptes.join(' · ')}
                      </div>
                      <div>
                        <Icone nom="cle" taille={16} className="rc-i" />
                        {s.places} {s.places > 1 ? 'places' : 'place'}
                      </div>
                    </div>
                    <div className="rc-actions">
                      <button
                        type="button"
                        className="rc-carte"
                        onClick={() => montrerSurLePlan(s.reference)}
                      >
                        Voir sur la carte
                      </button>
                      <Link
                        className="rc-btn"
                        href={`/emplacements/${s.reference}?${requete}`}
                      >
                        Voir la fiche
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : sitters.length > 0 ? (
              <div className="vide">
                <b>Aucun Bike Sitter ne correspond à vos critères.</b>
                <p>
                  {sitters.length} Bike Sitter
                  {sitters.length > 1 ? 's sont' : ' est'} disponible
                  {sitters.length > 1 ? 's' : ''} sur ce créneau, mais pas avec
                  ces critères. Retirez-en un pour les voir.
                </p>
                <button
                  type="button"
                  className="outline"
                  id="videFiltres"
                  onClick={toutEffacer}
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className="vide">
                <b>Personne n’est disponible sur ce créneau.</b>
                <p>
                  Les Bike Sitters déclarent leurs horaires et la durée qu’ils
                  acceptent d’affilée. Essayez un autre moment, ou une garde
                  plus courte.
                </p>
                <button
                  type="button"
                  className="outline"
                  onClick={ouvrirLaModification}
                >
                  Modifier la recherche
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={plan === 'Satellite' ? 'map satellite' : 'map'}>
          <CarteDesZones
            zones={visibles
              .filter((s) => s.latitude !== null && s.longitude !== null)
              .map((s) => ({
                reference: s.reference,
                nom: s.nom,
                quartier: s.espace,
                distance: s.zone.replace('À ', ''),
                latitude: s.latitude as number,
                longitude: s.longitude as number,
              }))}
            destination={destination}
            choisi={apercu}
            satellite={plan === 'Satellite'}
          />
          <div className="map-outils">
            <div className="bascule-plan">
              {(['Plan', 'Satellite'] as const).map((choix) => (
                <button
                  key={choix}
                  type="button"
                  className={plan === choix ? 'actif' : undefined}
                  aria-pressed={plan === choix}
                  onClick={() => setPlan(choix)}
                >
                  {choix}
                </button>
              ))}
            </div>
          </div>
          <div className="map-zoom">
            <button type="button" aria-label="Zoomer">
              +
            </button>
            <button type="button" aria-label="Dézoomer">
              −
            </button>
          </div>
          <button type="button" className="map-position" aria-label="Ma position">
            <Icone nom="position" taille={18} />
          </button>
          <span className="map-legende">Emplacements approximatifs</span>
          <div className="map-apercu" id="mapApercu" hidden={!choisi}>
            {choisi ? (
              <>
                <p className="ap-verif">Bike Sitter vérifié</p>
                <h3>
                  {choisi.nom}
                  {choisi.nombreDAvis >= AVIS_POUR_AFFICHER_UNE_NOTE && choisi.note !== null
                    ? ` · ★ ${choisi.note.toFixed(1).replace('.', ',')}`
                    : ''}
                </h3>
                <p>
                  {choisi.espace} · {choisi.places}{' '}
                  {choisi.places > 1 ? 'places' : 'place'} ·{' '}
                  {choisi.zone.replace('À ', '')}
                </p>
                <p className="gris">
                  Adresse exacte communiquée uniquement après acceptation.
                </p>
                <Link
                  className="primary"
                  href={`/emplacements/${choisi.reference}?${requete}`}
                >
                  Voir la fiche
                </Link>
              </>
            ) : null}
          </div>
          <button type="button" className="map-rezone" onClick={ouvrirLaModification}>
            Modifier la recherche
          </button>
          <span className="map-echelle">
            <i />2 km
          </span>
          <span className="map-note">
            Zones approximatives · l’adresse exacte est communiquée après
            acceptation
          </span>
        </div>

        <footer className="bandeau-confiance">
          <span>✓ Espace fermé</span>
          <span>✓ Présence humaine</span>
          <span>✓ Identité vérifiée</span>
          <span>✓ Toujours gratuit</span>
        </footer>
      </div>
    </>
  );
}
