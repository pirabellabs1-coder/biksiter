/**
 * Remplace `server-only` pendant les tests (voir vitest.config.ts).
 *
 * Le vrai paquet lève une exception dès qu'il est importé hors d'un composant
 * serveur, ce qui est exactement son intérêt en production — et exactement ce
 * qui empêcherait de tester les modules qui s'en servent.
 */
export {};
