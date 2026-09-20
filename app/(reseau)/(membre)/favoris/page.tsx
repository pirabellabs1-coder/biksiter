import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { mesFavoris } from '@/lib/depot/favoris';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { basculerUnFavori } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes favoris') };
}

export default async function MesFavoris() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const [favoris, nonLues] = await Promise.all([
    mesFavoris(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues} retour="/recherche" />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Mes favoris')}</h1>
        <p className="sous-titre">{p('Les Bike Sitters que vous avez gardés sous la main.')}</p>

        {favoris.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="coeur" taille={32} className="texte-leger" />
            <strong>{p('Aucun favori pour l’instant.')}</strong>
            <span className="texte-doux">
              {p('Touchez le cœur sur la fiche d’un Bike Sitter pour le retrouver ici.')}
            </span>
            <Link href="/recherche" className="bouton plein" style={{ marginTop: 8 }}>
              {p('Rechercher un bike sitter')}
            </Link>
          </div>
        ) : (
          <ul className="pile" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {favoris.map((favori) => (
              <li key={favori.reference} className="carte carte-bike-sitter" style={{ position: 'relative' }}>
                <div className="vignette-app">
                  {favori.nombreDePhotos > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/emplacements/${favori.reference}/photo/0`} alt="" />
                  ) : (
                    <Icone nom="maison" taille={34} />
                  )}
                </div>
                <div className="carte-de-garde-corps">
                  <Link href={`/emplacements/${favori.reference}`} className="carte-de-garde-personne">
                    {favori.prenom} {favori.initialeDuNom}.
                    {favori.identiteVerifiee ? (
                      <Icone
                        nom="verifie"
                        taille={17}
                        className="texte-verifie"
                        role="img"
                        aria-label={p('Identité vérifiée')}
                      />
                    ) : null}
                  </Link>
                  <span className="carte-de-garde-detail note">
                    <Icone nom="etoile" taille={16} plein />
                    {favori.noteMoyenne !== null
                      ? p('{note} ({n} avis)', {
                          note: favori.noteMoyenne.toFixed(1).replace('.', ','),
                          n: favori.nombreDAvis,
                        })
                      : favori.gardesMenees > 0
                        ? p('{n} gardes', { n: favori.gardesMenees })
                        : p('Nouveau Bike Sitter')}
                  </span>
                  <span className="carte-de-garde-detail">
                    <Icone nom="epingle" taille={16} />
                    {favori.quartier}
                  </span>
                  <span className="carte-de-garde-detail">
                    <Icone nom="maison" taille={16} />
                    {favori.accepteLesVae
                      ? p('{type} · Accepte les VAE', { type: p(favori.type) })
                      : p(favori.type)}
                  </span>
                </div>
                <form action={basculerUnFavori}>
                  <input type="hidden" name="reference" value={favori.reference} />
                  <input type="hidden" name="retour" value="/favoris" />
                  <input type="hidden" name="voulu" value="retirer" />
                  <button
                    type="submit"
                    className="entete-bouton"
                    aria-pressed="true"
                    aria-label={p('Retirer {prenom} de mes favoris', { prenom: favori.prenom })}
                  >
                    <Icone nom="coeur" taille={22} plein className="texte-vert" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
