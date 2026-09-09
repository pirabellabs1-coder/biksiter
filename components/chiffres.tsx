import type { Chiffre } from '@/lib/regles/chiffres';

/**
 * Le terme vient avant sa description dans le document — c’est ce qu’attend
 * une liste de définitions. L’inversion visuelle (le nombre au-dessus) est
 * faite en CSS, pour que la lecture au clavier et au lecteur d’écran garde
 * l’ordre « libellé, puis valeur ».
 */
export default function Chiffres({
  chiffres,
}: {
  chiffres: readonly Chiffre[];
}) {
  return (
    <dl className="chiffres">
      {chiffres.map((chiffre) => (
        <div key={chiffre.libelle}>
          <dt className="chiffre__libelle">{chiffre.libelle}</dt>
          <dd className="chiffre__valeur">{chiffre.valeur}</dd>
        </div>
      ))}
    </dl>
  );
}
