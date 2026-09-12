import type { Metadata } from 'next';

import BandeauDePage from '@/components/bandeau-de-page';
import BaseNonBranchee from '@/components/base-non-branchee';
import SectionEditoriale from '@/components/section-editoriale';
import { baseConfiguree } from '@/lib/bd/client';
import { ASSOCIATION } from '@/lib/contenu/association';
import { CE_QUE_COUVRE_UN_DON, lesDonsSontOuverts } from '@/lib/regles/dons';

import FormulaireDeDon from './formulaire';

export const metadata: Metadata = {
  title: 'Nous soutenir',
  description:
    'Bike Sitters est gratuit pour ses membres. Découvrez ce que financent les dons : hébergement, cartographie, e-mails et vérification des candidatures.',
};

export default function Soutenir() {
  const ouverts = lesDonsSontOuverts(ASSOCIATION);

  return (
    <>
      <BandeauDePage
        surtitre="Nous soutenir"
        titre="Aider Bike Sitters à rester gratuit."
        chapeau="Le service est gratuit pour tous les membres. Son fonctionnement a pourtant quelques coûts : l’hébergement, la cartographie, l’envoi des e-mails et la vérification des candidatures."
        scene="velo-a-labri"
      />

      <section className="section" aria-labelledby="dons-titre">
        <div className="section__interieur">
          <div className="entete-de-section entete-de-section--centree">
            <p className="surtitre">Ce que couvre un don</p>
            <h2 id="dons-titre" className="titre-section titre-section--large">
              À quoi servent vos dons.
            </h2>
          </div>

          <ul className="grille dons cartes-nues">
            {CE_QUE_COUVRE_UN_DON.map(({ montant, usage }) => (
              <li className="carte" key={montant}>
                <p className="chiffre__valeur">{montant} €</p>
                <p className="discret">{usage}</p>
              </li>
            ))}
          </ul>

          {ouverts ? null : (
            <div className="encart precisions">
              <p>
                <strong>Les dons ne sont pas encore ouverts.</strong>{' '}
                L’association est en cours de constitution et n’a pas encore de
                compte bancaire. Les dons ouvriront dès qu’il sera créé.
              </p>
              <p>Le formulaire de don sera alors disponible sur cette page.</p>
            </div>
          )}
        </div>
      </section>

      <SectionEditoriale
        id="virement"
        claire
        surtitre="Comment donner"
        titre="Un don par virement"
      >
        <p>
          Nous privilégions le virement bancaire : il ne coûte rien, ni à vous
          ni à l’association, alors qu’un paiement par carte entraîne des frais
          sur chaque don.
        </p>
        <p>
          Le formulaire de don vous fournit une communication structurée à
          indiquer lors de votre virement : elle nous permet de le reconnaître
          et de vous remercier. Aucune donnée bancaire ne transite par ce site.
        </p>

        {ouverts ? (
          <>
            {baseConfiguree() ? <FormulaireDeDon /> : <BaseNonBranchee />}

            <div className="encart">
              <p>
                Vous pouvez aussi virer directement à {ASSOCIATION.nom}, IBAN{' '}
                <strong>{ASSOCIATION.iban}</strong>, en mentionnant simplement «
                don ». La communication structurée nous permet simplement de
                vous remercier personnellement.
              </p>
            </div>
          </>
        ) : null}
      </SectionEditoriale>

      <SectionEditoriale
        id="contrepartie"
        surtitre="Égalité entre membres"
        titre="Un soutien sans contrepartie"
      >
        <p>
          Tous les membres sont traités de la même manière, qu’ils fassent un
          don ou non : un don n’apporte ni priorité ni visibilité particulière.
        </p>
        <p className="exergue">Chacun bénéficie du même service.</p>
      </SectionEditoriale>
    </>
  );
}
