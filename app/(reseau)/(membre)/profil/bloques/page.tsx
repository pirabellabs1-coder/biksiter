import type { Metadata } from 'next';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { comptesBloques } from '@/lib/depot/mon-compte';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { bloquerOuDebloquer } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Membres bloqués') };
}

export default async function ComptesBloques() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const bloques = await comptesBloques(membre.id);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/confidentialite" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Membres bloqués')}</h1>
        <p className="sous-titre">
          {p(
            'Un compte bloqué ne peut plus vous contacter, et ses emplacements disparaissent de vos résultats.',
          )}
        </p>

        {bloques.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="utilisateurs" taille={30} />
            <strong>{p('Aucun compte bloqué.')}</strong>
          </div>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {bloques.map((compte) => (
              <li key={compte.id} className="ligne ligne-info">
                <span className="avatar-app" aria-hidden="true">
                  {compte.prenom.charAt(0)}
                </span>
                <span className="ligne-texte">
                  <strong id={`bloque-${compte.id}`}>
                    {compte.prenom} {compte.initiale}.
                  </strong>
                </span>
                <form action={bloquerOuDebloquer}>
                  <input type="hidden" name="id" value={compte.id} />
                  <input type="hidden" name="retour" value="bloques" />
                  <button
                    type="submit"
                    className="bouton contour petit"
                    aria-describedby={`bloque-${compte.id}`}
                  >
                    {p('Débloquer')}
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
