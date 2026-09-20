import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { compteSupprimableMaintenant } from '@/lib/depot/mon-compte';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { FormulaireDeSuppression } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Supprimer mon compte') };
}

export default async function SupprimerMonCompte() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const possible = await compteSupprimableMaintenant(membre.id);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/parametres" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Supprimer mon compte')}</h1>
        <div className="encart rouge" style={{ margin: '14px 0 12px' }}>
          <Icone nom="corbeille" taille={22} />
          <span>
            {p(
              'La suppression est définitive. Vos emplacements sont retirés, vos vélos et vos conversations effacés, vos avis anonymisés.',
            )}
          </span>
        </div>
        <FormulaireDeSuppression
          possible={possible}
          textes={{
            retenu: p(
              'Une demande ou une garde est encore en cours. Vous pourrez supprimer votre compte dès qu’elle sera terminée.',
            ),
            conserve: p(
              'Ce qui est conservé malgré la suppression : les gardes passées sans votre nom, et les traces de modération, pour des raisons légales.',
            ),
            motDePasse: p('Votre mot de passe'),
            confirmation: p('Je comprends que cette action est définitive.'),
            supprimer: p('Supprimer définitivement'),
            envoi: p('Suppression…'),
            annuler: p('Annuler'),
            voirMonActivite: p('Voir mon activité'),
          }}
        />
      </div>
    </main>
  );
}
