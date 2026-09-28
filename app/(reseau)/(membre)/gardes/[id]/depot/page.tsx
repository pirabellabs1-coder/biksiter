import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { creneau, heure } from '@/components/maquette/garde/dates';
import { BoutonDEnvoi } from '@/components/app/bouton-d-envoi';
import { PersonneALaPorte } from '@/components/maquette/garde/personne-a-la-porte';
import { codeDeLaRemise, detailDeLaGarde } from '@/lib/depot/gardes';
import { PHOTOS_DU_CONSTAT } from '@/lib/regles/constat';
import {
  ARRIVEE_AVANT_L_HEURE_MINUTES,
  peutSignalerSonArrivee,
} from '@/lib/regles/garde';
import {
  CHIFFRES_DU_CODE_DE_REMISE,
  VALIDITE_CODE_HEURES,
} from '@/lib/regles/remise';
import { exigerUnMembre } from '@/lib/session';

import { gesteDirect } from '../actions';

export const metadata: Metadata = { title: 'Déposer le vélo' };

/** Les quatre angles du constat de dépôt, dans l'ordre des maquettes. */

/**
 * Le dépôt du vélo, côté cycliste : les photos, le code à dicter, et ce qu'on
 * confirme en partant.
 *
 * Règle 5 — au dépôt, c'est le cycliste qui remet le vélo : il détient le code
 * et le lit à voix haute au bike sitter, en deux groupes de trois chiffres.
 */
export default async function DeposerLeVelo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id } = await params;
  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  if (
    garde.role !== 'cycliste' ||
    (garde.etat !== 'accepte' && garde.etat !== 'arrivee')
  ) {
    redirect(`/gardes/${id}`);
  }

  const code = await codeDeLaRemise(membre.id, id, 'depot');

  const prenom = garde.autre.prenom;
  const photosPrises = Boolean(garde.constats.depot);
  const arrive = garde.etat === 'arrivee';
  const arriveePossible = peutSignalerSonArrivee(
    garde.debut,
    garde.fin,
    new Date(),
  );
  const chiffres = code?.role === 'detenteur' ? code.chiffres : null;

  return (
    <main id="contenu">
      <div className="page page-etroite">
        <header className="page-tete">
          <span className="kicker">DÉPÔT DU VÉLO</span>
          <h1>Vous y êtes.</h1>
          <p>
            Chez {prenom} {garde.autre.initiale}. ·{' '}
            {creneau(garde.debut, garde.fin)} ·{' '}
            {garde.emplacement.type}. L’adresse complète et le téléphone sont
            dans la garde.
          </p>
          <PersonneALaPorte personne={garde.autre} role="Votre bike sitter" />
        </header>

        <ol className="jalons">
          <li className={photosPrises ? 'fait' : undefined} aria-current={photosPrises ? undefined : 'step'}>
            <b>1</b>Photos du vélo
          </li>
          <li className={chiffres ? 'fait' : undefined}>
            <b>2</b>Code de remise
          </li>
          <li>
            <b>3</b>Confirmation
          </li>
        </ol>

        <section className="bloc">
          <h2>Photos du vélo</h2>
          <p className="gris">
            Deux photos suffisent, côté gauche et côté droit ; deux autres sont
            possibles pour l’avant et pour un défaut déjà présent. Elles servent
            de référence si une question se pose plus tard.
          </p>
          <div className="photos-constat">
            {PHOTOS_DU_CONSTAT.map((photo) => (
              <Link
                key={photo.rang}
                className={photosPrises ? 'photo-case pleine' : 'photo-case'}
                href={`/gardes/${id}/constat/depot`}
              >
                {photosPrises ? `${photo.titre} ✓` : `+ ${photo.titre}`}
              </Link>
            ))}
          </div>
          <p className="gris">
            {photosPrises
              ? 'Les photos sont enregistrées. Il reste à échanger le code avec votre bike sitter pour lui confier le vélo.'
              : 'Les photos et la remarque sur l’état du vélo se prennent à l’écran suivant, devant la porte.'}
          </p>
        </section>

        <section className="bloc">
          <h2>Code de remise</h2>
          {chiffres ? (
            <>
              <p className="gris">
                Vous donnez {CHIFFRES_DU_CODE_DE_REMISE} chiffres à {prenom}.
                C’est ce code qui ouvre la garde : sans lui, rien n’est
                enregistré.
              </p>
              <div className="code-a-dicter">
                <p className="code-chiffres">
                  {/* Lu chiffre par chiffre, pas « cent vingt-trois ». */}
                  <span className="lecteur">
                    Code de remise : {chiffres.split('').join(' ')}
                  </span>
                  <span aria-hidden="true">{chiffres.slice(0, 3)}</span>
                  <span aria-hidden="true">{chiffres.slice(3)}</span>
                </p>
                <p className="code-aide">
                  Dictez-le en deux groupes de trois. Il reste valable{' '}
                  {VALIDITE_CODE_HEURES} heures et ne sert qu’une fois.
                </p>
              </div>
            </>
          ) : (
            <p className="gris">
              Le code apparaîtra ici une fois le vélo photographié devant la
              porte. Vous le lirez à {prenom}, qui le saisira sur son écran.
            </p>
          )}
        </section>

        <section className="bloc">
          <h2>Ce que vous confirmez</h2>
          <ul className="liste-nette">
            <li>
              Vous remettez le vélo <b>en main propre</b> à {prenom}.
            </li>
            <li>
              Le vélo est rangé dans un <b>emplacement fermé</b>, à son domicile.
            </li>
            <li>
              Vous repassez avant <b>{heure(garde.fin)}</b>, ou vous prolongez
              depuis la garde.
            </li>
          </ul>
          <div className="actions-fin">
            {arrive ? (
              <Link
                className="primary"
                href={
                  photosPrises
                    ? `/gardes/${id}/remise/depot`
                    : `/gardes/${id}/constat/depot`
                }
              >
                {photosPrises ? 'Afficher mon code de dépôt' : 'Photographier le vélo'}
              </Link>
            ) : arriveePossible ? (
              <form action={gesteDirect}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="geste" value="arriver" />
                <BoutonDEnvoi className="primary">
                  Je suis devant la porte
                </BoutonDEnvoi>
              </form>
            ) : (
              <button type="button" className="primary" disabled>
                Je suis devant la porte
              </button>
            )}
            <Link className="outline" href={`/gardes/${id}/solutions`}>
              Un problème ?
            </Link>
          </div>
          {!arrive && !arriveePossible ? (
            <p className="gris">
              Votre arrivée pourra être signalée à partir de{' '}
              {ARRIVEE_AVANT_L_HEURE_MINUTES} minutes avant l’heure prévue du
              dépôt.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
