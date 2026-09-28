/**
 * Alléger une photo dans le navigateur, avant de l'envoyer.
 *
 * Une photo de téléphone pèse souvent plus que ce qu'une requête peut porter
 * chez l'hébergeur (4,5 Mo). Réduite à 2 000 pixels et ré-encodée en JPEG,
 * elle ne pèse plus que quelques centaines de kilo-octets, et le serveur la
 * décode sans effort. Le serveur ré-encode de toute façon ce qu'il reçoit :
 * ce n'est qu'un allègement du trajet, jamais une garantie.
 */

/** Le plus grand côté envoyé : bien assez pour voir un visage ou un vélo. */
const COTE_MAXIMAL_ENVOYE = 2000;

/**
 * Ce qu'une requête peut porter chez l'hébergeur, avec une marge : au-delà,
 * l'envoi échouerait sans que l'écran puisse l'expliquer.
 */
export const POIDS_MAXIMAL_D_UN_ENVOI = 4 * 1024 * 1024;

/** Les formats qu'on demande au téléphone : un iPhone convertit alors ses HEIC en JPEG. */
export const FORMATS_DEMANDES = 'image/jpeg,image/png,image/webp';

export async function reduireUnePhoto(photo: File, nom = 'photo.jpg'): Promise<File> {
  try {
    const image = await createImageBitmap(photo);
    const echelle = Math.min(
      1,
      COTE_MAXIMAL_ENVOYE / Math.max(image.width, image.height),
    );
    const toile = document.createElement('canvas');
    toile.width = Math.round(image.width * echelle);
    toile.height = Math.round(image.height * echelle);
    toile.getContext('2d')?.drawImage(image, 0, 0, toile.width, toile.height);
    image.close();
    const blob = await new Promise<Blob | null>((resoudre) =>
      toile.toBlob(resoudre, 'image/jpeg', 0.85),
    );
    return blob && blob.size < photo.size
      ? new File([blob], nom, { type: 'image/jpeg' })
      : photo;
  } catch {
    // Un format que le navigateur ne sait pas lire part tel quel : le serveur
    // dira s'il l'accepte.
    return photo;
  }
}
