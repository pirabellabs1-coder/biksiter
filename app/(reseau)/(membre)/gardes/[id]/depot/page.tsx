import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { EtapesDuDepot } from '@/components/app/depot';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { monProfil } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { ARRIVEE_AVANT_L_HEURE_MINUTES, peutSignalerSonArrivee } from '@/lib/regles/garde';
import { heureABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { gesteDirect } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Préparer le dépôt') };
}

/**
 * Première étape du dépôt sécurisé : ce qu'il faut avoir en tête avant de
 * sonner. Le cycliste signale son arrivée ici, puis photographie son vélo.
 */
export default async function PreparerLeDepot({ params }: { params: Promise<{ id: string }> }) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { id } = await params;
  const [garde, profil] = await Promise.all([detailDeLaGarde(membre.id, id), monProfil(membre.id)]);
  if (!garde) notFound();
  if (garde.role !== 'cycliste' || (garde.etat !== 'accepte' && garde.etat !== 'arrivee')) {
    redirect(`/gardes/${id}`);
  }

  const arrive = garde.etat === 'arrivee';
  const photosPrises = Boolean(garde.constats.depot);
  const electrique = garde.typeVelo === 'Électrique';
  const arriveePossible = peutSignalerSonArrivee(garde.debut, garde.fin, new Date());

  // Le dernier champ dit si la ligne parle d'identité vérifiée : elle prend alors le bleu.
  const points: [NomDIcone, string, string, boolean, boolean?][] = [
    [
      'verifie',
      p('Votre identité'),
      profil?.identiteVerifiee
        ? p('Votre identité est vérifiée : {prenom} le voit sur votre profil.', { prenom: garde.autre.prenom })
        : p('Votre identité n’est pas encore vérifiée.'),
      Boolean(profil?.identiteVerifiee),
      Boolean(profil?.identiteVerifiee),
    ],
    [
      'epingle',
      p('Votre arrivée'),
      arrive
        ? p('{prenom} sait que vous êtes devant la porte.', { prenom: garde.autre.prenom })
        : p('Signalez votre arrivée une fois devant la porte, à partir de {heure}.', {
            heure: heureABruxelles(new Date(garde.debut.getTime() - ARRIVEE_AVANT_L_HEURE_MINUTES * 60_000)),
          }),
      arrive,
    ],
    [
      'photo',
      p('Photos du vélo'),
      p('Vous allez photographier votre vélo sous plusieurs angles, avec ses éventuels défauts.'),
      photosPrises,
    ],
    ...(electrique
      ? [
          [
            'batterie',
            p('État de la batterie'),
            p('Vérifiez qu’elle n’est ni gonflée, ni chaude, ni abîmée.'),
            photosPrises,
          ] as [NomDIcone, string, string, boolean],
        ]
      : []),
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <EtapesDuDepot p={p} etape={1} />
        <h1 className="titre-ecran">{p('Préparer le dépôt')}</h1>
        <p className="sous-titre">{p('Quelques vérifications avant de confier votre vélo en toute sérénité.')}</p>

        <ul className="pile" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {points.map(([icone, titre, texte, fait, verifie]) => (
            <li key={titre} className="carte ligne ligne-info" style={{ alignItems: 'center' }}>
              <span className={verifie ? 'ligne-icone texte-verifie' : 'ligne-icone'} aria-hidden="true">
                <Icone nom={icone} taille={24} />
              </span>
              <span className="ligne-texte">
                <strong>{titre}</strong>
                <span>{texte}</span>
              </span>
              {fait ? (
                <span className={verifie ? 'rond-etat bleu' : 'rond-etat'} style={{ width: 28, height: 28, boxShadow: 'none' }}>
                  <Icone nom="coche" taille={16} strokeWidth={3} />
                  <span className="lecteur">{p('Fait')}</span>
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        {electrique ? (
          <Link href="/regles/batteries" className="encart lien-encart">
            <Icone nom="batterie" taille={22} />
            <span>{p('Ce qu’il faut vérifier sur la batterie')}</span>
            <Icone nom="chevron" taille={20} />
          </Link>
        ) : null}

        <div className="encart" style={{ marginTop: 12 }}>
          <Icone nom="info" taille={20} />
          <span>{p('Ces informations sécurisent la garde et protègent tout le monde.')}</span>
        </div>

        <div className="boutons" style={{ marginTop: 16 }}>
          {arrive ? (
            <Link href={`/gardes/${id}/${photosPrises ? 'remise' : 'constat'}/depot`} className="bouton plein">
              {p('Continuer')}
              <Icone nom="chevron" taille={20} />
            </Link>
          ) : arriveePossible ? (
            <form action={gesteDirect}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="geste" value="arriver" />
              <button type="submit" className="bouton plein" style={{ width: '100%' }}>
                <Icone nom="epingle" taille={20} />
                {p('Je suis devant la porte')}
              </button>
            </form>
          ) : (
            <>
              <button type="button" className="bouton plein" disabled>
                {p('Je suis devant la porte')}
              </button>
              <p className="petit texte-doux centre" style={{ margin: 0 }}>
                {p('Vous pourrez signaler votre arrivée une demi-heure avant l’heure du dépôt.')}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
