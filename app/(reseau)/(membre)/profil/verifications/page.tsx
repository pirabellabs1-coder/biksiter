import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { etatDuCompte } from '@/lib/depot/comptes';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes vérifications') };
}

export default async function MesVerifications() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const compte = await etatDuCompte(membre.id);
  if (!compte) return null;

  const lignes: {
    icone: NomDIcone;
    titre: string;
    detail: string;
    etat: 'verifie' | 'examen' | 'a_faire';
    lien: string;
  }[] = [
    {
      icone: 'envoyer',
      titre: p('E-mail'),
      detail: p('Confirmé par lien'),
      etat: compte.emailVerifieLe ? 'verifie' : 'a_faire',
      lien: '/confirmer-mon-email',
    },
    {
      icone: 'telephone',
      titre: p('Téléphone'),
      detail: p(
        'Confirmé par SMS · communiqué à l’autre personne pendant une garde acceptée, et à elle seule',
      ),
      etat: compte.telephoneVerifieLe ? 'verifie' : 'a_faire',
      lien: '/inscription/telephone',
    },
    {
      icone: 'profil',
      titre: p('Identité'),
      detail: p('Pièce vérifiée puis supprimée'),
      etat:
        compte.verification === 'verifiee'
          ? 'verifie'
          : compte.verification === 'en_cours'
            ? 'examen'
            : 'a_faire',
      lien: '/inscription/identite',
    },
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Mes vérifications')}</h1>
        <p className="sous-titre">
          {p('Une identité vérifiée est nécessaire pour publier un emplacement ou envoyer une demande de garde.')}
        </p>

        <ul className="liste" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {lignes.map((ligne, rang) => (
            <li key={ligne.titre} className="ligne ligne-info">
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom={ligne.icone} taille={22} />
              </span>
              <span className="ligne-texte">
                <strong id={`verification-${rang}`}>{ligne.titre}</strong>
                <span>{ligne.detail}</span>
              </span>
              {ligne.etat === 'verifie' ? (
                <span className="pastille bleu">
                  <Icone nom="verifie" taille={14} />
                  {p('Vérifié')}
                </span>
              ) : ligne.etat === 'examen' ? (
                <span className="pastille ambre">
                  <Icone nom="horloge" taille={14} />
                  {p('En cours d’examen')}
                </span>
              ) : (
                <Link
                  href={ligne.lien}
                  className="bouton contour petit"
                  aria-describedby={`verification-${rang}`}
                >
                  {p('Vérifier')}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="encart bleu" style={{ marginTop: 12 }}>
          <Icone nom="cadenas" taille={22} />
          <span>
            {p(
              'Votre pièce d’identité n’est jamais conservée. Elle est supprimée dès la validation, et au plus tard après sept jours. Seul le résultat est enregistré.',
            )}
          </span>
        </div>
      </div>
    </main>
  );
}
