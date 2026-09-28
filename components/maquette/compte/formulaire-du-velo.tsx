'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import {
  enregistrerUnVelo,
  type EtatSimple,
} from '@/app/(reseau)/(membre)/profil/actions';
import { TYPES_VELO } from '@/lib/regles/velos';

const VIERGE: EtatSimple = { erreur: null };

const POIDS = ['Moins de 15 kg', '15 à 25 kg', 'Plus de 25 kg'];

/**
 * La description du vélo.
 *
 * Les douze types sont une liste fermée : le cycliste et le bike sitter
 * doivent parler du même vocabulaire. Le nom enregistré se compose de la
 * marque et du type, pour retrouver le bon vélo dans une demande sans
 * demander un champ de plus.
 */
export function FormulaireDuVelo() {
  const [etat, envoyer, enCours] = useActionState(enregistrerUnVelo, VIERGE);
  const [type, setType] = useState<string>(TYPES_VELO[0]);
  const [marque, setMarque] = useState('');

  // « VTT », « VTC » gardent leurs majuscules ; les autres types s'écrivent
  // en minuscules dans une phrase.
  const typeEcrit = type === type.toUpperCase() ? type : type.toLowerCase();
  const nom = [marque.trim(), `vélo ${typeEcrit}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <form action={envoyer} noValidate>
      <input type="hidden" name="nom" value={nom} />

      <section className="bloc">
        <h2>L’essentiel</h2>
        <div className="deux">
          <label className="champ">
            <span>Type</span>
            <select
              name="type"
              value={type}
              onChange={(evenement) => setType(evenement.currentTarget.value)}
            >
              {TYPES_VELO.map((valeur) => (
                <option key={valeur} value={valeur}>
                  {valeur}
                </option>
              ))}
            </select>
          </label>
          <label className="champ">
            <span>Couleur dominante</span>
            <input
              type="text"
              name="couleur"
              maxLength={40}
              placeholder="Vert foncé"
            />
          </label>
        </div>
        <div className="deux">
          <label className="champ">
            <span>Marque</span>
            <input
              type="text"
              name="marque"
              maxLength={60}
              placeholder="Facultatif"
              value={marque}
              onChange={(evenement) => setMarque(evenement.currentTarget.value)}
            />
          </label>
          <label className="champ">
            <span>Poids approximatif</span>
            <select name="poids" defaultValue={POIDS[1]}>
              {POIDS.map((valeur) => (
                <option key={valeur}>{valeur}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="fc-case">
          <input type="checkbox" name="antivol" defaultChecked />
          <span>J’ai un antivol et je le garde avec moi</span>
        </label>
      </section>

      <section className="bloc">
        <h2>Numéro de cadre</h2>
        <label className="champ">
          <span>Numéro gravé ou plaque</span>
          <input
            type="text"
            name="cadre"
            maxLength={60}
            placeholder="Facultatif"
          />
        </label>
        <p className="mention">
          Il n’est jamais montré aux autres membres. Il ne sert qu’à vous, si
          vous devez déclarer un vol. Un Bike Sitter peut vous demander de le
          vérifier avec lui au moment du dépôt — c’est un usage, pas une
          obligation.
        </p>
      </section>

      {/* Pas de photos de référence ici : rien ne les conservait. Les
          photos qui comptent se prennent à chaque dépôt, devant la porte, et
          montrent l'état du vélo ce jour-là. */}
      <p className="prog-note">
        Les photos du vélo se prennent au moment du dépôt, devant la porte :
        elles montrent son état ce jour-là, pour vous comme pour votre bike
        sitter.
      </p>

      {etat.erreur ? (
        <p className="msg-erreur" role="alert">
          {etat.erreur}
        </p>
      ) : null}

      <div className="actions-fin">
        {/* La maquette mettait cette action en bleu ; le bleu ne dit que
            « vérifié » (règle 6), les actions restent vertes. */}
        <button
          type="submit"
          className="primary"
          disabled={enCours}
          aria-busy={enCours || undefined}
        >
          {enCours ? 'Enregistrement…' : 'Enregistrer mon vélo'}
        </button>
        <Link className="outline" href="/profil">
          Revenir à mon compte
        </Link>
      </div>
    </form>
  );
}
