-- =============================================================================
-- Bike Sitters — le socle.
--
-- Les règles qui ne se négocient pas sont écrites ici autant que dans
-- lib/regles/. Ce n'est pas de la redondance : une règle qui ne vit que dans le
-- code applicatif tombe dès qu'un script, une migration de données ou un
-- deuxième service écrit dans la table. Les listes fermées deviennent des
-- CHECK, les règles 1 et 2 des contraintes, le quota un déclencheur.
-- =============================================================================

create extension if not exists postgis;

-- --- Membres -----------------------------------------------------------------

create table membre (
  id                uuid primary key default gen_random_uuid(),
  prenom            text not null check (length(trim(prenom)) > 0),
  nom               text not null check (length(trim(nom)) > 0),
  email             text not null,
  -- scrypt, au format « scrypt$N$r$p$sel$cle ». Les paramètres sont dans
  -- l'empreinte pour qu'on puisse les durcir sans invalider les anciennes.
  empreinte         text not null,
  telephone         text,
  -- Règle 2 : « verifiee » ne s'obtient que par le passage d'une personne.
  verification      text not null default 'absente'
                    check (verification in ('absente', 'en_cours', 'verifiee', 'refusee')),
  verifie_le        timestamptz,
  cree_le           timestamptz not null default now()
);

-- L'unicité est insensible à la casse : personne ne doit pouvoir créer un
-- second compte en changeant une majuscule.
create unique index membre_email_unique on membre (lower(email));

-- --- Invitations -------------------------------------------------------------
-- On entre dans le réseau sur recommandation. Une invitation est nominative et
-- ne sert qu'une fois.

create table invitation (
  code          text primary key check (code ~ '^[A-Z0-9-]{6,20}$'),
  emise_par     uuid not null references membre(id) on delete cascade,
  utilisee_par  uuid references membre(id) on delete set null,
  utilisee_le   timestamptz,
  creee_le      timestamptz not null default now(),
  -- Une invitation utilisée sait par qui et quand, ou ni l'un ni l'autre.
  constraint invitation_usage_coherent
    check ((utilisee_par is null) = (utilisee_le is null))
);

create index invitation_emise_par on invitation (emise_par);

-- --- Sessions ----------------------------------------------------------------
-- On stocke l'empreinte du jeton, pas le jeton : une fuite de cette table ne
-- doit pas donner de quoi se connecter.

create table session (
  empreinte_du_jeton  text primary key,
  membre_id           uuid not null references membre(id) on delete cascade,
  creee_le            timestamptz not null default now(),
  expire_le           timestamptz not null
);

create index session_membre on session (membre_id);
create index session_expiration on session (expire_le);

-- --- Emplacements ------------------------------------------------------------

create table emplacement (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique check (reference ~ '^[a-z0-9-]{3,60}$'),
  membre_id         uuid not null references membre(id) on delete cascade,

  -- Règle 1 : la liste des quatorze types EST la règle. Un local à vélos
  -- d'immeuble n'y figure pas, donc il n'est pas insérable.
  type              text not null check (type in (
                      'Garage privé fermé', 'Box de garage individuel',
                      'Cave privative', 'Intérieur du logement', 'Pièce dédiée',
                      'Débarras ou cellier', 'Local privatif',
                      'Abri de jardin ou remise', 'Jardin privé clôturé',
                      'Cour privée', 'Terrasse privée', 'Balcon ou loggia',
                      'Véranda fermée', 'Autre espace privé')),

  quartier          text not null check (length(trim(quartier)) > 0),

  -- Règle 4 : cette colonne ne sort jamais vers un client. Aucune requête de
  -- lecture publique ne la sélectionne ; seul `adresse_apres_acceptation()`
  -- la rend, et seulement pour un stationnement accepté.
  adresse_exacte    text not null check (length(trim(adresse_exacte)) > 0),

  -- Le point exact, source unique de la position. La zone publiée s'en déduit.
  position          geography(Point, 4326) not null,

  -- En dessous de 250 mètres, une zone désigne une maison.
  rayon_de_la_zone  integer not null check (rayon_de_la_zone >= 250),

  capacite          integer not null check (capacite between 1 and 10),

  verrouillage      text not null check (verrouillage in ('cle', 'code', 'autre', 'aucun')),
  intemperie        text not null check (intemperie in ('interieur', 'abri', 'partiel', 'dehors')),

  acces             text not null check (acces in (
                      'Plain-pied', 'Quelques marches', 'Escalier', 'Ascenseur',
                      'Rampe', 'Passage par l''intérieur du logement',
                      'Passage étroit', 'Autre')),

  ancrage           text not null check (ancrage in (
                      'Ancrage mural', 'Ancrage au sol', 'Râtelier fixe',
                      'Arceau ou barre fixe', 'Autre')),

  services          text[] not null default '{}'
                    check (services <@ array[
                      'Recharge VAE', 'Gonflage des pneus',
                      'Petit outillage à disposition']::text[]),

  velos_acceptes    text[] not null
                    check (cardinality(velos_acceptes) > 0
                       and velos_acceptes <@ array[
                      'Ville', 'Route', 'VTT', 'VTC', 'Gravel', 'Pliant',
                      'Électrique', 'Cargo', 'Longtail', 'Tandem', 'Enfant',
                      'Avec remorque']::text[]),

  precisions        text,
  publie            boolean not null default false,
  cree_le           timestamptz not null default now(),
  modifie_le        timestamptz not null default now()
);

create index emplacement_membre on emplacement (membre_id);
create index emplacement_position on emplacement using gist (position);
create index emplacement_publie on emplacement (publie) where publie;

-- Règle 2 — l'identité avant la publication.
-- Portée par un déclencheur et non par le code applicatif : un emplacement
-- publié par un membre non vérifié ne doit pas pouvoir exister, quel que soit
-- le chemin d'écriture.
create or replace function refuser_publication_sans_verification()
returns trigger
language plpgsql
as $$
begin
  if new.publie and (
    select verification from membre where id = new.membre_id
  ) is distinct from 'verifiee' then
    raise exception
      'Règle 2 : un emplacement ne se publie pas sans identité vérifiée (membre %)',
      new.membre_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger emplacement_publication_verifiee
  before insert or update of publie, membre_id on emplacement
  for each row execute function refuser_publication_sans_verification();

-- Un membre publie au maximum deux emplacements.
create or replace function refuser_au_dela_du_quota()
returns trigger
language plpgsql
as $$
declare
  deja integer;
begin
  select count(*) into deja
  from emplacement
  where membre_id = new.membre_id
    and id is distinct from new.id;

  if deja >= 2 then
    raise exception
      'Un membre publie au maximum 2 emplacements (membre %)', new.membre_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger emplacement_quota
  before insert or update of membre_id on emplacement
  for each row execute function refuser_au_dela_du_quota();

-- --- Stationnements ----------------------------------------------------------

create table stationnement (
  id              uuid primary key default gen_random_uuid(),
  emplacement_id  uuid not null references emplacement(id) on delete cascade,
  cycliste_id     uuid not null references membre(id) on delete cascade,

  etat            text not null default 'demande' check (etat in (
                    'demande', 'accepte', 'refuse', 'annule',
                    'en_cours', 'termine')),

  debut           timestamptz not null,
  fin             timestamptz not null,

  type_velo       text not null check (type_velo in (
                    'Ville', 'Route', 'VTT', 'VTC', 'Gravel', 'Pliant',
                    'Électrique', 'Cargo', 'Longtail', 'Tandem', 'Enfant',
                    'Avec remorque')),

  message         text,
  demande_le      timestamptz not null default now(),
  repondu_le      timestamptz,
  depose_le       timestamptz,
  repris_le       timestamptz,
  annule_le       timestamptz,

  constraint stationnement_creneau_valide check (fin > debut),

  -- Tout état qui suppose une réponse du bike sitter porte sa date. L'inverse
  -- n'est pas vrai : un cycliste peut annuler sa demande avant toute réponse,
  -- et ce stationnement-là n'a jamais de `repondu_le`.
  constraint stationnement_reponse_datee
    check (etat not in ('accepte', 'refuse', 'en_cours', 'termine')
           or repondu_le is not null),

  constraint stationnement_annulation_datee
    check ((etat = 'annule') = (annule_le is not null))
);

create index stationnement_emplacement on stationnement (emplacement_id);
create index stationnement_cycliste on stationnement (cycliste_id);
create index stationnement_creneau on stationnement (emplacement_id, debut, fin)
  where etat in ('accepte', 'en_cours');

create or replace function refuser_son_propre_emplacement()
returns trigger
language plpgsql
as $$
begin
  if new.cycliste_id = (
    select membre_id from emplacement where id = new.emplacement_id
  ) then
    raise exception 'On ne demande pas un stationnement chez soi'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger stationnement_pas_chez_soi
  before insert on stationnement
  for each row execute function refuser_son_propre_emplacement();

-- --- Codes de remise (règle 5) ----------------------------------------------
-- Quatre chiffres, six heures, trois essais. Celui qui remet le vélo détient
-- le code, celui qui le reçoit le saisit.

create table code_de_remise (
  id                uuid primary key default gen_random_uuid(),
  stationnement_id  uuid not null references stationnement(id) on delete cascade,
  sens              text not null check (sens in ('depot', 'reprise')),
  chiffres          text not null check (chiffres ~ '^[0-9]{4}$'),
  emis_le           timestamptz not null default now(),
  essais_utilises   integer not null default 0 check (essais_utilises between 0 and 3),
  consomme_le       timestamptz
);

-- Un seul code vivant par sens et par stationnement : régénérer remplace.
create unique index code_de_remise_vivant
  on code_de_remise (stationnement_id, sens)
  where consomme_le is null;

-- --- Liste d'attente ---------------------------------------------------------
-- Ce sont les bike sitters inscrits ici qui déclenchent l'ouverture d'un
-- quartier, pas les cyclistes.

create table inscription_liste_attente (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  quartier      text not null check (length(trim(quartier)) > 0),
  role          text not null check (role in ('cycliste', 'bike_sitter', 'les_deux')),
  inscrite_le   timestamptz not null default now()
);

create unique index inscription_email_unique on inscription_liste_attente (lower(email));
create index inscription_quartier on inscription_liste_attente (lower(quartier));

-- --- Candidatures d'emplacement ---------------------------------------------
-- Déposées par quelqu'un qui n'a pas encore de compte. Elles ne deviennent des
-- emplacements qu'après création du compte et vérification de l'identité.

create table candidature_emplacement (
  id              uuid primary key default gen_random_uuid(),
  prenom          text not null,
  email           text not null,
  adresse_exacte  text not null,
  type            text not null,
  quartier        text,
  capacite        integer not null check (capacite between 1 and 10),
  verrouillage    text not null,
  intemperie      text not null,
  acces           text not null,
  ancrage         text not null,
  services        text[] not null default '{}',
  velos_acceptes  text[] not null,
  precisions      text,
  traitee_le      timestamptz,
  deposee_le      timestamptz not null default now()
);

create index candidature_a_traiter on candidature_emplacement (deposee_le)
  where traitee_le is null;

-- --- La vue publique ---------------------------------------------------------
-- Règle 4, portée par la structure plutôt que par la vigilance de celui qui
-- écrit la requête : tout ce qui part vers un client passe par cette vue, et
-- elle ne contient ni `adresse_exacte`, ni la position exacte.
--
-- La position est arrondie à une maille d'environ 500 mètres. Combinée au rayon
-- minimal de 250 mètres, elle situe le quartier sans jamais désigner la maison.
-- Le pas diffère en latitude et en longitude parce qu'un degré de longitude
-- vaut moins qu'un degré de latitude à la hauteur de Bruxelles.

create view emplacement_visible as
select
  e.reference,
  m.prenom                                as prenom_du_bike_sitter,
  e.quartier,
  e.rayon_de_la_zone,
  e.type,
  e.capacite,
  e.verrouillage,
  e.intemperie,
  e.acces,
  e.ancrage,
  e.services,
  e.velos_acceptes,
  e.precisions,
  round((st_y(e.position::geometry) / 0.005)::numeric) * 0.005 as latitude_de_zone,
  round((st_x(e.position::geometry) / 0.008)::numeric) * 0.008 as longitude_de_zone
from emplacement e
join membre m on m.id = e.membre_id
where e.publie;

comment on view emplacement_visible is
  'Règle 4 : seule source de lecture autorisée vers un client. '
  'Ni adresse exacte, ni position exacte.';

-- La recherche par proximité lit la position exacte, mais ne la rend jamais :
-- elle ne renvoie que des lignes de la vue.
create or replace function emplacements_proches(
  latitude    double precision,
  longitude   double precision,
  rayon_metres integer default 1500
)
returns setof emplacement_visible
language sql
stable
as $$
  select v.*
  from emplacement_visible v
  join emplacement e on e.reference = v.reference
  where st_dwithin(
    e.position,
    st_setsrid(st_makepoint(longitude, latitude), 4326)::geography,
    rayon_metres
  )
  order by e.position <-> st_setsrid(st_makepoint(longitude, latitude), 4326)::geography;
$$;

-- L'adresse exacte n'a qu'une seule porte de sortie, et elle vérifie la règle.
create or replace function adresse_apres_acceptation(
  reference_demandee text,
  cycliste           uuid
)
returns text
language sql
stable
as $$
  select e.adresse_exacte
  from emplacement e
  join stationnement s on s.emplacement_id = e.id
  where e.reference = reference_demandee
    and s.cycliste_id = cycliste
    and s.etat in ('accepte', 'en_cours')
  limit 1;
$$;

comment on function adresse_apres_acceptation is
  'Règle 4 : rend l''adresse au seul cycliste dont la demande a été acceptée. '
  'Un refus ou une annulation la reprennent.';
