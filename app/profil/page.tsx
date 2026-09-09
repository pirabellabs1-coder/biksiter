import type { Metadata } from 'next';
import Link from 'next/link';

import BarreDuMembre from '@/components/barre-du-membre';
import { comptesDuMembre, registre, soldeDuMembre } from '@/lib/depot/maillons';
import { etatDuTelephone } from '@/lib/depot/telephone';
import { joursEntames, leSoldeSAffiche } from '@/lib/regles/maillons';
import { typeVeloDansUnePhrase } from '@/lib/regles/velos';
import { exigerUnMembre } from '@/lib/session';
import { enJour } from '@/lib/temps';

export const metadata: Metadata = { title: 'Mon profil' };

export default async function Profil() {
  const membre = await exigerUnMembre();

  const [comptes, solde, lignes, telephone] = await Promise.all([
    comptesDuMembre(membre.id),
    soldeDuMembre(membre.id),
    registre(membre.id, 6),
    etatDuTelephone(membre.id),
  ]);

  const accueille = leSoldeSAffiche(comptes.accueillies);

  return (
    <div className="page page--lecture">
      <BarreDuMembre membre={membre} page="profil" />

      <p className="surtitre">Profil</p>
      <h1 className="titre-page">
        {membre.prenom} {membre.nom.charAt(0)}.
      </h1>

      <div className="carte">
        <div className="row-identite">
          <span className="emplacement__initiale" aria-hidden="true">
            {membre.prenom.charAt(0)}
          </span>
          <div>
            <strong>
              {membre.prenom} {membre.nom.charAt(0)}.
            </strong>
            <p className="discret">
              Membre
              {accueille ? ' · bike sitter' : ''}
            </p>
          </div>
        </div>

        <div className="pastilles">
          <span className="pastille pastille--verifie">E-mail vérifié</span>
          {telephone.verifieLe ? (
            <span className="pastille pastille--verifie">Téléphone vérifié</span>
          ) : (
            <span className="pastille pastille--neutre">
              Téléphone à vérifier
            </span>
          )}
          {membre.verification === 'verifiee' ? (
            <span className="pastille pastille--verifie">Identité vérifiée</span>
          ) : (
            <span className="pastille pastille--neutre">
              Identité en vérification
            </span>
          )}
        </div>
      </div>

      {/* Les deux façons de faire vivre le réseau, comptées séparément. Ce sont
          des compteurs : rien ne les compare à ceux de quelqu'un d'autre. */}
      {accueille ? (
        <div className="carte compteur">
          <p className="compteur__valeur">
            {comptes.accueillies} vélo{comptes.accueillies > 1 ? 's' : ''}{' '}
            accueilli{comptes.accueillies > 1 ? 's' : ''}
          </p>
          <p className="discret">
            Chez vous, dans votre emplacement. C’est ce que voient les cyclistes
            qui vous écrivent.
          </p>
        </div>
      ) : null}

      <div className="carte compteur">
        <p className="compteur__valeur">
          {comptes.confiees} vélo{comptes.confiees > 1 ? 's' : ''} confié
          {comptes.confiees > 1 ? 's' : ''}
        </p>
        <p className="discret">
          Faire vivre le réseau compte aussi : sans demande, un emplacement libre
          ne sert à personne.
        </p>
      </div>

      {accueille ? (
        <>
          <div className="carte compteur">
            <p className="compteur__valeur">
              {solde.acquis} maillon{solde.acquis > 1 ? 's' : ''}
            </p>
            <p className="discret">
              Gagnés en accueillant. Ils ouvrent le catalogue de nos
              partenaires — ils ne s’achètent pas et ne se donnent pas.
            </p>

            {lignes.length > 0 ? (
              <ul className="registre">
                {lignes.map((ligne) => (
                  <li key={ligne.id}>
                    <span>
                      {/* La date qui compte est celle de la garde, pas celle
                          de l'écriture au registre. */}
                      {enJour(new Date(ligne.fin ?? ligne.creeLe))}
                      {ligne.typeVelo ? ` · ${typeVeloDansUnePhrase(ligne.typeVelo)}` : ''}
                      {ligne.debut && ligne.fin
                        ? ` · ${joursEntames(new Date(ligne.debut), new Date(ligne.fin))} jour(s)`
                        : ''}
                      {ligne.typeVelo ? '' : ` · ${ligne.motif ?? ''}`}
                    </span>
                    <strong>
                      {ligne.nombre > 0 ? `+${ligne.nombre}` : ligne.nombre}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : null}

            {solde.enAttente > 0 ? (
              <p className="discret registre__attente">
                {solde.enAttente} maillon{solde.enAttente > 1 ? 's' : ''} en
                attente : une garde est contestée, quelqu’un la regarde.
              </p>
            ) : null}
          </div>

          <div className="boutons">
            <Link href="/catalogue" className="bouton bouton--principal">
              Voir le catalogue
            </Link>
            <Link href="/mes-emplacements" className="bouton bouton--discret">
              Mes emplacements
            </Link>
          </div>
        </>
      ) : (
        <>
          <h2 className="titre-section titre-section--aere">
            Envie d’accueillir&nbsp;?
          </h2>
          <div className="carte">
            <h3>Proposer un emplacement</h3>
            <p className="discret">
              Un garage, une cour, une cave. Vous gagnez des maillons à chaque
              garde, et les commerçants du quartier vous en remercient.
            </p>
            <div className="boutons">
              <Link
                href="/proposer-un-emplacement"
                className="bouton bouton--principal"
              >
                Proposer un emplacement
              </Link>
              <Link href="/catalogue" className="bouton bouton--discret">
                Voir le catalogue
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
