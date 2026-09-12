import type { Metadata } from 'next';
import Link from 'next/link';

import Appel from '@/components/appel';
import BandeauDePage from '@/components/bandeau-de-page';
import SectionEditoriale from '@/components/section-editoriale';
import { SEUIL_DESISTEMENT_TARDIF_HEURES } from '@/lib/regles/annulation';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { ESSAIS_PAR_CODE, VALIDITE_CODE_HEURES } from '@/lib/regles/remise';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description:
    'Comment fonctionne Bike Sitters, côté cycliste comme côté bike sitter : la demande, la remise du vélo et la reprise.',
};

/** Les engagements du service, chacun expliqué en une phrase. */
const NOS_ENGAGEMENTS = [
  {
    titre: 'Chacun à son rythme',
    raison:
      'Les membres ne sont ni notés ni classés. Chaque bike sitter accueille selon ses disponibilités, sans pression.',
  },
  {
    titre: 'Un service entièrement gratuit',
    raison:
      'Le service est gratuit pour tous. Les bike sitters accueillent bénévolement, et aucune commission n’est prélevée.',
  },
  {
    titre: 'Une adresse confidentielle',
    raison:
      'L’adresse exacte n’apparaît ni sur la carte ni sur la fiche. Elle est transmise au cycliste une fois sa demande acceptée.',
  },
  {
    titre: 'Des échanges sans urgence',
    raison:
      'Les échanges se font par messages, sans obligation de répondre dans l’instant : chacun répond quand il le peut.',
  },
];

export default function Fonctionnement() {
  return (
    <>
      <BandeauDePage
        surtitre="Comment ça marche"
        titre="Le service en détail."
        chapeau="Bike Sitters met en relation des cyclistes qui cherchent un abri pour leur vélo et des habitants qui disposent d’une place. Voici comment cela se passe, étape par étape."
        scene="la-remise"
        actions={
          <>
            <Link href="/emplacements" className="bouton bouton--principal">
              Trouver un emplacement
            </Link>
            <Link
              href="/proposer-un-emplacement"
              className="bouton bouton--discret"
            >
              Accueillir un vélo
            </Link>
          </>
        }
      />

      <SectionEditoriale
        id="cycliste"
        surtitre="Côté cycliste"
        titre="Si vous cherchez une place pour votre vélo"
        chapeau="Quatre étapes, de la recherche à la reprise de votre vélo."
        scene="confier"
      >
        <ol className="etapes etapes--reliees">
          <li className="etape">
            <span className="etape__numero" aria-hidden="true" />
            <div>
              <h3>Vous ouvrez la carte</h3>
              <p>
                Les emplacements s’affichent dans une zone approximative autour
                de votre destination.
              </p>
            </div>
          </li>
          <li className="etape">
            <span className="etape__numero" aria-hidden="true" />
            <div>
              <h3>Vous écrivez au bike sitter</h3>
              <p>
                Vous proposez un jour, une heure de dépôt et une heure de
                reprise, et vous précisez le type de votre vélo.
              </p>
            </div>
          </li>
          <li className="etape">
            <span className="etape__numero" aria-hidden="true" />
            <div>
              <h3>Le bike sitter vous répond</h3>
              <p>
                S’il accepte, l’adresse exacte vous est transmise et vous
                convenez ensemble des détails. S’il n’est pas disponible, un
                autre emplacement du quartier pourra sûrement vous accueillir.
              </p>
            </div>
          </li>
          <li className="etape">
            <span className="etape__numero" aria-hidden="true" />
            <div>
              <h3>Vous vous remettez le vélo avec un code</h3>
              <p>
                La personne qui remet le vélo communique un code à quatre
                chiffres, celle qui le reçoit le saisit. Il se dicte facilement,
                fonctionne même sans réseau, reste valable{' '}
                {VALIDITE_CODE_HEURES} heures et accepte {ESSAIS_PAR_CODE}{' '}
                essais.
              </p>
            </div>
          </li>
        </ol>
      </SectionEditoriale>

      <SectionEditoriale
        id="bike-sitter"
        claire
        surtitre="Côté bike sitter"
        titre="Si vous proposez un emplacement"
        chapeau="Un garage, une cave ou une cour fermée suffisent. Vous gardez la main à chaque étape, et votre adresse reste confidentielle jusqu’à ce que vous acceptiez une demande."
        scene="garder"
      >
        <ol className="etapes etapes--reliees">
          <li className="etape">
            <span className="etape__numero" aria-hidden="true" />
            <div>
              <h3>Vous décrivez le lieu</h3>
              <p>
                Type d’emplacement, capacité, fermeture, accès, ancrage. Vous
                pouvez en proposer jusqu’à {EMPLACEMENTS_PAR_MEMBRE}.
              </p>
            </div>
          </li>
          <li className="etape">
            <span className="etape__numero" aria-hidden="true" />
            <div>
              <h3>Une personne vérifie</h3>
              <p>
                Chaque candidature est relue par une personne de l’association,
                et votre identité est vérifiée avant la publication.
              </p>
            </div>
          </li>
          <li className="etape">
            <span className="etape__numero" aria-hidden="true" />
            <div>
              <h3>Vous choisissez</h3>
              <p>
                Chaque demande est une proposition : vous l’acceptez si elle
                vous convient, en toute liberté.
              </p>
            </div>
          </li>
        </ol>
      </SectionEditoriale>

      <section className="section" aria-labelledby="engagements-titre">
        <div className="section__interieur">
          <div className="entete-de-section entete-de-section--centree">
            <p className="surtitre">Nos engagements</p>
            <h2
              id="engagements-titre"
              className="titre-section titre-section--large"
            >
              Un service pensé pour la confiance.
            </h2>
            <p className="chapeau">
              Quatre principes guident Bike Sitters, pour les cyclistes comme
              pour les bike sitters.
            </p>
          </div>

          <ul className="grille grille--deux cartes-nues">
            {NOS_ENGAGEMENTS.map(({ titre, raison }) => (
              <li key={titre} className="carte">
                <h3>{titre}</h3>
                <p className="discret">{raison}</p>
              </li>
            ))}
          </ul>

          <div className="grille grille--deux precisions">
            <div className="encart">
              <p>
                <strong>En cas d’empêchement.</strong> Si vous devez annuler
                moins de {SEUIL_DESISTEMENT_TARDIF_HEURES} heures avant le
                dépôt, prévenez l’autre personne avec un petit mot : elle
                s’était organisée pour vous. Aucune pénalité n’est appliquée.
              </p>
            </div>
            <div className="encart">
              <p>
                <strong>Le rôle du service.</strong> Bike Sitters met en
                relation deux personnes ; il ne garde pas, ne transporte pas et
                n’assure pas le vélo. Le partage des responsabilités est
                détaillé dans les{' '}
                <Link href="/conditions-generales" className="lien">
                  conditions générales
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <Appel
        surtitre="Et maintenant"
        titre="Le plus simple, c’est d’essayer."
        chapeau="Découvrez les emplacements autour de vos trajets, ou proposez le vôtre en quelques minutes."
        actions={
          <>
            <Link href="/emplacements" className="bouton bouton--principal">
              Trouver un emplacement
            </Link>
            <Link
              href="/proposer-un-emplacement"
              className="bouton bouton--discret"
            >
              Accueillir un vélo
            </Link>
          </>
        }
        note={
          <>
            Une question précise ?{' '}
            <Link href="/questions-frequentes" className="lien">
              Les questions qu’on nous pose
            </Link>
            .
          </>
        }
      />
    </>
  );
}
