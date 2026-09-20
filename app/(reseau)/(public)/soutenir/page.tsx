import type { Metadata } from 'next';

import { Icone } from '@/components/app/icone';
import { baseConfiguree } from '@/lib/bd/client';
import { ASSOCIATION } from '@/lib/contenu/association';
import { textes } from '@/lib/i18n/langue';
import { CE_QUE_COUVRE_UN_DON, lesDonsSontOuverts } from '@/lib/regles/dons';

import { BlocDeCote, ListeDeLiens, PagePublique } from '../page-publique';
import { FormulaireDeDon } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Nous soutenir') };
}

export default async function Soutenir() {
  const lesTextes = await textes();
  const { p } = lesTextes;
  const ouverts = lesDonsSontOuverts(ASSOCIATION);

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Nous soutenir')}
      titre={p('Aider Bike Sitters à rester gratuit')}
      introduction={p(
        'Le service est gratuit pour tous les membres. Son fonctionnement a pourtant quelques coûts : hébergement, cartographie, envoi des e-mails et vérification des candidatures.',
      )}
      cote={
        <>
          <BlocDeCote titre={p('Un don sans contrepartie')}>
            <p>
              {p(
                'Tous les membres sont traités de la même manière : un don n’apporte ni priorité ni visibilité particulière.',
              )}
            </p>
          </BlocDeCote>
          <BlocDeCote titre={p('En savoir plus')}>
            <ListeDeLiens
              liens={[
                ['coeur', p('À propos de l’association'), '/a-propos'],
                ['aide', p('Questions fréquentes'), '/faq'],
              ]}
            />
          </BlocDeCote>
        </>
      }
    >
      <section className="pile">
        <h2>{p('À quoi servent vos dons')}</h2>
        <ul className="grille-de-cartes">
          {CE_QUE_COUVRE_UN_DON.map(({ montant, usage }) => (
            <li key={montant} className="carte-de-contenu">
              <p className="chiffre">{montant} €</p>
              <p>{p(usage)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="pile">
        <h2>{p('Un don par virement')}</h2>
        <p>
          {p(
            'Nous privilégions le virement bancaire : il ne coûte rien, ni à vous ni à l’association, alors qu’un paiement par carte entraîne des frais sur chaque don.',
          )}
        </p>
        <p>
          {p(
            'Le formulaire vous fournit une communication structurée à indiquer lors de votre virement : elle nous permet de le reconnaître et de vous remercier. Aucune donnée bancaire ne transite par ce site.',
          )}
        </p>

        {!ouverts ? (
          <div className="encart" role="status">
            <Icone nom="horloge" taille={22} />
            <span>
              <strong>{p('Les dons ne sont pas encore ouverts.')}</strong>{' '}
              {p(
                'L’association est en cours de constitution et n’a pas encore de compte bancaire. Les dons ouvriront dès qu’il sera créé.',
              )}
            </span>
          </div>
        ) : !baseConfiguree() ? (
          <div className="encart" role="status">
            <Icone nom="info" taille={22} />
            <span>
              {p(
                'La base de données n’est pas branchée : le formulaire est indisponible pour l’instant.',
              )}
            </span>
          </div>
        ) : (
          <div className="carte formulaire-de-page">
            <FormulaireDeDon
              libelles={{
                prenom: p('Votre prénom (facultatif)'),
                montant: p('Montant en euros (facultatif)'),
                email: p('Votre e-mail (facultatif)'),
                aideEmail: p(
                  'Pour recevoir les coordonnées par écrit. Nous ne nous en servons pour rien d’autre.',
                ),
                envoyer: p('Obtenir les coordonnées du virement'),
                envoi: p('Un instant…'),
              }}
            />
          </div>
        )}
      </section>
    </PagePublique>
  );
}
