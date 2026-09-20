import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { lieuDuMembre } from '@/lib/depot/lieux';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Lieu enregistré') };
}

/** La fin du parcours « Devenir Bike Sitter » : ce qui est fait, et ce qui vient. */
export default async function LieuEnregistre({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { reference } = await params;
  const lieu = await lieuDuMembre(membre.id, reference);
  if (!lieu) notFound();

  const etapes: [boolean, string, string][] = [
    [
      lieu.identiteVerifiee,
      p('Identité vérifiée'),
      lieu.identiteVerifiee
        ? p('Votre identité a été confirmée.')
        : p('Envoyez votre pièce d’identité : une personne de l’association la vérifie.'),
    ],
    [
      lieu.nombreDePhotos > 0,
      p('Photos du lieu'),
      lieu.nombreDePhotos > 0
        ? p('{n} photo(s) ajoutée(s).', { n: lieu.nombreDePhotos })
        : p('Aucune photo pour l’instant : vous pourrez en ajouter à tout moment.'),
    ],
    [
      lieu.publie,
      p('Publication'),
      lieu.publie
        ? p('Votre lieu apparaît dans les recherches.')
        : p('Nous vous prévenons dès que votre lieu est en ligne.'),
    ],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/mes-lieux" cloche={false} />
      <div className="ecran-app ecran-parcours confirmation">
        <span className="rond-etat grand" aria-hidden="true">
          <Icone nom="coche" taille={46} strokeWidth={2.6} />
        </span>
        <h1 className="titre-ecran centre">
          {lieu.publie ? p('Votre lieu est en ligne !') : p('Lieu enregistré')}
        </h1>
        <p className="sous-titre centre">{p('Merci pour votre engagement !')}</p>

        <ol className="suivi" style={{ marginTop: 10 }}>
          {etapes.map(([fait, titre, texte]) => (
            <li key={titre} className={fait ? 'fait' : 'maintenant'}>
              <span className="suivi-point" aria-hidden="true">
                {fait ? <Icone nom="coche" taille={14} strokeWidth={3} /> : null}
              </span>
              <span className="ligne-texte">
                <strong>{titre}</strong>
                <span>{texte}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="boutons" style={{ marginTop: 16 }}>
          {!lieu.identiteVerifiee ? (
            <Link href="/inscription/identite" className="bouton plein">
              {p('Vérifier mon identité')}
              <Icone nom="chevron" taille={20} />
            </Link>
          ) : null}
          <Link href={`/mes-lieux/${reference}`} className={lieu.identiteVerifiee ? 'bouton plein' : 'bouton contour'}>
            {p('Voir mon lieu')}
          </Link>
          <Link href="/accueil" className="bouton discret">
            {p('Retour à l’accueil')}
          </Link>
        </div>
      </div>
    </main>
  );
}
