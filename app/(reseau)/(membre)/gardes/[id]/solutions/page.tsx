import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  ChoixDuMotif,
  type MotifPropose,
} from '@/components/maquette/garde/choix-du-motif';
import { creneau } from '@/components/maquette/garde/dates';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { motifsProposes, transitionPermise } from '@/lib/regles/garde';
import { exigerUnMembre } from '@/lib/session';

import { gesteAvecMotif } from '../actions';

export const metadata: Metadata = { title: 'Signaler un problème' };

/** Ce que chaque motif de signalement recouvre, en une ligne. */
const DETAIL_DU_MOTIF: Readonly<Record<string, string>> = {
  "Le vélo n'a pas été restitué": 'Il n’est pas revenu à l’heure convenue',
  "L'autre personne est injoignable": 'Plus de trente minutes sans nouvelles',
  'Le vélo est endommagé': 'Dégât, pièce manquante, état différent',
  "Le lieu ne correspond pas à l'annonce":
    'L’emplacement n’est pas celui de la fiche',
  "Le vélo n'a pas été récupéré": 'Le cycliste n’est pas revenu à l’heure convenue',
  'Le vélo déposé pose problème': 'État, batterie ou taille différents de la demande',
  'Comportement inapproprié': 'Des propos ou une attitude déplacés',
  Autre: 'Décrivez-le nous en quelques lignes',
};

/**
 * Le signalement d'un problème pendant ou après une garde.
 *
 * Un modérateur reprend le dossier avec les deux constats et leurs photos :
 * ni le cycliste ni le bike sitter ne peuvent les modifier une fois validés.
 */
export default async function Solutions({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id } = await params;
  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();

  const [_nonLues, _emplacements] = await Promise.all([
    nombreDeNotificationsNonLues(membre.id),
    nombreDEmplacements(membre.id),
  ]);

  const prenom = garde.autre.prenom;
  const possible = transitionPermise(garde.etat, 'signaler', garde.role);
  const motifs: MotifPropose[] = motifsProposes('signaler', garde.role).map(
    (valeur) => ({ valeur, detail: DETAIL_DU_MOTIF[valeur] ?? '' }),
  );

  return (
    <main id="contenu">
      <div className="page page-etroite">
        <header className="page-tete">
          <span className="kicker">ASSISTANCE</span>
          <h1>Signaler un problème</h1>
          <p>
            Garde chez {prenom} {garde.autre.initiale}. ·{' '}
            {creneau(garde.debut, garde.fin)}. Dites-nous ce qui s’est passé :
            un modérateur regarde les deux constats et leurs photos, que
            personne ne peut modifier.
          </p>
        </header>

        <div className="urgence">
          <b>En cas de danger immédiat, appelez le 112.</b>
          <p>
            Si vous ne vous sentez pas en sécurité, n’attendez pas notre
            réponse. <Link href="/urgence">Voir les numéros utiles</Link>.
          </p>
        </div>

        {possible ? (
          <ChoixDuMotif
            action={gesteAvecMotif.bind(null, id, 'signaler')}
            motifs={motifs}
            question="Que s’est-il passé ?"
            libellePrecision="Décrivez la situation"
            exemple="Ce que vous avez constaté, et à quel moment."
            confirmer="Envoyer le signalement"
            danger
            retour={`/gardes/${id}`}
            libelleRetour="Revenir à la garde"
          >
            <section className="bloc">
              <h2>Ce qui se passe ensuite</h2>
              <ul className="liste-nette">
                <li>
                  Tant qu’un signalement est ouvert, la garde ne peut être
                  close par aucune des deux parties.
                </li>
                <li>
                  Les points restent en attente jusqu’à la décision du
                  modérateur.
                </li>
                <li>
                  Les photos du dépôt et du retour font foi : elles sont
                  horodatées et ne se modifient plus.
                </li>
              </ul>
            </section>
          </ChoixDuMotif>
        ) : (
          <section className="bloc">
            <h2>Cette garde ne peut plus recevoir de signalement</h2>
            <p className="gris">
              Le signalement s’ouvre pendant la garde et dans les jours qui
              suivent sa clôture. Écrivez-nous depuis l’aide : un modérateur
              reprendra le dossier avec vous.
            </p>
            <div className="actions-fin">
              <Link className="primary" href="/aide">
                Nous écrire
              </Link>
              <Link className="outline" href={`/gardes/${id}`}>
                Revenir à la garde
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
