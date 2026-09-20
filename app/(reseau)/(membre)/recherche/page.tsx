import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import {
  CarteDeBikeSitter,
  FormulaireDeRecherche,
  PucesDeFiltres,
} from '@/components/app/recherche';
import { texteDuCreneau } from '@/components/membre/elements';
import { CarteDesZones } from '@/components/site/carte-des-zones';
import { velosDuMembre } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { emplacementsAutourDe } from '@/lib/depot/reseau';
import { textes } from '@/lib/i18n/langue';
import { correspond, placeLibre } from '@/lib/regles/recherche';
import { CHIFFRES_DU_CODE_DE_REMISE } from '@/lib/regles/remise';
import {
  lireLaRecherche,
  parametresDeLaRecherche,
} from '@/lib/recherche-courante';
import { exigerUnMembre } from '@/lib/session';

import { creerUneAlerte } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Rechercher un bike sitter') };
}

export default async function Rechercher({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const parametres = await searchParams;
  const recherche = lireLaRecherche(parametres);
  const query = parametresDeLaRecherche(recherche).toString();
  const nonLues = await nombreDeNotificationsNonLues(membre.id);

  // Sans lieu dans l'adresse, ou quand on revient pour changer : le formulaire.
  if (parametres.lieu === undefined || parametres.modifier === '1') {
    const velos = await velosDuMembre(membre.id);
    return (
      <main id="contenu">
        <EnTete p={p} notificationsNonLues={nonLues}>
          <Link
            href="/favoris"
            className="entete-bouton"
            aria-label={p('Mes favoris')}
          >
            <Icone nom="coeur" taille={22} />
          </Link>
        </EnTete>
        <div className="ecran-app ecran-large">
          <h1 className="titre-ecran">{p('Rechercher un bike sitter')}</h1>
          <p className="sous-titre">
            {p(
              'Trouvez un lieu sûr proche de chez vous pour confier votre vélo.',
            )}
          </p>
          <div className="colonnes colonnes-formulaire">
            <section className="colonne">
              <FormulaireDeRecherche
                p={p}
                recherche={recherche}
                velos={velos}
              />
            </section>
            <aside
              className="colonne panneau-garanties"
              aria-label={p('Ce qui vous protège')}
            >
              <h2 className="titre-section" style={{ marginTop: 0 }}>
                {p('Ce qui vous protège')}
              </h2>
              <ul
                className="pile"
                style={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                {(
                  [
                    [
                      'verifie',
                      p('Des Bike Sitters vérifiés'),
                      p(
                        'Une personne de l’association vérifie chaque identité.',
                      ),
                    ],
                    [
                      'cadenas',
                      p('Une adresse protégée'),
                      p(
                        'L’adresse exacte arrive après l’acceptation de votre demande.',
                      ),
                    ],
                    [
                      'cle',
                      p('Un code à chaque remise'),
                      p(
                        'Des photos devant la porte, puis un code à {n} chiffres.',
                        { n: CHIFFRES_DU_CODE_DE_REMISE },
                      ),
                    ],
                  ] as const
                ).map(([icone, titre, texte]) => (
                  <li
                    key={titre}
                    className="ligne sans-cadre"
                    style={{ padding: 0, alignItems: 'flex-start' }}
                  >
                    <span className="ligne-icone" aria-hidden="true">
                      <Icone nom={icone} taille={22} />
                    </span>
                    <span className="ligne-texte">
                      <strong>{titre}</strong>
                      <span>{texte}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  const retourAuFormulaire = `/recherche?${query}&modifier=1`;

  if (!recherche.lieu) {
    return (
      <main id="contenu">
        <EnTete
          p={p}
          retour={retourAuFormulaire}
          notificationsNonLues={nonLues}
        />
        <div className="ecran-app">
          <div className="carte vide-liste">
            <Icone nom="epingle" taille={30} />
            <strong>{p('Ce lieu n’est pas reconnu.')}</strong>
            <span>
              {p(
                'Essayez le nom d’un quartier, d’une place ou d’une commune de Bruxelles.',
              )}
            </span>
            <Link href={retourAuFormulaire} className="bouton contour petit">
              {p('Modifier la recherche')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const trouves = await emplacementsAutourDe(
    membre.id,
    recherche.lieu,
    recherche.creneau,
  );
  const filtres = trouves.filter((e) => correspond(e, recherche.filtres));
  const disponibles = filtres.filter((e) => placeLibre(e.disponibilite));
  const complets = filtres.filter((e) => !placeLibre(e.disponibilite));
  const zones = (disponibles.length ? disponibles : complets).map((e) => ({
    latitude: e.latitude,
    longitude: e.longitude,
    emplacements: 1,
  }));

  return (
    <main id="contenu">
      <EnTete
        p={p}
        retour={retourAuFormulaire}
        notificationsNonLues={nonLues}
      />
      <div className="ecran-app ecran-large resultats">
        <div className="resultats-entete">
          <h1 className="titre-ecran">{p('Bike Sitters disponibles')}</h1>
          <Link href={retourAuFormulaire} className="resume-de-recherche">
            <Icone nom="epingle" taille={16} />
            <span>
              {recherche.texte} · {texteDuCreneau(p, recherche.creneau)}
            </span>
            <span className="lien-texte-vert">{p('Modifier')}</span>
          </Link>
        </div>

        <div className="carte-resultats resultats-carte">
          <CarteDesZones p={p} zones={zones} />
        </div>

        <div className="resultats-liste">
          <PucesDeFiltres p={p} recherche={recherche} query={query} />

          {disponibles.length > 0 ? (
            <div className="pile" style={{ marginTop: 14 }}>
              {disponibles.map((e) => (
                <CarteDeBikeSitter
                  key={e.reference}
                  p={p}
                  e={e}
                  query={query}
                />
              ))}
            </div>
          ) : (
            <div className="pile" style={{ marginTop: 14 }}>
              <div className="carte vide-liste">
                <Icone nom="recherche" taille={30} />
                <strong>
                  {p('Aucun Bike Sitter disponible sur ce créneau.')}
                </strong>
                <span>
                  {complets.length > 0
                    ? p(
                        'Des Bike Sitters sont près d’ici, mais complets : un autre horaire suffirait peut-être.',
                      )
                    : p(
                        'Modifiez vos filtres, ou soyez prévenu dès qu’un emplacement ouvre.',
                      )}
                </span>
              </div>
              {parametres.alerte === 'creee' ? (
                <div className="encart" role="status">
                  <Icone nom="cloche" taille={22} />
                  <span>
                    {p(
                      'Alerte créée : nous vous prévenons dès qu’une place s’ouvre.',
                    )}
                  </span>
                </div>
              ) : (
                <form action={creerUneAlerte}>
                  <input type="hidden" name="lieu" value={recherche.texte} />
                  <input
                    type="hidden"
                    name="jour"
                    value={recherche.creneau.jourDepot}
                  />
                  <input
                    type="hidden"
                    name="de"
                    value={recherche.creneau.heureDepot}
                  />
                  <input
                    type="hidden"
                    name="a"
                    value={recherche.creneau.heureReprise}
                  />
                  <input
                    type="hidden"
                    name="retour"
                    value={`/recherche?${query}`}
                  />
                  <button type="submit" className="bouton contour">
                    <Icone nom="cloche" taille={20} />
                    {p('Rejoindre la liste d’attente')}
                  </button>
                </form>
              )}
              <Link href={retourAuFormulaire} className="bouton discret">
                {p('Modifier la recherche')}
              </Link>
            </div>
          )}

          {complets.length > 0 ? (
            <>
              <h2 className="titre-section">
                {p('Complets sur ce créneau ({n})', { n: complets.length })}
              </h2>
              <div className="pile">
                {complets.map((e) => (
                  <CarteDeBikeSitter
                    key={e.reference}
                    p={p}
                    e={e}
                    query={query}
                    complet
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
