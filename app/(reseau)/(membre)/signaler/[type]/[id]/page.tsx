import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { cibleDuSignalement } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { FormulaireDeSignalement } from './formulaire';

/** Les motifs sont enregistrés en français ; seul leur libellé se traduit. */
const MOTIFS = {
  membre: [
    'Comportement inapproprié',
    'Harcèlement',
    'Faux profil',
    "Ne s'est pas présenté",
    'Autre',
  ],
  emplacement: [
    'Lieu non sûr',
    'Photos trompeuses',
    'Emplacement partagé',
    'Annonce en double',
    'Autre',
  ],
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Signaler') };
}

export default async function Signaler({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { type, id } = await params;
  if (type !== 'membre' && type !== 'emplacement') notFound();
  const { p } = await textes();
  const cible = await cibleDuSignalement(membre.id, type, id);
  if (!cible) notFound();

  const retour = type === 'membre' ? `/membres/${id}` : `/emplacements/${id}`;
  const libelle =
    cible.type === 'membre'
      ? cible.nom
      : p('{type} à {quartier}', {
          type: p(cible.genre),
          quartier: cible.quartier,
        });

  return (
    <main id="contenu">
      <EnTete p={p} retour={retour} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">
          {type === 'membre' ? p('Signaler un membre') : p('Signaler un emplacement')}
        </h1>
        <p className="sous-titre">
          {p(
            'Votre signalement concerne {cible} et sera examiné par un modérateur, avec l’historique des gardes concernées.',
            { cible: libelle },
          )}
        </p>

        <div className="ligne carte ligne-info" style={{ marginBottom: 6 }}>
          {cible.type === 'membre' ? (
            <span className="avatar-app" aria-hidden="true">
              {cible.nom.charAt(0)}
            </span>
          ) : (
            <span className="ligne-icone fond-vert" aria-hidden="true">
              <Icone nom="maison" taille={22} />
            </span>
          )}
          <span className="ligne-texte">
            <strong>{libelle}</strong>
          </span>
        </div>

        <FormulaireDeSignalement
          type={type}
          id={id}
          retour={retour}
          motifs={MOTIFS[type].map((motif) => [motif, p(motif)] as const)}
          textes={{
            motif: p('Motif'),
            details: p('Détails'),
            exemple: p('Ce qui s’est passé…'),
            discretion: p(
              'La personne signalée n’est pas informée de votre identité.',
            ),
            envoyer: p('Envoyer le signalement'),
            envoi: p('Envoi…'),
            annuler: p('Annuler'),
          }}
        />
      </div>
    </main>
  );
}
