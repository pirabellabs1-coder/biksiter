import type { Metadata } from 'next';
import Link from 'next/link';

import { BasculeDeMode } from '@/components/app/bascule-de-mode';
import { EnTete } from '@/components/app/en-tete';
import { CarteDeGarde, dateDeGarde } from '@/components/app/garde';
import { Icone } from '@/components/app/icone';
import {
  accueilDuBikeSitter,
  prochaineGardeDuCycliste,
} from '@/lib/depot/accueil';
import { monProfil } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Accueil') };
}

export default async function Accueil() {
  const membre = await exigerUnMembre();
  const { t, p } = await textes();
  const mode = await modeCourant();
  const [profil, nonLues] = await Promise.all([
    monProfil(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">
          {p('Bonjour {prenom}', { prenom: profil?.prenom ?? '' })}
        </h1>
        <div className="accueil-bascule">
          <BasculeDeMode mode={mode} p={p} />
        </div>
        {mode === 'bike_sitter' ? (
          <AccueilBikeSitter membreId={membre.id} t={t} p={p} />
        ) : (
          <AccueilCycliste membreId={membre.id} t={t} p={p} />
        )}
      </div>
    </main>
  );
}

type Props = {
  membreId: string;
  t: Awaited<ReturnType<typeof textes>>['t'];
  p: Awaited<ReturnType<typeof textes>>['p'];
};

async function AccueilCycliste({ membreId, t, p }: Props) {
  const prochaine = await prochaineGardeDuCycliste(membreId);
  return (
    <div className="colonnes">
      <section className="colonne">
        <h2 className="titre-section">{p('Votre prochaine garde')}</h2>
        {prochaine ? (
          <div className="boutons">
            <CarteDeGarde t={t} p={p} garde={prochaine} />
            <Link href={`/gardes/${prochaine.id}`} className="bouton plein">
              {p('Voir ma garde')}
            </Link>
          </div>
        ) : (
          <div className="carte vide-accueil">
            <Icone nom="calendrier" taille={28} />
            <p>
              <strong>{p('Aucune garde prévue.')}</strong>
              {p(
                'Trouvez un Bike Sitter près de chez vous pour votre prochaine sortie.',
              )}
            </p>
          </div>
        )}
      </section>

      <section className="colonne">
        <h2 className="titre-section">{p('Actions rapides')}</h2>
        <div className="raccourcis">
          <Link href="/recherche" className="raccourci">
            <Icone nom="recherche" taille={26} />
            <span className="raccourci-texte">
              {p('Trouver un Bike Sitter')}
              <Icone nom="chevron" taille={18} className="texte-leger" />
            </span>
          </Link>
          <Link href="/profil/velos/ajouter" className="raccourci">
            <Icone nom="plus" taille={26} />
            <span className="raccourci-texte">
              {p('Ajouter un vélo')}
              <Icone nom="chevron" taille={18} className="texte-leger" />
            </span>
          </Link>
        </div>

        <Link href="/comment-ca-marche" className="encart lien-encart">
          <Icone nom="verifie" taille={30} />
          <span>
            <strong>{p('Votre vélo n’est jamais seul.')}</strong>
            {p('Des particuliers de confiance près de chez vous.')}
          </span>
          <Icone nom="chevron" taille={20} />
        </Link>
      </section>
    </div>
  );
}

async function AccueilBikeSitter({ membreId, p }: Props) {
  const accueil = await accueilDuBikeSitter(membreId);

  if (accueil.emplacements === 0) {
    return (
      <>
        <div className="carte devenir">
          <Icone nom="maison" taille={34} />
          <h2>{p('Devenir Bike Sitter')}</h2>
          <p className="texte-doux">
            {p(
              'Mettez votre espace privé et sécurisé au service des cyclistes de votre quartier.',
            )}
          </p>
          <div className="encart">
            <Icone nom="velo" taille={24} />
            <strong>{p('Gardez des vélos et gagnez des points.')}</strong>
          </div>
        </div>
        <div className="boutons" style={{ marginTop: 14 }}>
          <Link href="/devenir-bike-sitter" className="bouton plein">
            {p('Commencer ma candidature')}
            <Icone nom="chevron" taille={20} />
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="colonnes">
      <section className="colonne">
        <Link href="/mes-lieux" className="ligne carte disponibilite">
          <span
            className={`point-etat ${accueil.disponibleAujourdhui ? 'vert' : 'gris'}`}
            aria-hidden="true"
          />
          <span className="ligne-texte">
            <strong>
              {accueil.disponibleAujourdhui
                ? p('Disponible aujourd’hui')
                : p('Pas d’accueil aujourd’hui')}
            </strong>
          </span>
          <Icone nom="chevron" taille={20} className="texte-leger" />
        </Link>

        <div className="tuiles" style={{ marginTop: 12 }}>
          <Link href="/progression" className="tuile">
            <Icone nom="etoile" taille={22} plein />
            <strong>{accueil.points}</strong>
            <span>{p('points')}</span>
          </Link>
          <Link href="/demandes" className="tuile">
            <Icone nom="demandes" taille={22} />
            <strong>{accueil.demandesEnAttente}</strong>
            <span>{p('demandes')}</span>
          </Link>
          <Link href="/gardes" className="tuile">
            <Icone nom="velo" taille={22} />
            <strong>{accueil.gardesTerminees}</strong>
            <span>{p('gardes')}</span>
          </Link>
        </div>
      </section>

      <section className="colonne">
        <h2 className="titre-section">
          {p('Nouvelle demande')}
          {accueil.demandesEnAttente > 1 ? (
            <Link href="/demandes" aria-label={p('Toutes les demandes')}>
              <Icone nom="chevron" taille={20} />
            </Link>
          ) : null}
        </h2>
        {accueil.nouvelleDemande ? (
          <div className="carte">
            <div className="personne-demande">
              <span className="avatar-app" aria-hidden="true">
                {accueil.nouvelleDemande.autrePrenom.charAt(0)}
              </span>
              <span className="ligne-texte">
                <strong>
                  {accueil.nouvelleDemande.autrePrenom}{' '}
                  {accueil.nouvelleDemande.autreInitiale}.
                  {accueil.nouvelleDemande.autreVerifie ? (
                    <Icone
                      nom="verifie"
                      taille={16}
                      className="texte-verifie"
                      role="img"
                      aria-label={p('Identité vérifiée')}
                    />
                  ) : null}
                </strong>
                <span>
                  {accueil.nouvelleDemande.veloNom ??
                    p(accueil.nouvelleDemande.typeVelo)}
                </span>
                <span>
                  {dateDeGarde(
                    p,
                    accueil.nouvelleDemande.debut,
                    accueil.nouvelleDemande.fin,
                  )}
                </span>
              </span>
              <span className="pastille">{p('Nouveau')}</span>
            </div>
            <Link
              href={`/gardes/${accueil.nouvelleDemande.id}`}
              className="bouton plein"
              style={{ marginTop: 12 }}
            >
              {p('Voir la demande')}
              <Icone nom="chevron" taille={20} />
            </Link>
          </div>
        ) : (
          <p className="texte-doux">{p('Aucune demande en attente.')}</p>
        )}

        <h2 className="titre-section">{p('Prochaine garde')}</h2>
        {accueil.prochaineGarde ? (
          <Link
            href={`/gardes/${accueil.prochaineGarde.id}`}
            className="ligne carte"
          >
            <span className="ligne-icone fond-vert">
              <Icone nom="velo" taille={24} />
            </span>
            <span className="ligne-texte">
              <strong>
                {dateDeGarde(
                  p,
                  accueil.prochaineGarde.debut,
                  accueil.prochaineGarde.fin,
                )}
              </strong>
              <span>
                {accueil.prochaineGarde.autrePrenom}{' '}
                {accueil.prochaineGarde.autreInitiale}.
              </span>
            </span>
            <Icone nom="chevron" taille={20} className="texte-leger" />
          </Link>
        ) : (
          <p className="texte-doux">{p('Aucune garde prévue.')}</p>
        )}
      </section>
    </div>
  );
}
