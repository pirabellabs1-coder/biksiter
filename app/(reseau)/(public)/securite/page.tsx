import type { Metadata } from 'next';

import { Icone, type NomDIcone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';
import { CONSERVATION_MAXIMALE_JOURS } from '@/lib/regles/pieces';
import { CHIFFRES_DU_CODE_DE_REMISE } from '@/lib/regles/remise';

import { BlocDeCote, ListeDeLiens, PagePublique } from '../page-publique';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Sécurité') };
}

/**
 * Ce qui rend acceptable d'ouvrir sa porte, et de confier son vélo. Chaque
 * carte décrit une protection que l'application applique réellement.
 */
export default async function Securite() {
  const lesTextes = await textes();
  const { p } = lesTextes;

  const protections: [NomDIcone, string, string][] = [
    [
      'verifie',
      p('Une communauté vérifiée'),
      p(
        'Chaque membre confirme son adresse e-mail et son numéro de téléphone, puis fait vérifier sa pièce d’identité par une personne de l’association avant de pouvoir demander une garde ou en accueillir une.',
      ),
    ],
    [
      'epingle',
      p('La confidentialité de votre adresse'),
      p(
        'La fiche publique de votre emplacement indique uniquement la zone du quartier. L’adresse exacte est transmise après l’acceptation d’une demande, uniquement au membre concerné.',
      ),
    ],
    [
      'document',
      p('La suppression de votre pièce d’identité'),
      p(
        'Votre pièce d’identité est vérifiée puis supprimée au plus tard après {jours} jours. Seul le résultat de la vérification est conservé dans votre dossier.',
        { jours: CONSERVATION_MAXIMALE_JOURS },
      ),
    ],
    [
      'cle',
      p('Un code à la remise du vélo'),
      p(
        'Chaque remise est confirmée par un code à {chiffres} chiffres, communiqué oralement, après un constat photo à la porte. L’ensemble des étapes de la garde est horodaté dans votre espace.',
        { chiffres: CHIFFRES_DU_CODE_DE_REMISE },
      ),
    ],
    [
      'utilisateurs',
      p('Vous restez maître de vos accueils'),
      p(
        'Vous acceptez uniquement les demandes qui vous conviennent. Vous pouvez également bloquer ou signaler un membre à tout moment depuis son profil ou depuis la conversation.',
      ),
    ],
    [
      'batterie',
      p('Vélos à assistance électrique'),
      p(
        'À la remise, le bike sitter examine l’état de la batterie du vélo. Si la batterie présente un signe d’usure ou de dommage, il peut refuser d’accueillir le vélo, sans que cela ne pénalise le cycliste.',
      ),
    ],
    [
      'alerte',
      p('L’assistance en cas de problème'),
      p(
        'Vous pouvez signaler un incident depuis la garde concernée, une conversation ou un profil de membre. Une personne de l’équipe de modération reprend alors le dossier avec l’historique complet de la garde.',
      ),
    ],
  ];

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Sécurité')}
      titre={p('Les mesures qui protègent chaque garde.')}
      introduction={p(
        'Bike Sitters s’appuie sur plusieurs mesures pour garantir la confidentialité, l’identité des membres et le suivi de chaque garde.',
      )}
      cote={
        <>
          {/* Le bleu dit ce qui protège : il n'habille jamais un bouton. */}
          <div className="encart bleu">
            <Icone nom="bouclier" taille={26} />
            <span>
              <strong>{p('La protection de vos informations')}</strong>
              {p(
                'Identité vérifiée par un humain, adresse exacte communiquée après acceptation, remise confirmée par un code.',
              )}
            </span>
          </div>
          <BlocDeCote titre={p('En cas d’urgence')}>
            <p className="ligne-urgence">
              <Icone nom="telephone" taille={20} />
              {p(
                'En cas de danger, appelez le 112. Pour un vol, contactez la police au 101.',
              )}
            </p>
          </BlocDeCote>
          <BlocDeCote titre={p('Pour aller plus loin')}>
            <ListeDeLiens
              liens={[
                [
                  'bouclier',
                  p('Politique de confidentialité'),
                  '/confidentialite',
                ],
                [
                  'document',
                  p('Conditions d’utilisation'),
                  '/conditions-generales',
                ],
                ['aide', p('Questions fréquentes'), '/faq'],
              ]}
            />
          </BlocDeCote>
        </>
      }
    >
      <ul className="grille-de-cartes">
        {protections.map(([icone, titre, texte]) => (
          <li key={titre} className="carte-de-contenu">
            <span className="carte-de-contenu-icone" aria-hidden="true">
              <Icone nom={icone} taille={22} />
            </span>
            <h2>{titre}</h2>
            <p>{texte}</p>
          </li>
        ))}
      </ul>
    </PagePublique>
  );
}
