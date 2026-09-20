import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import type { AvisAffiche } from '@/lib/depot/reseau';
import type { Textes } from '@/lib/i18n/langue';
import { enJour } from '@/lib/temps';

type P = Textes['p'];

/** Cinq étoiles pour l'œil ; la note en toutes lettres pour le lecteur d'écran. */
export function NoteEnEtoiles({ p, note }: { p: P; note: number }) {
  const arrondie = Math.round(note);
  return (
    <span className="etoiles">
      {[1, 2, 3, 4, 5].map((rang) => (
        <Icone
          key={rang}
          nom="etoile"
          taille={16}
          plein={rang <= arrondie}
          className={rang <= arrondie ? 'note-fiche' : 'texte-leger'}
        />
      ))}
      <span className="lecteur">
        {note} {p('sur 5')}
      </span>
    </span>
  );
}

/**
 * Un avis publié, dans l'écriture des maquettes : qui l'a écrit, sa note, son
 * texte, le détail par critère et la réponse de la personne visée. Jamais de
 * suppression : une réponse, ou une contestation.
 */
export function CarteDAvisPublie({
  p,
  avis,
  actions = false,
}: {
  p: P;
  avis: AvisAffiche;
  /** Vrai quand la personne visée consulte ses propres avis. */
  actions?: boolean;
}) {
  const criteres = Object.entries(avis.criteres ?? {});
  const peutRepondre = actions && !avis.reponse;
  const peutContester = actions && !avis.conteste;

  return (
    <article className="carte">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="avatar-app" aria-hidden="true">
          {avis.auteurPrenom.charAt(0)}
        </span>
        <span className="ligne-texte">
          <strong>{avis.auteurPrenom}</strong>
          <span>{enJour(new Date(avis.ecritLe))}</span>
        </span>
        <NoteEnEtoiles p={p} note={avis.note} />
      </div>

      {avis.texte ? (
        <p className="texte-fiche" style={{ marginTop: 10 }}>
          {avis.texte}
        </p>
      ) : null}

      {criteres.length > 0 ? (
        <ul className="conditions" style={{ marginTop: 8 }}>
          {criteres.map(([critere, valeur]) => (
            <li key={critere}>
              <span className="texte-doux">{p(critere)}</span>
              <span className="pastille gris">
                <Icone nom="etoile" taille={12} plein />
                {valeur}
                <span className="lecteur">{p('sur 5')}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {avis.reponse ? (
        <div className="encart gris" style={{ marginTop: 10 }}>
          <Icone nom="messages" taille={20} />
          <span>
            <strong>{p('Réponse')}</strong>
            {avis.reponse}
          </span>
        </div>
      ) : null}

      {avis.conteste ? (
        <p style={{ margin: '10px 0 0' }}>
          <span className="pastille ambre">
            <Icone nom="horloge" taille={14} />
            {p('Le signalement a été transmis à la modération.')}
          </span>
        </p>
      ) : null}

      {peutRepondre || peutContester ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {peutRepondre ? (
            <Link href={`/profil/avis/${avis.id}/repondre`} className="bouton contour petit">
              <Icone nom="messages" taille={18} />
              {p('Répondre')}
            </Link>
          ) : null}
          {peutContester ? (
            <Link href={`/profil/avis/${avis.id}/contester`} className="bouton discret petit">
              <Icone nom="drapeau" taille={18} />
              {p('Contester')}
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
