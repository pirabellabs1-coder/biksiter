import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Urgence et vol') };
}

export default async function UrgenceEtVol() {
  await exigerUnMembre();
  const { p } = await textes();

  // Les numéros belges, gratuits et joignables sans crédit.
  const numeros: [NomDIcone, string, string, string][] = [
    ['alerte', '112', p('Urgences'), p('Pompiers et ambulance, en cas de danger pour une personne')],
    ['bouclier', '101', p('Police'), p('Un vol, une agression, une situation qui dégénère')],
    ['telephone', '1733', p('Médecin de garde'), p('Un souci de santé qui ne peut pas attendre, hors urgence vitale')],
  ];

  const etapesDuVol: [string, string][] = [
    [p('Mettez-vous en sécurité'), p('Ne poursuivez personne. Votre sécurité passe avant le vélo.')],
    [p('Prévenez la police'), p('Appelez le 101 ou rendez-vous au commissariat pour déclarer le vol.')],
    [p('Gardez les preuves'), p('Photos, heure, lieu, témoins : notez tout pendant que c’est frais.')],
    [p('Signalez-le sur la garde'), p('La garde est mise en pause et l’association reprend le dossier avec vous.')],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/aide" />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Urgence et vol')}</h1>
        <p className="sous-titre">
          {p('En cas de danger ou de vol, voici les bons réflexes et les numéros à appeler.')}
        </p>

        <h2 className="titre-section">{p('Numéros d’urgence en Belgique')}</h2>
        <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
          {numeros.map(([icone, numero, titre, detail]) => (
            <li key={numero}>
              <a href={`tel:${numero}`} className="ligne">
                <span className="ligne-icone texte-rouge" aria-hidden="true">
                  <Icone nom={icone} taille={24} />
                </span>
                <span className="ligne-texte">
                  <strong>
                    {titre} · <span style={{ display: 'inline', fontSize: 'inherit', color: 'inherit' }}>{numero}</span>
                  </strong>
                  <span>{detail}</span>
                </span>
                <Icone nom="telephone" taille={20} className="texte-leger" />
              </a>
            </li>
          ))}
        </ul>
        <p className="petit texte-doux" style={{ marginTop: 8 }}>
          {p('Les appels au 112 et au 101 sont gratuits.')}
        </p>

        <h2 className="titre-section">{p('Si votre vélo a été volé')}</h2>
        <ol className="suivi">
          {etapesDuVol.map(([titre, texte], rang) => (
            <li key={titre}>
              <span
                className="suivi-point"
                aria-hidden="true"
                style={{ borderColor: 'var(--trust)', color: 'var(--trust-deep)', fontSize: 12, fontWeight: 800 }}
              >
                {rang + 1}
              </span>
              <span className="ligne-texte">
                <strong>{titre}</strong>
                <span>{texte}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="encart" style={{ marginTop: 12 }}>
          <Icone nom="velo" taille={22} />
          <span>
            {p('Le numéro de cadre enregistré dans vos vélos aide la police à retrouver un vélo volé.')}{' '}
            <Link href="/profil/velos" className="lien-souligne">
              {p('Mes vélos')}
            </Link>
          </span>
        </div>

        <div className="boutons" style={{ marginTop: 16 }}>
          <Link href="/gardes?onglet=en-cours" className="bouton plein">
            <Icone nom="alerte" taille={20} />
            {p('Signaler un problème sur une garde')}
          </Link>
          <Link href="/contact" className="bouton contour">
            <Icone nom="messages" taille={20} />
            {p('Écrire à l’association')}
          </Link>
        </div>
      </div>
    </main>
  );
}
