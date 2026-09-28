import Link from 'next/link';

import type { GardeDeLaListe } from '@/lib/depot/accueil';
import { EXPIRATION_D_UNE_DEMANDE_HEURES } from '@/lib/regles/garde';
import { maillonsPourUneGarde } from '@/lib/regles/maillons';
import { TYPES_VELO, type TypeVelo } from '@/lib/regles/velos';

import { creneau, duree, heure, jourDuMois, moisAbrege } from './dates';
import { PASTILLE_DE_L_ETAT } from './etats';

/** Les états où la garde est en main : les points sont encore à venir. */
const EN_MAIN = ['demande', 'accepte', 'arrivee', 'en_cours', 'reprise_demandee'];

function estUnTypeDeVelo(type: string): type is TypeVelo {
  return (TYPES_VELO as readonly string[]).includes(type);
}

function pointsDeLaGarde(garde: GardeDeLaListe): number {
  if (!estUnTypeDeVelo(garde.typeVelo)) return 0;
  return maillonsPourUneGarde({
    debut: garde.debut,
    fin: garde.fin,
    typeVelo: garde.typeVelo,
  });
}

/** Le délai s'arrête à l'heure du dépôt : répondre après ne servirait plus. */
function limiteDeReponse(garde: GardeDeLaListe): Date {
  return new Date(
    Math.min(
      garde.demandeLe.getTime() + EXPIRATION_D_UNE_DEMANDE_HEURES * 3_600_000,
      garde.debut.getTime(),
    ),
  );
}

/**
 * Ce que la carte explique sous les horaires.
 *
 * Une phrase par état, qui dit ce qui se passe maintenant et ce qui vient
 * après : c'est ce qui évite d'avoir à ouvrir la garde pour comprendre.
 */
function notice(garde: GardeDeLaListe, prenom: string): string {
  switch (garde.etat) {
    case 'demande': {
      const limite = limiteDeReponse(garde);
      return `${prenom} a jusqu’au ${jourDuMois(limite)} ${moisAbrege(limite)} à ${heure(limite)} pour répondre. Rien n’est confirmé avant, et vous pouvez retirer la demande.`;
    }
    case 'accepte':
      return `${prenom} vous attend à l’heure du dépôt. Sur place, vous photographiez le vélo puis vous lui dictez votre code.`;
    case 'arrivee':
      return `${prenom} sait que vous êtes devant la porte. Les photos du vélo ouvrent la garde.`;
    case 'en_cours':
      return `Le vélo est chez ${prenom}. Vous pouvez demander une prolongation tant que la garde n’est pas finie.`;
    case 'reprise_demandee':
      return `${prenom} vous remet le vélo et lit son code : en le saisissant, vous clôturez la garde.`;
    case 'litige':
      return 'Un modérateur examine le signalement. La garde est gelée le temps de la décision : vous recevez une notification dès qu’elle est prise.';
    case 'termine':
      return garde.avisDonne
        ? 'La garde est terminée. Merci pour votre avis.'
        : 'La garde est terminée. Vous pouvez laisser un avis pendant quatorze jours.';
    case 'refuse':
      return 'La demande n’a pas pu être acceptée. Vous pouvez chercher un autre bike sitter sur ce créneau.';
    case 'annule':
      return 'La garde a été annulée. Vous pouvez envoyer une nouvelle demande quand vous voulez.';
    case 'expire':
      return 'La demande a expiré sans réponse. Vous pouvez en envoyer une autre quand vous voulez.';
  }
}

/**
 * Ce que la carte propose, selon l'état : l'étape suivante en premier, et
 * toujours sur l'écran de la garde, qui mène le dépôt et la reprise (photos,
 * puis code) dans le bon ordre.
 */
function Actions({ garde }: { garde: GardeDeLaListe }) {
  const ecrire = (
    <Link className="outline" href={`/messages/${garde.id}`}>
      Écrire
    </Link>
  );
  switch (garde.etat) {
    case 'accepte':
    case 'arrivee':
      return (
        <div className="guard-actions">
          <Link className="primary" href={`/gardes/${garde.id}/depot`}>
            {garde.etat === 'accepte' ? 'Préparer le dépôt' : 'Continuer le dépôt'}
          </Link>
          {ecrire}
        </div>
      );
    case 'en_cours':
    case 'reprise_demandee':
      return (
        <div className="guard-actions">
          <Link className="primary" href={`/gardes/${garde.id}`}>
            Récupérer mon vélo
          </Link>
          {ecrire}
          {garde.etat === 'en_cours' ? (
            <Link className="outline" href={`/gardes/${garde.id}/prolonger`}>
              Prolonger
            </Link>
          ) : null}
        </div>
      );
    case 'demande':
      return (
        <div className="guard-actions">
          {ecrire}
          <Link className="outline" href={`/gardes/${garde.id}/motif/annuler`}>
            Retirer la demande
          </Link>
        </div>
      );
    case 'litige':
      return (
        <div className="guard-actions">
          {ecrire}
          <Link className="outline" href={`/gardes/${garde.id}`}>
            Voir le détail
          </Link>
        </div>
      );
    case 'termine':
      return (
        <div className="guard-actions">
          {garde.avisDonne ? (
            <Link className="outline" href={`/gardes/${garde.id}`}>
              Voir le détail
            </Link>
          ) : (
            <Link className="outline" href={`/gardes/${garde.id}/avis`}>
              Laisser un avis
            </Link>
          )}
          <Link className="outline" href={`/gardes/${garde.id}/solutions`}>
            Signaler un problème
          </Link>
        </div>
      );
    case 'refuse':
      return (
        <div className="guard-actions">
          <Link className="outline" href={`/gardes/${garde.id}`}>
            Voir le détail
          </Link>
          <Link className="outline" href="/recherche">
            Chercher un autre créneau
          </Link>
        </div>
      );
    default:
      return (
        <div className="guard-actions">
          <Link className="outline" href={`/gardes/${garde.id}`}>
            Voir le détail
          </Link>
        </div>
      );
  }
}

export function CarteDeGarde({ garde }: { garde: GardeDeLaListe }) {
  const pastille = PASTILLE_DE_L_ETAT[garde.etat];
  const prenom = garde.autrePrenom;
  const nom = `${prenom} ${garde.autreInitiale}.`;
  const points = EN_MAIN.includes(garde.etat) ? pointsDeLaGarde(garde) : 0;

  return (
    <article className={pastille.carte}>
      <div className={pastille.date}>
        <b>{jourDuMois(garde.debut)}</b>
        <span>{moisAbrege(garde.debut)}</span>
      </div>
      <div>
        <span className={pastille.pastille}>{pastille.texte}</span>
        <h3>{garde.etat === 'demande' ? `Demande à ${nom}` : `Garde chez ${nom}`}</h3>
        <p>
          {creneau(garde.debut, garde.fin)} · {duree(garde.debut, garde.fin)} ·{' '}
          {garde.veloNom ?? garde.typeVelo} · {garde.quartier}
        </p>
        <p className="paye">
          <span className="paye-etat gratuite">Garde gratuite</span>
          {points > 0 ? (
            <span className="paye-points">
              {prenom} recevra {points} points une fois la garde terminée.
            </span>
          ) : null}
        </p>
        <p className="notice">{notice(garde, prenom)}</p>
      </div>
      <Actions garde={garde} />
    </article>
  );
}
