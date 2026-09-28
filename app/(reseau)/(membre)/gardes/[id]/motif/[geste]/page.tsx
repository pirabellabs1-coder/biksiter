import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import {
  ChoixDuMotif,
  type MotifPropose,
} from '@/components/maquette/garde/choix-du-motif';
import { creneau } from '@/components/maquette/garde/dates';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { SEUIL_DESISTEMENT_TARDIF_HEURES } from '@/lib/regles/annulation';
import {
  demandeUnMotif,
  estUnDesistementTardif,
  motifsProposes,
  transitionPermise,
  type Geste,
} from '@/lib/regles/garde';
import { exigerUnMembre } from '@/lib/session';
import { dePrenom } from '@/lib/texte/elision';

import { gesteAvecMotif } from '../../actions';

export const metadata: Metadata = { title: 'Motif' };

const GESTES = [
  'refuser',
  'annuler',
  'absence',
  'personne_n_ouvre',
  'signaler',
];

/**
 * Ce que chaque motif veut dire, en une ligne.
 *
 * Les motifs eux-mêmes sont une liste fermée, tenue dans `lib/regles/garde.ts` :
 * ici on n'ajoute que la phrase qui aide à choisir.
 */
const DETAIL_DU_MOTIF: Readonly<Record<string, string>> = {
  'Changement de programme': 'Je n’ai plus besoin de la garde',
  "J'ai trouvé une autre solution": 'Un autre Bike Sitter m’arrange mieux',
  'Erreur dans ma demande': 'Je me suis trompé de créneau ou de lieu',
  'Absence imprévue': 'Je ne serai pas chez moi sur le créneau',
  "L'emplacement n'est plus accessible":
    'Le lieu ne peut pas accueillir le vélo',
  'Problème de santé': 'Je ne peux pas assurer la garde',
  'Erreur de ma part': 'J’ai accepté par erreur',
  "Personne ne s'est présenté": 'J’ai attendu, le vélo n’est pas arrivé',
  'Prévenu trop tard': 'La nouvelle est arrivée après l’heure',
  'Rendez-vous manqué': 'Nous ne nous sommes pas trouvés',
  "Le vélo n'a pas été restitué": 'Le vélo n’est pas revenu à l’heure convenue',
  "L'autre personne est injoignable": 'Ni message ni appel depuis un moment',
  'Le vélo est endommagé': 'L’état a changé pendant la garde',
  "Le lieu ne correspond pas à l'annonce": 'Ce que j’ai vu diffère de la fiche',
  "Le vélo n'a pas été récupéré": 'Le cycliste n’est pas revenu à l’heure convenue',
  'Le vélo déposé pose problème': 'État, batterie ou taille différents de la demande',
  'Comportement inapproprié': 'Des propos ou une attitude déplacés',
  'Plus de place ce jour-là': 'Mon emplacement est déjà occupé',
  'Créneau qui ne me convient pas':
    'Les horaires ne sont pas possibles pour moi',
  'Type de vélo non accepté': 'Ce vélo ne tient pas dans mon emplacement',
  'Je préfère ne pas répondre': 'Sans autre précision',
  "Personne n'a répondu à la porte":
    'Je suis sur place et je n’ai pas de réponse',
  'Injoignable par téléphone': 'Aucun retour au numéro de la garde',
  Autre: 'Je préfère l’expliquer moi-même',
};

/** Ce qui se passe ensuite, dit à la personne qui fait le geste. */
const INTRODUCTIONS: Partial<Record<Geste, (prenom: string) => string>> = {
  refuser: (prenom) =>
    `Un message part tout de suite à ${prenom}, qui peut s’adresser à un autre bike sitter. Vous pouvez refuser librement ; votre profil reste inchangé.`,
  annuler: (prenom) =>
    `Un message part tout de suite à ${prenom}, et la place se libère.`,
  absence: (prenom) =>
    `Un message part à ${prenom}, et la garde est close sans suite.`,
  personne_n_ouvre: (prenom) =>
    `Un message part à ${prenom}, et la garde est close sans suite.`,
  signaler: () =>
    'Un modérateur lit votre signalement avec l’historique de la garde, puis revient vers vous.',
};

export default async function Motif({
  params,
}: {
  params: Promise<{ id: string; geste: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id, geste: brut } = await params;
  if (!GESTES.includes(brut)) notFound();
  const geste = brut as Geste;

  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  if (
    !demandeUnMotif(geste) ||
    !transitionPermise(garde.etat, geste, garde.role)
  ) {
    redirect(`/gardes/${id}`);
  }

  const [_nonLues, _emplacements] = await Promise.all([
    nombreDeNotificationsNonLues(membre.id),
    nombreDEmplacements(membre.id),
  ]);

  const prenom = garde.autre.prenom;
  const motifs: MotifPropose[] = motifsProposes(geste, garde.role).map(
    (valeur) => ({ valeur, detail: DETAIL_DU_MOTIF[valeur] ?? '' }),
  );
  const tardif =
    geste === 'annuler' &&
    garde.etat === 'accepte' &&
    estUnDesistementTardif(garde.debut, new Date());

  // Une demande qu'on n'a pas encore acceptée se retire ; une garde se
  // décommande. Les deux passent par le même geste, pas par les mêmes mots.
  const retrait = geste === 'annuler' && garde.etat === 'demande';

  const titre = retrait
    ? 'Retirer la demande ?'
    : geste === 'absence'
      ? 'Le vélo n’a pas été déposé'
      : geste === 'signaler'
        ? 'Signaler un problème'
        : geste === 'refuser'
          ? 'Refuser la demande'
          : geste === 'personne_n_ouvre'
            ? 'Personne ne m’a ouvert'
            : 'Annuler cette garde ?';

  const kicker =
    geste === 'annuler'
      ? 'ANNULER'
      : geste === 'refuser'
        ? 'RÉPONDRE À LA DEMANDE'
        : 'ASSISTANCE';

  const confirmer = retrait
    ? 'Retirer la demande'
    : geste === 'absence'
      ? 'Confirmer l’absence'
      : geste === 'signaler'
        ? 'Envoyer le signalement'
        : geste === 'refuser'
          ? 'Refuser la demande'
          : geste === 'personne_n_ouvre'
            ? 'Clore la garde'
            : 'Confirmer l’annulation';

  return (
    <main id="contenu">
      <div className="page page-etroite">
        <header className="page-tete">
          <span className="kicker">{kicker}</span>
          <h1>{titre}</h1>
          <p>
            {garde.role === 'cycliste'
              ? `Garde chez ${prenom} ${garde.autre.initiale}.`
              : `Vélo ${dePrenom(prenom)} ${garde.autre.initiale}.`}{' '}
            · {creneau(garde.debut, garde.fin)}.{' '}
            {retrait
              ? `Un message l’annonce à ${prenom}. Vous pourrez envoyer une autre demande quand vous voulez.`
              : INTRODUCTIONS[geste]?.(prenom)}
          </p>
        </header>

        {tardif ? (
          <div className="urgence">
            <b>Cette annulation arrive tard.</b>
            <p>
              {prenom} a gardé sa place pour vous : prévenir moins de{' '}
              {SEUIL_DESISTEMENT_TARDIF_HEURES} heures avant le dépôt compte
              comme un désistement tardif. Un mot d’explication est toujours
              apprécié.
            </p>
          </div>
        ) : null}

        <ChoixDuMotif
          action={gesteAvecMotif.bind(null, id, geste)}
          motifs={motifs}
          question={geste === 'refuser' ? 'Motif (facultatif)' : 'Pourquoi ?'}
          libellePrecision={`Un mot pour ${prenom} ?`}
          exemple="Facultatif, mais toujours apprécié."
          confirmer={confirmer}
          danger
          retour={geste === 'refuser' ? `/demande/${id}` : `/gardes/${id}`}
          libelleRetour={
            geste === 'refuser'
              ? 'Revenir à la demande'
              : retrait
                ? 'Garder ma demande'
                : geste === 'annuler'
                  ? 'Ne pas annuler'
                  : 'Revenir à la garde'
          }
          motifFacultatif={geste === 'refuser'}
        >
          {geste === 'annuler' ? (
            <section className="bloc">
              <h2>Ce que ça change</h2>
              <ul className="liste-nette">
                <li>
                  <b>
                    Plus de {SEUIL_DESISTEMENT_TARDIF_HEURES} heures avant le
                    dépôt
                  </b>
                  , vous pouvez annuler librement.
                </li>
                <li>
                  <b>Moins de {SEUIL_DESISTEMENT_TARDIF_HEURES} heures avant</b>
                  , l’annulation est notée sur la garde comme un désistement
                  tardif.
                </li>
                <li>
                  <b>Votre profil reste inchangé</b> dans les deux cas.
                </li>
              </ul>
            </section>
          ) : null}
        </ChoixDuMotif>
      </div>
    </main>
  );
}
