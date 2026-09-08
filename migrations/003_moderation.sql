-- =============================================================================
-- La vérification d'identité, et la trace de ce qu'une personne a décidé.
--
-- Règle 2 : personne ne publie sans avoir été vérifié par un humain. Cette
-- migration donne à cet humain de quoi travailler — et encadre ce qu'il
-- manipule, parce qu'il s'agit de pièces d'identité.
-- =============================================================================

-- --- Qui modère --------------------------------------------------------------
-- Un drapeau plutôt qu'une table de rôles : il n'y a qu'un rôle, et il n'y en
-- aura pas d'autre tant que l'association tient dans une pièce. Le jour où il
-- en faudra plusieurs, ce sera une table — pas six drapeaux de plus.

alter table membre
  add column moderateur boolean not null default false;

comment on column membre.moderateur is
  'Peut relire les pièces d''identité et vérifier des membres. '
  'Se pose à la main, jamais depuis l''application.';

-- --- Les pièces d'identité ---------------------------------------------------
-- Le document est chiffré (AES-256-GCM) avant d'arriver ici : la base ne
-- contient aucune pièce lisible, même pour qui aurait le fichier de sauvegarde.
-- La clé vit dans l'environnement, pas dans la base.
--
-- Il n'y a pas de colonne « numéro de pièce » et il n'y en aura pas : on ne
-- conserve que le fait qu'une vérification a eu lieu.

create table piece_didentite (
  id                uuid primary key default gen_random_uuid(),
  membre_id         uuid not null references membre(id) on delete cascade,

  -- Le contenu chiffré, et de quoi le déchiffrer sans la clé : le vecteur
  -- d'initialisation et l'étiquette d'authentification. Ni l'un ni l'autre
  -- n'est secret ; c'est la clé qui l'est.
  contenu_chiffre   bytea not null,
  vecteur           bytea not null,
  etiquette         bytea not null,

  type_mime         text not null check (type_mime in (
                      'image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  taille_en_octets  integer not null check (taille_en_octets > 0),

  deposee_le        timestamptz not null default now(),
  -- Renseigné au moment où une personne tranche. La ligne est supprimée dans
  -- la foulée : cette colonne n'existe que pour le cas où la suppression
  -- échouerait, afin que la purge la rattrape.
  relue_le          timestamptz
);

-- Une seule pièce vivante par membre : en redéposer une remplace l'ancienne.
create unique index piece_par_membre on piece_didentite (membre_id);

-- Ce que lit la purge : les pièces relues, et celles qui ont dépassé sept jours.
create index piece_a_purger on piece_didentite (deposee_le);

comment on table piece_didentite is
  'Chiffrée au repos. Supprimée dès la vérification, et au plus tard après '
  'sept jours — voir lib/regles/pieces.ts et « npm run bd:purger ».';

-- --- Le journal de modération ------------------------------------------------
-- « Les décisions de modération sont journalisées » (conditions générales).
-- Le journal survit à la pièce : on garde la décision et son motif, jamais le
-- document qui l'a fondée.

create table decision_de_moderation (
  id            uuid primary key default gen_random_uuid(),
  membre_id     uuid not null references membre(id) on delete cascade,
  -- Le modérateur n'est pas supprimé en cascade : effacer un compte de
  -- modérateur ne doit pas effacer la trace de ce qu'il a décidé.
  decide_par    uuid references membre(id) on delete set null,
  decision      text not null check (decision in ('verifiee', 'refusee')),
  motif         text,
  decidee_le    timestamptz not null default now(),

  -- Un refus se motive. C'est ce qui permet à quelqu'un de comprendre et de
  -- recommencer plutôt que de rester devant une porte close.
  constraint refus_motive
    check (decision <> 'refusee' or (motif is not null and length(trim(motif)) > 0))
);

create index decision_par_membre on decision_de_moderation (membre_id, decidee_le desc);

-- --- Suivi des candidatures --------------------------------------------------

alter table candidature_emplacement
  add column traitee_par uuid references membre(id) on delete set null;
