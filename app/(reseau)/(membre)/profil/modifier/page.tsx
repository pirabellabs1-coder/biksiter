import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { identiteDuMembre } from '@/lib/depot/mon-compte';
import { textes } from '@/lib/i18n/langue';
import { nomModifiable } from '@/lib/regles/comptes';
import { exigerUnMembre } from '@/lib/session';

import { FormulaireDuNom } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Modifier mes informations') };
}

export default async function ModifierMonProfil() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const identite = await identiteDuMembre(membre.id);
  if (!identite) return null;
  const modifiable = nomModifiable(identite.verification);
  const nomPublic = `${identite.prenom} ${identite.nom.charAt(0).toUpperCase()}.`;

  const coordonnees = (
    <>
      <label className="champ-app">
        <Icone nom="enveloppe" taille={22} />
        <span className="champ-empile">
          <small>{p('E-mail — jamais public')}</small>
          <input value={identite.email} disabled style={{ minHeight: 26 }} />
        </span>
      </label>
      <label className="champ-app">
        <Icone nom="telephone" taille={22} />
        <span className="champ-empile">
          <small>{p('Téléphone — jamais public')}</small>
          <input value={identite.telephone ?? ''} disabled style={{ minHeight: 26 }} />
        </span>
      </label>
      <div className="encart bleu">
        <Icone nom="cadenas" taille={22} />
        <span>
          {p(
            'Les autres membres voient « {nom} ». Votre nom complet et votre e-mail ne sont visibles par personne. Votre numéro de téléphone est communiqué à l’autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.',
            { nom: nomPublic },
          )}
        </span>
      </div>
    </>
  );

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil/parametres" cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Modifier mes informations')}</h1>
        <p className="sous-titre">
          {p('Retrouvez ici vos informations personnelles et vos préférences.')}
        </p>
        {modifiable ? (
          <FormulaireDuNom
            prenom={identite.prenom}
            nom={identite.nom}
            textes={{
              prenom: p('Prénom — affiché publiquement'),
              nom: p('Nom — seule l’initiale est affichée'),
              enregistrer: p('Enregistrer les modifications'),
              envoi: p('Enregistrement…'),
            }}
          >
            {coordonnees}
          </FormulaireDuNom>
        ) : (
          <div className="pile">
            <label className="champ-app">
              <Icone nom="profil" taille={22} />
              <span className="champ-empile">
                <small>{p('Prénom — affiché publiquement')}</small>
                <input
                  value={identite.prenom}
                  disabled
                  aria-describedby="prenom-verifie"
                  style={{ minHeight: 26 }}
                />
              </span>
            </label>
            <div id="prenom-verifie" className="encart gris">
              <Icone nom="cadenas" taille={22} />
              <span>
                {p(
                  'Ce prénom figure sur la pièce que nous avons vérifiée. Pour le changer, écrivez-nous en expliquant pourquoi.',
                )}
              </span>
            </div>
            <Link href="/contact" className="bouton contour">
              {p('Demander une modification')}
            </Link>
            {coordonnees}
          </div>
        )}
      </div>
    </main>
  );
}
