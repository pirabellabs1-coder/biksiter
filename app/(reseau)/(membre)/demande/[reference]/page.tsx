import type { Metadata } from 'next';

import { NouvelleDemande } from './nouvelle-demande';
import { VueDeLaDemande } from './vue-de-la-demande';

/**
 * `/demande/…` sert deux écrans :
 *   - avec la référence d'un emplacement (« parvis-de-saint-gilles-tom-b84a »),
 *     le formulaire où le cycliste prépare et envoie sa demande ;
 *   - avec l'identifiant d'une garde, la demande telle que la voit celui qui
 *     doit y répondre (ou qui l'a envoyée).
 * Une référence d'emplacement n'a jamais la forme d'un identifiant : c'est ce
 * qui les départage.
 */
const EST_UN_IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  return { title: EST_UN_IDENTIFIANT.test(reference) ? 'La demande' : 'Votre demande' };
}

export default async function Demande({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { reference } = await params;
  if (EST_UN_IDENTIFIANT.test(reference)) {
    return <VueDeLaDemande reference={reference} />;
  }
  return <NouvelleDemande reference={reference} parametres={await searchParams} />;
}
