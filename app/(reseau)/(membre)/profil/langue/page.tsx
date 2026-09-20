import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { choisirLaLangue } from '@/lib/i18n/actions';
import { LANGUES, NOMS_DES_LANGUES, textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Langue et région') };
}

export default async function Langue() {
  await exigerUnMembre();
  const { langue, p } = await textes();

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/parametres" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Langue et région')}</h1>
        <p className="sous-titre">{p('L’application s’affiche dans la langue de votre choix.')}</p>

        <h2 className="titre-section">{p('Langue')}</h2>
        <div className="liste">
          {LANGUES.map((code) => (
            <form key={code} action={choisirLaLangue}>
              <input type="hidden" name="langue" value={code} />
              <button
                type="submit"
                className="ligne"
                lang={code}
                aria-current={code === langue ? 'true' : undefined}
              >
                <span className="ligne-icone" aria-hidden="true">
                  <Icone nom="globe" taille={22} />
                </span>
                <span className="ligne-texte">
                  <strong>{NOMS_DES_LANGUES[code]}</strong>
                </span>
                {code === langue ? (
                  <span className="pastille" lang={langue}>
                    <Icone nom="coche" taille={14} />
                    {p('Actuelle')}
                  </span>
                ) : null}
              </button>
            </form>
          ))}
        </div>

        <h2 className="titre-section">{p('Région')}</h2>
        <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="epingle" taille={22} />
            </span>
            <span className="ligne-texte">
              <span>{p('Pays')}</span>
              <strong>{p('Belgique')}</strong>
            </span>
          </li>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="horloge" taille={22} />
            </span>
            <span className="ligne-texte">
              <span>{p('Fuseau horaire')}</span>
              <strong>{p('Heure de Bruxelles')}</strong>
            </span>
          </li>
        </ul>
        <p className="petit texte-doux" style={{ marginTop: 8 }}>
          {p('Le réseau ouvre quartier par quartier à Bruxelles. L’ensemble des horaires est affiché à l’heure de Bruxelles.')}
        </p>
      </div>
    </main>
  );
}
