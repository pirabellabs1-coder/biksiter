import type { Textes } from '@/lib/i18n/langue';

/**
 * Le dépôt sécurisé en quatre temps (planche 15) : préparer, photographier,
 * remettre avec le code, puis restituer. La barre dit où l'on en est.
 */
export function EtapesDuDepot({
  p,
  etape,
}: {
  p: Textes['p'];
  etape: 1 | 2 | 3 | 4;
}) {
  return (
    <>
      <div className="etapes-app">
        <span>{p('{n} / 4', { n: etape })}</span>
        <span
          className="barre"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={etape}
          aria-label={p('Étape {n} sur 4', { n: etape })}
        >
          <span style={{ width: `${etape * 25}%` }} />
        </span>
      </div>
      <p className="surtitre-etape">
        {etape === 4 ? p('Restitution') : p('Dépôt')}
      </p>
    </>
  );
}
