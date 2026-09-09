import type { Metadata } from 'next';
import Link from 'next/link';

import EnteteDePage from '@/components/espace/entete-de-page';
import IconeCaracteristique from '@/components/icone-caracteristique';
import { comptesDuMembre, registre, soldeDuMembre } from '@/lib/depot/maillons';
import { etatDuTelephone } from '@/lib/depot/telephone';
import { joursEntames, leSoldeSAffiche } from '@/lib/regles/maillons';
import { typeVeloDansUnePhrase } from '@/lib/regles/velos';
import { exigerUnMembre } from '@/lib/session';
import { enJour } from '@/lib/temps';

export const metadata: Metadata = { title: 'Mon profil' };
export const dynamic = 'force-dynamic';

export default async function Profil() {
  const membre = await exigerUnMembre();

  const [comptes, solde, lignes, telephone] = await Promise.all([
    comptesDuMembre(membre.id),
    soldeDuMembre(membre.id),
    registre(membre.id, 8),
    etatDuTelephone(membre.id),
  ]);

  const accueille = leSoldeSAffiche(comptes.accueillies);

  const verifications = [
    { libelle: 'Adresse e-mail', faite: true },
    { libelle: 'Téléphone', faite: telephone.verifieLe !== null },
    { libelle: 'Pièce d’identité', faite: membre.verification === 'verifiee' },
  ];

  return (
    <>
      <EnteteDePage
        surtitre="Mon profil"
        titre={`${membre.prenom} ${membre.nom.charAt(0)}.`}
        phrase={
          accueille
            ? 'Cycliste et bike sitter — c’est le même compte, selon le moment.'
            : 'Ce que le réseau sait de vous, et ce que vous y avez fait.'
        }
        actions={
          accueille ? (
            <Link href="/catalogue" className="bouton bouton--principal">
              Voir le catalogue
            </Link>
          ) : (
            <Link
              href="/proposer-un-emplacement"
              className="bouton bouton--principal"
            >
              Proposer un emplacement
            </Link>
          )
        }
      />

      {/* Les deux façons de faire vivre le réseau, comptées séparément. Ce sont
          des compteurs : rien ne les compare à ceux de quelqu'un d'autre, et
          aucune requête du produit ne les ordonne (règle 3). */}
      <ul className="tuiles">
        {accueille ? (
          <li className="tuile">
            <span className="tuile__valeur">{comptes.accueillies}</span>
            <span className="tuile__libelle">
              vélo{comptes.accueillies > 1 ? 's' : ''} accueilli
              {comptes.accueillies > 1 ? 's' : ''}
            </span>
          </li>
        ) : null}
        <li className="tuile">
          <span className="tuile__valeur">{comptes.confiees}</span>
          <span className="tuile__libelle">
            vélo{comptes.confiees > 1 ? 's' : ''} confié
            {comptes.confiees > 1 ? 's' : ''}
          </span>
        </li>
        {accueille ? (
          <li className="tuile">
            <span className="tuile__valeur">{solde.acquis}</span>
            <span className="tuile__libelle">
              maillon{solde.acquis > 1 ? 's' : ''} acquis
            </span>
          </li>
        ) : null}
        {solde.enAttente > 0 ? (
          <li className="tuile tuile--attente">
            <span className="tuile__valeur">{solde.enAttente}</span>
            <span className="tuile__libelle">en attente d’une décision</span>
          </li>
        ) : null}
      </ul>

      <div className="panneaux panneaux--deux">
        <section className="panneau">
          <div className="panneau__entete">
            <h2>{accueille ? 'Mon registre' : 'Mes gardes'}</h2>
            {accueille ? (
              <Link href="/catalogue">Ce que ça ouvre</Link>
            ) : null}
          </div>

          {lignes.length === 0 ? (
            <div className="vide">
              <IconeCaracteristique pictogramme="journal" />
              <p>
                {accueille
                  ? 'Rien d’écrit pour l’instant.'
                  : 'Vous n’avez encore accueilli aucun vélo. Les maillons se gagnent en accueillant, jamais en demandant — et ils ne s’achètent pas.'}
              </p>
              {accueille ? null : (
                <div className="boutons">
                  <Link
                    href="/proposer-un-emplacement"
                    className="bouton bouton--discret"
                  >
                    Proposer un emplacement
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <ul className="lignes">
              {lignes.map((ligne) => (
                <li key={ligne.id}>
                  <div className="ligne">
                    <span className="ligne__corps">
                      <span className="ligne__titre">
                        {/* La date qui compte est celle de la garde, pas celle
                            de l'écriture au registre. */}
                        {enJour(new Date(ligne.fin ?? ligne.creeLe))}
                        {ligne.typeVelo
                          ? ` · ${typeVeloDansUnePhrase(ligne.typeVelo)}`
                          : ''}
                      </span>
                      <span className="ligne__detail">
                        {ligne.debut && ligne.fin
                          ? `${joursEntames(new Date(ligne.debut), new Date(ligne.fin))} jour${
                              joursEntames(
                                new Date(ligne.debut),
                                new Date(ligne.fin),
                              ) > 1
                                ? 's'
                                : ''
                            } entamé${
                              joursEntames(
                                new Date(ligne.debut),
                                new Date(ligne.fin),
                              ) > 1
                                ? 's'
                                : ''
                            }`
                          : (ligne.motif ?? '—')}
                      </span>
                    </span>
                    <span className="ligne__fin">
                      <span
                        className={
                          ligne.etat === 'en_attente'
                            ? 'pastille pastille--garde'
                            : 'pastille pastille--neutre'
                        }
                      >
                        {ligne.nombre > 0 ? `+${ligne.nombre}` : ligne.nombre}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panneau">
          <div className="panneau__entete">
            <h2>Mes vérifications</h2>
          </div>
          <div className="panneau__corps">
            <ul className="verifications">
              {verifications.map(({ libelle, faite }) => (
                <li key={libelle}>
                  <span>{libelle}</span>
                  <span
                    className={
                      faite
                        ? 'pastille pastille--verifie'
                        : 'pastille pastille--neutre'
                    }
                  >
                    {faite ? 'Vérifié' : 'À faire'}
                  </span>
                </li>
              ))}
            </ul>

            <p className="discret">
              Ces trois-là sont contrôlées par une personne, pas par un
              automate. C’est ce qui rend acceptable d’ouvrir sa porte — et
              c’est aussi pourquoi ça prend un peu de temps.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
