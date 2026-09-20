import type { Metadata } from 'next';
import Link from 'next/link';

import { basculerLeClassement } from '@/app/(reseau)/(membre)/classement/actions';
import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { apparaitAuClassement } from '@/lib/depot/progression';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Confidentialité et sécurité') };
}

export default async function Confidentialite() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const apparait = await apparaitAuClassement(membre.id);

  const liens: [NomDIcone, string, string, string][] = [
    ['utilisateurs', p('Membres bloqués'), '/profil/bloques', p('Les comptes bloqués ne peuvent plus vous contacter ni vous demander une garde.')],
    ['document', p('Politique de confidentialité'), '/confidentialite', p('Voici les données conservées, leur usage et leur durée de conservation.')],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/parametres" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Confidentialité et sécurité')}</h1>
        <p className="sous-titre">{p('Vous choisissez ici ce que les autres membres peuvent voir de votre profil.')}</p>

        <div className="encart">
          <Icone nom="bouclier" taille={34} />
          <span>
            <strong>{p('Vos informations sont protégées.')}</strong>
            {p('Les autres membres voient uniquement votre prénom et l’initiale de votre nom. Votre nom complet et votre adresse e-mail restent confidentiels.')}
          </span>
        </div>

        <ul className="liste" style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="epingle" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{p('Adresse exacte après acceptation')}</strong>
              <span>{p('Votre adresse est communiquée uniquement au membre dont vous acceptez la garde. Avant l’acceptation, seule la zone approximative de l’emplacement apparaît sur la fiche.')}</span>
              <span className="pastille" style={{ width: 'fit-content', marginTop: 4 }}>
                <Icone nom="cadenas" taille={13} />
                {p('Toujours actif')}
              </span>
            </span>
          </li>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="telephone" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{p('Numéro de téléphone')}</strong>
              <span>{p('Ce numéro est communiqué uniquement au membre concerné pendant une garde acceptée. Il n’est plus visible à la fin de la garde.')}</span>
            </span>
          </li>
        </ul>

        <form action={basculerLeClassement} className="carte interrupteur-demandes" style={{ marginTop: 12 }}>
          <input type="hidden" name="apparaitre" value={apparait ? 'non' : 'oui'} />
          <input type="hidden" name="retour" value="confidentialite" />
          <span className="ligne-texte">
            <strong>{p('Apparaître dans le classement')}</strong>
            <span>
              {apparait
                ? p('Le classement Top Bike Sitters affiche uniquement votre prénom et vos points. Votre adresse et votre quartier n’y apparaissent pas.')
                : p('Vous n’apparaissez pas dans le Top Bike Sitters.')}
            </span>
          </span>
          <button
            type="submit"
            role="switch"
            aria-checked={apparait}
            aria-label={p('Apparaître dans le classement')}
            className="interrupteur"
          />
        </form>

        <nav className="liste" style={{ marginTop: 12 }} aria-label={p('Confidentialité et sécurité')}>
          {liens.map(([icone, titre, href, detail]) => (
            <Link key={href} href={href} className="ligne">
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom={icone} taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>{titre}</strong>
                <span>{detail}</span>
              </span>
              <Icone nom="chevron" taille={20} className="texte-leger" />
            </Link>
          ))}
          {/* Un téléchargement, pas une page : le routeur ne doit pas l'intercepter. */}
          <a href="/profil/export" className="ligne" download>
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="document" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{p('Télécharger mes données')}</strong>
              <span>{p('Un fichier qui contient l’ensemble des informations vous concernant.')}</span>
            </span>
            <Icone nom="chevron" taille={20} className="texte-leger" />
          </a>
        </nav>

        <div className="encart rouge" style={{ marginTop: 12, alignItems: 'center' }}>
          <Icone nom="corbeille" taille={22} />
          <span>
            <strong>{p('Supprimer mon compte')}</strong>
            {p('Vos données personnelles sont effacées. Cette action est définitive.')}
          </span>
        </div>
        <div className="boutons" style={{ marginTop: 10 }}>
          <Link href="/profil/supprimer" className="bouton danger-contour">
            {p('Supprimer mon compte')}
          </Link>
        </div>
      </div>
    </main>
  );
}
