'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { estUnMode, TEMOIN_DE_MODE } from '@/lib/mode';
import { exigerUnMembre } from '@/lib/session';

/** Un an : le mode choisi reste celui qu'on retrouve en revenant. */
const UN_AN = 60 * 60 * 24 * 365;

export async function choisirLeMode(donnees: FormData): Promise<void> {
  await exigerUnMembre();
  const mode = donnees.get('mode');
  if (estUnMode(mode)) {
    (await cookies()).set(TEMOIN_DE_MODE, mode, {
      maxAge: UN_AN,
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }
  redirect('/accueil');
}
