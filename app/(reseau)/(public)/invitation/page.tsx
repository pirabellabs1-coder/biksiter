import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { adresseIpDuVisiteur } from '@/lib/adresse-ip';
import { baseConfiguree } from '@/lib/bd/client';
import { invitationPresentee } from '@/lib/depot/membres';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { textes } from '@/lib/i18n/langue';
import { CONSULTATIONS_D_INVITATION } from '@/lib/regles/limites';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';

import {
  BORD_EN_ERREUR,
  EcranDeCompte,
  EncartDErreurs,
} from '../ecran-de-compte';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Rejoindre le réseau') };
}

/**
 * L'entrée dans le réseau, par le code d'une invitation.
 *
 * Le code est lu par un simple formulaire GET : la page se recharge avec la
 * personne qui invite, sans JavaScript, et rien n'est écrit tant que le compte
 * n'est pas créé.
 */
export default async function Invitation({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { p } = await textes();
  const code = ((await searchParams).code ?? '').trim().toUpperCase();

  if (!INSCRIPTION_SUR_INVITATION) {
    return (
      <EcranDeCompte p={p} retour="/bienvenue">
        <h1 className="titre-ecran">{p('Rejoindre le réseau')}</h1>
        <div className="encart" style={{ margin: '10px 0 12px' }}>
          <Icone nom="info" taille={20} />
          <span>
            {p(
              'Le réseau est ouvert : vous pouvez créer un compte sans invitation.',
            )}
          </span>
        </div>
        <p className="sous-titre">
          {p(
            "La vérification d'identité reste obligatoire, et votre compte est activé après validation. Si vous avez reçu une invitation, renseignez-la : votre parrain sera prévenu de votre arrivée.",
          )}
        </p>
        <form action="/inscription" method="get" className="pile">
          <label className="champ-app">
            <Icone nom="cle" taille={22} />
            <span className="champ-empile">
              <small>{p("Code d'invitation (facultatif)")}</small>
              <input
                name="code"
                defaultValue={code}
                placeholder="MANO-4K29"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                style={{ minHeight: 26 }}
              />
            </span>
          </label>
          <button type="submit" className="bouton plein">
            {p('Créer mon compte')}
            <Icone nom="chevron" taille={20} />
          </button>
        </form>
      </EcranDeCompte>
    );
  }

  let invitant: Awaited<ReturnType<typeof invitationPresentee>> = null;
  let tropDEssais = false;
  if (code && baseConfiguree()) {
    const adresse = await adresseIpDuVisiteur();
    tropDEssais = await limiteDejaAtteinte(CONSULTATIONS_D_INVITATION, adresse);
    if (!tropDEssais) {
      await noterUneTentative('consultation_invitation', adresse);
      invitant = await invitationPresentee(code);
    }
  }
  const codeRefuse = Boolean(code) && !invitant;

  return (
    <EcranDeCompte p={p} retour="/bienvenue">
      <h1 className="titre-ecran">{p('Rejoindre le réseau')}</h1>
      <div className="encart ambre" style={{ margin: '10px 0 14px' }}>
        <Icone nom="epingle" taille={20} />
        <span>
          {p(
            "Le réseau ouvre quartier par quartier. On y entre aujourd'hui sur invitation d'un membre.",
          )}
        </span>
      </div>

      <form action="/invitation" method="get" className="pile">
        <label
          className="champ-app"
          style={codeRefuse ? BORD_EN_ERREUR : undefined}
        >
          <Icone nom="cle" taille={22} />
          <span className="champ-empile">
            <small>{p("Code d'invitation")}</small>
            <input
              name="code"
              defaultValue={code}
              placeholder="MANO-4K29"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={codeRefuse || undefined}
              aria-describedby={codeRefuse ? 'code-erreur' : undefined}
              style={{ minHeight: 26 }}
            />
          </span>
        </label>

        {tropDEssais ? (
          <EncartDErreurs
            id="code-erreur"
            erreurs={[
              p(
                'Beaucoup de codes ont été essayés depuis cette connexion. Vous pourrez réessayer dans une heure.',
              ),
            ]}
          />
        ) : codeRefuse ? (
          <EncartDErreurs
            id="code-erreur"
            erreurs={[
              p(
                'Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez qu’il est recopié tel quel, par exemple MANO-4K29.',
              ),
            ]}
          />
        ) : null}

        {/* Une fois l'invitation reconnue, la suite est un lien : le champ
            reste modifiable, et Entrée relit un autre code. */}
        {invitant ? null : (
          <button type="submit" className="bouton plein">
            {p('Continuer')}
            <Icone nom="chevron" taille={20} />
          </button>
        )}
      </form>

      {invitant ? (
        <div className="pile" style={{ marginTop: 12 }}>
          <div className="carte carte-profil">
            <span className="avatar-app" aria-hidden="true">
              {invitant.prenom.charAt(0).toUpperCase()}
            </span>
            <span className="ligne-texte">
              <strong>
                {p('{prenom} vous invite', { prenom: invitant.prenom })}
              </strong>
              <span className="petit texte-doux">
                {invitant.quartier
                  ? p('bike sitter à {quartier} · membre depuis {annee}', {
                      quartier: invitant.quartier,
                      annee: invitant.depuis,
                    })
                  : p('membre depuis {annee}', { annee: invitant.depuis })}
              </span>
              {invitant.identiteVerifiee ? (
                <span className="pastille bleu">
                  <Icone nom="verifie" taille={14} />
                  {p('Identité vérifiée')}
                </span>
              ) : null}
            </span>
          </div>
          <div className="encart">
            <Icone nom="info" taille={20} />
            <span>
              {p(
                'Votre invitation a le plus de valeur si vous êtes du même quartier que {prenom} : c’est la densité qui rend le service utilisable.',
                { prenom: invitant.prenom },
              )}
            </span>
          </div>
          <Link
            href={`/inscription?code=${encodeURIComponent(code)}`}
            className="bouton plein"
          >
            {p('Continuer')}
            <Icone nom="chevron" taille={20} />
          </Link>
        </div>
      ) : null}

      <div className="boutons" style={{ marginTop: 10 }}>
        <Link href="/liste-attente" className="bouton contour">
          {p("Je n'ai pas d'invitation")}
        </Link>
      </div>
    </EcranDeCompte>
  );
}
