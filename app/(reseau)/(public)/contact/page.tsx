import type { Metadata } from 'next';

import { Icone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';
import { SUJETS_DE_CONTACT } from '@/lib/regles/contact';

import { BlocDeCote, ListeDeLiens, PagePublique } from '../page-publique';
import { FormulaireDeContact } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Contact') };
}

export default async function Contact() {
  const lesTextes = await textes();
  const { p } = lesTextes;

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Contact')}
      titre={p('Contacter l’association')}
      introduction={p(
        'Une question, un problème ou un abus à signaler : une personne de l’association vous répond sous 48 heures.',
      )}
      cote={
        <>
          {/* Le formulaire n'est pas le chemin le plus court pour une garde :
              la garde elle-même ouvre un dossier à la modération. */}
          <BlocDeCote titre={p('Un problème pendant une garde ?')}>
            <p>
              {p(
                'Signalez-le depuis la garde : elle est mise en pause, et le dossier arrive directement à la modération.',
              )}
            </p>
          </BlocDeCote>
          <BlocDeCote titre={p('En cas d’urgence')}>
            <p className="ligne-urgence">
              <Icone nom="telephone" taille={20} />
              {p(
                'En cas de danger, appelez le 112. Pour un vol, contactez la police au 101.',
              )}
            </p>
          </BlocDeCote>
          <BlocDeCote titre={p('Vous cherchez une réponse rapide ?')}>
            <ListeDeLiens
              liens={[
                ['aide', p('Questions fréquentes'), '/faq'],
                ['velo', p('Comment ça marche'), '/comment-ca-marche'],
              ]}
            />
          </BlocDeCote>
        </>
      }
    >
      <div className="carte formulaire-de-page">
        <FormulaireDeContact
          libelles={{
            email: p('Votre e-mail'),
            sujet: p('Sujet'),
            message: p('Message'),
            messageExemple: p('Écrivez votre message ici.'),
            envoyer: p('Envoyer'),
            envoi: p('Envoi…'),
            sujets: Object.entries(SUJETS_DE_CONTACT).map(
              ([valeur, libelle]) => [valeur, p(libelle)] as const,
            ),
          }}
        />
      </div>
    </PagePublique>
  );
}
