import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { dateDeGarde } from '@/components/app/garde';
import { Icone } from '@/components/app/icone';
import { referenceDeGarde } from '@/components/membre/garde';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Suivi du signalement') };
}

function quand(instant: Date): string {
  return `${jourAffiche(jourABruxelles(instant))} · ${heureABruxelles(instant)}`;
}

/**
 * Le suivi d'une garde signalée : ce qui a été reçu, où en est l'examen, ce
 * qui vient. La décision s'inscrit dans la frise de la garde quand la
 * modération la prend.
 */
export default async function SuiviDuSignalement({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { id } = await params;
  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();

  const ouverture = [...garde.evenements].reverse().find((e) => e.etape === 'litige');
  if (!ouverture) redirect(`/gardes/${id}`);
  const decision = garde.evenements.find(
    (e) => e.acteur === 'moderation' && new Date(e.faitLe) > new Date(ouverture.faitLe),
  );
  const enExamen = garde.etat === 'litige' && !decision;

  const etapes: { titre: string; texte: string; etat: 'fait' | 'maintenant' | 'a-venir' }[] = [
    {
      titre: p('Signalement reçu'),
      texte: quand(new Date(ouverture.faitLe)),
      etat: 'fait',
    },
    {
      titre: p('En cours d’examen'),
      texte: p('Une personne de la modération relit l’historique complet de la garde et les constats.'),
      etat: enExamen ? 'maintenant' : 'fait',
    },
    {
      titre: p('Décision'),
      texte: decision
        ? decision.note ?? quand(new Date(decision.faitLe))
        : p('Nous vous prévenons dès qu’une décision est prise.'),
      etat: decision ? 'fait' : 'a-venir',
    },
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Suivi du signalement')}</h1>
        <p className="sous-titre">{p('Nous vous informons à chaque étape.')}</p>

        <div className="carte ligne ligne-info" style={{ alignItems: 'flex-start' }}>
          <span className="ligne-icone texte-rouge" aria-hidden="true">
            <Icone nom="alerte" taille={24} />
          </span>
          <span className="ligne-texte">
            <strong>{p('Dossier {reference}', { reference: referenceDeGarde(garde.id) })}</strong>
            <span>{dateDeGarde(p, garde.debut, garde.fin)}</span>
            {ouverture.note ? <span>{p('Motif : {motif}', { motif: ouverture.note })}</span> : null}
            <span className={enExamen ? 'pastille ambre' : 'pastille'} style={{ marginTop: 6 }}>
              {enExamen ? p('En cours d’examen') : p('Examen terminé')}
            </span>
          </span>
        </div>

        <ol className="suivi" style={{ marginTop: 16 }}>
          {etapes.map((etape) => (
            <li key={etape.titre} className={etape.etat}>
              <span className="suivi-point" aria-hidden="true">
                {etape.etat === 'fait' ? <Icone nom="coche" taille={14} strokeWidth={3} /> : null}
              </span>
              <span className="ligne-texte">
                <strong>{etape.titre}</strong>
                <span>{etape.texte}</span>
              </span>
            </li>
          ))}
        </ol>

        {enExamen ? (
          <div className="encart ambre">
            <Icone nom="cadenas" taille={22} />
            <span>
              <strong>{p('La garde est en pause pendant l’examen.')}</strong>
              {p('Ni vous ni {prenom} ne pouvez la faire avancer d’ici là. Les messages restent ouverts.', {
                prenom: garde.autre.prenom,
              })}
            </span>
          </div>
        ) : null}

        <div className="boutons" style={{ marginTop: 16 }}>
          <Link href="/contact" className="bouton contour">
            <Icone nom="messages" taille={20} />
            {p('Ajouter des précisions pour l’association')}
          </Link>
          <Link href="/urgence" className="bouton discret texte-rouge">
            <Icone nom="alerte" taille={18} />
            {p('Urgence ou vol')}
          </Link>
        </div>
      </div>
    </main>
  );
}
