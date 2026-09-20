import type { Metadata } from 'next';
import Link from 'next/link';

import { NavigationDAdministration } from '@/components/app/administration';
import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { activiteRecente, tableauDeBord } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Administration') };
}

export default async function TableauDeBordAdmin() {
  await exigerUnModerateur();
  const { p } = await textes();
  const [chiffres, activite] = await Promise.all([tableauDeBord(), activiteRecente()]);

  const tuiles: [NomDIcone, number, string, string, string][] = [
    ['verifie', chiffres.verificationsEnAttente, p('vérifications d’identité en attente'), '/administration/verifications', 'ambre'],
    ['velo', chiffres.gardesActives, p('gardes actives'), '/administration/statistiques', ''],
    ['alerte', chiffres.litigesEnCours, p('litiges en cours'), '/administration/litiges', 'rouge'],
    ['drapeau', chiffres.signalementsOuverts, p('signalements à traiter'), '/administration/signalements', 'ambre'],
  ];
  const libelleDeLActivite: Record<string, [NomDIcone, string]> = {
    verification: ['verifie', p('Nouvelle demande de vérification')],
    garde: ['velo', p('Garde commencée')],
    signalement: ['drapeau', p('Nouveau signalement')],
    litige: ['alerte', p('Litige ouvert')],
  };

  return (
    <main id="contenu">
      <EnTete p={p} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Tableau de bord')}</h1>
        <p className="periode">
          <Icone nom="calendrier" taille={18} />
          {p('Aujourd’hui, {date}', { date: jourAffiche(jourABruxelles()) })}
        </p>
        <NavigationDAdministration p={p} actif="tableau" />

        <div className="grille-de-cartes" style={{ alignItems: 'stretch' }}>
          {tuiles.map(([icone, valeur, libelle, href, ton]) => (
            <Link key={href + libelle} href={href} className="carte" style={{ display: 'grid', gap: 4 }}>
              <Icone nom={icone} taille={24} className={ton === 'rouge' ? 'texte-rouge' : 'texte-vert'} />
              <strong style={{ fontSize: 26 }}>{valeur}</strong>
              <span className="petit texte-doux">{libelle}</span>
            </Link>
          ))}
        </div>

        {chiffres.envoisEnEchec > 0 ? (
          <div className="encart rouge" style={{ marginTop: 12 }}>
            <Icone nom="alerte" taille={22} />
            <span>
              {p('{n} e-mail(s) n’ont pas pu partir. Vérifiez la configuration de l’envoi.', {
                n: chiffres.envoisEnEchec,
              })}
            </span>
          </div>
        ) : null}

        <h2 className="titre-section">{p('Activité récente')}</h2>
        {activite.length === 0 ? (
          <div className="carte vide-liste">
            <strong>{p('Rien de neuf pour l’instant.')}</strong>
          </div>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
            {activite.map((evenement, rang) => {
              const [icone, titre] = libelleDeLActivite[evenement.type] ?? ['info', evenement.type];
              return (
                <li key={`${evenement.lien}-${rang}`}>
                  <Link href={evenement.lien} className="ligne">
                    <span className="ligne-icone" aria-hidden="true">
                      <Icone nom={icone} taille={22} />
                    </span>
                    <span className="ligne-texte">
                      <strong>{titre}</strong>
                      <span>
                        {evenement.prenom} ·{' '}
                        {jourABruxelles(new Date(evenement.quand)) === jourABruxelles()
                          ? heureABruxelles(new Date(evenement.quand))
                          : jourAffiche(jourABruxelles(new Date(evenement.quand)))}
                      </span>
                    </span>
                    <Icone nom="chevron" taille={20} className="texte-leger" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
