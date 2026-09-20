import type { Metadata } from 'next';
import Link from 'next/link';

import { choisirLeMode } from '@/app/(reseau)/(membre)/mode/actions';
import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { monProfil } from '@/lib/depot/membre-espace';
import { NOMS_DES_LANGUES, textes } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import { exigerUnMembre } from '@/lib/session';

import { seDeconnecterDeLEspace } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Paramètres') };
}

export default async function Parametres() {
  const membre = await exigerUnMembre();
  const { p, langue } = await textes();
  const [profil, mode] = await Promise.all([monProfil(membre.id), modeCourant()]);
  if (!profil) return null;

  const lignes: [NomDIcone, string, string][] = [
    ['profil', p('Informations personnelles'), '/profil/modifier'],
    ['verifie', p('Vérification'), '/profil/verifications'],
    ['velo', p('Mes vélos'), '/profil/velos'],
    ['cloche', p('Notifications'), '/profil/preferences'],
    ['globe', p('Langue : {langue}', { langue: NOMS_DES_LANGUES[langue] }), '/profil/langue'],
    ['utilisateurs', p('Accessibilité'), '/profil/accessibilite'],
    ['bouclier', p('Confidentialité et sécurité'), '/profil/confidentialite'],
    ['aide', p('Centre d’aide'), '/aide'],
    ['document', p('Conditions et règles'), '/conditions-generales'],
    ['info', p('À propos de Bike Sitters'), '/a-propos'],
  ];
  const autreMode = mode === 'bike_sitter' ? 'cycliste' : 'bike_sitter';

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Paramètres')}</h1>

        <Link href="/profil/modifier" className="carte carte-profil">
          <span className="avatar-app grand" aria-hidden="true">
            {profil.prenom.charAt(0)}
          </span>
          <span className="ligne-texte">
            <strong className="nom-profil">
              {profil.prenom} {profil.initiale}.
            </strong>
            <span className="petit">{p('Membre depuis {annee}', { annee: profil.membreDepuis })}</span>
            {profil.identiteVerifiee ? (
              <span className="pastille bleu" style={{ width: 'fit-content' }}>
                <Icone nom="verifie" taille={14} />
                {p('Identité vérifiée')}
              </span>
            ) : null}
          </span>
          <Icone nom="chevron" taille={20} className="texte-leger" />
        </Link>

        <nav className="liste" style={{ marginTop: 12 }} aria-label={p('Paramètres')}>
          {lignes.map(([icone, titre, href]) => (
            <Link key={href} href={href} className="ligne">
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom={icone} taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>{titre}</strong>
              </span>
              <Icone nom="chevron" taille={20} className="texte-leger" />
            </Link>
          ))}
        </nav>

        <form action={choisirLeMode} style={{ marginTop: 12 }}>
          <input type="hidden" name="mode" value={autreMode} />
          <button type="submit" className="encart lien-encart" style={{ width: '100%', border: 0, font: 'inherit', textAlign: 'left', cursor: 'pointer', marginTop: 0 }}>
            <Icone nom={autreMode === 'bike_sitter' ? 'maison' : 'velo'} taille={28} />
            <span>
              <strong>
                {autreMode === 'bike_sitter'
                  ? p('Passer en mode Bike Sitter')
                  : p('Passer en mode Cycliste')}
              </strong>
              {autreMode === 'bike_sitter'
                ? p('Accueillez des vélos et gagnez des points.')
                : p('Trouvez une place pour votre vélo.')}
            </span>
            <Icone nom="chevron" taille={20} />
          </button>
        </form>

        <div className="boutons" style={{ marginTop: 16 }}>
          <form action={seDeconnecterDeLEspace}>
            <button type="submit" className="bouton contour" style={{ width: '100%' }}>
              <Icone nom="deconnexion" taille={20} />
              {p('Se déconnecter')}
            </button>
          </form>
          <Link href="/profil/supprimer" className="bouton discret texte-rouge">
            <Icone nom="corbeille" taille={18} />
            {p('Supprimer mon compte')}
          </Link>
        </div>
      </div>
    </main>
  );
}
