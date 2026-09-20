-- Les favoris : les lieux qu'un cycliste garde sous la main (planche 21).
-- Une liste privée : personne d'autre ne la voit, et un bike sitter ne sait
-- pas qui l'a mis en favori.
create table favori (
  membre_id       uuid not null references membre(id) on delete cascade,
  emplacement_id  uuid not null references emplacement(id) on delete cascade,
  cree_le         timestamptz not null default now(),
  primary key (membre_id, emplacement_id)
);
