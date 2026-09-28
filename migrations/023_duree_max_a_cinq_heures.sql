-- =============================================================================
-- La durée d'affilée qu'un bike sitter accepte : le réseau plafonne à cinq
-- heures.
--
-- La liste d'origine — 1, 3, 8, 24 — décrivait un autre produit : une journée
-- entière de garde. Les maquettes définitives plafonnent à cinq heures et
-- proposent trois par défaut. La contrainte suit, sinon la base refuserait ce
-- que l'écran des disponibilités propose.
-- =============================================================================

-- Les lignes existantes d'abord : une valeur hors de la nouvelle liste
-- empêcherait la contrainte de s'appliquer.
update emplacement
   set duree_max_heures = 3
 where duree_max_heures not in (1, 2, 3, 4, 5);

alter table emplacement
  drop constraint emplacement_duree_max_heures_check;

alter table emplacement
  add constraint emplacement_duree_max_heures_check
  check (duree_max_heures in (1, 2, 3, 4, 5));

-- Le défaut de la colonne valait huit : ce n'est plus une valeur possible.
alter table emplacement
  alter column duree_max_heures set default 3;
