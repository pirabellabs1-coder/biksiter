import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { nomPublic } from '@/components/membre/elements';
import { profilPublic } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import {
  AVIS_POUR_AFFICHER_UNE_NOTE,
  moyenne,
} from '@/lib/regles/avis-de-garde';
import { presence } from '@/lib/regles/notifications';
import { exigerUnMembre } from '@/lib/session';

import { bloquerOuDebloquer } from '../../profil/actions';
import { CarteDAvisPublie } from '../../profil/avis/carte-d-avis';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  // Le nom d'une personne n'a rien à faire dans l'historique du navigateur.
  return { title: p('Profil') };
}

export default async function ProfilDUnMembre({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id } = await params;
  const { p } = await textes();
  const profil = await profilPublic(membre.id, id);
  if (!profil) notFound();

  if (profil === 'refuse') {
    return (
      <main id="contenu">
        <EnTete p={p} retour="/recherche" cloche={false} />
        <div className="ecran-app ecran-large">
          <h1 className="titre-ecran">{p('Profil')}</h1>
          <div className="carte vide-liste" style={{ marginTop: 14 }}>
            <Icone nom="cadenas" taille={30} />
            <strong>{p('Ce profil n’est pas public.')}</strong>
            <span>
              {p('Le profil d’un membre s’affiche pour les personnes avec qui il a partagé une garde.')}
            </span>
          </div>
        </div>
      </main>
    );
  }

  const soiMeme = profil.id === membre.id;
  const commeBikeSitter = profil.bikeSitter && !soiMeme;
  const note =
    profil.avis.length >= AVIS_POUR_AFFICHER_UNE_NOTE
      ? moyenne(profil.avis.map((avis) => avis.note))
      : null;
  const gardes = commeBikeSitter ? profil.velosAccueillis : profil.velosConfies;
  const nom = nomPublic(profil.prenom, profil.initiale);
  const enLigne = presence(profil.vuLe ? new Date(profil.vuLe) : null, new Date());

  return (
    <main id="contenu">
      <EnTete p={p} retour={soiMeme ? '/profil' : '/recherche'} cloche={false} />
      <div className="ecran-app ecran-large fiche-detail">
        <h1 className="titre-ecran">
          {soiMeme ? p('Aperçu du profil public') : p('Profil')}
        </h1>

        {profil.bloque ? (
          <div className="encart rouge" role="status" style={{ margin: '12px 0 10px' }}>
            <Icone nom="alerte" taille={22} />
            <span>{p('Vous avez bloqué ce compte. Il ne peut plus vous contacter.')}</span>
          </div>
        ) : null}

        <div className="carte carte-profil" style={{ marginTop: 12 }}>
          <span className="avatar-app grand" aria-hidden="true">
            {profil.prenom.charAt(0)}
          </span>
          {/* Pas de .ligne-texte ici : sa règle sur les span écraserait les pastilles. */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong className="nom-profil">{nom}</strong>
            <span className="pastilles">
              {profil.emailVerifie ? (
                <span className="pastille bleu">
                  <Icone nom="verifie" taille={14} />
                  {p('E-mail vérifié')}
                </span>
              ) : null}
              {profil.telephoneVerifie ? (
                <span className="pastille bleu">
                  <Icone nom="telephone" taille={14} />
                  {p('Téléphone vérifié')}
                </span>
              ) : null}
              {profil.identiteVerifiee ? (
                <span className="pastille bleu">
                  <Icone nom="verifie" taille={14} />
                  {p('Identité vérifiée')}
                </span>
              ) : (
                <span className="pastille gris">{p('Identité non vérifiée')}</span>
              )}
              {profil.bikeSitter ? (
                <span className="pastille bleu">
                  <Icone nom="bouclier" taille={14} />
                  {p('Bike Sitter vérifié')}
                </span>
              ) : null}
            </span>
            {enLigne ? (
              <span className="petit texte-doux" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  className={enLigne.enLigne ? 'point-etat vert' : 'point-etat gris'}
                  style={{ width: 8, height: 8 }}
                  aria-hidden="true"
                />
                {p(enLigne.texte, enLigne.valeurs)}
              </span>
            ) : null}
          </div>
        </div>

        <ul className="liste faits-fiche">
          <li className="ligne">
            <span className="ligne-icone note-fiche">
              <Icone nom="etoile" taille={20} plein />
            </span>
            <span className="ligne-texte">
              {note !== null
                ? p('{note} · {n} avis', {
                    note: note.toFixed(1).replace('.', ','),
                    n: profil.avis.length,
                  })
                : gardes > 0
                  ? p("Pas encore assez d'avis pour une note")
                  : p('Nouveau membre')}
            </span>
          </li>
          <li className="ligne">
            <span className="ligne-icone">
              <Icone nom="velo" taille={20} />
            </span>
            <span className="ligne-texte">
              {commeBikeSitter
                ? p('{n} vélos accueillis', { n: profil.velosAccueillis })
                : p('{n} gardes', { n: profil.velosConfies })}
            </span>
          </li>
          <li className="ligne">
            <span className="ligne-icone">
              <Icone nom="calendrier" taille={20} />
            </span>
            <span className="ligne-texte">
              {p('Membre depuis {annee}', { annee: profil.membreDepuis })}
            </span>
          </li>
        </ul>

        {profil.emplacements.length > 0 ? (
          <>
            <h2 className="titre-section">{p('Emplacements proposés')}</h2>
            <div className="pile">
              {profil.emplacements.map((emplacement) => (
                <Link
                  key={emplacement.reference}
                  href={`/emplacements/${emplacement.reference}`}
                  className="ligne carte"
                >
                  <span className="ligne-icone">
                    <Icone nom="maison" taille={22} />
                  </span>
                  <span className="ligne-texte">
                    <strong>{p(emplacement.type)}</strong>
                    <span>
                      {p('{n} vélos · {quartier}', {
                        n: emplacement.capacite,
                        quartier: emplacement.quartier,
                      })}
                    </span>
                  </span>
                  <Icone nom="chevron" taille={20} className="texte-leger" />
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <h2 className="titre-section">{p('Avis reçus')}</h2>
        {profil.avis.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="etoile" taille={30} />
            <span>
              {gardes > 0
                ? p('Pas encore d’avis publié.')
                : p('Nouveau membre — pas encore d’avis.')}
            </span>
          </div>
        ) : (
          profil.avis.map((avis) => <CarteDAvisPublie key={avis.id} p={p} avis={avis} />)
        )}

        {soiMeme ? null : (
          <div className="deux-colonnes" style={{ marginTop: 18 }}>
            <Link href={`/signaler/membre/${profil.id}`} className="bouton contour">
              <Icone nom="drapeau" taille={18} />
              {p('Signaler')}
            </Link>
            <form action={bloquerOuDebloquer}>
              <input type="hidden" name="id" value={profil.id} />
              <button
                type="submit"
                className={profil.bloque ? 'bouton contour' : 'bouton danger-contour'}
              >
                {profil.bloque ? p('Débloquer') : p('Bloquer')}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
