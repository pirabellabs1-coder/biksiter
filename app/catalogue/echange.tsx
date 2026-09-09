'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';

import { echanger } from './actions';

export type OffreAffichee = {
  id: string;
  titre: string;
  partenaire: string;
  quartier: string | null;
  coutEnMaillons: number;
  stock: string | null;
  echangeable: boolean;
};

/**
 * Toute la grille dans un seul formulaire : le retour s'affiche une fois, en
 * haut, plutôt qu'un refus recopié sous chaque offre.
 *
 * Les offres qu'on ne peut pas échanger restent lisibles et gardent leur coût
 * affiché. Ce qu'on ne montre nulle part, c'est ce qui manque pour y arriver.
 */
export default function CatalogueEchangeable({
  offres,
}: {
  offres: readonly OffreAffichee[];
}) {
  const [etat, envoyer, enCours] = useActionState(echanger, FORMULAIRE_VIERGE);

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <ul className="offres">
        {offres.map((offre) => (
          <li key={offre.id} className="carte offre">
            <div className="offre__corps">
              <h3>{offre.titre}</h3>
              <p className="discret">
                {offre.partenaire}
                {offre.quartier ? ` · ${offre.quartier}` : ''}
                {offre.stock ? ` · ${offre.stock}` : ''}
              </p>
              <p className="offre__cout">
                {offre.coutEnMaillons} maillon
                {offre.coutEnMaillons > 1 ? 's' : ''}
              </p>
            </div>

            <button
              type="submit"
              name="offre"
              value={offre.id}
              className="bouton bouton--discret"
              disabled={enCours || !offre.echangeable}
            >
              Échanger
              <span className="visuellement-cache"> : {offre.titre}</span>
            </button>
          </li>
        ))}
      </ul>
    </form>
  );
}
