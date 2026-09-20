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
      p('Des membres vérifiés'),
      p(
        'Pour demander une garde ou accueillir un vélo, chaque membre confirme son e-mail et son téléphone, et fait vérifier sa pièce d’identité par une personne de l’association.',
      ),
    ],
    [
      'epingle',
      p('Votre adresse reste privée'),
      p(
        'Une fiche montre une zone approximative, jamais un point précis. L’adresse exacte est communiquée après l’acceptation d’une demande, à la seule personne concernée.',
      ),
    ],
    [
      'document',
      p('Votre pièce d’identité n’est pas conservée'),
      p(
        'Elle est vérifiée puis supprimée, au plus tard après {jours} jours. Seul le résultat est enregistré.',
        { jours: CONSERVATION_MAXIMALE_JOURS },
      ),
    ],
    [
      'cle',
      p('Un code à chaque remise'),
      p(
        'Le vélo change de mains avec un code à {chiffres} chiffres, après des photos prises devant la porte. Chaque étape de la garde est horodatée.',
        { chiffres: CHIFFRES_DU_CODE_DE_REMISE },
      ),
    ],
    [
      'utilisateurs',
      p('Vous gardez la main'),
      p(
        'Vous acceptez seulement les demandes qui vous conviennent, et vous pouvez bloquer ou signaler un membre à tout moment.',
      ),
    ],
    [
      'batterie',
      p('Vélos électriques'),
      p(
        'Au dépôt, le bike sitter jette un œil à la batterie. Gonflée, chaude ou abîmée : il peut refuser le vélo, sans reproche pour personne.',
      ),
    ],
    [
      'alerte',
      p('En cas de problème'),
      p(
        'Signalez-le depuis la garde, la conversation ou le profil du membre : une personne de la modération reprend le dossier avec l’historique complet de la garde.',
      ),
    ],
  ];

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Sécurité')}
      titre={p('Ce qui permet d’ouvrir sa porte.')}
      introduction={p(
        'Identités vérifiées, adresses confidentielles et remises confirmées par un code : voici ce qui protège chaque garde.',
      )}
      cote={
        <>
          {/* Le bleu dit ce qui protège : il n'habille jamais un bouton. */}
          <div className="encart bleu">
            <Icone nom="bouclier" taille={26} />
            <span>
              <strong>{p('Vos informations sont protégées')}</strong>
              {p(
                'Identités vérifiées, adresses confidentielles et remises confirmées par un code.',
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
