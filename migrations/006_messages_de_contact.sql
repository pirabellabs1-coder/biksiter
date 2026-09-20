-- Les messages envoyés depuis la page Contact du site public.
--
-- Ils arrivent dans l'administration (« Messages reçus »), où un modérateur
-- les marque traités. Le traitement est daté et signé, comme toute action de
-- modération.

create table message_de_contact (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  sujet       text not null check (sujet in ('question', 'garde', 'abus', 'presse')),
  message     text not null check (length(trim(message)) between 1 and 5000),
  recu_le     timestamptz not null default now(),
  traite_le   timestamptz,
  traite_par  uuid references membre(id) on delete set null,

  -- Un traitement est toujours daté. Le modérateur, lui, peut avoir quitté
  -- le réseau depuis : la date reste, le nom s'efface.
  constraint message_de_contact_traitement_date
    check (traite_par is null or traite_le is not null)
);

create index message_de_contact_a_traiter on message_de_contact (recu_le)
  where traite_le is null;

-- La limite par adresse se compte sur les dernières vingt-quatre heures.
create index message_de_contact_par_adresse on message_de_contact (lower(email), recu_le);
