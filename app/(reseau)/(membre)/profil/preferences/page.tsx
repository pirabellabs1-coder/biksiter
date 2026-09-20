import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { TRANQUILLITE_PAR_DEFAUT, tranquilliteDuMembre } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { HEURES } from '@/lib/recherche-courante';
import { exigerUnMembre } from '@/lib/session';

import { enregistrerLesHeuresDeCalme } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Préférences de communication') };
}

export default async function Preferences({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const [plage, { enregistre }] = await Promise.all([
    tranquilliteDuMembre(membre.id),
    searchParams,
  ]);
  const affichee = plage ?? TRANQUILLITE_PAR_DEFAUT;

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/parametres" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Préférences de communication')}</h1>
        <p className="sous-titre">{p('Choisissez quand et comment le réseau vous prévient.')}</p>

        {enregistre ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Modifications enregistrées')}</span>
          </div>
        ) : null}

        <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="cloche" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{p('Notifications dans l’application')}</strong>
              <span>{p('Demandes, gardes, messages et points : tout arrive dans l’onglet des notifications.')}</span>
            </span>
            <span className="pastille">{p('Actives')}</span>
          </li>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="messages" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{p('E-mails')}</strong>
              <span>{p('Les étapes importantes d’une garde vous sont aussi envoyées par e-mail.')}</span>
            </span>
            <span className="pastille">{p('Actifs')}</span>
          </li>
        </ul>

        <form action={enregistrerLesHeuresDeCalme} style={{ marginTop: 12 }}>
          <div className="carte pile">
            <label className="ligne sans-cadre" style={{ padding: 0, minHeight: 0 }}>
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom="horloge" taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>{p('Heures de calme')}</strong>
                <span>{p('Aucune notification ne vous dérange pendant cette plage.')}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                name="active"
                value="oui"
                className="sw"
                defaultChecked={plage !== null}
              />
            </label>
            <div className="deux-colonnes">
              <label className="petit" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600 }}>
                <span>{p('De')}</span>
                <select name="de" className="champ-simple" defaultValue={affichee.de}>
                  {HEURES.map((heure) => (
                    <option key={heure}>{heure}</option>
                  ))}
                </select>
              </label>
              <label className="petit" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600 }}>
                <span>{p('À')}</span>
                <select name="a" className="champ-simple" defaultValue={affichee.a}>
                  {HEURES.map((heure) => (
                    <option key={heure}>{heure}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="petit texte-doux" style={{ margin: 0 }}>
              {p('Les notifications reçues pendant cette plage vous attendent à la fin de la nuit : rien n’est perdu. Une urgence sur une garde en cours passe toujours.')}
            </p>
          </div>

          <div className="boutons" style={{ marginTop: 16 }}>
            <button type="submit" className="bouton plein">
              {p('Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
