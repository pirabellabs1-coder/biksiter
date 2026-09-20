-- Le dépôt sécurisé en quatre étapes (planche 15 des maquettes).
--
-- Le cycliste photographie son vélo au moment de le remettre, puis au moment
-- de le reprendre, avant que le code ne soit saisi. Le bike sitter voit ces
-- photos avant de saisir le code du dépôt, et peut y joindre une réserve.

-- Jusqu'à quatre photos : côté gauche, côté droit, avant et accessoires,
-- dégâts existants.
alter table photo_de_constat drop constraint photo_de_constat_rang_check;
alter table photo_de_constat add constraint photo_de_constat_rang_check
  check (rang between 0 and 3);

alter table constat
  -- Pour un vélo électrique : le cycliste confirme avoir vérifié la batterie.
  add column batterie_verifiee boolean,
  -- Ce que le bike sitter a remarqué en recevant le vélo, s'il y a lieu.
  add column reserve text check (reserve is null or length(trim(reserve)) between 1 and 600),
  add column reserve_le timestamptz,
  -- Une réserve porte toujours sa date, et une date toujours sa réserve.
  add constraint constat_reserve_datee check ((reserve is null) = (reserve_le is null));
