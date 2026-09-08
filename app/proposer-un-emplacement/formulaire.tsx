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
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';
import {
  ACCES,
  ANCRAGES,
  INTEMPERIES,
  SERVICES,
  VERROUILLAGES,
} from '@/lib/regles/caracteristiques';
import { TYPES_EMPLACEMENT_PRIVE } from '@/lib/regles/emplacements';
import { TYPES_VELO } from '@/lib/regles/velos';

import { proposerUnEmplacement } from './actions';

export default function FormulaireDEmplacement() {
  const [etat, envoyer, enCours] = useActionState(
    proposerUnEmplacement,
    FORMULAIRE_VIERGE,
  );

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

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

      <ChampTexte
        id="adresse"
        label="Adresse du lieu"
        aide="Elle n’est jamais publiée. La carte n’affiche qu’une zone, et vous seul communiquez l’adresse, à la personne dont vous avez accepté la demande."
        autoComplete="street-address"
        erreur={erreurs.adresse}
      />

      <ChampListe
        id="type"
        label="Type d’emplacement"
        aide="Un emplacement doit être inaccessible au public et aux autres résidents de l’immeuble : c’est pourquoi un local à vélos partagé ne figure pas dans cette liste."
        options={optionsDepuis(TYPES_EMPLACEMENT_PRIVE)}
        erreur={erreurs.type}
      />

      <div className="duo">
        <ChampTexte
          id="capacite"
          label="Vélos accueillis en même temps"
          type="number"
          min={1}
          max={10}
          defaultValue={1}
          erreur={erreurs.capacite}
        />
        <ChampListe
          id="verrouillage"
          label="Comment l’emplacement se ferme"
          options={optionsDepuisTable(VERROUILLAGES)}
          erreur={erreurs.verrouillage}
        />
      </div>

      <div className="duo">
        <ChampListe
          id="intemperie"
          label="Le vélo est-il à l’abri ?"
          options={optionsDepuisTable(INTEMPERIES)}
          erreur={erreurs.intemperie}
        />
        <ChampListe
          id="acces"
          label="Accès avec le vélo à la main"
          options={optionsDepuis(ACCES)}
          erreur={erreurs.acces}
        />
      </div>

      <ChampListe
        id="ancrage"
        label="À quoi le vélo peut être attaché"
        options={optionsDepuis(ANCRAGES)}
        erreur={erreurs.ancrage}
      />

      <GroupeDeCases
        nom="velos"
        legende="Les vélos que vous pouvez accueillir"
        aide="Un cargo ou un vélo à sacoches ne passe pas partout : ce que vous cochez ici évite des demandes impossibles."
        options={optionsDepuis(TYPES_VELO)}
        erreur={erreurs.velos}
      />

      <GroupeDeCases
        nom="services"
        legende="Ce que vous proposez en plus (facultatif)"
        options={optionsDepuis(SERVICES)}
        erreur={erreurs.services}
      />

      <ChampZoneDeTexte
        id="precisions"
        label="Précisions sur l’accès (facultatif)"
        aide="Ce qu’il faut savoir pour arriver jusqu’au vélo : porte latérale, sonnette, code du hall."
      />

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Envoi…' : 'Envoyer ma candidature'}
      </button>
    </form>
  );
}
