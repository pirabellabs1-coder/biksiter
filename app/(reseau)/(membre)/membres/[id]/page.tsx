import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Avatar } from '@/components/app/avatar';
import { Icone } from '@/components/app/icone';
import { statistiquesDuBikeSitter } from '@/lib/depot/lieux';
import { profilPublic } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { BasculeDesDemandes } from '@/components/maquette/sitter/bascule-des-demandes';
import {
  AVIS_POUR_AFFICHER_UNE_NOTE,
  moyenne,
} from '@/lib/regles/avis-de-garde';
import { exigerUnMembre } from '@/lib/session';

import { bloquerOuDebloquer } from '../../profil/actions';

export const metadata: Metadata = {
  // Le nom d'une personne n'a rien à faire dans l'historique du navigateur.
  title: 'Profil',
};

/**
 * Le profil Bike Sitter : le sien, avec ses réglages, ou celui d'un autre
 * membre, sans son adresse ni sa zone précise (règles 3 et 4).
 */
export default async function ProfilBikeSitter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id } = await params;
  const [cible, stats, _nonLues] = await Promise.all([
    profilPublic(membre.id, id),
    statistiquesDuBikeSitter(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);
  if (!cible) notFound();
  if (cible === 'refuse') {
    return (
      <main id="contenu">
        <div className="dashboard-wrap" id="bsprofil">
          <span className="kicker">PROFIL</span>
          <h1>Ce profil n’est pas public.</h1>
          <p className="bs-intro">
            Le profil d’un membre s’affiche pour les personnes avec qui il a
            partagé une garde.
          </p>
        </div>
      </main>
    );
  }

  const soiMeme = cible.id === membre.id;
  // La note n'existe qu'à partir de cinq avis : en dessous, on écrit « — ».
  const noteChiffree =
    cible.avis.length >= AVIS_POUR_AFFICHER_UNE_NOTE
      ? soiMeme
        ? stats.noteMoyenne
        : moyenne(cible.avis.map((avis) => avis.note))
      : null;
  const note =
    noteChiffree === null ? '—' : noteChiffree.toFixed(1).replace('.', ',');
  const tauxDeReponse = soiMeme ? stats.tauxDeReponse : null;
  const gardesRealisees = soiMeme
    ? stats.gardesMenees
    : cible.bikeSitter
      ? cible.velosAccueillis
      : cible.velosConfies;

  return (
    <main id="contenu">
      <div className="dashboard-wrap" id="bsprofil">
        {soiMeme && cible.bikeSitter ? (
          <div className="apercu-fiche">
            <p>
              <b>Ce que voient les cyclistes</b>
              <span>
                Votre fiche publique, avec vos photos, vos disponibilités et
                vos avis.
              </span>
            </p>
            <Link className="outline" href="/mes-lieux">
              Voir ma fiche publique
            </Link>
          </div>
        ) : null}
        <header className="profil-public-tete">
          <Avatar
            membreId={cible.id}
            prenom={cible.prenom}
            version={cible.photo}
            taille={88}
          />
          <div>
            <p className="kicker">
              {soiMeme
                ? 'Mon profil public'
                : cible.bikeSitter
                  ? 'Bike sitter'
                  : 'Membre du réseau'}
            </p>
            <h1>
              {cible.prenom} {cible.initiale}.
            </h1>
            <p className="profil-public-badges">
              {cible.identiteVerifiee ? (
                <span className="tag ver">Identité vérifiée</span>
              ) : null}
              <span className="gris">Membre depuis {cible.membreDepuis}</span>
            </p>
            {soiMeme ? (
              <Link className="lien-profil" href="/profil">
                {cible.photo ? 'Changer ma photo' : 'Ajouter une photo'}
              </Link>
            ) : null}
          </div>
        </header>

        <div className="prog-stats">
          <div>
            <b>{gardesRealisees}</b>
            <span>
              garde{gardesRealisees > 1 ? 's' : ''} réalisée
              {gardesRealisees > 1 ? 's' : ''}
            </span>
          </div>
          {/* Le taux de réponse n'est montré qu'au membre lui-même : pour les
              autres, un tiret sans explication laissait croire à un manque. */}
          {tauxDeReponse === null ? null : (
            <div>
              <b>{`${tauxDeReponse} %`}</b>
              <span>taux de réponse</span>
            </div>
          )}
          <div>
            <b>{note}</b>
            <span>note moyenne</span>
          </div>
        </div>
        <p className="prog-note">
          La note s’affiche à partir de {AVIS_POUR_AFFICHER_UNE_NOTE} avis,
          pour qu’elle reflète vraiment les gardes réalisées.
        </p>

        {soiMeme ? (
          cible.bikeSitter ? (
            <>
              <h2 className="prog-titre">Votre accueil</h2>
              <ul className="groupe" role="list">
                <li>
                  <Link href="/mes-lieux" className="rangee">
                    <span className="rangee-icone" aria-hidden="true">
                      <Icone nom="maison" taille={18} strokeWidth={2} />
                    </span>
                    <span className="rangee-texte">
                      <strong>Mes emplacements</strong>
                      <span>Horaires, photos, vélos acceptés</span>
                    </span>
                    <Icone nom="chevron" taille={18} className="rangee-chevron" />
                  </Link>
                </li>
                <li>
                  <Link href="/profil" className="rangee">
                    <span className="rangee-icone" aria-hidden="true">
                      <Icone nom="profil" taille={18} strokeWidth={2} />
                    </span>
                    <span className="rangee-texte">
                      <strong>Ma photo et mon compte</strong>
                      <span>Ce que les cyclistes voient de vous</span>
                    </span>
                    <Icone nom="chevron" taille={18} className="rangee-chevron" />
                  </Link>
                </li>
              </ul>

              <BasculeDesDemandes accepte={stats.accepteLesDemandes} />
            </>
          ) : (
            <section className="carte-accueillir" aria-labelledby="titre-accueillir">
              <h2 id="titre-accueillir">Accueillir un vélo chez vous</h2>
              <p>
                Un garage, une cave ou une cour fermée suffit. Vous choisissez
                vos jours et vos heures, et chaque garde menée à terme vous
                rapporte des points.
              </p>
              <Link className="primary" href="/devenir-bike-sitter">
                Proposer un emplacement
              </Link>
            </section>
          )
        ) : (
          <>
            <h2 className="prog-titre">Avis reçus</h2>
            {cible.avis.length === 0 ? (
              <p className="prog-note">
                Pas encore d’avis publié pour ce membre.
              </p>
            ) : (
              <ul className="bs-liste">
                {cible.avis.map((avis) => (
                  <li key={avis.id}>
                    <b>
                      {avis.auteurPrenom} {avis.auteurInitiale}. · {avis.note}
                      /5
                    </b>
                    {avis.texte ? ` — ${avis.texte}` : ''}
                  </li>
                ))}
              </ul>
            )}

            <div className="deux-boutons">
              <Link className="outline" href={`/signaler/membre/${cible.id}`}>
                Signaler
              </Link>
              <form action={bloquerOuDebloquer}>
                <input type="hidden" name="id" value={cible.id} />
                <button type="submit" className="outline">
                  {cible.bloque ? 'Débloquer' : 'Bloquer'}
                </button>
              </form>
            </div>
            {cible.bloque ? (
              <p className="prog-note" role="status">
                Vous avez bloqué ce compte. Il ne peut plus vous contacter.
              </p>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
