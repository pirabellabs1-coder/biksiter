'use client';

import { useActionState } from 'react';

import {
  ChampListe,
  ChampTexte,
  ChampZoneDeTexte,
  GroupeDeCases,
  optionsDepuis,
  optionsDepuisTable,
} from '@/components/champs';
import MessageDeFormulaire from '@/components/message-de-formulaire';
import { NOMS_DE_QUARTIER } from '@/lib/contenu/quartiers';
import { FORMULAIRE_VIERGE, type EtatDuFormulaire } from '@/lib/formulaires/etat';
import {
  ACCES,
  ANCRAGES,
  INTEMPERIES,
  SERVICES,
  VERROUILLAGES,
} from '@/lib/regles/caracteristiques';
import { TYPES_EMPLACEMENT_PRIVE } from '@/lib/regles/emplacements';
import { TYPES_VELO } from '@/lib/regles/velos';

/**
 * Le formulaire d'emplacement, pour le décrire comme pour le corriger.
 *
 * Un seul composant parce que ce sont les mêmes questions : deux copies
 * auraient divergé au premier champ ajouté. Ce qui change d'un cas à l'autre
 * est passé en paramètre — l'action, les valeurs de départ, le libellé du
 * bouton.
 */

export type ValeursDEmplacement = {
  adresseExacte: string;
  quartier: string;
  type: string;
  capacite: number;
  verrouillage: string;
  intemperie: string;
  acces: string;
  ancrage: string;
  services: readonly string[];
  velosAcceptes: readonly string[];
  precisions: string | null;
};

export default function FormulaireDEmplacement({
  action,
  membreDejaConnu,
  valeurs,
  libelleDuBouton,
}: {
  action: (
    etat: EtatDuFormulaire,
    donnees: FormData,
  ) => Promise<EtatDuFormulaire>;
  /** Un membre connecté n'a pas à ressaisir son prénom ni son e-mail. */
  membreDejaConnu: boolean;
  valeurs?: ValeursDEmplacement;
  libelleDuBouton: string;
}) {
  const [etat, envoyer, enCours] = useActionState(action, FORMULAIRE_VIERGE);

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      {membreDejaConnu ? null : (
        <div className="duo">
          <ChampTexte
            id="prenom"
            label="Votre prénom"
            autoComplete="given-name"
            erreur={erreurs.prenom}
          />
          <ChampTexte
            id="email"
            label="Votre e-mail"
            type="email"
            autoComplete="email"
            erreur={erreurs.email}
          />
        </div>
      )}

      <ChampTexte
        id="adresse"
        label="Adresse du lieu"
        aide="Elle n’est jamais publiée. La carte n’affiche qu’une zone, et vous seul communiquez l’adresse, à la personne dont vous avez accepté la demande."
        autoComplete="street-address"
        defaultValue={valeurs?.adresseExacte}
        erreur={erreurs.adresse}
      />

      <ChampListe
        id="quartier"
        label="Le quartier le plus proche"
        aide="Il situe votre emplacement sur la carte, en zone approximative. Votre adresse, elle, n’y figure jamais."
        options={optionsDepuis(NOMS_DE_QUARTIER)}
        defaultValue={valeurs?.quartier ?? ''}
        erreur={erreurs.quartier}
      />

      <ChampListe
        id="type"
        label="Type d’emplacement"
        aide="Un emplacement doit être inaccessible au public et aux autres résidents de l’immeuble : c’est pourquoi un local à vélos partagé ne figure pas dans cette liste."
        options={optionsDepuis(TYPES_EMPLACEMENT_PRIVE)}
        defaultValue={valeurs?.type ?? ''}
        erreur={erreurs.type}
      />

      <div className="duo">
        <ChampTexte
          id="capacite"
          label="Vélos accueillis en même temps"
          type="number"
          min={1}
          max={10}
          defaultValue={valeurs?.capacite ?? 1}
          erreur={erreurs.capacite}
        />
        <ChampListe
          id="verrouillage"
          label="Comment l’emplacement se ferme"
          options={optionsDepuisTable(VERROUILLAGES)}
          defaultValue={valeurs?.verrouillage ?? ''}
          erreur={erreurs.verrouillage}
        />
      </div>

      <div className="duo">
        <ChampListe
          id="intemperie"
          label="Le vélo est-il à l’abri ?"
          options={optionsDepuisTable(INTEMPERIES)}
          defaultValue={valeurs?.intemperie ?? ''}
          erreur={erreurs.intemperie}
        />
        <ChampListe
          id="acces"
          label="Accès avec le vélo à la main"
          options={optionsDepuis(ACCES)}
          defaultValue={valeurs?.acces ?? ''}
          erreur={erreurs.acces}
        />
      </div>

      <ChampListe
        id="ancrage"
        label="À quoi le vélo peut être attaché"
        options={optionsDepuis(ANCRAGES)}
        defaultValue={valeurs?.ancrage ?? ''}
        erreur={erreurs.ancrage}
      />

      <GroupeDeCases
        nom="velos"
        legende="Les vélos que vous pouvez accueillir"
        aide="Un cargo ou un vélo à sacoches ne passe pas partout : ce que vous cochez ici évite des demandes impossibles."
        options={optionsDepuis(TYPES_VELO)}
        coches={valeurs?.velosAcceptes}
        erreur={erreurs.velos}
      />

      <GroupeDeCases
        nom="services"
        legende="Ce que vous proposez en plus (facultatif)"
        options={optionsDepuis(SERVICES)}
        coches={valeurs?.services}
        erreur={erreurs.services}
      />

      <ChampZoneDeTexte
        id="precisions"
        label="Précisions sur l’accès (facultatif)"
        aide="Ce qu’il faut savoir pour arriver jusqu’au vélo : porte latérale, sonnette, code du hall."
        defaultValue={valeurs?.precisions ?? ''}
      />

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Envoi…' : libelleDuBouton}
      </button>
    </form>
  );
}
