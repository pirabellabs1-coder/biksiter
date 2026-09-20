import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { EtapesDuDepot } from '@/components/app/depot';
import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { textes } from '@/lib/i18n/langue';
import {
  AUTEUR_DU_CONSTAT,
  constatPossible,
  ETATS_DECLARABLES,
  ETATS_DU_VELO,
  MOTIFS_DU_CONSTAT,
  PHOTOS_DU_CONSTAT,
  titreDeLaPhoto,
} from '@/lib/regles/constat';
import { exigerUnMembre } from '@/lib/session';

import { FormulaireDeConstat } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Photos du vélo') };
}

/**
 * Deuxième étape du dépôt, ou dernière de la restitution : le cycliste
 * photographie son vélo devant la porte, avant que le code ne soit saisi.
 */
export default async function Constat({
  params,
}: {
  params: Promise<{ id: string; phase: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { id, phase } = await params;
  if (phase !== 'depot' && phase !== 'reprise') notFound();

  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  if (garde.role !== AUTEUR_DU_CONSTAT[phase]) redirect(`/gardes/${id}`);
  // Déjà établi : le parcours continue par le code.
  if (garde.constats[phase]) redirect(`/gardes/${id}/remise/${phase}`);
  if (!constatPossible(phase, garde)) redirect(`/gardes/${id}`);

  const depot = phase === 'reprise' ? (garde.constats.depot ?? null) : null;
  const electrique = garde.typeVelo === 'Électrique';
  const checklistRetour = [
    p('Vérifiez l’état général du vélo'),
    ...(electrique ? [p('Contrôlez la batterie')] : []),
    p('Comparez avec les photos du dépôt'),
    p('Photos du vélo au retour'),
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <EtapesDuDepot p={p} etape={phase === 'depot' ? 2 : 4} />
        <h1 className="titre-ecran">
          {phase === 'depot' ? p('Photos avant la garde') : p('Photos de retour')}
        </h1>
        <p className="sous-titre">
          {phase === 'depot'
            ? p(
                'Photographiez votre vélo sous différents angles, avec ses éventuels défauts. {prenom} verra ces photos avant de saisir le code.',
                { prenom: garde.autre.prenom },
              )
            : p('Vérifiez votre vélo avant de repartir : ces photos se comparent à celles du dépôt.')}
        </p>

        {phase === 'reprise' ? (
          <div className="carte checklist" style={{ marginBottom: 16 }}>
            <strong>{p('Checklist retour')}</strong>
            <ul>
              {checklistRetour.map((point) => (
                <li key={point}>
                  <Icone nom="coche" taille={18} />
                  {point}
                </li>
              ))}
            </ul>
            {depot ? (
              <>
                <p className="petit texte-doux" style={{ margin: '12px 0 0' }}>
                  {p('Au dépôt')} · <strong>{p(ETATS_DU_VELO[depot.etat])}</strong>
                </p>
                {depot.rangs.length > 0 ? (
                  <div className="photos-de-constat">
                    {depot.rangs.map((rang) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={rang}
                        src={`/gardes/${id}/constat/depot/photo/${rang}`}
                        alt={p('Photo du dépôt : {angle}', { angle: p(titreDeLaPhoto(rang)) })}
                      />
                    ))}
                  </div>
                ) : null}
                {depot.note ? <p className="petit texte-doux">{depot.note}</p> : null}
                {depot.reserve ? (
                  <p className="petit texte-doux">
                    {p('Remarque du bike sitter : {remarque}', { remarque: depot.reserve })}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}

        <FormulaireDeConstat
          id={id}
          phase={phase}
          electrique={electrique}
          emplacements={PHOTOS_DU_CONSTAT.map(
            (photo) =>
              [
                photo.rang,
                p(photo.titre),
                photo.requise,
                p('Ajouter une photo : {angle}', { angle: p(photo.titre) }),
              ] as const,
          )}
          etats={ETATS_DECLARABLES.map((valeur) => [valeur, p(ETATS_DU_VELO[valeur])] as const)}
          textes={{
            photos: p('Photos du vélo'),
            facultative: p('facultative'),
            ajoutee: p('Photo ajoutée'),
            tropLourde: p('Une photo dépasse la taille autorisée. Il est conseillé de la reprendre directement avec l’appareil photo du téléphone.'),
            etat: p('État du vélo'),
            defaut: p('Description du défaut'),
            defautExemple: p('Rayure sur le cadre, garde-boue tordu…'),
            batterie: p('J’ai vérifié la batterie : elle n’est ni gonflée, ni chaude, ni abîmée.'),
            valider: p('Valider les photos'),
            envoi: p('Enregistrement…'),
            motifs: Object.fromEntries(MOTIFS_DU_CONSTAT.map((motif) => [motif, p(motif)])),
          }}
        />

        <div className="encart" style={{ marginTop: 16 }}>
          <Icone nom="bouclier" taille={22} />
          <span>
            {p(
              'Ce constat protège les deux parties. Il est horodaté, visible par vous deux, et ne peut plus être modifié une fois validé.',
            )}
          </span>
        </div>
      </div>
    </main>
  );
}
