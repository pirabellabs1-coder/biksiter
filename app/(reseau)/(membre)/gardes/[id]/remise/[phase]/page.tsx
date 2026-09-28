import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PersonneALaPorte } from '@/components/maquette/garde/personne-a-la-porte';
import { SaisieDuCode } from '@/components/maquette/garde/saisie-du-code';
import { codeDeLaRemise, detailDeLaGarde } from '@/lib/depot/gardes';
import {
  AUTEUR_DU_CONSTAT,
  ETATS_DU_VELO,
  titreDeLaPhoto,
} from '@/lib/regles/constat';
import {
  ESSAIS_PAR_CODE,
  VALIDITE_CODE_HEURES,
} from '@/lib/regles/remise';
import { exigerUnMembre } from '@/lib/session';
import { dePrenom } from '@/lib/texte/elision';

import { confirmerLaRemise, nouveauCode } from '../../actions';
import { Rafraichir } from './saisie';

export const metadata: Metadata = { title: 'Remise du vélo' };

/** Les trois angles du constat de retour, dans l'ordre des maquettes. */
const ANGLES_DE_RETOUR = ['Côté gauche', 'Côté droit', 'Cadre et accessoires'];

/**
 * La remise du vélo, dépôt ou reprise.
 *
 * Règle 5 — celui qui remet le vélo détient le code et le dicte en deux
 * groupes de trois ; celui qui le reçoit le saisit. L'écran sert donc deux
 * personnes, et montre à chacune ce qu'elle a à faire.
 */
export default async function RemiseDuVelo({
  params,
}: {
  params: Promise<{ id: string; phase: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id, phase } = await params;
  if (phase !== 'depot' && phase !== 'reprise') notFound();

  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  const constat = garde.constats[phase] ?? null;
  // Celui qui photographie le fait avant que le code n'ait un sens.
  if (garde.role === AUTEUR_DU_CONSTAT[phase] && !constat) {
    redirect(`/gardes/${id}/constat/${phase}`);
  }

  const code = await codeDeLaRemise(membre.id, id, phase);
  // La garde a avancé : l'écran de remise n'a plus d'objet.
  if (!code) redirect(`/gardes/${id}`);

  const prenom = garde.autre.prenom;
  const aLaPorte = (
    <PersonneALaPorte
      personne={garde.autre}
      role={garde.role === 'cycliste' ? 'Votre bike sitter' : 'Cycliste de cette garde'}
    />
  );
  const angles = constat
    ? constat.rangs.map((rang) => titreDeLaPhoto(rang))
    : ANGLES_DE_RETOUR;

  if (code.role === 'detenteur') {
    return (
      <main id="contenu">
        <Rafraichir secondes={5} />
        <div className="dashboard-wrap">
          <ol className="fil-etapes">
            <li className="fait">Vérification</li>
            <li className="fait">Photos</li>
            <li className="on">
              {phase === 'depot' ? 'Dépôt' : 'Récupération'}
            </li>
          </ol>
          <h1>
            {phase === 'depot' ? 'Code de dépôt' : 'Code de récupération'}
          </h1>
          {aLaPorte}
          <p className="bs-intro">
            Lisez ce code à voix haute à {prenom}, au moment où vous remettez
            le vélo. En le saisissant, {prenom} confirme la remise.
          </p>

          <div className={code.expire ? 'code-a-dicter expire' : 'code-a-dicter'}>
            <p className="code-chiffres">
              {/* Deux groupes de trois : c'est ainsi qu'on le dicte. Assez
                  grand pour être lu à bout de bras, dans une cave. Le
                  lecteur d'écran lit chiffre par chiffre, pas « cent
                  vingt-trois ». */}
              <span className="lecteur">
                Code : {code.chiffres.split('').join(' ')}
              </span>
              <span aria-hidden="true">{code.chiffres.slice(0, 3)}</span>
              <span aria-hidden="true">{code.chiffres.slice(3)}</span>
            </p>
            <p className="code-aide">
              {code.expire
                ? 'Ce code a expiré. Générez-en un nouveau avant de le dicter.'
                : `Valable ${VALIDITE_CODE_HEURES} heures, ${ESSAIS_PAR_CODE} essais. À dire en face à face, jamais par message.`}
            </p>
          </div>

          {!constat ? (
            <p className="prog-note" role="status">
              {prenom} photographie le vélo, puis saisira ce code.
            </p>
          ) : null}

          <form action={nouveauCode} className="deux-boutons">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="phase" value={phase} />
            <button type="submit" className="outline">
              Générer un nouveau code
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Les photos ne sont pas encore là : l'écran attend, et se met à jour seul.
  if (!constat) {
    return (
      <main id="contenu">
        <Rafraichir secondes={5} />
        <div className="dashboard-wrap">
          <ol className="fil-etapes">
            <li className="fait">Vérification</li>
            <li className="on">Photos</li>
            <li>{phase === 'depot' ? 'Dépôt' : 'Récupération'}</li>
          </ol>
          <h1>Recevoir le vélo</h1>
          {aLaPorte}
          <p className="bs-intro">
            {prenom} photographie le vélo devant votre porte. L’écran se met à
            jour dès que le constat est enregistré.
          </p>
          <p className="prog-note" role="status">
            Les photos sont en cours de réception.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main id="contenu">
      <div className="dashboard-wrap">
        <ol className="fil-etapes">
          <li className="fait">Vérification</li>
          <li className="fait">Photos</li>
          <li className="on">
            {phase === 'depot' ? 'Dépôt' : 'Récupération'}
          </li>
        </ol>
        <h1>
          {phase === 'depot' ? 'Recevoir le vélo' : 'Récupérer mon vélo'}
        </h1>
        {aLaPorte}
        <p className="bs-intro">
          Deux constats horodatés : celui du dépôt et celui du retour. Une fois
          validés, ni vous ni {prenom} ne pouvez les modifier.
        </p>

        <h2 className="prog-titre">
          {phase === 'depot' ? 'Photos du dépôt' : 'Photos de retour'}
        </h2>
        {/* Celui qui reçoit le vélo voit ce qui a été photographié et déclaré
            avant de confirmer : c'est sur cette base qu'il accepte la remise. */}
        {constat.rangs.length > 0 ? (
          <div className="photos-de-constat">
            {constat.rangs.map((rang) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={rang}
                src={`/gardes/${id}/constat/${phase}/photo/${rang}`}
                alt={titreDeLaPhoto(rang)}
              />
            ))}
          </div>
        ) : (
          <ul className="liste-nette">
            {angles.map((angle) => (
              <li key={angle}>{angle}</li>
            ))}
          </ul>
        )}
        <div className="champs lecture">
          <div>
            <span>État déclaré</span>
            <b>{ETATS_DU_VELO[constat.etat]}</b>
          </div>
          {constat.note ? (
            <div>
              <span>Remarque {dePrenom(prenom)}</span>
              <b>{constat.note}</b>
            </div>
          ) : null}
        </div>
        <p className="prog-note">
          {phase === 'depot'
            ? 'Les photos du vélo ont été prises devant la porte, au moment du dépôt. Elles servent de référence si une question se pose plus tard.'
            : 'Les photos du vélo ont été prises au moment de la reprise. Comparées à celles du dépôt, elles montrent l’état du vélo à chaque bout de la garde.'}
        </p>

        <h2 className="prog-titre">
          {phase === 'depot' ? 'Code de dépôt' : 'Code de récupération'}
        </h2>
        <SaisieDuCode
          action={confirmerLaRemise.bind(null, id, phase)}
          intro={`${prenom} a le code sur son écran. Demandez-le-lui et saisissez-le ici : c’est lui qui ${phase === 'depot' ? 'ouvre la garde' : 'clôt la garde et libère la place'}.`}
          aide={
            code.essaisRestants < ESSAIS_PAR_CODE
              ? `Il reste ${code.essaisRestants} ${code.essaisRestants > 1 ? 'essais' : 'essai'}. Au-delà, un nouveau code est généré et ${prenom} vous le relit.`
              : `Le code change à chaque garde et ne sert qu’une fois. Il reste valable ${VALIDITE_CODE_HEURES} heures.`
          }
          confirmer={
            phase === 'depot'
              ? 'Confirmer la réception'
              : 'Confirmer la récupération'
          }
          lienAvis={null}
          libelleDuChamp={
            phase === 'depot'
              ? 'Code de dépôt à six chiffres'
              : 'Code de récupération à six chiffres'
          }
          reserve={
            phase === 'depot'
              ? {
                  libelle: 'Une remarque sur l’état du vélo ? (facultatif)',
                  aide: `Par exemple une rayure ou un pneu dégonflé qui n’apparaît pas sur les photos. Votre remarque s’affiche sur la garde, pour ${prenom} comme pour vous.`,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
