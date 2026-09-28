import { Avatar } from '@/components/app/avatar';

/**
 * La personne qu'on retrouve devant la porte, avec son visage quand elle a
 * mis une photo : c'est à elle, et à elle seule, qu'on remet le vélo ou
 * qu'on lit le code.
 */
export function PersonneALaPorte({
  personne,
  role,
}: {
  personne: {
    id: string;
    prenom: string;
    initiale: string;
    verifie: boolean;
    photo: string | null;
  };
  /** Ce qu'est la personne dans cette garde, écrit sous son nom. */
  role: string;
}) {
  return (
    <div className="personne-a-la-porte">
      <Avatar
        membreId={personne.id}
        prenom={personne.prenom}
        version={personne.photo}
        taille={52}
      />
      <span>
        <strong>
          {personne.prenom} {personne.initiale}.
        </strong>
        <span className="gris">{role}</span>
      </span>
      {personne.verifie ? (
        <span className="tag ver">Identité vérifiée</span>
      ) : null}
    </div>
  );
}
