import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Icone } from '@/components/app/icone';
import { etatDuCompte } from '@/lib/depot/comptes';
import { textes } from '@/lib/i18n/langue';
import { ACCUEIL_DES_MEMBRES } from '@/lib/navigation';
import { exigerUnMembre } from '@/lib/session';

import { EcranDeCompte, EtapesDeLInscription } from '../../ecran-de-compte';
import { FormulaireDeLaPiece } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Vérifiez votre identité') };
}

/** Troisième étape de l'inscription : la pièce d'identité. */
export default async function Identite() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const compte = await etatDuCompte(membre.id);
  if (
    membre.verification !== 'verifiee' &&
    (!compte?.emailVerifieLe || !compte.telephoneVerifieLe)
  ) {
    redirect('/inscription/telephone');
  }
  const verifiee = membre.verification === 'verifiee';
  const enExamen = !verifiee && compte?.pieceDeposeeLe;

  return (
    <EcranDeCompte p={p} retour="/inscription/telephone">
      <EtapesDeLInscription p={p} etape={3} titre={p('Identité')} />
      <h1 className="titre-ecran">{p('Vérifiez votre identité')}</h1>
      <p className="sous-titre">
        {p(
          'Une identité vérifiée vous permet de publier un emplacement et de demander une garde.',
        )}
      </p>

      {verifiee || enExamen ? (
        <div className="pile">
          {verifiee ? (
            <div className="encart bleu">
              <Icone nom="verifie" taille={20} />
              <span>{p('Votre identité est vérifiée.')}</span>
            </div>
          ) : (
            <div className="encart ambre" role="status">
              <Icone nom="horloge" taille={20} />
              <span>
                {p(
                  'Votre pièce a bien été reçue. Un administrateur la vérifie sous 24 heures, et vous serez prévenu du résultat.',
                )}
              </span>
            </div>
          )}
          <Link href={ACCUEIL_DES_MEMBRES} className="bouton plein">
            {p('Continuer')}
            <Icone nom="chevron" taille={20} />
          </Link>
        </div>
      ) : (
        <FormulaireDeLaPiece
          suite={ACCUEIL_DES_MEMBRES}
          libelles={{
            photographier: p("Photographier ma carte d'identité"),
            choisi: p('Document choisi : {nom}'),
            documentSupprime: p(
              "Votre document est supprimé dès la validation, et au plus tard après sept jours. Ni l'image ni le numéro ne sont conservés.",
            ),
            majeur: p(
              'Je déclare être majeur. La bêta est réservée aux personnes de 18 ans ou plus.',
            ),
            envoyer: p('Envoyer pour vérification'),
            enCours: p('Envoi…'),
            plusTard: p('Le faire plus tard'),
            continuer: p('Continuer'),
          }}
        />
      )}
    </EcranDeCompte>
  );
}
