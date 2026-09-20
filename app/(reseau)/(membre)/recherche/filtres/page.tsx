import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';
import { DISTANCES } from '@/lib/regles/distance';
import { TYPES_EMPLACEMENT_PRIVE } from '@/lib/regles/emplacements';
import { NOTES_MINIMALES, SANS_FILTRE } from '@/lib/regles/recherche';
import { TYPES_VELO } from '@/lib/regles/velos';
import {
  lireLaRecherche,
  parametresDeLaRecherche,
} from '@/lib/recherche-courante';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Filtres de recherche') };
}

/**
 * Les filtres avancés. Un formulaire GET qui renvoie aux résultats : les
 * filtres, comme la recherche, vivent dans l'adresse de la page.
 */
export default async function FiltresDeRecherche({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await exigerUnMembre();
  const { p } = await textes();
  const recherche = lireLaRecherche(await searchParams);
  const f = recherche.filtres;
  const query = parametresDeLaRecherche(recherche).toString();
  const sansFiltre = parametresDeLaRecherche(recherche, {
    filtres: SANS_FILTRE,
  }).toString();

  const interrupteurs: [keyof typeof f, NomDIcone, string, string][] = [
    ['vae', 'batterie', p('Compatible VAE'), p('Vélo à assistance électrique')],
    ['accessible', 'maison', p('Accès sans marche'), p('Plain-pied, rampe ou ascenseur')],
    ['interieur', 'cadenas', p('À l’intérieur'), p('Entièrement à l’abri')],
    ['ancrage', 'cle', p('Point d’ancrage'), p('Pour attacher le vélo')],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/recherche?${query}`} cloche={false} />
      <form action="/recherche" method="get" className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Filtres de recherche')}</h1>
        <p className="sous-titre">
          {p('Trouvez le lieu idéal pour votre vélo.')}
        </p>
        <input type="hidden" name="lieu" value={recherche.texte} />
        <input type="hidden" name="jour" value={recherche.creneau.jourDepot} />
        <input type="hidden" name="de" value={recherche.creneau.heureDepot} />
        <input type="hidden" name="jourFin" value={recherche.creneau.jourReprise} />
        <input type="hidden" name="a" value={recherche.creneau.heureReprise} />

        <fieldset className="carte groupe-de-filtres">
          <legend className="ligne-texte">
            <Icone nom="epingle" taille={20} />
            <strong>{p('Distance')}</strong>
          </legend>
          <div className="choix-puces">
            <label className="puce-choix">
              <input type="radio" name="distance" value="" defaultChecked={f.distanceMax === null} />
              {p('Toutes')}
            </label>
            {DISTANCES.map((d) => (
              <label key={d.metres} className="puce-choix">
                <input
                  type="radio"
                  name="distance"
                  value={d.metres}
                  defaultChecked={f.distanceMax === d.metres}
                />
                {p(d.libelle)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="carte groupe-de-filtres">
          <span className="ligne-texte">
            <Icone nom="maison" taille={20} />
            <strong>{p('Type d’espace')}</strong>
          </span>
          <select name="espace" defaultValue={f.typeDEmplacement ?? ''} className="heure">
            <option value="">{p('Tous')}</option>
            {TYPES_EMPLACEMENT_PRIVE.map((type) => (
              <option key={type} value={type}>
                {p(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="carte groupe-de-filtres">
          <span className="ligne-texte">
            <Icone nom="velo" taille={20} />
            <strong>{p('Type de vélo')}</strong>
          </span>
          <select name="velo" defaultValue={f.typeVelo ?? ''} className="heure">
            <option value="">{p('Tous les vélos')}</option>
            {TYPES_VELO.map((type) => (
              <option key={type} value={type}>
                {p(type)}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="carte groupe-de-filtres">
          <legend className="ligne-texte">
            <Icone nom="etoile" taille={20} />
            <strong>{p('Note minimale')}</strong>
          </legend>
          <div className="choix-puces">
            <label className="puce-choix">
              <input type="radio" name="note" value="" defaultChecked={f.noteMin === null} />
              {p('Toutes')}
            </label>
            {NOTES_MINIMALES.map((note) => (
              <label key={note} className="puce-choix">
                <input type="radio" name="note" value={note} defaultChecked={f.noteMin === note} />★{' '}
                {String(note).replace('.', ',')}+
              </label>
            ))}
          </div>
          <p className="petit texte-doux">
            {p('Une note s’affiche à partir de trois avis : les nouveaux Bike Sitters n’en ont pas encore.')}
          </p>
        </fieldset>

        <div className="liste">
          {interrupteurs.map(([cle, icone, titre, detail]) => (
            <label key={cle} className="ligne">
              <span className="ligne-icone">
                <Icone nom={icone} taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>{titre}</strong>
                <span>{detail}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                name={cle}
                value="1"
                className="sw"
                defaultChecked={Boolean(f[cle])}
              />
            </label>
          ))}
        </div>

        <div className="boutons" style={{ marginTop: 18 }}>
          <button type="submit" className="bouton plein">
            {p('Voir les résultats')}
          </button>
          <Link href={`/recherche/filtres?${sansFiltre}`} className="bouton discret">
            {p('Tout effacer')}
          </Link>
        </div>
      </form>
    </main>
  );
}
