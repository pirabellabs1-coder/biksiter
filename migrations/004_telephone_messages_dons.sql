-- =============================================================================
-- Le téléphone, les échanges entre membres, et les dons.
-- =============================================================================

-- --- La file sortante porte maintenant deux canaux ---------------------------
-- Le SMS est réservé à la vérification (le coût par message en Belgique
-- interdit d'en faire un canal de rappel), mais il part par le même chemin que
-- les courriels : écrit dans la transaction, drainé par un script. La table
-- change de nom parce qu'elle ne contient plus seulement des courriels.

alter table courriel rename to message_sortant;
alter index courriel_a_envoyer rename to message_sortant_a_envoyer;

alter table message_sortant
  add column canal text not null default 'courriel'
  check (canal in ('courriel', 'sms'));

comment on table message_sortant is
  'File d''attente sortante, courriels et SMS. Rien n''est envoyé depuis une '
  'requête web : un script draine cette table.';

-- --- La vérification du téléphone --------------------------------------------

alter table membre
  add column telephone_verifie_le timestamptz;

-- Un seul code vivant par membre. On garde l'empreinte et non le code : une
-- fuite de cette table ne doit donner à personne le moyen de se faire passer
-- pour quelqu'un le temps que le code expire.
create table code_telephone (
  membre_id        uuid primary key references membre(id) on delete cascade,
  telephone        text not null,
  empreinte        text not null,
  emis_le          timestamptz not null default now(),
  essais_utilises  integer not null default 0 check (essais_utilises between 0 and 3)
);

-- --- Les échanges autour d'un stationnement ----------------------------------
-- Ce qui remplace le chat en temps réel, écarté parce qu'il crée une attente
-- de réponse que des bénévoles ne tiennent pas. Ici : des messages, pas de
-- compteur, pas d'accusé de lecture, pas d'indicateur de saisie.

create table message (
  id                uuid primary key default gen_random_uuid(),
  stationnement_id  uuid not null references stationnement(id) on delete cascade,
  auteur_id         uuid not null references membre(id) on delete cascade,
  corps             text not null check (length(trim(corps)) between 1 and 2000),
  ecrit_le          timestamptz not null default now()
);

create index message_par_stationnement on message (stationnement_id, ecrit_le);

comment on table message is
  'Échanges autour d''un stationnement. Pas d''accusé de lecture : personne '
  'ne doit pouvoir reprocher à un bénévole de ne pas avoir répondu assez vite.';

-- --- Les dons -----------------------------------------------------------------
-- Il n'y a pas de paiement en ligne : un virement ne coûte rien à l'association
-- alors qu'une carte lui prend une commission sur chaque don. Cette table ne
-- retient donc qu'une intention et la communication structurée qui permettra de
-- rapprocher le virement quand il arrivera.
--
-- Elle ne contient aucune donnée bancaire, et n'en contiendra pas.

create table don (
  id             uuid primary key default gen_random_uuid(),
  prenom         text,
  email          text,
  montant_annonce integer check (montant_annonce is null or montant_annonce > 0),
  communication  text not null unique
                 check (communication ~ '^\+\+\+[0-9]{3}/[0-9]{4}/[0-9]{5}\+\+\+$'),
  annonce_le     timestamptz not null default now(),
  recu_le        timestamptz
);

create index don_a_rapprocher on don (annonce_le) where recu_le is null;

-- Le numéro qui alimente la communication structurée. Une séquence plutôt
-- qu'un « count(*) + 1 » : deux dons annoncés à la même seconde recevraient
-- sinon la même communication, et deviendraient impossibles à distinguer sur
-- l'extrait de compte.
create sequence don_numero start 1;
