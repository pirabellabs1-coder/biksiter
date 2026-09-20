import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { mesLieux } from '@/lib/depot/lieux';
import { monProfil } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Devenir Bike Sitter') };
}

/**
 * Devenir bike sitter n'est pas un statut qu'on demande : c'est proposer un
 * lieu depuis le même compte. Cet écran dit ce qu'il faut, puis ouvre le
 * parcours d'ajout.
 */
export default async function DevenirBikeSitter() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const [profil, lieux] = await Promise.all([monProfil(membre.id), mesLieux(membre.id)]);
  if (lieux.length > 0) redirect('/mes-lieux');

  const conditions: [boolean | null, string][] = [
    [null, p('Être majeur')],
    [profil?.identiteVerifiee ?? false, p('Identité vérifiée')],
    [null, p('Espace privé et fermé')],
    [null, p('Être présent pendant la garde')],
    [null, p('Accepter les règles de sécurité')],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil" />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Devenir Bike Sitter')}</h1>
        <p className="sous-titre">
          {p('Mettez votre espace privé et sécurisé au service des cyclistes de votre quartier.')}
        </p>

        <div className="illustration-devenir" aria-hidden="true">
          <Icone nom="maison" taille={70} strokeWidth={1.4} />
          <span className="illustration-velo">
            <Icone nom="velo" taille={44} strokeWidth={1.6} />
          </span>
          <span className="illustration-cadenas">
            <Icone nom="cadenas" taille={24} strokeWidth={2} />
          </span>
        </div>

        <div className="encart" style={{ alignItems: 'center' }}>
          <Icone nom="velo" taille={28} />
          <strong className="texte-vert">{p('Gardez des vélos et gagnez des points.')}</strong>
        </div>

        <div className="carte" style={{ marginTop: 12 }}>
          <p className="petit" style={{ margin: '0 0 8px', fontWeight: 700 }}>
            {p('Pour devenir Bike Sitter, il faut :')}
          </p>
          <ul className="conditions">
            {conditions.map(([etat, condition]) => (
              <li key={condition}>
                <Icone nom="verifie" taille={20} className={etat === false ? 'texte-leger' : 'texte-vert'} />
                {condition}
                {etat === false ? (
                  <Link href="/profil/verifications" className="pastille ambre">
                    {p('À faire')}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="boutons" style={{ marginTop: 16 }}>
          <Link href="/mes-lieux/ajouter" className="bouton plein">
            {p('Commencer ma candidature')}
            <Icone nom="chevron" taille={20} />
          </Link>
          <Link href="/comment-ca-marche" className="bouton discret">
            {p('Comment ça marche')}
          </Link>
        </div>
      </div>
    </main>
  );
}
