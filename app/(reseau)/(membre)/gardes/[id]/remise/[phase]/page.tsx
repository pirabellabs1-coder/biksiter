import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { EtapesDuDepot } from '@/components/app/depot';
import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { codeDeLaRemise, detailDeLaGarde } from '@/lib/depot/gardes';
import { textes } from '@/lib/i18n/langue';
import {
  AUTEUR_DU_CONSTAT,
  ETATS_DU_VELO,
  LONGUEUR_D_UNE_RESERVE,
  titreDeLaPhoto,
} from '@/lib/regles/constat';
import { DETENTEUR_DU_CODE } from '@/lib/regles/garde';
import { ESSAIS_PAR_CODE, VALIDITE_CODE_HEURES } from '@/lib/regles/remise';
import { exigerUnMembre } from '@/lib/session';

import { nouveauCode, refuserPourLaBatterie } from '../../actions';
import { Rafraichir, SaisieDuCode } from './saisie';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Remise du vélo') };
}

/**
 * Troisième étape du dépôt, dernière de la restitution : le code. Il ne se
 * saisit qu'une fois le vélo photographié, et celui qui le reçoit voit les
 * photos avant de valider.
 */
export default async function RemiseDuVelo({
  params,
}: {
  params: Promise<{ id: string; phase: string }>;
}) {
  const membre = await exigerUnMembre();
  const { t, p } = await textes();
  const { id, phase } = await params;
  if (phase !== 'depot' && phase !== 'reprise') notFound();

  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  const constat = garde.constats[phase] ?? null;
  const photographe = garde.role === AUTEUR_DU_CONSTAT[phase];
  // Le cycliste photographie d'abord : le code attend les photos.
  if (photographe && !constat) {
    redirect(`/gardes/${id}/constat/${phase}`);
  }

  const code = await codeDeLaRemise(membre.id, id, phase);
  // La garde a avancé : l'écran de remise n'a plus d'objet.
  if (!code) redirect(`/gardes/${id}`);

  const etape = phase === 'depot' ? 3 : 4;
  const prenom = garde.autre.prenom;
  const electrique = garde.typeVelo === 'Électrique';

  if (code.role === 'detenteur') {
    return (
      <main id="contenu">
        <Rafraichir secondes={5} />
        <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
        <div className="ecran-app ecran-parcours">
          <EtapesDuDepot p={p} etape={etape} />
          <h1 className="titre-ecran">
            {phase === 'depot' ? p('Code de dépôt') : p('Code de restitution')}
          </h1>
          <p className="sous-titre">
            {p(
              'Lisez ce code à voix haute à {prenom}, au moment où vous remettez le vélo : en le saisissant, {prenom} confirme la remise.',
              { prenom },
            )}
          </p>

          <div className="carte carte-code">
            <p className="carte-code-titre">
              <Icone nom="cadenas" taille={20} />
              {phase === 'depot' ? p('Code sécurisé de dépôt') : p('Code sécurisé de restitution')}
            </p>
            <p className="code-affiche" aria-label={code.chiffres.split('').join(' ')}>
              {/* Deux groupes de trois : c'est ainsi qu'on les dicte. */}
              {code.chiffres.slice(0, 3)} {code.chiffres.slice(3)}
            </p>
            <p className="petit texte-doux">
              {p('Valable {n} heures · {essais} essais', {
                n: VALIDITE_CODE_HEURES,
                essais: ESSAIS_PAR_CODE,
              })}
            </p>
          </div>

          <div className="pile" style={{ marginTop: 12 }}>
            {code.expire ? (
              <div className="encart rouge" role="alert">
                <Icone nom="alerte" taille={22} />
                <span>{p('Ce code a expiré.')}</span>
              </div>
            ) : null}
            {/* À la restitution, le cycliste photographie son vélo avant de saisir le code. */}
            {DETENTEUR_DU_CODE[phase] !== AUTEUR_DU_CONSTAT[phase] && !constat ? (
              <div className="encart ambre">
                <Icone nom="photo" taille={22} />
                <span>
                  {p('{prenom} photographie son vélo, puis saisira ce code.', { prenom })}
                </span>
              </div>
            ) : null}
            <div className="encart">
              <Icone nom="info" taille={22} />
              <span>
                {p('À partager uniquement en face à face avec {prenom}. Ne l’envoyez jamais par message.', {
                  prenom,
                })}
              </span>
            </div>
            <form action={nouveauCode}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="phase" value={phase} />
              <button type="submit" className="bouton contour">
                {p('Générer un nouveau code')}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Au dépôt, le bike sitter peut refuser un vélo électrique dont la batterie
  // l'inquiète : il le voit devant sa porte.
  const refusPourLaBatterie =
    phase === 'depot' && electrique ? (
      <details className="carte rubrique-d-aide" style={{ marginTop: 16 }}>
        <summary className="ligne" style={{ padding: 0, border: 0 }}>
          <span className="ligne-icone" aria-hidden="true">
            <Icone nom="batterie" taille={22} />
          </span>
          <span className="ligne-texte">
            <strong>{p('La batterie vous inquiète ?')}</strong>
            <span>{p('Gonflée, chaude, abîmée ou odorante : vous pouvez refuser le vélo.')}</span>
          </span>
          <Icone nom="chevron" taille={20} />
        </summary>
        <form action={refuserPourLaBatterie} className="pile" style={{ marginTop: 12 }}>
          <input type="hidden" name="id" value={id} />
          <p className="petit" style={{ margin: 0 }}>
            {p(
              'La garde sera annulée et {prenom} recevra un message. Ce refus ne compte pas comme un désistement.',
              { prenom },
            )}
          </p>
          <button type="submit" className="bouton danger-contour">
            {p('Refuser le vélo : batterie inquiétante')}
          </button>
        </form>
      </details>
    ) : null;

  // Les photos ne sont pas encore là : l'écran attend, et se met à jour seul.
  if (!constat) {
    return (
      <main id="contenu">
        <Rafraichir secondes={5} />
        <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
        <div className="ecran-app ecran-parcours">
          <EtapesDuDepot p={p} etape={etape} />
          <h1 className="titre-ecran">{p('Recevoir le vélo')}</h1>
          <p className="sous-titre">
            {p('{prenom} photographie son vélo devant votre porte. Les photos s’afficheront ici.', { prenom })}
          </p>
          <div className="encart ambre" role="status">
            <Icone nom="horloge" taille={22} />
            <span>{p('Les photos arrivent : cet écran se met à jour tout seul.')}</span>
          </div>
          {refusPourLaBatterie}
        </div>
      </main>
    );
  }

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <EtapesDuDepot p={p} etape={etape} />
        <h1 className="titre-ecran">
          {phase === 'depot' ? p('Recevoir le vélo') : p('Récupérer mon vélo')}
        </h1>

        {phase === 'depot' ? (
          <section className="carte" aria-labelledby="photos-recues" style={{ marginBottom: 12 }}>
            <h2 id="photos-recues" className="titre-section" style={{ marginTop: 0 }}>
              {p('Photos prises par {prenom}', { prenom })}
            </h2>
            <div className="grille-photos">
              {constat.rangs.map((rang) => (
                <figure key={rang} className="emplacement-photo">
                  <strong>{p(titreDeLaPhoto(rang))}</strong>
                  <a
                    href={`/gardes/${id}/constat/depot/photo/${rang}`}
                    target="_blank"
                    rel="noopener"
                    className="emplacement-photo-image"
                    aria-label={p('Agrandir la photo : {angle}', { angle: p(titreDeLaPhoto(rang)) })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/gardes/${id}/constat/depot/photo/${rang}`} alt="" />
                  </a>
                </figure>
              ))}
            </div>
            <p style={{ margin: '12px 0 0' }}>
              {p('État déclaré')} · <strong>{p(ETATS_DU_VELO[constat.etat])}</strong>
            </p>
            {constat.note ? <p className="petit texte-doux" style={{ margin: '4px 0 0' }}>{constat.note}</p> : null}
            {constat.batterieVerifiee ? (
              <p className="petit texte-doux" style={{ margin: '4px 0 0' }}>
                {p('{prenom} a vérifié la batterie.', { prenom })}
              </p>
            ) : null}
          </section>
        ) : null}

        <SaisieDuCode
          id={id}
          phase={phase}
          reserve={
            phase === 'depot'
              ? {
                  libelle: p('Une remarque sur l’état du vélo ? (facultatif)'),
                  exemple: p('Ex. : la béquille est fendue, ce qui ne se voit pas sur les photos.'),
                  longueur: LONGUEUR_D_UNE_RESERVE,
                }
              : null
          }
          textes={{
            explication:
              phase === 'depot'
                ? p(
                    'Comparez ces photos avec le vélo devant vous, puis demandez le code à {prenom}. En le saisissant, vous confirmez les avoir vérifiées.',
                    { prenom },
                  )
                : p(
                    '{prenom} vous remet le vélo et voit un code à six chiffres sur son écran. Demandez-le-lui et saisissez-le.',
                    { prenom },
                  ),
            libelle: t('d.code'),
            essais:
              code.essaisRestants < ESSAIS_PAR_CODE
                ? code.essaisRestants > 1
                  ? p('Il reste {n} essais. Au-delà, un nouveau code est généré et {prenom} doit vous le relire.', {
                      n: code.essaisRestants,
                      prenom,
                    })
                  : p('Il reste un essai. Au-delà, un nouveau code est généré et {prenom} doit vous le relire.', {
                      prenom,
                    })
                : null,
            conseil: p(
              "Trois essais par code, qui expire au bout de {n} heures. Si vous ne parvenez pas à l'obtenir, écrivez-vous : la remise peut attendre, un vélo mal remis non.",
              { n: VALIDITE_CODE_HEURES },
            ),
            confirmer: t('d.confirm'),
            envoi: p('Vérification…'),
          }}
        />

        {refusPourLaBatterie}
      </div>
    </main>
  );
}
