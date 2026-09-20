import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { Anneau, EmblemeDeBadge, iconeDuBadge, resteDuBadge } from '@/components/app/progression';
import { statistiquesDuBikeSitter } from '@/lib/depot/lieux';
import { progressionDuMembre } from '@/lib/depot/progression';
import { textes } from '@/lib/i18n/langue';
import { niveauPour, objectifsEnCours } from '@/lib/regles/progression';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes objectifs') };
}

export default async function MesObjectifs() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const [progression, stats] = await Promise.all([
    progressionDuMembre(membre.id),
    statistiquesDuBikeSitter(membre.id),
  ]);
  const niveau = niveauPour(progression.pointsGagnes);
  const objectifs = objectifsEnCours(progression.activite);
  const prochain = objectifs[0] ?? null;
  const pourcentage = Math.round(niveau.avancement * 100);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/progression" />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Mes objectifs')}</h1>
        <p className="sous-titre">
          {p('Progressez pour débloquer de nouveaux badges et atteindre le niveau suivant.')}
        </p>

        <div className="encart solde-encart">
          <span className="ligne-texte">
            <span className="petit">
              {niveau.suivant ? p('Niveau suivant :') : p('Votre niveau')}
            </span>
            <strong style={{ fontSize: 16 }}>
              {p((niveau.suivant ?? niveau.actuel).titre)}
            </strong>
            {niveau.suivant ? (
              <span className="petit">
                {p('Encore {n} points pour y accéder', { n: niveau.manquants })}
              </span>
            ) : null}
          </span>
          <Anneau avancement={niveau.avancement} petit>
            <strong>{pourcentage} %</strong>
          </Anneau>
        </div>

        <div className="pile" style={{ marginTop: 12 }}>
          {objectifs.map((objectif) => (
            <div key={objectif.cle} className="carte objectif">
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom={iconeDuBadge(objectif.cle)} taille={24} />
              </span>
              <strong>{p(objectif.description)}</strong>
              <span className="objectif-compte">
                {objectif.avancement} / {objectif.objectif}
              </span>
              <span
                className="jauge"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={objectif.objectif}
                aria-valuenow={objectif.avancement}
                aria-label={p(objectif.titre)}
              >
                <span style={{ width: `${(objectif.avancement / objectif.objectif) * 100}%` }} />
              </span>
            </div>
          ))}

          {stats.tauxDeReponse !== null ? (
            <div className="carte objectif">
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom="messages" taille={24} />
              </span>
              <strong>{p('Taux de réponse')}</strong>
              <span className="objectif-compte">{stats.tauxDeReponse} %</span>
              <span
                className="jauge"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={stats.tauxDeReponse}
                aria-label={p('Taux de réponse')}
              >
                <span style={{ width: `${stats.tauxDeReponse}%` }} />
              </span>
            </div>
          ) : null}
        </div>

        {prochain ? (
          <div className="carte ligne ligne-info" style={{ marginTop: 12, alignItems: 'center' }}>
            <EmblemeDeBadge badge={prochain} />
            <span className="ligne-texte">
              <strong>{p('Prochain badge')}</strong>
              <span>{p(prochain.titre)}</span>
              <span>{resteDuBadge(p, prochain)}</span>
            </span>
          </div>
        ) : (
          <div className="carte vide-liste" style={{ marginTop: 12 }}>
            <Icone nom="trophee" taille={30} className="texte-vert" />
            <strong>{p('Tous les badges sont à vous.')}</strong>
            <span className="texte-doux">{p('Merci pour chacune de vos gardes.')}</span>
          </div>
        )}
      </div>
    </main>
  );
}
