import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icone, type NomDIcone } from '@/components/app/icone';
import { EnTeteDuSite } from '@/components/site/en-tete-du-site';
import { PiedPublic } from '@/components/site/pied-public';
import type { SectionDeTexte } from '@/lib/contenu/conditions';
import type { Textes } from '@/lib/i18n/langue';

/**
 * Une page du site public : l'en-tête du site, un bandeau de titre sur toute
 * la largeur, puis le contenu aligné sur l'en-tête.
 *
 * Sur ordinateur, le contenu garde sa largeur de lecture et une colonne
 * latérale l'accompagne — sommaire, contact, liens — plutôt qu'une colonne
 * étroite perdue au milieu de l'écran.
 */
export function PagePublique({
  textes,
  titre,
  introduction,
  surtitre,
  enTete,
  cote,
  coteAGauche = false,
  retour = '/',
  children,
}: {
  textes: Textes;
  titre: string;
  introduction?: string;
  surtitre?: string;
  /** Sous le titre, dans le bandeau : une recherche, une date de version. */
  enTete?: ReactNode;
  /** La colonne latérale, sur ordinateur ; sous le contenu, sur téléphone. */
  cote?: ReactNode;
  /** Un sommaire se lit à gauche ; un complément, à droite. */
  coteAGauche?: boolean;
  retour?: string;
  children: ReactNode;
}) {
  return (
    <>
      <EnTeteDuSite p={textes.p} retour={retour} />
      <main id="contenu" className="page-publique">
        <div className="bande-titre">
          <div className="contenu-public">
            {surtitre ? <p className="surtitre-public">{surtitre}</p> : null}
            <h1 className="titre-page">{titre}</h1>
            {introduction ? (
              <p className="introduction-page">{introduction}</p>
            ) : null}
            {enTete ? <div className="bande-titre-plus">{enTete}</div> : null}
          </div>
        </div>
        <div
          className={[
            'contenu-public',
            'corps-de-page',
            cote ? 'avec-cote' : '',
            cote && coteAGauche ? 'cote-a-gauche' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="corps-principal">{children}</div>
          {cote ? <aside className="corps-cote">{cote}</aside> : null}
        </div>
      </main>
      <PiedPublic {...textes} />
    </>
  );
}

/** Un bloc de la colonne latérale : un titre, puis son contenu. */
export function BlocDeCote({
  titre,
  children,
}: {
  titre: string;
  children: ReactNode;
}) {
  return (
    <section className="bloc-de-cote">
      <h2>{titre}</h2>
      {children}
    </section>
  );
}

/** Une liste de liens, avec leur pictogramme. */
export function ListeDeLiens({
  liens,
}: {
  liens: readonly (readonly [NomDIcone, string, string])[];
}) {
  return (
    <ul className="liste-de-liens">
      {liens.map(([icone, libelle, href]) => (
        <li key={href}>
          <Link href={href}>
            <Icone nom={icone} taille={20} />
            <span>{libelle}</span>
            <Icone nom="chevron" taille={16} className="texte-leger" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Un sommaire : les entrées d'une page, numérotées ou non. */
export function Sommaire({
  entrees,
  numerote = false,
}: {
  entrees: readonly (readonly [string, string])[];
  numerote?: boolean;
}) {
  return (
    <ol className={numerote ? 'sommaire numerote' : 'sommaire'}>
      {entrees.map(([libelle, href], rang) => (
        <li key={href}>
          <Link href={href}>
            {numerote ? (
              <span className="sommaire-numero">{rang + 1}</span>
            ) : null}
            {libelle}
          </Link>
        </li>
      ))}
    </ol>
  );
}

/**
 * La version d'un texte de référence : sa date une fois validée, ou la mention
 * d'une version de travail.
 */
export function VersionDuTexte({
  textes: { p, langue },
  miseAJour,
}: {
  textes: Textes;
  /** La date de la version validée ; `null` pour une version de travail. */
  miseAJour: string | null;
}) {
  if (miseAJour === null) {
    return (
      <p className="pastille ambre">
        <Icone nom="horloge" taille={14} />
        {p('Version de travail, en attente de relecture juridique')}
      </p>
    );
  }
  const date = new Intl.DateTimeFormat(`${langue}-BE`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Brussels',
  }).format(new Date(`${miseAJour}T12:00:00Z`));
  return (
    <p className="petit texte-doux">
      {p('Dernière mise à jour : {date}', { date })}
    </p>
  );
}

/**
 * Des sections repliées, numérotées comme dans les maquettes : on parcourt les
 * titres, on ouvre celle qu'on veut lire. Un lien vers `?section=` en ouvre une.
 */
export function SectionsDeTexte({
  p,
  sections,
  ouverte,
}: {
  p: Textes['p'];
  sections: readonly SectionDeTexte[];
  ouverte?: string;
}) {
  return (
    <div className="pile">
      {sections.map((section, rang) => (
        <details
          key={section.cle}
          id={section.cle}
          className="carte rubrique-d-aide"
          open={ouverte === section.cle}
        >
          <summary
            className="ligne sans-cadre"
            style={{ padding: 0, listStyle: 'none' }}
          >
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom={section.icone} taille={24} />
            </span>
            <span className="ligne-texte">
              <strong>
                {rang + 1}. {p(section.titre)}
              </strong>
              <span>{p(section.resume)}</span>
            </span>
            <Icone nom="chevron" taille={20} className="texte-leger" />
          </summary>
          <div className="texte-de-section">
            {section.paragraphes.map((paragraphe) => (
              <p key={paragraphe}>{p(paragraphe, section.valeurs)}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
