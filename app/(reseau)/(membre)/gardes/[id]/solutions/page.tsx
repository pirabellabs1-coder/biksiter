import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import {
  CarteDEmplacement,
  creneauDeLaGarde,
} from '@/components/membre/elements';
import { LIEU_PAR_DEFAUT, trouverUnLieu } from '@/lib/contenu/lieux';
import { quartierParNom } from '@/lib/contenu/quartiers';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { emplacementsAutourDe } from '@/lib/depot/reseau';
import { textes } from '@/lib/i18n/langue';
import { parametresDeLaRecherche } from '@/lib/recherche-courante';
import { jourAffiche } from '@/lib/regles/creneau';
import { placeLibre, SANS_FILTRE } from '@/lib/regles/recherche';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Une autre solution') };
}

/**
 * Après un désistement de dernière minute : ce qui reste de libre sur le même
 * créneau, près du même quartier.
 */
export default async function Solutions({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { t, p } = await textes();
  const { id } = await params;
  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde || garde.role !== 'cycliste') notFound();

  const creneau = creneauDeLaGarde(garde.debut, garde.fin);
  const lieu =
    quartierParNom(garde.emplacement.quartier) ??
    trouverUnLieu(garde.emplacement.quartier) ??
    LIEU_PAR_DEFAUT;
  const alternatives = (
    await emplacementsAutourDe(membre.id, lieu, creneau)
  ).filter(
    (e) =>
      placeLibre(e.disponibilite) && e.reference !== garde.emplacement.reference,
  );
  const query = parametresDeLaRecherche({
    texte: lieu.nom,
    creneau,
    filtres: SANS_FILTRE,
  }).toString();

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Une autre solution')}</h1>
        <p className="sous-titre">
          {p("{prenom} s'est désisté pour le {jour} de {de} à {a}.", {
            prenom: garde.autre.prenom,
            jour: jourAffiche(creneau.jourDepot),
            de: creneau.heureDepot,
            a: creneau.heureReprise,
          })}
        </p>

        {alternatives.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="recherche" taille={30} />
            <strong>{p('Aucun autre emplacement libre sur ce créneau.')}</strong>
            <span>
              {p(
                "Élargissez l'horaire ou la zone : une place se libère souvent en décalant d'une heure.",
              )}
            </span>
            <Link
              href={`/recherche?${query}&modifier=1`}
              className="bouton plein petit"
            >
              {p('Modifier ma recherche')}
              <Icone nom="chevron" taille={18} />
            </Link>
          </div>
        ) : (
          <>
            <p className="petit texte-doux">
              {alternatives.length > 1
                ? p('{n} emplacements libres sur le même créneau', {
                    n: alternatives.length,
                  })
                : p('Un emplacement libre sur le même créneau')}
            </p>
            <div className="pile grille-lieux">
              {alternatives.map((e) => (
                <CarteDEmplacement
                  key={e.reference}
                  p={p}
                  t={t}
                  emplacement={e}
                  suffixe={`?${query}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
