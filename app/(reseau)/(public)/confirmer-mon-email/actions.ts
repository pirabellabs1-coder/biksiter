'use server';

import { redirect } from 'next/navigation';

import { baseConfiguree } from '@/lib/bd/client';
import { confirmerLAdresse } from '@/lib/depot/comptes';
import { texte } from '@/lib/formulaires/etat';
import { membreConnecte } from '@/lib/session';

/**
 * La confirmation se fait par un bouton, jamais à l'ouverture du lien : une
 * messagerie qui ouvre les liens pour en afficher l'aperçu confirmerait sinon
 * une adresse à la place de la personne à qui elle appartient.
 */
export async function confirmerMonAdresse(donnees: FormData): Promise<void> {
  const jeton = texte(donnees, 'jeton').slice(0, 100);
  const confirme =
    jeton !== '' && baseConfiguree() && (await confirmerLAdresse(jeton));

  const suite = (await membreConnecte())
    ? '/inscription/telephone'
    : '/connexion';
  redirect(`${suite}?email=${confirme ? 'confirme' : 'lien-perime'}`);
}
