import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { etatDuCompte } from '@/lib/depot/comptes';
import { etatDuTelephone } from '@/lib/depot/telephone';
import { canauxConfigures } from '@/lib/envois/canaux';
import { textes } from '@/lib/i18n/langue';
import { coordonneesSuffisantes } from '@/lib/regles/comptes';
import { exigerUnMembre } from '@/lib/session';

import { EcranDeCompte, EtapesDeLInscription } from '../../ecran-de-compte';
import { renvoyerLeLien } from './actions';
import {
  FormulaireDuCode,
  FormulaireDuNumero,
  FormulaireDuNumeroSansCode,
} from './formulaires';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Vérifions vos coordonnées') };
}

/** Deuxième étape de l'inscription : l'adresse e-mail et le téléphone. */
export default async function Telephone({
  searchParams,
}: {
  searchParams: Promise<{ lien?: string; email?: string; numero?: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { lien, email, numero } = await searchParams;

  const [compte, telephone] = await Promise.all([
    etatDuCompte(membre.id),
    etatDuTelephone(membre.id),
  ]);
  const telephoneVerifie = telephone.verifieLe !== null;
  const emailVerifie = Boolean(compte?.emailVerifieLe);
  // Une confirmation qui dépend d'un envoi n'est demandée que si l'envoi est
  // branché : sans passerelle SMS, le numéro s'enregistre sans code.
  const canaux = canauxConfigures();
  const numeroEnregistre = !canaux.sms && telephone.telephone !== null;
  // Sans SMS, rien ne confirme le numéro : il doit rester corrigeable.
  const corrigerLeNumero = numeroEnregistre && numero === 'modifier';
  const peutContinuer = coordonneesSuffisantes({
    emailVerifie,
    telephoneVerifie,
    telephoneConnu: telephone.telephone !== null,
    courrielPossible: canaux.courriel,
    smsPossible: canaux.sms,
  });

  const verifie = (
    <span className="pastille bleu">
      <Icone nom="verifie" taille={14} />
      {p('Vérifié')}
    </span>
  );
  const aFaire = <span className="pastille ambre">{p('À faire')}</span>;
  const enregistre = <span className="pastille gris">{p('Enregistré')}</span>;
  const plusTard = <span className="pastille gris">{p('Plus tard')}</span>;

  return (
    <EcranDeCompte p={p} retour="/">
      <EtapesDeLInscription p={p} etape={2} titre={p('Coordonnées')} />
      <h1 className="titre-ecran">{p('Vérifions vos coordonnées')}</h1>
      <p className="sous-titre">
        {p('Les bike sitters acceptent plus volontiers un profil vérifié.')}
      </p>

      {emailVerifie && email === 'confirme' ? (
        <div className="encart bleu" role="status" style={{ marginBottom: 12 }}>
          <Icone nom="verifie" taille={20} />
          <span>{p('Merci, votre adresse est confirmée.')}</span>
        </div>
      ) : null}

      {/* Où en est la personne : ce qui est fait, ce qui reste, ce qui vient. */}
      <ul className="liste" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li className="ligne ligne-info">
          <span className="ligne-icone" aria-hidden="true">
            <Icone nom="enveloppe" taille={22} />
          </span>
          <span className="ligne-texte">
            <strong>{p('E-mail')}</strong>
            <span className="tronque">{compte?.email}</span>
          </span>
          {emailVerifie ? verifie : canaux.courriel ? aFaire : plusTard}
        </li>
        <li className="ligne ligne-info">
          <span className="ligne-icone" aria-hidden="true">
            <Icone nom="telephone" taille={22} />
          </span>
          <span className="ligne-texte">
            <strong>{p('Téléphone')}</strong>
            {(telephoneVerifie || numeroEnregistre) && telephone.telephone ? (
              <span className="tronque">{telephone.telephone}</span>
            ) : null}
            {numeroEnregistre && !corrigerLeNumero ? (
              <Link href="/inscription/telephone?numero=modifier" className="lien-texte">
                {p('Modifier mon numéro')}
              </Link>
            ) : null}
          </span>
          {telephoneVerifie ? verifie : numeroEnregistre ? enregistre : aFaire}
        </li>
        <li className="ligne ligne-info">
          <span className="ligne-icone" aria-hidden="true">
            <Icone nom="profil" taille={22} />
          </span>
          <span className="ligne-texte">
            <strong>{p('Identité')}</strong>
            <span>{p('Pièce vérifiée puis supprimée')}</span>
          </span>
          <span className="pastille gris">{p('Étape suivante')}</span>
        </li>
      </ul>

      {emailVerifie || !canaux.courriel ? null : (
        <div
          className={email === 'lien-perime' ? 'encart rouge' : 'encart ambre'}
          style={{ marginTop: 12 }}
        >
          <Icone
            nom={email === 'lien-perime' ? 'alerte' : 'envoyer'}
            taille={20}
          />
          <div>
            {email === 'lien-perime'
              ? `${p('Ce lien de confirmation n’est plus valable.')} `
              : null}
            {p('Confirmez votre adresse : un lien vous a été envoyé à')}{' '}
            <span style={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
              {compte?.email}
            </span>
            .{' '}
            {lien === 'renvoye' ? (
              <span role="status">{p('Un nouveau lien vient de partir.')}</span>
            ) : (
              <form action={renvoyerLeLien} style={{ display: 'inline' }}>
                <button
                  type="submit"
                  className="lien-texte"
                  style={{ padding: '4px 0' }}
                >
                  {p('Renvoyer le lien')}
                </button>
              </form>
            )}
            <p style={{ margin: '6px 0 0' }}>
              {p('Le message peut arriver dans les courriers indésirables.')}
            </p>
          </div>
        </div>
      )}

      {peutContinuer ? (
        <div className="boutons" style={{ marginTop: 16 }}>
          <Link href="/inscription/identite" className="bouton plein">
            {p('Continuer')}
            <Icone nom="chevron" taille={20} />
          </Link>
        </div>
      ) : null}

      {telephoneVerifie || (numeroEnregistre && !corrigerLeNumero) ? null : (
        <section
          className="carte pile"
          style={{ marginTop: 12 }}
          aria-labelledby="titre-telephone"
        >
          <h2
            id="titre-telephone"
            style={{ margin: 0, fontSize: 17, fontWeight: 800 }}
          >
            {p('Numéro de téléphone')}
          </h2>
          <p className="petit texte-doux" style={{ margin: '4px 0 0' }}>
            {p(
              'Il sert à vous joindre le jour de la garde : le bike sitter le voit une fois votre demande acceptée, et à ce moment-là seulement.',
            )}
          </p>
          {canaux.sms ? (
            <>
              <FormulaireDuNumero
                numeroConnu={telephone.telephone}
                codeDejaEnvoye={telephone.codeEnvoyeLe !== null}
                libelles={{
                  numero: p('Numéro de téléphone'),
                  recevoir: p('Recevoir le code par SMS'),
                  renvoyer: p('Renvoyer un code'),
                  envoi: p('Envoi…'),
                }}
              />
              <FormulaireDuCode
                libelles={{
                  code: p('Code reçu par SMS'),
                  chiffre: p('Chiffre'),
                  aide: p(
                    'Le code arrive en quelques secondes et reste valable dix minutes.',
                  ),
                  continuer: p('Continuer'),
                  verification: p('Vérification…'),
                }}
              />
            </>
          ) : (
            <FormulaireDuNumeroSansCode
              numeroConnu={telephone.telephone}
              libelles={{
                numero: p('Numéro de téléphone'),
                enregistrer: p('Enregistrer mon numéro'),
                envoi: p('Enregistrement…'),
              }}
            />
          )}
        </section>
      )}
    </EcranDeCompte>
  );
}
