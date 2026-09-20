import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { alertesDuMembre } from '@/lib/depot/mon-compte';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';

import { supprimerUneAlerte } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes alertes') };
}

export default async function MesAlertes() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const alertes = await alertesDuMembre(membre.id);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Mes alertes')}</h1>
        <p className="sous-titre">
          {p('Une alerte vous prévient dès qu’un emplacement ouvre là où votre recherche n’a rien trouvé.')}
        </p>

        {alertes.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="cloche" taille={30} />
            <strong>{p('Aucune alerte.')}</strong>
            <span>
              {p(
                'Créez-en une depuis une recherche sans résultat : vous serez prévenu dès qu’un emplacement ouvre.',
              )}
            </span>
            <Link href="/recherche" className="bouton contour petit">
              <Icone nom="recherche" taille={18} />
              {p('Chercher un emplacement')}
            </Link>
          </div>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {alertes.map((alerte) => (
              <li key={alerte.id} className="ligne ligne-info">
                <span className="ligne-icone" aria-hidden="true">
                  <Icone nom="cloche" taille={22} />
                </span>
                <span className="ligne-texte">
                  <strong>{alerte.lieu}</strong>
                  <span>
                    {alerte.jour ? jourAffiche(alerte.jour) : p('Tous les jours')}
                    {alerte.de && alerte.a ? ` · ${alerte.de} → ${alerte.a}` : ''}
                  </span>
                </span>
                <form action={supprimerUneAlerte}>
                  <input type="hidden" name="id" value={alerte.id} />
                  <button
                    type="submit"
                    className="entete-bouton"
                    aria-label={p('Supprimer l’alerte « {lieu} »', { lieu: alerte.lieu })}
                  >
                    <Icone nom="corbeille" taille={22} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
