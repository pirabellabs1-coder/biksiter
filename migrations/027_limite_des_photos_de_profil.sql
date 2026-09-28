-- Une limite aux changements de photo de profil.
--
-- Chaque photo envoyée est décodée puis ré-encodée par le serveur : sans
-- limite, un compte pourrait l'occuper à décoder des images en boucle. Une
-- personne de bonne foi change sa photo quelques fois, pas dix fois par heure.

alter table tentative drop constraint tentative_nature_check;
alter table tentative add constraint tentative_nature_check check (nature in (
  'code_sms_envoye',
  'code_sms_refuse',
  'connexion_refusee',
  'courriel_de_compte',
  'consultation_invitation',
  'inscription_refusee',
  'message_envoye',
  'demande_envoyee',
  'remise_refusee',
  'demande_modifiee',
  'prolongation_demandee',
  'photo_de_profil'));
