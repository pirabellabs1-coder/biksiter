-- La progression des maquettes définitives : points, badges, niveaux et
-- classement « Top Bike Sitters » (CLAUDE.md, règle 3).

-- On n'apparaît dans un classement que si on l'a choisi.
alter table membre
  add column apparait_au_classement boolean not null default false;

comment on column membre.apparait_au_classement is
  'Choix du membre : figurer dans le classement Top Bike Sitters. Faux par défaut.';

-- La fiche d'un avantage du catalogue : ce qu'il est, où le retirer.
alter table offre
  add column description text check (description is null or length(description) <= 600),
  add column categorie   text not null default 'autre'
    check (categorie in ('securite', 'equipement', 'entretien', 'autre')),
  add column retrait     text check (retrait is null or length(retrait) <= 300);
