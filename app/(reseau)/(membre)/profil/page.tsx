import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { statistiquesDuBikeSitter } from '@/lib/depot/lieux';
import { monProfil, velosDuMembre } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import { exigerUnMembre } from '@/lib/session';

import {
  basculerLesNouvellesDemandes,
  seDeconnecterDeLEspace,
} from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mon profil') };
}

export default async function Profil({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const mode = await modeCourant();
  const indications = await searchParams;
  const [profil, velos, nonLues, stats] = await Promise.all([
    monProfil(membre.id),
    velosDuMembre(membre.id),
    nombreDeNotificationsNonLues(membre.id),
    statistiquesDuBikeSitter(membre.id),
  ]);
  if (!profil) return null;
  const bikeSitter = mode === 'bike_sitter' && stats.lieux > 0;

  const lignes: [NomDIcone, string, string, string?][] = bikeSitter
    ? [
        [
          'maison',
          p('Mes lieux'),
          '/mes-lieux',
          p('Photos et détails de votre espace privé'),
        ],
        [
          'calendrier',
          p('Mes disponibilités'),
          '/mes-lieux',
          p('Indiquez vos créneaux'),
        ],
        [
          'velo',
          p('Vélos acceptés'),
          '/mes-lieux',
          p('Types de vélos que vous gardez'),
        ],
        [
          'etoile',
          p('Mes avis'),
          '/profil/avis',
          p('Les avis reçus des cyclistes'),
        ],
        [
          'oeil',
          p('Aperçu du profil public'),
          `/membres/${membre.id}`,
          p('Consulter votre profil public'),
        ],
      ]
    : [
        ['profil', p('Informations personnelles'), '/profil/modifier'],
        ['verifie', p('Vérification'), '/profil/verifications'],
        ['etoile', p('Mes avis'), '/profil/avis'],
        ['coeur', p('Mes favoris'), '/favoris'],
        ['cloche', p('Mes alertes'), '/profil/alertes'],
        ['cadenas', p('Confidentialité'), '/profil/confidentialite'],
        ['aide', p('Aide'), '/aide'],
      ];
  if (membre.moderateur) {
    lignes.push([
      'bouclier',
      p('Administration'),
      '/administration',
      p('Vérifications, signalements et litiges'),
    ]);
  }

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues}>
        <Link
          href="/profil/parametres"
          className="entete-bouton"
          aria-label={p('Paramètres')}
        >
          <Icone nom="reglages" taille={22} />
        </Link>
      </EnTete>
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">
          {bikeSitter ? p('Mon profil Bike Sitter') : p('Mon profil')}
        </h1>

        {indications.signalement === 'envoye' ? (
          <div className="encart" role="status" style={{ marginBottom: 10 }}>
            <Icone nom="coche" taille={22} />
            <span>
              {p('Votre signalement a été transmis à la modération.')}
            </span>
          </div>
        ) : null}
        {indications.demandes === 'impossible' ? (
          <div
            className="encart rouge"
            role="alert"
            style={{ marginBottom: 10 }}
          >
            <Icone nom="alerte" taille={22} />
            <span>
              {p(
                'Vos lieux ne peuvent pas être republiés tant que votre identité n’est pas vérifiée.',
              )}
            </span>
          </div>
        ) : null}

        <div className="colonnes">
          <section className="colonne">
            <Link href="/profil/modifier" className="carte carte-profil">
              <span className="avatar-app grand" aria-hidden="true">
                {profil.prenom.charAt(0)}
              </span>
              <span className="ligne-texte">
                <strong className="nom-profil">
                  {profil.prenom} {profil.initiale}.
                </strong>
                <span className="pastilles">
                  {profil.identiteVerifiee ? (
                    <span className="pastille bleu">
                      <Icone nom="verifie" taille={14} />
                      {p('Identité vérifiée')}
                    </span>
                  ) : (
                    <span className="pastille gris">
                      {p('Identité non vérifiée')}
                    </span>
                  )}
                  {profil.telephoneVerifie ? (
                    <span className="pastille bleu">
                      <Icone nom="telephone" taille={14} />
                      {p('Téléphone vérifié')}
                    </span>
                  ) : null}
                </span>
                <span className="petit">
                  {p('Membre depuis {annee}', { annee: profil.membreDepuis })}
                </span>
              </span>
              <Icone nom="chevron" taille={20} className="texte-leger" />
            </Link>

            {bikeSitter ? (
              <>
                <div className="tuiles" style={{ marginTop: 12 }}>
                  <span className="tuile">
                    <Icone nom="etoile" taille={22} plein />
                    <strong>
                      {stats.noteMoyenne !== null
                        ? stats.noteMoyenne.toFixed(1).replace('.', ',')
                        : '—'}
                    </strong>
                    <span>{p('avis moyen')}</span>
                  </span>
                  <span className="tuile">
                    <Icone nom="velo" taille={22} />
                    <strong>{stats.gardesMenees}</strong>
                    <span>{p('gardes réalisées')}</span>
                  </span>
                  <span className="tuile">
                    <Icone nom="messages" taille={22} />
                    <strong>
                      {stats.tauxDeReponse !== null
                        ? `${stats.tauxDeReponse} %`
                        : '—'}
                    </strong>
                    <span>{p('taux de réponse')}</span>
                  </span>
                </div>
                <form
                  action={basculerLesNouvellesDemandes}
                  className="carte interrupteur-demandes"
                >
                  <input
                    type="hidden"
                    name="accepter"
                    value={stats.accepteLesDemandes ? 'non' : 'oui'}
                  />
                  <span className="ligne-texte">
                    <strong>{p('Accepter les nouvelles demandes')}</strong>
                    <span>
                      {stats.accepteLesDemandes
                        ? p('Vos lieux reçoivent des demandes de garde.')
                        : p(
                            'Vos lieux sont en pause : aucune nouvelle demande.',
                          )}
                    </span>
                  </span>
                  <button
                    type="submit"
                    role="switch"
                    aria-checked={stats.accepteLesDemandes}
                    aria-label={p('Accepter les nouvelles demandes')}
                    className="interrupteur"
                  />
                </form>
              </>
            ) : (
              <>
                <h2 className="titre-section">
                  {p('Mes vélos')}
                  <Link href="/profil/velos" aria-label={p('Tous mes vélos')}>
                    <Icone nom="chevron" taille={20} />
                  </Link>
                </h2>
                {velos[0] ? (
                  <Link href="/profil/velos" className="ligne carte">
                    <span className="vignette-app petite">
                      <Icone nom="velo" taille={28} />
                    </span>
                    <span className="ligne-texte">
                      <strong>{velos[0].nom}</strong>
                      <span>
                        {[p(velos[0].type), velos[0].marque]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <Icone nom="chevron" taille={20} className="texte-leger" />
                  </Link>
                ) : null}
                <Link
                  href="/profil/velos/ajouter"
                  className="bouton lavis"
                  style={{ marginTop: 10 }}
                >
                  <Icone nom="plus" taille={20} />
                  {p('Ajouter un vélo')}
                </Link>
              </>
            )}
          </section>

          <section className="colonne">
            <div className="liste liste-reglages">
              {lignes.map(([icone, libelle, href, detail]) => (
                <Link key={libelle} href={href} className="ligne">
                  <span className="ligne-icone">
                    <Icone nom={icone} taille={22} />
                  </span>
                  <span className="ligne-texte">
                    <strong>{libelle}</strong>
                    {detail ? <span>{detail}</span> : null}
                  </span>
                  <Icone nom="chevron" taille={20} className="texte-leger" />
                </Link>
              ))}
            </div>

            {stats.lieux === 0 ? (
              <Link href="/devenir-bike-sitter" className="encart lien-encart">
                <Icone nom="utilisateurs" taille={30} />
                <span>
                  <strong>{p('Vous souhaitez proposer un emplacement ?')}</strong>
                  {p(
                    'Devenir Bike Sitter et gardez des vélos près de chez vous.',
                  )}
                </span>
                <Icone nom="chevron" taille={20} />
              </Link>
            ) : null}

            <form action={seDeconnecterDeLEspace} style={{ marginTop: 16 }}>
              <button type="submit" className="bouton contour">
                <Icone nom="deconnexion" taille={20} />
                {p('Se déconnecter')}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
