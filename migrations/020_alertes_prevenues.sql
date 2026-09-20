-- Une alerte de recherche prévient une fois : dès qu'un lieu ouvre près de
-- l'endroit cherché. Ensuite elle reste dans la liste du membre, marquée.
alter table alerte_de_recherche
  add column prevenue_le timestamptz;

create index alerte_a_prevenir on alerte_de_recherche (creee_le) where prevenue_le is null;
