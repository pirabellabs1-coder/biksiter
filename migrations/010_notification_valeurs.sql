-- Une notification se lit dans la langue de celui qui la reçoit : on garde la
-- phrase française avec ses emplacements (« {prenom} a accepté votre
-- demande »), et les valeurs à part. La traduction se fait à l'affichage.

alter table notification
  add column valeurs jsonb not null default '{}'::jsonb;
