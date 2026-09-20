import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { avisDuMembre } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';
import { enJour } from '@/lib/temps';

import { CarteDAvisPublie, NoteEnEtoiles } from './carte-d-avis';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes avis') };
}

export default async function MesAvis({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { recus, donnes } = await avisDuMembre(membre.id);
  const { reponse, contestation } = await searchParams;
  const enAttente = donnes.filter((avis) => !avis.publie).length;

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil" cloche={false} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Mes avis')}</h1>
        <p className="sous-titre">
          {p('Les avis que vous recevez, et ceux que vous laissez après une garde.')}
        </p>

        {reponse === 'publiee' ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Votre réponse est publiée sous l’avis.')}</span>
          </div>
        ) : null}
        {contestation === 'envoyee' ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Votre contestation a été transmise à la modération.')}</span>
          </div>
        ) : null}

        <h2 className="titre-section">{p('Reçus ({n})', { n: recus.length })}</h2>
        {recus.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="etoile" taille={30} />
            <span>{p('Nouveau membre — la note s’affiche à partir de trois avis.')}</span>
          </div>
        ) : (
          recus.map((avis) => <CarteDAvisPublie key={avis.id} p={p} avis={avis} actions />)
        )}

        <h2 className="titre-section">{p('Donnés ({n})', { n: donnes.length })}</h2>
        {enAttente > 0 ? (
          <div className="encart gris" style={{ marginBottom: 10 }}>
            <Icone nom="cadenas" taille={22} />
            <span>
              {enAttente > 1
                ? p(
                    '{n} avis déposés en attente : ils restent invisibles tant que l’autre personne n’a pas noté, ou pendant sept jours.',
                    { n: enAttente },
                  )
                : p(
                    'Un avis déposé en attente : il reste invisible tant que l’autre personne n’a pas noté, ou pendant sept jours.',
                  )}
            </span>
          </div>
        ) : null}
        {donnes.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="document" taille={30} />
            <span>{p('Aucun avis donné.')}</span>
          </div>
        ) : (
          donnes.map((avis) => (
            <article key={avis.id} className="carte">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="avatar-app" aria-hidden="true">
                  {avis.ciblePrenom.charAt(0)}
                </span>
                <span className="ligne-texte">
                  <strong>{p('Pour {prenom}', { prenom: avis.ciblePrenom })}</strong>
                  <span>{enJour(new Date(avis.ecritLe))}</span>
                </span>
                <NoteEnEtoiles p={p} note={avis.note} />
              </div>
              {avis.texte ? (
                <p className="texte-fiche" style={{ marginTop: 10 }}>
                  {avis.texte}
                </p>
              ) : null}
              {avis.publie ? null : (
                <p style={{ margin: '10px 0 0' }}>
                  <span className="pastille ambre">
                    <Icone nom="horloge" taille={14} />
                    {p('En attente de publication')}
                  </span>
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </main>
  );
}
