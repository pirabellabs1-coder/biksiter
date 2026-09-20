import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { dateDeGarde, PastilleDEtat } from '@/components/app/garde';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { nomPublic } from '@/components/membre/elements';
import {
  CLE_DU_GESTE,
  ETAPES_DE_LA_FRISE,
  libelleDEtat,
  referenceDeGarde,
} from '@/components/membre/garde';
import { enPoints } from '@/components/app/progression';
import { amenagementsDeLaGarde } from '@/lib/depot/amenagements';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { pointsDeLaGarde } from '@/lib/depot/progression';
import { textes } from '@/lib/i18n/langue';
import {
  ETATS_PROLONGEABLES,
  heureAnnoncee,
  prolongationPossible,
  retardAnnoncable,
} from '@/lib/regles/amenagements';
import {
  AUTEUR_DU_CONSTAT,
  constatPossible,
  ETATS_DU_VELO,
  JOURS_D_ACCES_AUX_PHOTOS,
  titreDeLaPhoto,
} from '@/lib/regles/constat';
import { jourAffiche } from '@/lib/regles/creneau';
import {
  ATTENTE_AVANT_D_APPELER_MINUTES,
  ATTENTE_AVANT_DE_REPARTIR_MINUTES,
  demandeUnMotif,
  DETENTEUR_DU_CODE,
  estEnRetardAuDepot,
  EXPIRATION_D_UNE_DEMANDE_HEURES,
  gestesPossibles,
  minutesEcoulees,
  phaseDuGeste,
  REFUS_D_UN_GESTE,
  type Phase,
  type RefusDUnGeste,
} from '@/lib/regles/garde';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { creerUneAlerte } from '@/app/(reseau)/(membre)/recherche/actions';

import { gesteDirect } from './actions';
import { repondreALaDemandeDeProlongation } from './amenagements';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Garde') };
}

function horodatage(instant: Date): string {
  const jour = jourABruxelles(instant);
  return jour === jourABruxelles()
    ? heureABruxelles(instant)
    : `${jourAffiche(jour)} ${heureABruxelles(instant)}`;
}

const CLASSE_DU_STYLE = {
  primary: 'bouton plein',
  danger: 'bouton danger-contour',
  ghost: 'bouton contour',
} as const;

export default async function DetailDUneGarde({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { t, p } = await textes();
  const { id } = await params;
  const indications = await searchParams;
  const [garde, nonLues] = await Promise.all([
    detailDeLaGarde(membre.id, id),
    nombreDeNotificationsNonLues(membre.id),
  ]);
  if (!garde) notFound();
  const [points, { retards, prolongation }] = await Promise.all([
    garde.role === 'bike_sitter' && (garde.etat === 'termine' || garde.etat === 'litige')
      ? pointsDeLaGarde(garde.id, membre.id)
      : null,
    amenagementsDeLaGarde(garde.id),
  ]);

  const maintenant = new Date();
  // Une demande expirée propose de chercher ailleurs, sur le même créneau s'il est encore devant nous.
  const creneauAVenir = garde.debut.getTime() > maintenant.getTime();
  const rechercheSimilaire = creneauAVenir
    ? `/recherche?${new URLSearchParams({
        lieu: garde.emplacement.quartier,
        jour: jourABruxelles(garde.debut),
        de: heureABruxelles(garde.debut),
        jourFin: jourABruxelles(garde.fin),
        a: heureABruxelles(garde.fin),
      }).toString()}`
    : `/recherche?${new URLSearchParams({ lieu: garde.emplacement.quartier }).toString()}`;
  const phaseDuRetard = retardAnnoncable(garde.etat, garde, maintenant);
  const retardPossible =
    phaseDuRetard !== null &&
    !retards.some((r) => r.acteur === garde.role && r.phase === phaseDuRetard);
  // Un retard annoncé ne compte que pour le rendez-vous qui vient.
  const retardsEnCours = retards.filter((r) =>
    r.phase === 'depot'
      ? garde.etat === 'accepte'
      : ['en_cours', 'reprise_demandee'].includes(garde.etat),
  );
  const prolongationEnAttente =
    prolongation?.etat === 'demandee' && ETATS_PROLONGEABLES.includes(garde.etat)
      ? prolongation
      : null;
  const moi = garde.role;
  const messagesDeProlongation: Record<string, { texte: string; erreur: boolean }> = {
    demandee: {
      texte: p('Demande de prolongation envoyée à {prenom}.', { prenom: garde.autre.prenom }),
      erreur: false,
    },
    accepter: { texte: p('Prolongation acceptée : la nouvelle fin est enregistrée.'), erreur: false },
    refuser: {
      texte: p('Prolongation refusée : nous prévenons {prenom}.', { prenom: garde.autre.prenom }),
      erreur: false,
    },
    annuler: { texte: p('Demande de prolongation annulée.'), erreur: false },
    occupe: {
      texte: p('Une autre garde occupe déjà la place sur ce créneau : la prolongation ne tient pas. Vous pouvez la refuser et en parler avec le cycliste.'),
      erreur: true,
    },
    plus_possible: { texte: p('Cette garde ne peut plus être prolongée.'), erreur: true },
    deja_repondu: { texte: p('Cette demande de prolongation n’attend plus de réponse.'), erreur: true },
    interdit: { texte: p('Cette réponse ne vous revient pas.'), erreur: true },
  };
  const messageDeProlongation = indications.prolongation
    ? (messagesDeProlongation[indications.prolongation] ?? null)
    : null;
  const autre = garde.autre;
  const gestes = gestesPossibles(garde.etat, moi);
  const etapesFaites = new Set(garde.evenements.map((e) => e.etape));

  const attente =
    garde.etat === 'arrivee' && garde.arriveLe
      ? minutesEcoulees(garde.arriveLe, maintenant)
      : 0;
  const retard = estEnRetardAuDepot(garde.etat, garde.debut, maintenant)
    ? minutesEcoulees(garde.debut, maintenant)
    : 0;
  const repriseDepassee =
    garde.etat === 'en_cours' && maintenant.getTime() > garde.fin.getTime();

  // Celui qui détient le code l'affiche ; l'autre le saisit en recevant le vélo.
  const phaseDuCode: Phase | null =
    garde.etat === 'arrivee'
      ? 'depot'
      : garde.etat === 'reprise_demandee'
        ? 'reprise'
        : null;
  const jeDetiensLeCode =
    phaseDuCode !== null && DETENTEUR_DU_CODE[phaseDuCode] === moi;

  // Le code attend les photos : tant qu'elles manquent, le cycliste les prend d'abord.
  const photosAPrendre =
    phaseDuCode !== null &&
    AUTEUR_DU_CONSTAT[phaseDuCode] === moi &&
    !garde.constats[phaseDuCode];

  const constats: [Phase, string][] = [
    ['depot', p('Constat au dépôt')],
    ['reprise', p('Constat au retour')],
  ];

  const minutesRestantes = Math.max(
    0,
    Math.round(
      EXPIRATION_D_UNE_DEMANDE_HEURES * 60 - minutesEcoulees(garde.demandeLe, maintenant),
    ),
  );
  const heures = Math.round((garde.fin.getTime() - garde.debut.getTime()) / 3_600_000);

  // L'en-tête dit d'abord où en est la garde, comme dans les maquettes.
  const entete: { icone: NomDIcone; titre: string; texte: string; ton: string } =
    garde.etat === 'demande'
      ? moi === 'bike_sitter'
        ? {
            icone: 'horloge',
            titre: p('Nouvelle demande'),
            texte: p('Répondez dans {h} h {m} min', {
              h: Math.floor(minutesRestantes / 60),
              m: String(minutesRestantes % 60).padStart(2, '0'),
            }),
            ton: 'ambre',
          }
        : {
            icone: 'envoyer',
            titre: p('Demande envoyée'),
            texte: p('{prenom} vous répondra dans les {n} heures.', {
              prenom: autre.prenom,
              n: EXPIRATION_D_UNE_DEMANDE_HEURES,
            }),
            ton: '',
          }
      : garde.etat === 'accepte'
        ? {
            icone: 'coche',
            titre: p('Demande acceptée'),
            texte:
              moi === 'cycliste'
                ? p('Votre garde est confirmée !')
                : p('Nous prévenons {prenom}. La garde est ajoutée à vos gardes.', {
                    prenom: autre.prenom,
                  }),
            ton: '',
          }
        : garde.etat === 'arrivee'
          ? {
              icone: 'epingle',
              titre: p('Arrivée signalée'),
              texte: p('Le moment de la remise : les photos du vélo, puis le code.'),
              ton: '',
            }
          : garde.etat === 'en_cours' || garde.etat === 'reprise_demandee'
            ? {
                icone: 'verifie',
                titre: p('Garde en cours'),
                texte:
                  moi === 'cycliste'
                    ? p('Votre vélo est gardé. Tout se passe bien !')
                    : p('Le vélo de {prenom} est chez vous.', { prenom: autre.prenom }),
                ton: 'ambre',
              }
            : garde.etat === 'termine'
              ? {
                  icone: 'coche',
                  titre: p('Garde terminée'),
                  texte:
                    moi === 'bike_sitter'
                      ? p('Vous avez aidé {prenom} à protéger son vélo.', { prenom: autre.prenom })
                      : p('Le vélo est rendu. Merci pour cette garde !'),
                  ton: '',
                }
              : garde.etat === 'expire'
                ? {
                    icone: 'horloge',
                    titre: p('Demande expirée'),
                    texte:
                      moi === 'cycliste'
                        ? p('{prenom} n’a pas pu répondre à temps. Votre vélo n’est engagé nulle part.', {
                            prenom: autre.prenom,
                          })
                        : p('Cette demande n’a pas reçu de réponse à temps.'),
                    ton: 'rouge',
                  }
              : garde.etat === 'litige'
                ? {
                    icone: 'alerte',
                    titre: p('La garde est gelée'),
                    texte: p(
                      'Un modérateur reprend le dossier avec l’historique complet, puis reprend contact avec vous.',
                    ),
                    ton: 'rouge',
                  }
                : {
                    icone: 'croix',
                    titre: libelleDEtat(t, garde.etat),
                    texte: garde.motif
                      ? p('Motif : {motif}', { motif: garde.motif })
                      : p('Cette garde n’aura pas lieu.'),
                    ton: 'rouge',
                  };

  const checklist: string[] =
    garde.etat === 'accepte'
      ? moi === 'cycliste'
        ? [
            p('Arriver à l’heure'),
            p('Avoir votre vélo et son antivol'),
            p('Photographier votre vélo devant la porte'),
          ]
        : [
            p('Libérer l’emplacement'),
            p('Être présent dès {heure}', { heure: heureABruxelles(garde.debut) }),
            p('Vérifier les photos du vélo avant de saisir le code'),
          ]
      : [];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/gardes" notificationsNonLues={nonLues} />
      <div className="ecran-app ecran-large fiche-detail">
        <div className={`entete-de-garde ${entete.ton}`}>
          <span className="rond-etat" aria-hidden="true">
            <Icone nom={entete.icone} taille={30} strokeWidth={2.4} />
          </span>
          <div>
            <h1 className="titre-ecran">{entete.titre}</h1>
            <p className="texte-doux">{entete.texte}</p>
          </div>
        </div>
        <p className="reference-de-garde">
          {referenceDeGarde(garde.id)} · <PastilleDEtat t={t} etat={garde.etat} />
        </p>

        <div className="pile">
          {indications.retard === 'annonce' ? (
            <div className="encart" role="status">
              <Icone nom="coche" taille={22} />
              <span>{p('Votre retard est signalé à {prenom}.', { prenom: autre.prenom })}</span>
            </div>
          ) : null}
          {indications.prolongation && messageDeProlongation ? (
            <div
              className={messageDeProlongation.erreur ? 'encart rouge' : 'encart'}
              role={messageDeProlongation.erreur ? 'alert' : 'status'}
            >
              <Icone nom={messageDeProlongation.erreur ? 'alerte' : 'coche'} taille={22} />
              <span>{messageDeProlongation.texte}</span>
            </div>
          ) : null}
          {retardsEnCours.map((r) =>
            r.acteur === moi ? (
              <div key={`${r.acteur}-${r.phase}`} className="encart">
                <Icone nom="horloge" taille={22} />
                <span>
                  {p('Vous avez prévenu {prenom} d’un retard d’environ {n} minutes.', {
                    prenom: autre.prenom,
                    n: r.minutes,
                  })}
                </span>
              </div>
            ) : (
              <div key={`${r.acteur}-${r.phase}`} className="encart ambre">
                <Icone nom="horloge" taille={22} />
                <span>
                  <strong>
                    {p('{prenom} annonce un retard d’environ {n} minutes', {
                      prenom: autre.prenom,
                      n: r.minutes,
                    })}
                  </strong>
                  {p('Arrivée prévue vers {heure}.', {
                    heure: heureABruxelles(
                      heureAnnoncee(r.phase === 'depot' ? garde.debut : garde.fin, r.minutes),
                    ),
                  })}
                </span>
              </div>
            ),
          )}
          {prolongationEnAttente && moi === 'bike_sitter' ? (
            <div className="carte pile" style={{ gap: 10 }}>
              <strong style={{ fontSize: 17 }}>
                {p('{prenom} souhaite prolonger la garde', { prenom: autre.prenom })}
              </strong>
              <dl className="liste" style={{ margin: 0 }}>
                <div className="ligne ligne-info" style={{ justifyContent: 'space-between' }}>
                  <dt>{p('Fin actuelle')}</dt>
                  <dd style={{ margin: 0, fontWeight: 700 }}>
                    {horodatage(prolongationEnAttente.ancienneFin)}
                  </dd>
                </div>
                <div className="ligne ligne-info" style={{ justifyContent: 'space-between' }}>
                  <dt className="texte-vert">{p('Nouvelle fin demandée')}</dt>
                  <dd className="texte-vert" style={{ margin: 0, fontWeight: 800 }}>
                    {horodatage(prolongationEnAttente.nouvelleFin)}
                  </dd>
                </div>
              </dl>
              {prolongationEnAttente.motif ? (
                <p className="texte-doux" style={{ margin: 0 }}>
                  « {prolongationEnAttente.motif} »
                </p>
              ) : null}
              {prolongationEnAttente.pointsEnPlus > 0 ? (
                <div className="encart">
                  <Icone nom="etoile" taille={20} plein />
                  <span>
                    {p('Cette prolongation ajoute {points} à la garde, une fois menée à terme.', {
                      points: enPoints(p, prolongationEnAttente.pointsEnPlus),
                    })}
                  </span>
                </div>
              ) : null}
              <div className="deux-colonnes">
                <form action={repondreALaDemandeDeProlongation}>
                  <input type="hidden" name="id" value={garde.id} />
                  <input type="hidden" name="reponse" value="refuser" />
                  <button type="submit" className="bouton contour" style={{ width: '100%' }}>
                    {p('Refuser')}
                  </button>
                </form>
                <form action={repondreALaDemandeDeProlongation}>
                  <input type="hidden" name="id" value={garde.id} />
                  <input type="hidden" name="reponse" value="accepter" />
                  <button type="submit" className="bouton plein" style={{ width: '100%' }}>
                    {p('Accepter')}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
          {prolongationEnAttente && moi === 'cycliste' ? (
            <div className="encart ambre">
              <Icone nom="horloge" taille={22} />
              <span>
                <strong>
                  {p('Prolongation demandée jusqu’à {heure}', {
                    heure: horodatage(prolongationEnAttente.nouvelleFin),
                  })}
                </strong>
                {p('En attente de la réponse de {prenom}. Jusque-là, la garde se termine à l’heure prévue.', {
                  prenom: autre.prenom,
                })}
                <form action={repondreALaDemandeDeProlongation} style={{ marginTop: 6 }}>
                  <input type="hidden" name="id" value={garde.id} />
                  <input type="hidden" name="reponse" value="annuler" />
                  <button
                    type="submit"
                    className="lien-souligne"
                    style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }}
                  >
                    {p('Annuler la demande')}
                  </button>
                </form>
              </span>
            </div>
          ) : null}
          {points && points.etat !== 'annule' ? (
            <Link
              href="/progression/historique"
              className={`encart solde-encart lien-encart${points.etat === 'en_attente' ? ' ambre' : ''}`}
              style={{ marginTop: 0 }}
            >
              <Icone nom={points.etat === 'en_attente' ? 'horloge' : 'etoile'} taille={26} plein={points.etat !== 'en_attente'} />
              <span>
                <strong>{p('+{n} points', { n: points.nombre })}</strong>
                {points.etat === 'en_attente'
                  ? p('En attente, le temps que l’équipe examine le signalement.')
                  : p('Gagnés grâce à cette garde.')}
              </span>
              <Icone nom="chevron" taille={20} />
            </Link>
          ) : null}
          {indications.demande === 'envoyee' ? (
            <div className="encart" role="status">
              <Icone nom="coche" taille={22} />
              <span>{p('Demande envoyée à {prenom}.', { prenom: autre.prenom })}</span>
            </div>
          ) : null}
          {indications.demande === 'modifiee' ? (
            <div className="encart" role="status">
              <Icone nom="coche" taille={22} />
              <span>{p('Demande modifiée : nous prévenons {prenom}.', { prenom: autre.prenom })}</span>
            </div>
          ) : null}
          {indications.erreur ? (
            <div className="encart rouge" role="alert">
              <Icone nom="alerte" taille={22} />
              <span>
                {Object.hasOwn(REFUS_D_UN_GESTE, indications.erreur)
                  ? p(REFUS_D_UN_GESTE[indications.erreur as RefusDUnGeste])
                  : p("Cette action n'a pas pu aboutir : la garde a peut-être changé entre-temps.")}
              </span>
            </div>
          ) : null}
          {indications.remise === 'depot' && garde.etat === 'en_cours' ? (
            <div className="encart" role="status">
              <Icone nom="coche" taille={22} />
              <span>{p('Vélo reçu : la garde commence.')}</span>
            </div>
          ) : null}
          {indications.remise === 'reprise' && garde.etat === 'termine' ? (
            <div className="encart" role="status">
              <Icone nom="coche" taille={22} />
              <span>{p('Vélo rendu : la garde est terminée.')}</span>
            </div>
          ) : null}
          {indications.batterie === 'refusee' && garde.etat === 'annule' ? (
            <div className="encart rouge" role="status">
              <Icone nom="batterie" taille={22} />
              <span>
                {p('Vélo refusé. Nous prévenons {prenom} que la batterie doit être vérifiée.', {
                  prenom: autre.prenom,
                })}
              </span>
            </div>
          ) : null}
          {indications.avis === 'depose' ? (
            <div className="encart" role="status">
              <Icone nom="etoile" taille={22} />
              <span>
                {garde.avis.deposeParLAutre
                  ? p('Les deux avis sont déposés : ils sont publiés.')
                  : p("Avis enregistré. Invisible tant que {prenom} n'a pas déposé le sien.", {
                      prenom: autre.prenom,
                    })}
              </span>
            </div>
          ) : null}

          {attente >= ATTENTE_AVANT_D_APPELER_MINUTES && moi === 'cycliste' ? (
            <div className="encart ambre">
              <Icone nom="horloge" taille={22} />
              <span>
                <strong>{p('Vous attendez depuis {n} minutes', { n: attente })}</strong>
                {attente < ATTENTE_AVANT_DE_REPARTIR_MINUTES
                  ? p('Personne n’ouvre ? Appelez {prenom} : la personne descend peut-être.', {
                      prenom: autre.prenom,
                    })
                  : p('Si personne ne vient, vous pouvez clore cette garde et repartir.')}
              </span>
            </div>
          ) : null}

          {retard > 0 ? (
            <div className="encart ambre">
              <Icone nom="horloge" taille={22} />
              <span>
                <strong>{p('Arrivée dépassée de {n} min', { n: retard })}</strong>
                {moi === 'cycliste'
                  ? garde.retardAnnonceLe
                    ? p('Votre bike sitter est prévenu.')
                    : p('Prévenez votre bike sitter, même si vous arrivez dans une heure.')
                  : garde.retardAnnonceLe
                    ? p('{prenom} vous a prévenu de son retard.', { prenom: autre.prenom })
                    : p("Sans nouvelles, vous pouvez signaler que personne n'est venu.")}
              </span>
            </div>
          ) : null}

          {repriseDepassee ? (
            <div className="encart ambre">
              <Icone nom="horloge" taille={22} />
              <span>
                <strong>{p("L'heure de récupération est dépassée.")}</strong>
                {moi === 'bike_sitter'
                  ? p('Contactez le propriétaire du vélo, et gardez-le chez vous sans le sortir.')
                  : p('Prévenez votre bike sitter, même si vous ne pouvez pas venir tout de suite.')}
              </span>
            </div>
          ) : null}
        </div>

        <div className="carte personne-de-garde">
          <Link
            href={`/membres/${autre.id}`}
            className="avatar-app"
            aria-label={p('Voir le profil de {prenom}', { prenom: autre.prenom })}
          >
            {autre.prenom.charAt(0)}
          </Link>
          <div className="ligne-texte">
            <strong>{nomPublic(autre.prenom, autre.initiale)}</strong>
            <span>
              {moi === 'cycliste' ? p('Votre Bike Sitter') : p('Cycliste')} ·{' '}
              {autre.gardes > 1
                ? p('{n} gardes', { n: autre.gardes })
                : p('{n} garde', { n: autre.gardes })}
            </span>
          </div>
          {autre.telephone ? (
            <a
              className="bouton-rond"
              href={`tel:${autre.telephone.replace(/\s/g, '')}`}
              aria-label={p('Appeler {prenom}', { prenom: autre.prenom })}
            >
              <Icone nom="telephone" taille={22} />
            </a>
          ) : null}
          <Link
            href={`/messages/${garde.id}`}
            className="bouton-rond"
            aria-label={p('Écrire à {prenom}', { prenom: autre.prenom })}
          >
            <Icone nom="messages" taille={22} />
          </Link>
        </div>

        <ul className="liste recapitulatif details-de-garde">
          <li className="ligne">
            <span className="ligne-icone">
              <Icone nom="calendrier" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{dateDeGarde(p, garde.debut, garde.fin)}</strong>
              <span>
                {heures >= 24
                  ? p('{n} jours', { n: Math.ceil(heures / 24) })
                  : p('{n} h', { n: heures })}
              </span>
            </span>
          </li>
          <li className="ligne">
            <span className="ligne-icone">
              <Icone nom="velo" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{garde.velo?.nom ?? p(garde.typeVelo)}</strong>
              <span>
                {[p(garde.velo?.type ?? garde.typeVelo), garde.velo?.couleur]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </span>
          </li>
          <li className="ligne">
            <span className="ligne-icone">
              <Icone nom="epingle" taille={22} />
            </span>
            <span className="ligne-texte">
              {garde.emplacement.adresse ? (
                <>
                  <span>
                    {moi === 'cycliste' ? p('Adresse du dépôt') : p('Votre espace')}
                  </span>
                  <strong>{garde.emplacement.adresse}</strong>
                  {garde.emplacement.precisions ? (
                    <span>{garde.emplacement.precisions}</span>
                  ) : null}
                </>
              ) : (
                <>
                  <strong>
                    {p(garde.emplacement.type)} · {garde.emplacement.quartier}
                  </strong>
                  <span>
                    {garde.etat === 'demande'
                      ? p('Adresse exacte communiquée après acceptation.')
                      : garde.etat === 'termine' || garde.etat === 'litige'
                        ? p('L’adresse n’est plus affichée une fois la garde terminée.')
                        : p('L’adresse n’a pas été communiquée.')}
                  </span>
                </>
              )}
            </span>
          </li>
          {autre.telephone ? (
            <li className="ligne">
              <span className="ligne-icone">
                <Icone nom="telephone" taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>
                  <a href={`tel:${autre.telephone.replace(/\s/g, '')}`}>{autre.telephone}</a>
                </strong>
                <span>{p('Pour cette garde seulement')}</span>
              </span>
            </li>
          ) : null}
          {moi === 'bike_sitter' && garde.message ? (
            <li className="ligne">
              <span className="ligne-icone">
                <Icone nom="document" taille={22} />
              </span>
              <span className="ligne-texte">
                <span>{p('Note de {prenom}', { prenom: autre.prenom })}</span>
                <strong className="texte-normal">{garde.message}</strong>
              </span>
            </li>
          ) : null}
        </ul>

        {moi === 'cycliste' && garde.etat === 'expire' ? (
          <>
            <h2 className="titre-section">{p('Et maintenant ?')}</h2>
            <div className="liste">
              <Link href={rechercheSimilaire} className="ligne">
                <span className="ligne-icone" aria-hidden="true">
                  <Icone nom="recherche" taille={24} />
                </span>
                <span className="ligne-texte">
                  <strong>{p('Voir des Bike Sitters disponibles')}</strong>
                  <span>{p('Les lieux libres dans le même quartier, sur le même créneau.')}</span>
                </span>
                <Icone nom="chevron" taille={20} className="texte-leger" />
              </Link>
              {creneauAVenir ? (
                <form action={creerUneAlerte}>
                  <input type="hidden" name="lieu" value={garde.emplacement.quartier} />
                  <input type="hidden" name="jour" value={jourABruxelles(garde.debut)} />
                  <input type="hidden" name="de" value={heureABruxelles(garde.debut)} />
                  <input type="hidden" name="a" value={heureABruxelles(garde.fin)} />
                  <input type="hidden" name="retour" value={rechercheSimilaire} />
                  <button type="submit" className="ligne" style={{ width: '100%' }}>
                    <span className="ligne-icone" aria-hidden="true">
                      <Icone nom="cloche" taille={24} />
                    </span>
                    <span className="ligne-texte">
                      <strong>{p('Rejoindre la liste d’attente')}</strong>
                      <span>{p('Soyez prévenu dès qu’une place se libère près d’ici.')}</span>
                    </span>
                    <Icone nom="chevron" taille={20} className="texte-leger" />
                  </button>
                </form>
              ) : null}
            </div>
          </>
        ) : null}

        {moi === 'bike_sitter' && garde.etat === 'demande' ? (
          <div className="encart" style={{ marginTop: 12 }}>
            <Icone nom="bouclier" taille={22} />
            <span>
              <strong>{p('L’adresse du cycliste n’est pas nécessaire.')}</strong>
              {p('La garde se déroule dans votre espace privé et sécurisé.')}
            </span>
          </div>
        ) : null}

        {checklist.length > 0 ? (
          <div className="encart checklist" style={{ marginTop: 12 }}>
            <Icone nom="document" taille={24} />
            <span>
              <strong>
                {moi === 'cycliste' ? p('À ne pas oublier') : p('Préparez la garde')}
              </strong>
              <ul>
                {checklist.map((element) => (
                  <li key={element}>
                    <Icone nom="coche" taille={16} strokeWidth={2.6} />
                    {element}
                  </li>
                ))}
              </ul>
            </span>
          </div>
        ) : null}

        {constats.map(([phase, titre]) => {
          const constat = garde.constats[phase];
          if (constat) {
            return (
              <div key={phase} className="carte constat" style={{ marginTop: 12 }}>
                <div className="personne-demande">
                  <span className="ligne-texte">
                    <span>
                      {titre} · {horodatage(new Date(constat.etabliLe))}
                    </span>
                    <strong>{p(ETATS_DU_VELO[constat.etat])}</strong>
                    {constat.note ? <span>{constat.note}</span> : null}
                    <span>
                      {garde.photosVisibles
                        ? p('{n} photos · établi par {prenom}', {
                            n: constat.rangs.length,
                            prenom: constat.etabliPar ?? '—',
                          })
                        : p('Établi par {prenom}', { prenom: constat.etabliPar ?? '—' })}
                    </span>
                    {constat.batterieVerifiee ? <span>{p('Batterie vérifiée au moment des photos')}</span> : null}
                    {constat.reserve ? (
                      <span>
                        {p('Remarque du bike sitter : {remarque}', { remarque: constat.reserve })}
                      </span>
                    ) : null}
                  </span>
                  <span className={constat.etat === 'defaut' ? 'pastille rouge' : 'pastille'}>
                    <Icone nom={constat.etat === 'defaut' ? 'alerte' : 'coche'} taille={14} />
                    {constat.etat === 'defaut' ? p('Défaut') : p('Constaté')}
                  </span>
                </div>
                {!garde.photosVisibles ? (
                  <p className="petit texte-doux" style={{ margin: '10px 0 0' }}>
                    {p('Les photos du constat étaient visibles jusqu’à {n} jours après la fin de la garde.', {
                      n: JOURS_D_ACCES_AUX_PHOTOS,
                    })}
                  </p>
                ) : null}
                {constat.rangs.length > 0 && garde.photosVisibles ? (
                  <div className="photos-de-constat">
                    {constat.rangs.map((rang) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={rang}
                        src={`/gardes/${garde.id}/constat/${phase}/photo/${rang}`}
                        alt={p(titreDeLaPhoto(rang))}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }
          // Les photos se prennent devant la porte, avant le code ; après, elles
          // ne prouveraient plus rien.
          if (!constatPossible(phase, garde)) return null;
          const cEstAMoi = AUTEUR_DU_CONSTAT[phase] === moi;
          return (
            <div key={phase} className="encart ambre" style={{ marginTop: 12 }}>
              <Icone nom="photo" taille={24} />
              <span>
                <strong>{phase === 'depot' ? p('Photos du dépôt à prendre') : p('Photos du retour à prendre')}</strong>
                {cEstAMoi
                  ? phase === 'depot'
                    ? p('Photographiez votre vélo avant de le remettre : ces photos protègent la garde.')
                    : p('Photographiez votre vélo avant de repartir : ces photos protègent la fin de la garde.')
                  : p('{prenom} photographie son vélo avant la remise du code.', { prenom: autre.prenom })}
              </span>
            </div>
          );
        })}

        <h2 className="titre-section">{p('Suivi de la garde')}</h2>
        <ol className="suivi">
          {ETAPES_DE_LA_FRISE.map(([etape, libelle]) => {
            const evenement = garde.evenements.find((e) => e.etape === etape);
            const enCours =
              garde.etat === etape || (etape === 'velo_recu' && garde.etat === 'en_cours');
            const fait = etapesFaites.has(etape);
            return (
              <li key={etape} className={enCours ? 'maintenant' : fait ? 'fait' : 'a-venir'}>
                <span className="suivi-point" aria-hidden="true">
                  {fait && !enCours ? <Icone nom="coche" taille={14} strokeWidth={3} /> : null}
                </span>
                <span className="ligne-texte">
                  <strong>{p(libelle)}</strong>
                  <span>
                    {evenement
                      ? `${horodatage(new Date(evenement.faitLe))}${
                          evenement.acteur === 'systeme' ? ` · ${p('automatique')}` : ''
                        }`
                      : etape === 'reprise_demandee' && !fait
                        ? p('Prévue à {heure}', { heure: heureABruxelles(garde.fin) })
                        : '—'}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="boutons actions-de-garde">
          {phaseDuCode && photosAPrendre ? (
            <Link href={`/gardes/${garde.id}/constat/${phaseDuCode}`} className="bouton plein">
              <Icone nom="photo" taille={20} />
              {p('Photographier mon vélo')}
            </Link>
          ) : phaseDuCode && jeDetiensLeCode ? (
            <Link href={`/gardes/${garde.id}/remise/${phaseDuCode}`} className="bouton plein">
              <Icone nom="cadenas" taille={20} />
              {phaseDuCode === 'depot'
                ? p('Afficher mon code de dépôt')
                : p('Afficher le code de restitution')}
            </Link>
          ) : null}
          {gestes.map((transition) => {
            // La restitution commence par les photos : le geste ouvre le parcours, il ne le clôt pas.
            const libelle =
              transition.geste === 'reprendre' ? p('Récupérer mon vélo') : t(CLE_DU_GESTE[transition.geste]);
            const classe = CLASSE_DU_STYLE[transition.style];
            const phase = phaseDuGeste(transition.geste);
            // Le dépôt sécurisé commence par sa préparation (planche 15).
            if (transition.geste === 'arriver') {
              return (
                <Link key={transition.geste} href={`/gardes/${garde.id}/depot`} className={classe}>
                  <Icone nom="velo" taille={20} />
                  {p('Préparer le dépôt')}
                </Link>
              );
            }
            if (phase) {
              // Tant que les photos manquent, le bouton « Photographier mon vélo » tient lieu d'étape suivante.
              if (photosAPrendre) return null;
              return (
                <Link
                  key={transition.geste}
                  href={`/gardes/${garde.id}/remise/${phase}`}
                  className={classe}
                >
                  {libelle}
                </Link>
              );
            }
            if (demandeUnMotif(transition.geste)) {
              return (
                <Link
                  key={transition.geste}
                  href={`/gardes/${garde.id}/motif/${transition.geste}`}
                  className={transition.geste === 'signaler' ? 'bouton discret texte-rouge' : classe}
                >
                  {transition.geste === 'signaler' ? <Icone nom="alerte" taille={18} /> : null}
                  {libelle}
                </Link>
              );
            }
            return (
              <form key={transition.geste} action={gesteDirect}>
                <input type="hidden" name="id" value={garde.id} />
                <input type="hidden" name="geste" value={transition.geste} />
                <button type="submit" className={classe}>
                  {libelle}
                </button>
              </form>
            );
          })}
          {moi === 'cycliste' && garde.etat === 'demande' ? (
            <Link href={`/gardes/${garde.id}/modifier`} className="bouton contour">
              <Icone nom="calendrier" taille={20} />
              {p('Modifier la demande')}
            </Link>
          ) : null}
          {moi === 'cycliste' &&
          !prolongationEnAttente &&
          prolongationPossible(garde.etat, garde.fin, maintenant) ? (
            <Link href={`/gardes/${garde.id}/prolonger`} className="bouton contour">
              <Icone nom="calendrier" taille={20} />
              {p('Prolonger la garde')}
            </Link>
          ) : null}
          {retardPossible ? (
            <Link href={`/gardes/${garde.id}/retard`} className="bouton contour">
              <Icone nom="horloge" taille={20} />
              {p('Je serai en retard')}
            </Link>
          ) : null}
          {gestes.length === 0 && garde.etat === 'termine' && !garde.avis.deposeParMoi ? (
            <Link href={`/gardes/${garde.id}/avis`} className="bouton plein">
              <Icone nom="etoile" taille={20} />
              {p('Laisser un avis')}
            </Link>
          ) : null}
          {garde.etat === 'litige' || garde.evenements.some((e) => e.etape === 'litige') ? (
            <Link href={`/gardes/${garde.id}/suivi`} className="bouton contour">
              <Icone nom="document" taille={20} />
              {p('Suivre le signalement')}
            </Link>
          ) : null}
          <Link href={`/messages/${garde.id}`} className="bouton contour">
            <Icone nom="messages" taille={20} />
            {p('Envoyer un message')}
          </Link>
          {gestes.length === 0 && !phaseDuCode && ['demande', 'en_cours'].includes(garde.etat) ? (
            <p className="petit texte-doux centre">
              {p('En attente de {prenom}.', { prenom: autre.prenom })}
            </p>
          ) : null}
          <Link href={`/signaler/membre/${autre.id}`} className="bouton discret texte-doux">
            <Icone nom="drapeau" taille={18} />
            {p('Signaler ce membre')}
          </Link>
        </div>
      </div>
    </main>
  );
}
