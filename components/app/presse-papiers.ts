/**
 * Copier un texte, sur tous les navigateurs.
 *
 * `navigator.clipboard` n'existe que dans un contexte sûr (HTTPS) et peut être
 * refusé (réglages, navigateur intégré d'une application). On retombe alors
 * sur l'ancienne méthode — un champ temporaire sélectionné — qui fonctionne
 * encore presque partout. Renvoie `false` si rien n'a marché : l'écran montre
 * alors le texte, prêt à être sélectionné à la main.
 */
export async function copierLeTexte(texte: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texte);
      return true;
    }
  } catch {
    // On tente la méthode de repli.
  }
  try {
    const champ = document.createElement('textarea');
    champ.value = texte;
    champ.setAttribute('readonly', '');
    champ.style.position = 'fixed';
    champ.style.top = '-1000px';
    champ.style.opacity = '0';
    document.body.appendChild(champ);
    champ.select();
    champ.setSelectionRange(0, texte.length);
    const reussi = document.execCommand('copy');
    document.body.removeChild(champ);
    return reussi;
  } catch {
    return false;
  }
}
