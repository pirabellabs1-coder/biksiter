-- La suppression d'un compte.
--
-- Supprimer la ligne du membre effacerait aussi, en cascade, l'historique des
-- gardes de l'autre personne et les avis qu'elle a reçus. On efface donc ce qui
-- identifie la personne, et l'on garde ce qui appartient aussi aux autres :
-- une garde passée, un avis anonyme, une trace de modération.

alter table membre
  add column supprime_le timestamptz;

comment on column membre.supprime_le is
  'Compte supprimé par son titulaire : nom, coordonnées et contenus personnels effacés.';
