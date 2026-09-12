import type { Metadata } from 'next';
import Link from 'next/link';

import { Avancement, Jalon } from '@/components/avancement';
import BandeauDePage from '@/components/bandeau-de-page';
import SectionEditoriale from '@/components/section-editoriale';

export const metadata: Metadata = {
  title: 'Votre inscription',
  description:
    'Où en est la vérification de votre compte, et ce que vous pouvez faire en attendant.',
};

export default function Validation() {
  return (
    <>
      <BandeauDePage
        surtitre="Votre inscription"
        titre="Nous vérifions votre pièce."
        chapeau="Une personne de l’association examine votre document, généralement sous 24 heures. La personne qui vous a invité sera prévenue dès que votre compte sera actif."
      />

      <SectionEditoriale
        id="verifications"
        surtitre="Où vous en êtes"
        titre="Plus qu’une étape."
        chapeau="Si votre pièce est difficile à lire, nous vous le signalerons et vous pourrez simplement en envoyer une autre."
        scene="confier"
      >
        <Avancement>
          <Jalon
            etat="faite"
            titre="E-mail et téléphone"
            mention="Vérifiés"
            resume="Confirmés tous les deux."
          />
          <Jalon
            etat="en-cours"
            titre="Pièce d’identité"
            resume="Transmise, en cours de vérification. En cas de refus, le motif vous est toujours expliqué."
          />
        </Avancement>
      </SectionEditoriale>

      <section
        className="section section--claire"
        aria-labelledby="attente-titre"
      >
        <div className="section__interieur">
          <div className="entete-de-section">
            <h2 id="attente-titre" className="titre-section">
              En attendant, vous pouvez déjà
            </h2>
          </div>
          <div className="grille grille--deux">
            <article className="carte">
              <h3>Voir la carte</h3>
              <p className="discret">
                Repérez les emplacements autour de vos destinations habituelles.
              </p>
              <Link
                href="/emplacements"
                className="bouton bouton--discret bouton--large"
              >
                Ouvrir la carte
              </Link>
            </article>

            <article className="carte">
              <h3>Comprendre le service</h3>
              <p className="discret">
                Comment se passe un stationnement, des deux côtés.
              </p>
              <Link
                href="/fonctionnement"
                className="bouton bouton--discret bouton--large"
              >
                Comment ça marche
              </Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
