import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { velosDuMembre } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { supprimerUnVelo } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mon vélo') };
}

/**
 * Les vélos du membre. Un seul parcours pour en ajouter un
 * (/profil/velos/ajouter) : deux formulaires différents pour le même vélo
 * laissaient hésiter sur celui qui comptait.
 */
export default async function MonVelo({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const velos = await velosDuMembre(membre.id);
  const { velo } = await searchParams;

  return (
    <main className="page page-etroite" id="contenu">
      <header className="page-tete">
        <span className="kicker">MON VÉLO</span>
        <h1>Vos vélos</h1>
        <p>
          Le vélo enregistré vous est proposé à chaque demande : votre bike
          sitter sait à l’avance ce qu’il accueille.
        </p>
      </header>

      {velo === 'ajoute' ? (
        <div className="encart" role="status" style={{ marginBottom: 16 }}>
          <Icone nom="coche" taille={20} />
          <span>Vélo enregistré. Il vous sera proposé à chaque demande.</span>
        </div>
      ) : null}
      {velo === 'retire' ? (
        <div className="encart" role="status" style={{ marginBottom: 16 }}>
          <Icone nom="coche" taille={20} />
          <span>Vélo retiré de votre liste.</span>
        </div>
      ) : null}
      {velo === 'engage' ? (
        <p className="msg-erreur" role="alert">
          Ce vélo est engagé dans une garde en cours : vous pourrez le retirer
          une fois la garde terminée.
        </p>
      ) : null}

      {velos.length > 0 ? (
        <section className="bloc">
          <ul className="verifs">
            {velos.map((v) => (
              <li key={v.id}>
                <span className="vi" aria-hidden="true">
                  <Icone nom="velo" taille={18} />
                </span>
                <div>
                  <b>{v.nom}</b>
                  <span>
                    {[v.type, v.marque, v.couleur].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <form action={supprimerUnVelo}>
                  <input type="hidden" name="id" value={v.id} />
                  <button type="submit" className="lien">
                    Retirer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="prog-note">
          Aucun vélo enregistré pour l’instant. Ajoutez celui que vous souhaitez
          confier ; son type, sa couleur et sa marque suffisent.
        </p>
      )}

      <div className="actions-fin">
        <Link className="primary" href="/profil/velos/ajouter">
          Ajouter un vélo
        </Link>
        <Link className="outline" href="/profil">
          Revenir à mon compte
        </Link>
      </div>
    </main>
  );
}
