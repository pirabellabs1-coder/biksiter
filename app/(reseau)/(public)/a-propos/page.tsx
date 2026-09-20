import type { Metadata } from 'next';

import { Icone, type NomDIcone } from '@/components/app/icone';
import { ASSOCIATION } from '@/lib/contenu/association';
import { textes } from '@/lib/i18n/langue';

import { BlocDeCote, ListeDeLiens, PagePublique } from '../page-publique';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('À propos de Bike Sitters') };
}

export default async function APropos() {
  const lesTextes = await textes();
  const { t, p } = lesTextes;
  const { fondateur, numeroDEntreprise } = ASSOCIATION;

  const reperes: [NomDIcone, string, string][] = [
    ['coeur', p('Gratuit'), p('pour chaque garde')],
    ['utilisateurs', p('Entraide'), p('entre voisins')],
    ['epingle', p('Bruxelles'), p('premier quartier')],
  ];

  const recit: [NomDIcone, string, string][] = [
    ['cadenas', t('ab.why'), t('ab.whyd')],
    ['maison', t('ab.how'), t('ab.howd')],
    ['epingle', t('ab.where'), t('ab.whered')],
  ];

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('L’association')}
      titre={p('À propos de Bike Sitters')}
      introduction={p(
        'Bike Sitters est une association bruxelloise à but non lucratif qui met en relation les cyclistes de la ville avec des particuliers qui accueillent leur vélo dans un espace privé.',
      )}
      cote={
        <>
          <BlocDeCote titre={p('En bref')}>
            <ul className="reperes">
              {reperes.map(([icone, mot, precision]) => (
                <li key={mot}>
                  <Icone nom={icone} taille={20} />
                  <span>
                    <strong>{mot}</strong> {precision}
                  </span>
                </li>
              ))}
            </ul>
          </BlocDeCote>
          <BlocDeCote titre={p('Pour aller plus loin')}>
            <ListeDeLiens
              liens={[
                ['velo', p('Comment ça marche'), '/comment-ca-marche'],
                ['bouclier', p('Sécurité'), '/securite'],
                ['aide', p('Questions fréquentes'), '/faq'],
                ['messages', p('Contact'), '/contact'],
              ]}
            />
          </BlocDeCote>
        </>
      }
    >
      {/* Un visage et un prénom : on confie son vélo à des gens, pas à un
          service. La carte n'apparaît qu'avec une vraie personne. */}
      <div className="texte-d-ouverture">
        {fondateur ? (
          <div className="ligne sans-cadre" style={{ padding: '0 0 12px' }}>
            <span className="avatar-app" aria-hidden="true">
              {fondateur.prenom.charAt(0)}
            </span>
            <span className="ligne-texte">
              <strong>{fondateur.prenom}</strong>
              <span>{fondateur.role}</span>
            </span>
          </div>
        ) : null}
        <p>{t('ab.who')}</p>
      </div>

      <ul className="grille-de-cartes">
        {recit.map(([icone, titre, texte]) => (
          <li key={titre} className="carte-de-contenu">
            <span className="carte-de-contenu-icone" aria-hidden="true">
              <Icone nom={icone} taille={22} />
            </span>
            <h2>{titre}</h2>
            <p>{texte}</p>
          </li>
        ))}
      </ul>

      {numeroDEntreprise ? (
        <p className="petit texte-doux" style={{ margin: '24px 0 0' }}>
          {ASSOCIATION.nom} · {p(ASSOCIATION.forme)} ·{' '}
          {p('Numéro d’entreprise : {numero}', { numero: numeroDEntreprise })}
        </p>
      ) : null}
    </PagePublique>
  );
}
