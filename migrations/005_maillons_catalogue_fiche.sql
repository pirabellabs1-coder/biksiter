-- =============================================================================
-- Les maillons, le catalogue, et ce qui enrichit la fiche d'un emplacement.
--
-- Sur la règle 3 : ces tables comptent, elles ne classent pas. Il n'y a nulle
-- part de colonne « note », de moyenne, ni d'index qui permettrait de trier
-- des membres par leur solde. Le jour où une requête ferait « order by
-- maillons », c'est la requête qu'il faudrait retirer.
-- =============================================================================

-- --- Le registre des maillons -------------------------------------------------
-- Un registre en ajout seul plutôt qu'un solde dans la table membre : on doit
-- pouvoir dire d'où vient chaque maillon, et un solde qu'on met à jour finit
-- toujours par diverger de son historique.

create table maillon (
  id                uuid primary key default gen_random_uuid(),
  membre_id         uuid not null references membre(id) on delete cascade,
  -- Renseigné pour un gain, vide pour une dépense.
  stationnement_id  uuid references stationnement(id) on delete set null,
  nombre            integer not null check (nombre <> 0),
  etat              text not null default 'acquis'
                    check (etat in ('acquis', 'en_attente', 'annule')),
  motif             text,
  cree_le           timestamptz not null default now()
);

create index maillon_par_membre on maillon (membre_id, cree_le desc);

-- Une garde ne se remercie qu'une fois, quel que soit le chemin d'écriture.
create unique index maillon_une_fois_par_garde
  on maillon (stationnement_id)
  where stationnement_id is not null;

-- Un gain se rattache à une garde, une dépense n'en a pas.
alter table maillon add constraint maillon_gain_rattache
  check ((nombre > 0) = (stationnement_id is not null));

comment on table maillon is
  'Registre en ajout seul. Le solde est la somme des lignes « acquis » — '
  'il n''est stocké nulle part et ne sert à trier personne.';

-- Une garde contestée retient ses maillons le temps qu'une personne regarde.
alter table stationnement
  add column conteste boolean not null default false;

-- --- Les partenaires et leurs remerciements -----------------------------------

create table partenaire (
  id        uuid primary key default gen_random_uuid(),
  nom       text not null check (length(trim(nom)) > 0),
  quartier  text,
  actif     boolean not null default true,
  cree_le   timestamptz not null default now()
);

create table offre (
  id                uuid primary key default gen_random_uuid(),
  partenaire_id     uuid not null references partenaire(id) on delete cascade,
  titre             text not null check (length(trim(titre)) > 0),
  cout_en_maillons  integer not null check (cout_en_maillons > 0),
  -- Décrémenté à chaque échange. Le CHECK est ce qui empêche deux échanges
  -- simultanés de passer sur le dernier exemplaire.
  stock_restant     integer not null check (stock_restant >= 0),
  active            boolean not null default true,
  cree_le           timestamptz not null default now()
);

create index offre_visible on offre (partenaire_id) where active;

comment on table offre is
  'Des remerciements de commerçants, pas des promotions : ni date de fin, ni '
  'prix barré, ni compte à rebours.';

-- --- Les bons échangés ---------------------------------------------------------

create table echange (
  id                uuid primary key default gen_random_uuid(),
  membre_id         uuid not null references membre(id) on delete cascade,
  -- « restrict » : un bon déjà échangé garde son offre, même si le partenaire
  -- retire le reste de son catalogue.
  offre_id          uuid not null references offre(id) on delete restrict,
  code              text not null unique check (code ~ '^[A-Z0-9]{8}$'),
  cout_en_maillons  integer not null check (cout_en_maillons > 0),
  echange_le        timestamptz not null default now(),
  utilise_le        timestamptz
);

create index echange_par_membre on echange (membre_id, echange_le desc);

comment on column echange.code is
  'Ce que le membre présente au commerçant. Il ne porte ni son nom, ni son '
  'solde, ni le nombre de gardes qu''il a faites.';

-- --- Les photos d'un emplacement ----------------------------------------------
-- ATTENTION — RÈGLE 4. Une photo prise au téléphone porte les coordonnées GPS
-- du lieu dans ses métadonnées : la publier, c'est publier l'adresse. Le type
-- MIME est contraint à WebP parce que l'application ré-encode chaque image, ce
-- qui supprime toutes les métadonnées au passage. Ne pas élargir ce CHECK sans
-- garantir le même nettoyage.

create table photo_emplacement (
  id              uuid primary key default gen_random_uuid(),
  emplacement_id  uuid not null references emplacement(id) on delete cascade,
  contenu         bytea not null,
  type_mime       text not null check (type_mime = 'image/webp'),
  largeur         integer not null check (largeur > 0),
  hauteur         integer not null check (hauteur > 0),
  rang            integer not null default 0 check (rang between 0 and 2),
  ajoutee_le      timestamptz not null default now()
);

-- Trois photos au plus, et une seule par rang : la principale, la zone des
-- vélos, l'entrée.
create unique index photo_rang_unique on photo_emplacement (emplacement_id, rang);

-- --- Les avis ------------------------------------------------------------------
-- Du texte, et rien que du texte. Pas de note, pas d'étoiles, pas de moyenne :
-- « la note appartient à la personne », et un emplacement noté deviendrait un
-- emplacement classé.
--
-- Un avis se rattache à une garde terminée : on ne parle que de ce qu'on a
-- vécu, et une seule fois par garde.

create table avis (
  id                uuid primary key default gen_random_uuid(),
  stationnement_id  uuid not null unique references stationnement(id) on delete cascade,
  emplacement_id    uuid not null references emplacement(id) on delete cascade,
  auteur_id         uuid not null references membre(id) on delete cascade,
  corps             text not null check (length(trim(corps)) between 1 and 1000),
  ecrit_le          timestamptz not null default now()
);

create index avis_par_emplacement on avis (emplacement_id, ecrit_le desc);

create or replace function refuser_un_avis_hors_garde()
returns trigger
language plpgsql
as $$
declare
  concerne record;
begin
  select s.cycliste_id, s.etat, s.emplacement_id
    into concerne
    from stationnement s
   where s.id = new.stationnement_id;

  if concerne.cycliste_id is distinct from new.auteur_id then
    raise exception 'Un avis s''écrit par le cycliste qui a déposé le vélo'
      using errcode = 'check_violation';
  end if;

  if concerne.etat <> 'termine' then
    raise exception 'Un avis s''écrit après la reprise du vélo, pas avant'
      using errcode = 'check_violation';
  end if;

  if concerne.emplacement_id is distinct from new.emplacement_id then
    raise exception 'L''avis ne porte pas sur l''emplacement du stationnement'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger avis_apres_une_garde
  before insert on avis
  for each row execute function refuser_un_avis_hors_garde();
