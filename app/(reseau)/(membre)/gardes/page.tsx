import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { CarteDeGarde } from '@/components/maquette/garde/carte-de-garde';
import { OngletsDesGardes } from '@/components/maquette/garde/onglets';
import { gardesDuMembre } from '@/lib/depot/accueil';
import { JOURS_D_ACCES_AUX_PHOTOS } from '@/lib/regles/constat';
import { EXPIRATION_D_UNE_DEMANDE_HEURES } from '@/lib/regles/garde';
import { vueDeLEtat, type VueDesGardes } from '@/lib/regles/vues-des-gardes';
import { exigerUnMembre } from '@/lib/session';


export const metadata: Metadata = { title: 'Mes gardes' };

export default async function MesGardes() {
  const membre = await exigerUnMembre();
  const gardes = await gardesDuMembre(membre.id);

  // Les gardes du cycliste : c'est son parcours que cet écran raconte.
  const miennes = gardes.filter((g) => g.role === 'cycliste');
  const par = (vue: VueDesGardes) =>
    miennes.filter((g) => vueDeLEtat(g.etat) === vue);
  const avenir = par('avenir').sort(
    (a, b) => a.debut.getTime() - b.debut.getTime(),
  );
  const demandes = par('demandes');
  const terminees = par('terminees');

  const cartes = (liste: typeof miennes) =>
    liste.map((garde) => (
      <CarteDeGarde key={garde.id} garde={garde} />
    ));

  // Sans aucune garde, les onglets n'auraient rien à trier : l'écran dit
  // simplement comment commencer.
  if (miennes.length === 0) {
    return (
      <main id="contenu" className="ecran">
        <header className="ecran-tete">
          <h1>Mes gardes</h1>
          <p className="ecran-intro">
            Vos demandes et vos gardes, à venir comme passées.
          </p>
        </header>
        <div className="etat-vide" data-vide="gardes" style={{ display: 'block' }}>
          <span className="ev-i" aria-hidden="true">
            <Icone nom="gardes" taille={26} />
          </span>
          <h2>Aucune garde pour l’instant</h2>
          <p>
            Cherchez un bike sitter près de l’endroit où vous allez. Une
            demande prend deux minutes, et vous pouvez la retirer tant
            qu’elle n’est pas acceptée.
          </p>
          <Link className="primary" href="/recherche">
            Chercher un bike sitter
          </Link>
        </div>
        <nav className="raccourcis" aria-label="Votre espace">
          <Link href="/profil/velos">
            <Icone nom="velo" taille={18} />
            Mes vélos
          </Link>
          <Link href="/favoris">
            <Icone nom="coeur" taille={18} />
            Favoris
          </Link>
          <Link href="/inviter">
            <Icone nom="enveloppe" taille={18} />
            Inviter
          </Link>
          <Link href="/profil">
            <Icone nom="profil" taille={18} />
            Mon compte
          </Link>
        </nav>
      </main>
    );
  }

  return (
    <main id="contenu">
      <div className="dashboard-wrap">
        <h1>Mes gardes</h1>



        <OngletsDesGardes
          nombres={{
            avenir: avenir.length,
            demandes: demandes.length,
            terminees: terminees.length,
          }}
          initial={
            avenir.length > 0
              ? 'avenir'
              : demandes.length > 0
                ? 'demandes'
                : 'terminees'
          }
          raccourcis={
            <nav className="raccourcis" aria-label="Votre espace">
              <Link href="/profil/velos">
                <Icone nom="velo" taille={18} />
                Mes vélos
              </Link>
              <Link href="/favoris">
                <Icone nom="coeur" taille={18} />
                Favoris
              </Link>
              <Link href="/inviter">
                <Icone nom="enveloppe" taille={18} />
                Inviter
              </Link>
              <Link href="/profil">
                <Icone nom="profil" taille={18} />
                Mon compte
              </Link>
            </nav>
          }
          vues={{
            avenir: (
              <>
                {cartes(avenir)}
                {avenir.length === 0 && miennes.length > 0 ? (
                  <p className="vide-onglet">
                    Aucune garde confirmée pour l’instant. Une demande acceptée
                    apparaît ici.
                  </p>
                ) : null}
              </>
            ),
            demandes: (
              <>
                {cartes(demandes)}
                <p className="vide-onglet">
                  Sans réponse, une demande expire à l’heure prévue du dépôt,
                  et au plus tard après {EXPIRATION_D_UNE_DEMANDE_HEURES}{' '}
                  heures. Elle reste ici, marquée « Demande expirée ».
                </p>
              </>
            ),
            terminees: (
              <>
                {cartes(terminees)}
                <p className="vide-onglet">
                  Les photos d’une garde restent consultables{' '}
                  {JOURS_D_ACCES_AUX_PHOTOS} jours après sa clôture.
                </p>
              </>
            ),
          }}
        />
      </div>
    </main>
  );
}
