-- Règle 5 : le code de remise passe à six chiffres. Un million de combinaisons
-- au lieu de dix mille ; il se dicte encore en deux groupes de trois.
-- Les codes à quatre chiffres encore vivants sont consommés : celui qui remet
-- le vélo en affichera simplement un nouveau.

update code_de_remise set consomme_le = now() where consomme_le is null;

alter table code_de_remise drop constraint code_de_remise_chiffres_check;
-- Les anciens codes consommés gardent leurs quatre chiffres : ils ne servent
-- plus qu'à l'historique.
alter table code_de_remise add constraint code_de_remise_chiffres_check
  check (chiffres ~ '^[0-9]{6}$'
         or (consomme_le is not null and chiffres ~ '^[0-9]{4}$'));
