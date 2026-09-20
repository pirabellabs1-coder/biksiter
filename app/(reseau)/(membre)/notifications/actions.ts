'use server';

import { revalidatePath } from 'next/cache';

import { toutMarquerCommeLu } from '@/lib/depot/notifications';
import { exigerUnMembre } from '@/lib/session';

export async function toutLire(): Promise<void> {
  const membre = await exigerUnMembre();
  await toutMarquerCommeLu(membre.id);
  revalidatePath('/notifications');
}
