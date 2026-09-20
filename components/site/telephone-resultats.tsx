import { Icone } from '@/components/app/icone';
import type { Textes } from '@/lib/i18n/langue';

/**
 * Une seconde maquette téléphone qui montre l'écran de résultats de la
 * recherche : la barre de recherche en haut, une rangée de filtres, puis les
 * cartes d'emplacements en grille. C'est l'inverse du téléphone du hero, qui
 * lui montre la carte : ici, la liste. Aucune image externe : les vignettes
 * sont des dégradés + une icône maison.
 */
export function TelephoneResultats({ p }: { p: Textes['p'] }) {
  const filtres = [
    { libelle: p('Tous les types'), actif: true },
    { libelle: p('Garage'), actif: false },
    { libelle: p('Cave'), actif: false },
    { libelle: p('Cour'), actif: false },
  ];

  const emplacements = [
    { titre: p('Garage privé'), quartier: p('Ixelles'), note: '4,8', teinte: 'teinte-a' },
    { titre: p('Cave privative'), quartier: p('Uccle'), note: '4,9', teinte: 'teinte-b' },
    { titre: p('Cour close'), quartier: p('Saint-Gilles'), note: '4,7', teinte: 'teinte-c' },
    { titre: p('Box individuel'), quartier: p('Etterbeek'), note: '4,8', teinte: 'teinte-d' },
  ];

  return (
    <div className="telephone-liste" aria-hidden="true">
      <div className="telephone-liste-halo" />
      <div className="telephone-cadre telephone-cadre-droit">
        <div className="telephone-encoche" />
        <div className="telephone-ecran">
          {/* Barre de recherche. */}
          <div className="telephone-liste-recherche">
            <Icone nom="recherche" taille={14} />
            <span>{p('Rechercher un emplacement')}</span>
          </div>

          {/* Chips de filtres. */}
          <div className="telephone-liste-filtres">
            {filtres.map((f) => (
              <span
                key={f.libelle}
                className={f.actif ? 'chip-filtre actif' : 'chip-filtre'}
              >
                {f.libelle}
              </span>
            ))}
          </div>

          {/* Section : Près de chez vous. */}
          <div className="telephone-liste-section">
            <p className="telephone-liste-titre">{p('Près de chez vous')}</p>
            <div className="telephone-liste-grille">
              {emplacements.map((e) => (
                <div key={e.titre} className={`carte-emplacement ${e.teinte}`}>
                  <div className="carte-emplacement-photo">
                    <Icone nom="maison" taille={22} />
                  </div>
                  <div className="carte-emplacement-corps">
                    <strong>{e.titre}</strong>
                    <span className="carte-emplacement-quartier">
                      {e.quartier}
                    </span>
                    <span className="carte-emplacement-note">
                      <Icone nom="etoile" taille={10} plein /> {e.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barre d'onglets. */}
          <nav className="telephone-onglets" aria-label={p('Application')}>
            {(
              [
                ['accueil', p('Accueil')],
                ['gardes', p('Gardes')],
                ['recherche', p('Rechercher')],
                ['messages', p('Messages')],
                ['profil', p('Profil')],
              ] as const
            ).map(([nom, libelle], rang) => (
              <span
                key={nom}
                className={rang === 2 ? 'telephone-onglet actif' : 'telephone-onglet'}
              >
                <Icone nom={nom} taille={18} />
                <small>{libelle}</small>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
