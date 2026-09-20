/**
 * L'avancement d'un parcours en plusieurs écrans : « 2/3 » dans la barre de
 * titre, et une barre segmentée juste en dessous.
 */
export function NumeroDEtape({
  etape,
  total,
}: {
  etape: number;
  total: number;
}) {
  return (
    <span className="t-xs muted etape">
      {etape}/{total}
    </span>
  );
}

export function BarreDEtapes({
  etape,
  total,
  libelle,
}: {
  etape: number;
  total: number;
  libelle: string;
}) {
  return (
    <div
      className="steps"
      role="progressbar"
      aria-label={libelle}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={etape}
    >
      {Array.from({ length: total }, (_, rang) => (
        <div key={rang} className={rang < etape ? 'step on' : 'step'} />
      ))}
    </div>
  );
}
