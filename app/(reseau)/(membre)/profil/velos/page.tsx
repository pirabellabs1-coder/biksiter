import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { velosDuMembre } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { supprimerUnVelo } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes vélos') };
}

export default async function MesVelos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const velos = await velosDuMembre(membre.id);
  const { velo } = await searchParams;

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Mes vélos')}</h1>
        <p className="sous-titre">
          {p('Une fois enregistrés, vos vélos sont proposés lors de chaque demande de garde.')}
        </p>

        {velo === 'ajoute' ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Vélo enregistré')}</span>
          </div>
        ) : null}
        {velo === 'retire' ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Vélo supprimé')}</span>
          </div>
        ) : null}
        {velo === 'engage' ? (
          <div className="encart rouge" role="alert" style={{ marginBottom: 12 }}>
            <Icone nom="alerte" taille={22} />
            <span>{p('Ce vélo est engagé dans une garde en cours.')}</span>
          </div>
        ) : null}

        {velos.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="velo" taille={30} />
            <strong>{p('Aucun vélo enregistré.')}</strong>
            <span>{p("Le bike sitter saura ce qu'il accueille.")}</span>
          </div>
        ) : (
          <ul className="pile" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {velos.map((v) => (
              <li key={v.id} className="ligne carte ligne-info">
                <span className="vignette-app petite" aria-hidden="true">
                  <Icone nom="velo" taille={28} />
                </span>
                <span className="ligne-texte">
                  <strong>{v.nom}</strong>
                  <span>{[p(v.type), v.marque].filter(Boolean).join(' · ')}</span>
                  {v.couleur ? <span>{v.couleur}</span> : null}
                  {v.numeroDeCadreEnregistre ? (
                    <span>{p('Numéro de cadre enregistré')}</span>
                  ) : null}
                </span>
                <form action={supprimerUnVelo}>
                  <input type="hidden" name="id" value={v.id} />
                  <button
                    type="submit"
                    className="entete-bouton"
                    aria-label={p('Supprimer « {nom} »', { nom: v.nom })}
                  >
                    <Icone nom="corbeille" taille={22} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <Link href="/profil/velos/ajouter" className="bouton plein" style={{ marginTop: 16 }}>
          <Icone nom="plus" taille={20} />
          {p('Ajouter un vélo')}
        </Link>
      </div>
    </main>
  );
}
