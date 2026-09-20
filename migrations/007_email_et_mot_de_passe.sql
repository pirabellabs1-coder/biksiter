-- La confirmation de l'adresse e-mail, et le mot de passe oublié.
--
-- Les deux reposent sur un lien envoyé par courriel, qui ne sert qu'une fois
-- et expire. On garde l'empreinte du jeton, jamais le jeton : une fuite de
-- cette table ne doit donner à personne de quoi confirmer une adresse ou
-- changer un mot de passe.

alter table membre
  add column email_verifie_le timestamptz;

-- Les comptes créés avant cette migration n'ont jamais reçu de lien : leur
-- adresse est tenue pour confirmée, comme elle l'était jusqu'ici.
update membre set email_verifie_le = cree_le where email_verifie_le is null;

create table jeton_a_usage_unique (
  empreinte   text primary key,
  membre_id   uuid not null references membre(id) on delete cascade,
  usage       text not null check (usage in ('confirmation_email', 'nouveau_mot_de_passe')),
  emis_le     timestamptz not null default now(),
  expire_le   timestamptz not null,
  utilise_le  timestamptz,

  constraint jeton_expire_apres_emission check (expire_le > emis_le)
);

create index jeton_par_membre on jeton_a_usage_unique (membre_id, usage);
create index jeton_a_purger on jeton_a_usage_unique (expire_le);

comment on table jeton_a_usage_unique is
  'Liens envoyés par courriel : confirmation d''adresse et nouveau mot de passe. '
  'Empreinte SHA-256 seulement ; un jeton sert une fois.';
