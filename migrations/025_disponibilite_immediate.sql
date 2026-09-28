-- =============================================================================
-- La disponibilité immédiate d'un bike sitter.
--
-- « Disponible tout de suite » : pendant une heure, le bike sitter passe en tête
-- des résultats pour les gardes qui commencent dans cette heure. La colonne
-- garde l'instant où cela s'éteint ; passé cet instant, elle ne compte plus,
-- sans qu'aucune tâche n'ait à la remettre à zéro.
-- =============================================================================

alter table emplacement
  add column disponible_jusqu_a timestamptz;

comment on column emplacement.disponible_jusqu_a is
  'Fin de la disponibilité immédiate du bike sitter ; sans effet une fois passée.';
