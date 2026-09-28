import type { Metadata } from 'next';
import Link from 'next/link';

import { Confirmation } from '@/components/maquette/confirmation';
import { FormulaireDIdentite } from '@/components/maquette/compte/formulaire-d-identite';
import { PhotoDeProfil } from '@/components/maquette/compte/photo-de-profil';
import { ReglagesDeNotification } from '@/components/maquette/compte/reglages-de-notification';
import { Icone } from '@/components/app/icone';
import { etatDuCompte } from '@/lib/depot/comptes';
import { canauxConfigures } from '@/lib/envois/canaux';
import { monProfil } from '@/lib/depot/membre-espace';
import { tranquilliteDuMembre } from '@/lib/depot/notifications';
import { versionDeMaPhoto } from '@/lib/depot/photo-de-profil';
import { textes } from '@/lib/i18n/langue';
import { nomModifiable } from '@/lib/regles/comptes';
import { exigerUnMembre } from '@/lib/session';

import { seDeconnecterDeLEspace } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mon compte') };
}

const CONFIRMATIONS_DU_PROFIL: Record<string, string> = {
  envoye:
    'Votre signalement est transmis à la modération. Vous recevez une notification dès qu’il a été examiné.',
};

export default async function MonCompte({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { signalement, demandes } = await searchParams;
  const [profil, compte, versionDeLaPhoto, tranquillite] = await Promise.all([
    monProfil(membre.id),
    etatDuCompte(membre.id),
    versionDeMaPhoto(membre.id),
    tranquilliteDuMembre(membre.id),
  ]);
  if (!profil) return null;

  // Le statut des trois vérifications, résumé ici et détaillé dans la page
  // dédiée. Une pastille écrit toujours l'état en toutes lettres (règle 6).
  // Sans passerelle SMS, un numéro enregistré ne peut pas être confirmé : il
  // se dit « Enregistré », pas « À faire ».
  const canaux = canauxConfigures();
  const verifications = [
    {
      titre: 'E-mail',
      verifie: Boolean(compte?.emailVerifieLe),
      examen: false,
      enregistre: false,
    },
    {
      titre: 'Identité',
      verifie: compte?.verification === 'verifiee',
      examen: compte?.verification === 'en_cours',
      enregistre: false,
    },
    {
      titre: 'Téléphone',
      verifie: Boolean(compte?.telephoneVerifieLe),
      examen: false,
      enregistre: !canaux.sms && Boolean(compte?.telephone),
    },
  ];

  const confirmation = signalement
    ? CONFIRMATIONS_DU_PROFIL[signalement]
    : demandes === 'impossible'
      ? 'Les nouvelles demandes n’ont pas pu être rouvertes : aucun emplacement publié.'
      : undefined;

  return (
    <>
      {confirmation ? <Confirmation texte={confirmation} /> : null}
      <main className="page page-etroite" id="contenu">
        <PhotoDeProfil
          membreId={membre.id}
          prenom={profil.prenom}
          nomPublic={`${profil.prenom} ${profil.initiale}.`}
          version={versionDeLaPhoto}
        />

        {membre.moderateur ? (
          <ul className="groupe acces-moderation" role="list">
            <li>
              <Link href="/administration" className="rangee">
                <span className="rangee-icone" aria-hidden="true">
                  <Icone nom="bouclier" taille={18} strokeWidth={2} />
                </span>
                <span className="rangee-texte">
                  <strong>Espace de modération</strong>
                  <span>Vérifications d’identité, signalements, litiges</span>
                </span>
                <Icone nom="chevron" taille={18} className="rangee-chevron" />
              </Link>
            </li>
          </ul>
        ) : null}

        <FormulaireDIdentite
          prenom={profil.prenom}
          initiale={profil.initiale}
          email={membre.email}
          telephone={
            profil.telephoneConnu ? '+32 4·· ·· ·· ··' : 'Non renseigné'
          }
          modifiable={nomModifiable(profil.verification)}
        />

        <section className="bloc">
          <h2>Vérifications</h2>
          <p className="mention">
            Une identité vérifiée est nécessaire pour publier un emplacement ou
            envoyer une demande. Elle est vérifiée une fois, par une personne
            de l’association.
          </p>
          <ul className="liste-nette">
            {verifications.map((v) => (
              <li key={v.titre} className="ligne-verif">
                <span>{v.titre}</span>
                {v.verifie ? (
                  <span className="pastille bleu">
                    <Icone nom="verifie" taille={14} />
                    Vérifié
                  </span>
                ) : v.examen ? (
                  <span className="pastille ambre">
                    <Icone nom="horloge" taille={14} />
                    En cours d’examen
                  </span>
                ) : v.enregistre ? (
                  <span className="pastille gris">Enregistré</span>
                ) : (
                  <span className="pastille gris">À faire</span>
                )}
              </li>
            ))}
          </ul>
          <div className="actions-fin">
            <Link className="outline" href="/profil/verifications">
              Gérer mes vérifications
            </Link>
          </div>
        </section>


        <section className="bloc">
          <h2>Notifications</h2>
          <ReglagesDeNotification tranquillite={tranquillite} />
        </section>

        <section className="bloc">
          <h2>Vos données</h2>
          <ul className="liste-nette">
            <li>
              <b>Exporter.</b> Vous téléchargez tout ce que le service détient
              sur vous, en un fichier lisible.
            </li>
            <li>
              <b>Effacer.</b> Le compte et les données personnelles sont
              supprimés sous trente jours. Les avis que vous avez laissés
              restent, sans votre nom.
            </li>
            <li>
              <b>Une garde en cours</b> empêche l’effacement tant qu’elle n’est
              pas close : l’autre membre a droit à son constat.
            </li>
          </ul>
          <div className="actions-fin">
            <a className="outline" href="/profil/export" download>
              Exporter mes données
            </a>
            <Link className="danger" href="/profil/supprimer">
              Effacer mon compte
            </Link>
          </div>
        </section>

        <section className="bloc">
          <h2>Cet appareil</h2>
          <p>
            Vous restez connecté tant que vous ne vous déconnectez pas. Sur un
            appareil partagé, déconnectez-vous : vos gardes et vos messages
            sont visibles sans mot de passe.
          </p>
          <div className="actions-fin">
            <form action={seDeconnecterDeLEspace}>
              <button type="submit" className="outline">
                Se déconnecter
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
