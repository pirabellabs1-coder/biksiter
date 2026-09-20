'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState, useTransition } from 'react';

import { Icone } from '@/components/app/icone';

import type { ChampsDeDemande, EtatDeLEnvoi, VerificationDeDemande } from './actions';

type Velo = { id: string; nom: string; type: string; couleur: string | null };

export type TextesDuFormulaire = {
  creneau: string;
  date: string;
  debut: string;
  fin: string;
  jourDeRecuperation: string;
  memeJour: string;
  duree: string;
  heures: string;
  nombreDeJours: string;
  plusieursJours: string;
  velo: string;
  aucunVelo: string;
  ajouterUnVelo: string;
  message: string;
  placeholder: string;
  recapitulatif: string;
  votreBikeSitter: string;
  verifie: string;
  lieu: string;
  adresseApresAcceptation: string;
  votreVelo: string;
  dateEtHoraires: string;
  dureeAcceptee: string;
  disponibilites: string;
  placesRestantes: string;
  gratuit: string;
  envoyer: string;
  envoi: string;
  sur: string;
};

const VIDE: EtatDeLEnvoi = { motifs: [] };

function minutes(heure: string): number {
  const [h, m] = heure.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

export function FormulaireDeDemande({
  envoyerAction,
  verifierAction,
  messageInitial = '',
  bikeSitter,
  capacite,
  dureeAcceptee,
  horaires,
  joursDeDepot,
  joursDeRetour,
  heures,
  velos,
  initial,
  verificationInitiale,
  textes,
}: {
  /** L'envoi : une nouvelle demande, ou la modification d'une demande en attente. */
  envoyerAction: (precedent: EtatDeLEnvoi, donnees: FormData) => Promise<EtatDeLEnvoi>;
  verifierAction: (champs: ChampsDeDemande) => Promise<VerificationDeDemande>;
  messageInitial?: string;
  bikeSitter: {
    prenom: string;
    initiale: string;
    verifie: boolean;
    note: string | null;
    quartier: string;
  };
  capacite: number;
  dureeAcceptee: string;
  horaires: string;
  joursDeDepot: readonly { valeur: string; libelle: string }[];
  joursDeRetour: readonly { valeur: string; libelle: string }[];
  heures: readonly string[];
  velos: readonly Velo[];
  initial: {
    jourDepot: string;
    heureDepot: string;
    jourReprise: string;
    heureReprise: string;
    veloId: string;
  };
  verificationInitiale: VerificationDeDemande;
  textes: TextesDuFormulaire;
}) {
  const [champs, setChamps] = useState(initial);
  const [message, setMessage] = useState(messageInitial);
  const [champsEnvoyes, setChampsEnvoyes] = useState<typeof champs | null>(null);
  const [verification, setVerification] = useState(verificationInitiale);
  const [, verifier] = useTransition();
  const [etat, envoyer, enCours] = useActionState(envoyerAction, VIDE);

  // Chaque changement relit la disponibilité : on voit avant d'envoyer ce
  // qui empêcherait la demande.
  useEffect(() => {
    if (champs === initial) return;
    verifier(async () => {
      setVerification(await verifierAction(champs));
    });
  }, [champs, initial, verifierAction]);

  const changer =
    (nom: keyof typeof champs) =>
    (evenement: { currentTarget: { value: string } }) => {
      const valeur = evenement.currentTarget.value;
      setChamps((precedents) => ({ ...precedents, [nom]: valeur }));
    };

  const indexDepot = joursDeRetour.findIndex((j) => j.valeur === champs.jourDepot);
  const indexRetour = joursDeRetour.findIndex((j) => j.valeur === champs.jourReprise);
  const jours = Math.max(1, indexRetour - Math.max(0, indexDepot) + 1);
  const dureeHeures = (minutes(champs.heureReprise) - minutes(champs.heureDepot)) / 60;
  const duree =
    jours > 1
      ? textes.nombreDeJours.replace('{n}', String(jours))
      : textes.heures.replace(
          '{n}',
          String(Math.max(0, dureeHeures)).replace('.', ','),
        );
  // Un refus du serveur porte sur les champs envoyés : dès qu'ils changent, la
  // vérification en direct reprend la main, et le bouton se libère.
  const motifs =
    etat.motifs.length > 0 && champsEnvoyes === champs ? etat.motifs : verification.motifs;
  const libelle = (valeur: string) =>
    joursDeRetour.find((j) => j.valeur === valeur)?.libelle ?? valeur;
  const veloChoisi = velos.find((v) => v.id === champs.veloId);

  return (
    <form action={envoyer} onSubmit={() => setChampsEnvoyes(champs)} className="pile">
      <h2 className="titre-section">{textes.creneau}</h2>
      <label className="champ-app">
        <Icone nom="calendrier" taille={22} />
        <span className="champ-empile">
          <small>{textes.date}</small>
          <select name="jour" value={champs.jourDepot} onChange={changer('jourDepot')}>
            {joursDeDepot.map((jour) => (
              <option key={jour.valeur} value={jour.valeur}>
                {jour.libelle}
              </option>
            ))}
          </select>
        </span>
      </label>
      <div className="deux-colonnes">
        <label className="champ-app">
          <Icone nom="horloge" taille={22} />
          <span className="champ-empile">
            <small>{textes.debut}</small>
            <select name="de" value={champs.heureDepot} onChange={changer('heureDepot')}>
              {heures.map((heure) => (
                <option key={heure}>{heure}</option>
              ))}
            </select>
          </span>
        </label>
        <label className="champ-app">
          <Icone nom="horloge" taille={22} />
          <span className="champ-empile">
            <small>{textes.fin}</small>
            <select name="a" value={champs.heureReprise} onChange={changer('heureReprise')}>
              {heures.map((heure) => (
                <option key={heure}>{heure}</option>
              ))}
            </select>
          </span>
        </label>
      </div>
      <label className="champ-app">
        <Icone nom="calendrier" taille={22} />
        <span className="champ-empile">
          <small>{textes.jourDeRecuperation}</small>
          <select
            name="jourFin"
            value={champs.jourReprise}
            onChange={changer('jourReprise')}
          >
            {joursDeRetour
              .filter((jour) => jour.valeur >= champs.jourDepot)
              .map((jour) => (
                <option key={jour.valeur} value={jour.valeur}>
                  {jour.valeur === champs.jourDepot ? textes.memeJour : jour.libelle}
                </option>
              ))}
          </select>
        </span>
      </label>
      <div className="encart gris duree-demande" aria-live="polite">
        <Icone nom="horloge" taille={26} />
        <span>
          <small>{textes.duree}</small>
          <strong>{duree}</strong>
          {jours > 1 ? (
            <small>
              {textes.plusieursJours
                .replace('{jours}', String(jours))
                .replace('{nuits}', String(jours - 1))}
            </small>
          ) : null}
        </span>
      </div>

      <h2 className="titre-section">{textes.velo}</h2>
      {velos.length === 0 ? (
        <div className="encart ambre">
          <Icone nom="velo" taille={24} />
          <span>
            {textes.aucunVelo}{' '}
            <Link href="/profil/velos/ajouter" className="lien-souligne">
              {textes.ajouterUnVelo}
            </Link>
          </span>
        </div>
      ) : (
        <div className="liste" role="radiogroup" aria-label={textes.velo}>
          {velos.map((velo) => (
            <label key={velo.id} className="ligne">
              <span className="ligne-icone fond-vert">
                <Icone nom="velo" taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>{velo.nom}</strong>
                <span>{[velo.type, velo.couleur].filter(Boolean).join(' · ')}</span>
              </span>
              <input
                type="radio"
                name="velo"
                value={velo.id}
                checked={champs.veloId === velo.id}
                onChange={changer('veloId')}
                className="radio-app"
              />
            </label>
          ))}
        </div>
      )}

      <label className="champ-texte">
        <span>{textes.message}</span>
        <textarea
          name="message"
          maxLength={1000}
          placeholder={textes.placeholder}
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
        />
      </label>

      <h2 className="titre-section">{textes.recapitulatif}</h2>
      <div className="liste recapitulatif">
        <div className="ligne">
          <span className="avatar-app" aria-hidden="true">
            {bikeSitter.prenom.charAt(0)}
          </span>
          <span className="ligne-texte">
            <span>{textes.votreBikeSitter}</span>
            <strong>
              {bikeSitter.prenom} {bikeSitter.initiale}.
            </strong>
            {bikeSitter.note ? <span>★ {bikeSitter.note}</span> : null}
          </span>
          {bikeSitter.verifie ? (
            <span className="pastille bleu">
              <Icone nom="verifie" taille={14} />
              {textes.verifie}
            </span>
          ) : null}
        </div>
        <div className="ligne">
          <span className="ligne-icone">
            <Icone nom="epingle" taille={22} />
          </span>
          <span className="ligne-texte">
            <span>{textes.lieu}</span>
            <strong>{bikeSitter.quartier}</strong>
            <span>{textes.adresseApresAcceptation}</span>
          </span>
        </div>
        {veloChoisi ? (
          <div className="ligne">
            <span className="ligne-icone">
              <Icone nom="velo" taille={22} />
            </span>
            <span className="ligne-texte">
              <span>{textes.votreVelo}</span>
              <strong>{veloChoisi.nom}</strong>
              <span>{[veloChoisi.type, veloChoisi.couleur].filter(Boolean).join(' · ')}</span>
            </span>
          </div>
        ) : null}
        <div className="ligne">
          <span className="ligne-icone">
            <Icone nom="calendrier" taille={22} />
          </span>
          <span className="ligne-texte">
            <span>{textes.dateEtHoraires}</span>
            <strong>
              {libelle(champs.jourDepot)} · {champs.heureDepot} →{' '}
              {champs.jourReprise !== champs.jourDepot ? `${libelle(champs.jourReprise)} ` : ''}
              {champs.heureReprise}
            </strong>
            <span>{duree}</span>
          </span>
        </div>
        <div className="ligne">
          <span className="ligne-icone">
            <Icone nom="horloge" taille={22} />
          </span>
          <span className="ligne-texte">
            <span>{textes.disponibilites}</span>
            <strong>{horaires}</strong>
            <span>
              {textes.dureeAcceptee} : {dureeAcceptee}
            </span>
          </span>
        </div>
        <div className="ligne">
          <span className="ligne-icone">
            <Icone nom="maison" taille={22} />
          </span>
          <span className="ligne-texte">
            <span>{textes.placesRestantes}</span>
            <strong>
              {Math.max(0, verification.placesLibres)} {textes.sur} {capacite}
            </strong>
          </span>
        </div>
      </div>

      {motifs.length > 0 ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>
            {motifs.map((motif) => (
              <span key={motif} className="motif">
                {motif}
              </span>
            ))}
          </span>
        </div>
      ) : null}

      <div className="encart">
        <Icone nom="info" taille={22} />
        <span>{textes.gratuit}</span>
      </div>

      <button
        type="submit"
        className="bouton plein"
        disabled={enCours || motifs.length > 0 || velos.length === 0}
      >
        {enCours ? textes.envoi : textes.envoyer}
      </button>
    </form>
  );
}
