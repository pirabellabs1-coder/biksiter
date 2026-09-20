import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { lieuDuMembre } from '@/lib/depot/lieux';
import { textes } from '@/lib/i18n/langue';
import {
  DELAIS_DE_REPONSE,
  DUREES_MAX_HEURES,
  JOURS_ABREGES,
  libelleDesHoraires,
} from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';

import { basculerLaPauseDuLieu } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mon lieu') };
}

export default async function MonLieu({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { reference } = await params;
  const indications = await searchParams;
  const lieu = await lieuDuMembre(membre.id, reference);
  if (!lieu) notFound();

  const horaires =
    lieu.jours.length > 0
      ? libelleDesHoraires(
          {
            jours: lieu.jours,
            ouverture: lieu.ouverture,
            fermeture: lieu.fermeture,
            parJour: {},
            fermetures: lieu.fermetures,
          },
          (jour) => p(JOURS_ABREGES[jour] ?? ''),
        )
      : p('Aucun jour d’accueil');

  const confirmation =
    indications.modifie
      ? p('Modifications enregistrées')
      : indications.photos
        ? p('Photos enregistrées')
        : indications.disponibilites
          ? p('Disponibilités enregistrées')
          : null;

  const lignes: [NomDIcone, string, string, string][] = [
    ['maison', p('Informations du lieu'), `${p(lieu.type)} · ${lieu.quartier}`, `/mes-lieux/${reference}/modifier`],
    ['photo', p('Photos du lieu'), p('{n} sur 3', { n: lieu.nombreDePhotos }), `/mes-lieux/${reference}/photos`],
    ['calendrier', p('Disponibilités et capacité'), horaires, `/mes-lieux/${reference}/disponibilites`],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/mes-lieux" cloche={false} />
      <div className="ecran-app ecran-large fiche-detail">
        <h1 className="titre-ecran">{p(lieu.type)}</h1>
        <p className="sous-titre">
          <Icone nom="epingle" taille={16} className="texte-vert" /> {lieu.quartier}
        </p>

        {confirmation ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{confirmation}</span>
          </div>
        ) : null}
        {indications.publication === 'identite' ? (
          <div className="encart ambre" role="alert" style={{ marginBottom: 12 }}>
            <Icone nom="alerte" taille={22} />
            <span>{p('Le lieu sera publié dès que votre identité aura été vérifiée.')}</span>
          </div>
        ) : null}

        <div className="carte-lieu-photo grande">
          {lieu.nombreDePhotos > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/emplacements/${reference}/photo/0`} alt={p('Photo du lieu')} />
          ) : (
            <Icone nom="maison" taille={48} />
          )}
        </div>

        {lieu.publie ? (
          <div className="encart" style={{ marginTop: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>
              <strong>{p('Lieu actif')}</strong>
              {p('Il apparaît dans les recherches, dans une zone approximative.')}
            </span>
          </div>
        ) : lieu.enPause ? (
          <div className="encart ambre" style={{ marginTop: 12 }}>
            <Icone nom="horloge" taille={22} />
            <span>
              <strong>{p('Lieu en pause')}</strong>
              {p('Il n’apparaît plus dans les recherches. Les gardes acceptées continuent.')}
            </span>
          </div>
        ) : lieu.jours.length === 0 ? (
          <div className="encart ambre" style={{ marginTop: 12 }}>
            <Icone nom="calendrier" taille={22} />
            <span>
              <strong>{p('Brouillon')}</strong>
              {p('Réglez vos disponibilités pour publier ce lieu.')}
            </span>
          </div>
        ) : (
          <div className="encart ambre" style={{ marginTop: 12 }}>
            <Icone nom="verifie" taille={22} />
            <span>
              <strong>{p('En attente de vérification')}</strong>
              {p('Le lieu sera publié dès que votre identité aura été vérifiée.')}{' '}
              <Link href="/profil/verifications" className="lien-souligne">
                {p('Mes vérifications')}
              </Link>
            </span>
          </div>
        )}

        <div className="tuiles" style={{ marginTop: 12 }}>
          <span className="tuile">
            <Icone nom="velo" taille={22} />
            <strong>{lieu.capacite}</strong>
            <span>{p('vélos maximum')}</span>
          </span>
          <span className="tuile">
            <Icone nom="oeil" taille={22} />
            <strong>{lieu.vues}</strong>
            <span>{p('vues de la fiche')}</span>
          </span>
          <span className="tuile">
            <Icone nom="coche" taille={22} />
            <strong>{lieu.gardes}</strong>
            <span>{p('gardes terminées')}</span>
          </span>
        </div>

        <div className="liste" style={{ marginTop: 16 }}>
          {lignes.map(([icone, titre, detail, href]) => (
            <Link key={href} href={href} className="ligne">
              <span className="ligne-icone">
                <Icone nom={icone} taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>{titre}</strong>
                <span>{detail}</span>
              </span>
              <Icone nom="chevron" taille={20} className="texte-leger" />
            </Link>
          ))}
          <div className="ligne ligne-info">
            <span className="ligne-icone">
              <Icone nom="horloge" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{p(DUREES_MAX_HEURES[lieu.dureeMaxHeures] ?? '')}</strong>
              <span>{p(DELAIS_DE_REPONSE[lieu.delaiDeReponse] ?? '')}</span>
            </span>
          </div>
        </div>

        <div className="boutons" style={{ marginTop: 16 }}>
          {lieu.publie ? (
            <Link href={`/emplacements/${reference}`} className="bouton contour">
              <Icone nom="oeil" taille={20} />
              {p('Voir ma fiche comme un cycliste')}
            </Link>
          ) : null}
          {lieu.publie || lieu.enPause ? (
            <form action={basculerLaPauseDuLieu}>
              <input type="hidden" name="reference" value={reference} />
              <input type="hidden" name="pause" value={lieu.enPause ? 'non' : 'oui'} />
              <button type="submit" className="bouton contour">
                <Icone nom={lieu.enPause ? 'coche' : 'horloge'} taille={20} />
                {lieu.enPause ? p('Reprendre les demandes') : p('Mettre en pause')}
              </button>
            </form>
          ) : null}
          <Link href={`/mes-lieux/${reference}/retirer`} className="bouton discret texte-rouge">
            <Icone nom="corbeille" taille={18} />
            {p('Retirer ce lieu')}
          </Link>
        </div>
      </div>
    </main>
  );
}
