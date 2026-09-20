import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { reglagesDAffichage } from '@/lib/affichage';
import { textes } from '@/lib/i18n/langue';
import { REGLAGES_D_AFFICHAGE, type ReglageDAffichage } from '@/lib/regles/accessibilite';
import { exigerUnMembre } from '@/lib/session';

import { enregistrerLAffichage } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Accessibilité') };
}

const ICONE_DU_REGLAGE: Record<ReglageDAffichage, NomDIcone> = {
  'texte-grand': 'document',
  'contraste-eleve': 'oeil',
  'animations-reduites': 'horloge',
};

export default async function Accessibilite({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await exigerUnMembre();
  const { p } = await textes();
  const [actifs, { enregistre }] = await Promise.all([reglagesDAffichage(), searchParams]);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/parametres" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Accessibilité')}</h1>
        <p className="sous-titre">
          {p('Adaptez l’application à vos besoins pour une utilisation confortable.')}
        </p>

        {enregistre ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Vos réglages sont enregistrés sur cet appareil.')}</span>
          </div>
        ) : null}

        <form action={enregistrerLAffichage}>
          <div className="liste">
            {REGLAGES_D_AFFICHAGE.map((reglage) => (
              <label key={reglage.cle} className="ligne">
                <span className="ligne-icone" aria-hidden="true">
                  <Icone nom={ICONE_DU_REGLAGE[reglage.cle]} taille={22} />
                </span>
                <span className="ligne-texte">
                  <strong>{p(reglage.titre)}</strong>
                  <span>{p(reglage.description)}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  name={reglage.cle}
                  value="oui"
                  className="sw"
                  defaultChecked={actifs.includes(reglage.cle)}
                />
              </label>
            ))}
          </div>

          <div className="encart gris" style={{ marginTop: 12 }}>
            <Icone nom="info" taille={20} />
            <span>
              {p('Les écrans sont conçus pour les lecteurs d’écran et la navigation au clavier. Le zoom de votre navigateur fonctionne aussi partout.')}
            </span>
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
