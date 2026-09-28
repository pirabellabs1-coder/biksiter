import type { Metadata } from 'next';
import Link from 'next/link';

import { Avatar } from '@/components/app/avatar';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { jourDuMois, moisAbrege } from '@/components/maquette/garde/dates';
import { PASTILLE_DE_L_ETAT } from '@/components/maquette/garde/etats';
import { Recherche } from '@/components/maquette/recherche';
import { gardesDuMembre, prochaineGardeDuCycliste } from '@/lib/depot/accueil';
import { mesFavoris } from '@/lib/depot/favoris';
import { membreAUnEmplacement } from '@/lib/depot/lieux';
import { exigerUnMembre } from '@/lib/session';
import { creneauCourt } from '@/lib/temps';

export const metadata: Metadata = { title: 'Mon espace' };

/**
 * L'accueil du cycliste, dans l'application.
 *
 * L'onglet « Accueil » menait jusqu'ici à la page de présentation du site :
 * un membre connecté quittait l'application sans le vouloir. Cet écran est son
 * point de départ : chercher tout de suite, voir où en est sa prochaine garde,
 * retrouver les bike sitters qu'il connaît. Le plus urgent vient en premier.
 */
export default async function MonEspace() {
  const membre = await exigerUnMembre();
  const [prochaine, gardes, favoris, estBikeSitter] = await Promise.all([
    prochaineGardeDuCycliste(membre.id),
    gardesDuMembre(membre.id),
    mesFavoris(membre.id),
    membreAUnEmplacement(membre.id),
  ]);

  const enAttente = gardes.filter(
    (g) => g.role === 'cycliste' && g.etat === 'demande',
  ).length;
  const aVenir = gardes.filter(
    (g) =>
      g.role === 'cycliste' &&
      ['accepte', 'arrivee', 'en_cours', 'reprise_demandee'].includes(g.etat),
  ).length;

  const raccourcis: {
    href: string;
    icone: NomDIcone;
    titre: string;
    detail: string;
    valeur?: string;
  }[] = [
    {
      href: '/gardes',
      icone: 'gardes',
      titre: 'Mes gardes',
      detail:
        enAttente > 0
          ? `${enAttente} demande${enAttente > 1 ? 's' : ''} en attente de réponse`
          : 'Vos demandes, vos gardes à venir et passées',
      valeur: aVenir > 0 ? String(aVenir) : undefined,
    },
    {
      href: '/messages',
      icone: 'messages',
      titre: 'Messages',
      detail: 'Vos échanges avec les bike sitters',
    },
    {
      href: '/favoris',
      icone: 'coeur',
      titre: 'Favoris',
      detail:
        favoris.length > 0
          ? `${favoris.length} bike sitter${favoris.length > 1 ? 's' : ''} mis de côté`
          : 'Les bike sitters que vous gardez sous la main',
    },
    {
      href: '/profil/velos',
      icone: 'velo',
      titre: 'Mes vélos',
      detail: 'Décrivez votre vélo une fois, choisissez-le à chaque demande',
    },
    {
      href: '/aide',
      icone: 'aide',
      titre: 'Centre d’aide',
      detail: 'Comment se passent le dépôt, le code et la reprise',
    },
  ];

  return (
    <main id="contenu" className="ecran">
      <header className="ecran-tete">
        <p className="kicker">Espace cycliste</p>
        <h1>Bonjour {membre.prenom}</h1>
        <p className="ecran-intro">Où déposez-vous votre vélo aujourd’hui ?</p>
      </header>

      <section className="espace-recherche" aria-label="Chercher un bike sitter">
        <Recherche />
      </section>

      {prochaine ? (
        <section aria-labelledby="titre-prochaine">
          <h2 className="titre-section" id="titre-prochaine">
            Votre prochaine garde
          </h2>
          <Link href={`/gardes/${prochaine.id}`} className="garde-a-venir">
            <span className="gav-date" aria-hidden="true">
              <b>{jourDuMois(new Date(prochaine.debut))}</b>
              <span>{moisAbrege(new Date(prochaine.debut))}</span>
            </span>
            <span className="gav-texte">
              <span className={PASTILLE_DE_L_ETAT[prochaine.etat].pastille}>
                {PASTILLE_DE_L_ETAT[prochaine.etat].texte}
              </span>
              <strong>
                Chez {prochaine.autrePrenom} {prochaine.autreInitiale}.
              </strong>
              <span>
                {creneauCourt(
                  new Date(prochaine.debut),
                  new Date(prochaine.fin),
                )}{' '}
                · {prochaine.quartier}
              </span>
            </span>
            <Icone nom="chevron" taille={20} className="rangee-chevron" />
          </Link>
        </section>
      ) : null}

      {favoris.length > 0 ? (
        <section aria-labelledby="titre-favoris">
          <div className="titre-avec-lien">
            <h2 className="titre-section" id="titre-favoris">
              Vos bike sitters
            </h2>
            <Link href="/favoris">Tout voir</Link>
          </div>
          <ul className="rail" role="list">
            {favoris.slice(0, 6).map((f) => (
              <li key={f.reference}>
                <Link href={`/emplacements/${f.reference}`} className="rail-carte">
                  <Avatar
                    membreId={f.bikeSitterId}
                    prenom={f.prenom}
                    version={f.photo}
                    taille={44}
                    className="rail-avatar"
                  />
                  <strong>
                    {f.prenom} {f.initialeDuNom}.
                  </strong>
                  <span>{f.quartier}</span>
                  {f.noteMoyenne !== null && f.nombreDAvis >= 3 ? (
                    <span className="rail-note">
                      ★ {f.noteMoyenne.toFixed(1).replace('.', ',')}
                    </span>
                  ) : (
                    <span className="rail-note">
                      {f.gardesMenees} garde{f.gardesMenees > 1 ? 's' : ''}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="titre-raccourcis">
        <h2 className="titre-section" id="titre-raccourcis">
          Raccourcis
        </h2>
        <ul className="groupe" role="list">
          {raccourcis.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="rangee">
                <span className="rangee-icone" aria-hidden="true">
                  <Icone nom={r.icone} taille={18} strokeWidth={2} />
                </span>
                <span className="rangee-texte">
                  <strong>{r.titre}</strong>
                  <span>{r.detail}</span>
                </span>
                {r.valeur ? (
                  <span className="rangee-valeur">{r.valeur}</span>
                ) : null}
                <Icone nom="chevron" taille={18} className="rangee-chevron" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {!estBikeSitter ? (
        <section className="carte-accueillir" aria-labelledby="titre-accueillir">
          <h2 id="titre-accueillir">Accueillir un vélo chez vous</h2>
          <p>
            Un garage, une cave ou une cour fermée suffit. Vous choisissez vos
            jours et vos heures, et chaque garde menée à terme vous rapporte des
            points à utiliser chez les commerces du quartier.
          </p>
          <Link className="primary" href="/devenir-bike-sitter">
            Proposer un emplacement
          </Link>
        </section>
      ) : null}
    </main>
  );
}
