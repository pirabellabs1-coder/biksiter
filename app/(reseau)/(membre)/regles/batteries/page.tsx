import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Vélos électriques') };
}

export default async function BatteriesDesVelosElectriques() {
  await exigerUnMembre();
  const { p } = await textes();

  const aVerifier = [
    p('Une batterie d’origine ou compatible avec le vélo'),
    p('Un aspect normal, sans déformation'),
    p('Une batterie propre et sèche'),
    p('Ni chaleur ni odeur inhabituelle'),
  ];
  const refus = [
    p('Gonflée ou déformée'),
    p('Anormalement chaude'),
    p('Endommagée : fissures, traces de choc'),
    p('Qui dégage une odeur inhabituelle (brûlé, produit chimique)'),
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/regles" />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Vélos électriques')}</h1>
        <p className="sous-titre">{p('Quelques vérifications sur la batterie, au moment du dépôt.')}</p>

        <div className="carte">
          <strong style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <Icone nom="batterie" taille={22} className="texte-vert" />
            {p('À vérifier')}
          </strong>
          <ul className="pile" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 6 }}>
            {aVerifier.map((point) => (
              <li key={point} style={{ display: 'flex', gap: 8 }}>
                <Icone nom="coche" taille={18} className="texte-vert" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="encart rouge" style={{ marginTop: 12, flexDirection: 'column', gap: 6 }}>
          <strong style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Icone nom="alerte" taille={22} />
            {p('Le vélo n’est pas accueilli si la batterie est :')}
          </strong>
          {refus.map((point) => (
            <span key={point} style={{ display: 'flex', gap: 8 }}>
              <Icone nom="croix" taille={16} />
              {point}
            </span>
          ))}
        </div>

        <div className="encart" style={{ marginTop: 12 }}>
          <Icone nom="info" taille={20} />
          <span>
            {p('Au moment du dépôt, le bike sitter peut refuser le vélo depuis l’écran du code : la garde est annulée simplement, sans reproche pour personne. En cas de doute, n’accueillez pas le vélo.')}
          </span>
        </div>

        <div className="boutons" style={{ marginTop: 16 }}>
          <Link href="/regles" className="bouton plein">
            {p('Continuer')}
          </Link>
        </div>
      </div>
    </main>
  );
}
