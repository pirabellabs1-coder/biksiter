-- L'administration de l'application (planches 26 et 27 des maquettes).
--
-- Chaque geste d'une personne qui modère laisse une trace datée et motivée :
-- suspendre un compte, corriger des points, trancher un litige, traiter un
-- signalement. La trace survit au geste ; elle ne contient ni adresse, ni
-- message, ni document.

create table action_de_moderation (
  id          uuid primary key default gen_random_uuid(),
  -- Le membre concerné ; vide pour un geste qui ne vise personne (une offre).
  membre_id   uuid references membre(id) on delete set null,
  decide_par  uuid references membre(id) on delete set null,
  action      text not null check (action in (
                'compte_suspendu', 'compte_reactive', 'points_corriges',
                'litige_tranche', 'signalement_traite', 'offre_modifiee')),
  motif       text not null check (length(trim(motif)) between 5 and 600),
  details     jsonb not null default '{}'::jsonb,
  fait_le     timestamptz not null default now()
);

create index action_de_moderation_recente on action_de_moderation (fait_le desc);
create index action_de_moderation_par_membre on action_de_moderation (membre_id, fait_le desc);

alter table signalement
  add column traite_par          uuid references membre(id) on delete set null,
  add column traite_le           timestamptz,
  add column note_de_moderation  text check (note_de_moderation is null or length(note_de_moderation) <= 600);

-- Une correction de points n'a ni garde ni échange : son motif est obligatoire.
alter table maillon add constraint maillon_correction_motivee
  check (stationnement_id is not null or echange_id is not null
         or (motif is not null and length(trim(motif)) >= 5));
