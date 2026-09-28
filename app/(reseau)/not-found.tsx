import { PageIntrouvable } from '@/components/maquette/page-introuvable';

/** Une adresse inconnue sur le site : on propose de repartir de l'accueil. */
export default function IntrouvableSurLeSite() {
  return <PageIntrouvable membre={false} />;
}
