import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { baseConfiguree } from '@/lib/bd/client';
import {
  DUREE_DE_SESSION_JOURS,
  fermerLaSession,
  membreDeLaSession,
  type MembreConnecte,
} from '@/lib/depot/sessions';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { ACCUEIL_DES_MEMBRES } from '@/lib/navigation';
import type { Membre as MembreDesRegles } from '@/lib/regles/publication';

export const NOM_DU_COOKIE = 'bike_sitters_session';

/**
 * Le cookie ne contient qu'un jeton opaque : ni identifiant de membre, ni
 * état de vérification. Tout ce qui décide d'une autorisation est relu en
 * base à chaque requête — sinon révoquer un compte ne servirait à rien tant
 * que son cookie n'aurait pas expiré.
 */
const OPTIONS_DU_COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: DUREE_DE_SESSION_JOURS * 24 * 60 * 60,
};

export async function membreConnecte(): Promise<MembreConnecte | null> {
  if (!baseConfiguree()) {
    return null;
  }

  const jeton = (await cookies()).get(NOM_DU_COOKIE)?.value;
  if (!jeton) {
    return null;
  }

  return membreDeLaSession(jeton);
}

/** Pour les pages réservées aux membres. */
export async function exigerUnMembre(): Promise<MembreConnecte> {
  const membre = await membreConnecte();
  if (!membre) {
    redirect('/bienvenue');
  }
  return membre;
}

/**
 * Pour les pages de modération.
 *
 * Un membre connecté mais non modérateur est renvoyé sur son compte, pas sur
 * une page d'erreur : il n'a rien fait de mal, cette porte n'est simplement
 * pas la sienne. Et surtout, une page qui répondrait « accès refusé » plutôt
 * que « cette page n'existe pas pour vous » confirmerait à qui cherche que
 * l'adresse existe.
 */
export async function exigerUnModerateur(): Promise<MembreConnecte> {
  const membre = await exigerUnMembre();
  if (!membre.moderateur) {
    redirect(ACCUEIL_DES_MEMBRES);
  }
  return membre;
}

export async function poserLeCookieDeSession(jeton: string): Promise<void> {
  (await cookies()).set(NOM_DU_COOKIE, jeton, OPTIONS_DU_COOKIE);
}

export async function seDeconnecter(): Promise<void> {
  const boite = await cookies();
  const jeton = boite.get(NOM_DU_COOKIE)?.value;
  if (jeton && baseConfiguree()) {
    await fermerLaSession(jeton);
  }
  boite.delete(NOM_DU_COOKIE);
}

/**
 * Le membre tel que les règles le voient. Un visiteur est un membre dont
 * l'identité n'est pas vérifiée et qui n'a aucun emplacement : c'est le cas le
 * plus fermé, donc le bon défaut.
 */
export async function membrePourLesRegles(): Promise<MembreDesRegles> {
  const membre = await membreConnecte();

  if (!membre) {
    return { verification: 'absente', emplacementsPublies: 0 };
  }

  return {
    verification: membre.verification,
    emplacementsPublies: await nombreDEmplacements(membre.id),
  };
}
