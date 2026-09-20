-- =============================================================================
-- L'espace membre : la fiche complète d'un emplacement, les vélos, le
-- déroulé d'une garde étape par étape, les constats, les notifications, les
-- avis sur les personnes, le blocage, les signalements et les alertes.
-- =============================================================================

-- --- La fiche d'un emplacement ------------------------------------------------
-- Chaque colonne répond à une question posée au bike sitter et se lit sur la
-- fiche : une question qu'on pose sans jamais afficher la réponse ne sert à
-- personne.

alter table emplacement
  -- Un point d'ancrage est facultatif : sa nature n'a de sens que s'il existe.
  alter column ancrage drop not null,
  add column description           text check (description is null or length(description) <= 1000),
  add column chaque_velo_attache   boolean not null default false,
  add column securite_en_plus      text[] not null default '{}'
    check (securite_en_plus <@ array['Caméra de surveillance', 'Alarme',
      'Détecteur d''ouverture', 'Détecteur de mouvement', 'Éclairage automatique']::text[]),
  add column acces_difficile       boolean not null default false,
  add column precision_d_acces     text check (precision_d_acces is null or length(precision_d_acces) <= 300),
  add column prise_electrique      boolean not null default false,
  add column delai_de_reponse      text not null default 'jour'
    check (delai_de_reponse in ('heure', 'jour', 'h24', 'veille')),
  add column rythme                text not null default 'regulier'
    check (rythme in ('ponctuel', 'regulier')),
  -- La durée acceptée à l'intérieur d'une journée.
  add column duree_max_heures      integer not null default 8
    check (duree_max_heures in (1, 3, 8, 24)),
  -- Au-delà d'une journée, c'est la modération qui ouvre le multi-jours ;
  -- 99 signifie « au-delà d'une semaine, à convenir ».
  add column duree_max_jours       integer not null default 1
    check (duree_max_jours in (1, 7, 99)),
  -- Jours d'accueil, de 0 (dimanche) à 6 (samedi). Vide : un brouillon, qui
  -- ne sort dans aucune recherche.
  add column jours_d_accueil       smallint[] not null default '{}'
    check (jours_d_accueil <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  add column heure_d_ouverture     time,
  add column heure_de_fermeture    time,
  -- Un horaire différent pour certains jours : {"5": {"de": "08:00", "a": "20:00"}}.
  add column horaires_par_jour     jsonb not null default '{}'::jsonb,
  add column fermetures            date[] not null default '{}',
  add column en_pause              boolean not null default false,
  add column vues                  integer not null default 0 check (vues >= 0),
  add constraint emplacement_horaires_coherents
    check (heure_d_ouverture is null or heure_de_fermeture is null
           or heure_d_ouverture < heure_de_fermeture);

-- Un emplacement en pause ne se publie pas : il reste à son bike sitter.
create or replace function emplacement_pause_depublie()
returns trigger
language plpgsql
as $$
begin
  if new.en_pause then
    new.publie := false;
  end if;
  return new;
end;
$$;

create trigger emplacement_pause
  before insert or update of en_pause, publie on emplacement
  for each row execute function emplacement_pause_depublie();

-- --- La vue publique, avec la fiche complète ------------------------------------
-- Règle 4, inchangée : ni `adresse_exacte`, ni la position exacte. La vue et la
-- fonction de proximité sont recréées ensemble, la seconde renvoyant des
-- lignes de la première.

drop function if exists emplacements_proches(double precision, double precision, integer);
drop view if exists emplacement_visible;

create view emplacement_visible as
select
  e.reference,
  e.membre_id                             as bike_sitter_id,
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
  round((st_x(e.position::geometry) / 0.008)::numeric) * 0.008 as longitude_de_zone,
  e.description,
  e.chaque_velo_attache,
  e.securite_en_plus,
  e.acces_difficile,
  e.precision_d_acces,
  e.prise_electrique,
  e.delai_de_reponse,
  e.rythme,
  e.duree_max_heures,
  e.duree_max_jours,
  e.jours_d_accueil,
  e.heure_d_ouverture,
  e.heure_de_fermeture,
  e.horaires_par_jour,
  e.fermetures,
  e.cree_le
from emplacement e
join membre m on m.id = e.membre_id
where e.publie;

comment on view emplacement_visible is
  'Règle 4 : seule source de lecture autorisée vers un client. '
  'Ni adresse exacte, ni position exacte.';

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
  );
$$;

-- --- Le membre : sa présence et ses heures de tranquillité ----------------------

alter table membre
  -- « Vu il y a 2 h » : jamais un horodatage précis, qui en dirait trop sur
  -- les habitudes de quelqu'un.
  add column vu_le                     timestamptz,
  -- Les notifications reçues pendant cette plage attendent la fin de la nuit.
  add column tranquillite_de           time default '22:00',
  add column tranquillite_a            time default '07:00',
  add column suspendu                  boolean not null default false;

-- --- Les vélos -------------------------------------------------------------------

create table velo (
  id                uuid primary key default gen_random_uuid(),
  membre_id         uuid not null references membre(id) on delete cascade,
  nom               text not null check (length(trim(nom)) between 1 and 60),
  type              text not null check (type in (
                      'Ville', 'Route', 'VTT', 'VTC', 'Gravel', 'Pliant',
                      'Électrique', 'Cargo', 'Longtail', 'Tandem', 'Enfant',
                      'Avec remorque')),
  marque            text check (marque is null or length(marque) <= 60),
  couleur           text check (couleur is null or length(couleur) <= 40),
  -- Privé : ni le bike sitter ni le public ne le voient. Il ne sert qu'à
  -- retrouver un vélo déclaré volé.
  numero_de_cadre   text check (numero_de_cadre is null or length(numero_de_cadre) <= 60),
  cree_le           timestamptz not null default now()
);

create index velo_par_membre on velo (membre_id);

-- --- Le déroulé d'une garde ---------------------------------------------------------
-- Les états suivent le parcours réel : la demande, l'acceptation, l'arrivée
-- devant la porte, le vélo gardé, la reprise demandée, la fin. Chaque passage
-- laisse un événement daté, qui forme la frise de la garde.

alter table stationnement drop constraint stationnement_etat_check;
alter table stationnement drop constraint stationnement_reponse_datee;

alter table stationnement
  add constraint stationnement_etat_check check (etat in (
    'demande', 'accepte', 'arrivee', 'en_cours', 'reprise_demandee',
    'termine', 'refuse', 'annule', 'expire', 'litige')),
  add constraint stationnement_reponse_datee
    check (etat not in ('accepte', 'refuse', 'arrivee', 'en_cours',
                        'reprise_demandee', 'termine')
           or repondu_le is not null),
  add column velo_id             uuid references velo(id) on delete set null,
  add column arrive_le           timestamptz,
  add column retard_annonce_le   timestamptz,
  -- Le motif d'un refus, d'une annulation ou d'un litige, tel qu'écrit.
  add column motif               text check (motif is null or length(motif) <= 600),
  add column desistement_tardif  boolean not null default false;

create table evenement_de_garde (
  id                uuid primary key default gen_random_uuid(),
  stationnement_id  uuid not null references stationnement(id) on delete cascade,
  etape             text not null check (etape in (
                      'demande', 'accepte', 'arrivee', 'velo_recu', 'en_cours',
                      'reprise_demandee', 'velo_restitue', 'termine', 'refuse',
                      'annule', 'expire', 'litige', 'retard_annonce')),
  acteur            text not null check (acteur in ('cycliste', 'bike_sitter', 'systeme', 'moderation')),
  note              text,
  fait_le           timestamptz not null default now()
);

create index evenement_par_garde on evenement_de_garde (stationnement_id, fait_le);

-- Les gardes existantes reçoivent leur premier événement, pour que leur frise
-- ne commence pas vide.
insert into evenement_de_garde (stationnement_id, etape, acteur, fait_le)
select id, 'demande', 'cycliste', demande_le from stationnement;

-- --- Les constats d'état ---------------------------------------------------------------
-- Deux photos et un état, au dépôt et à la reprise. Un constat ne se modifie
-- jamais : s'il pouvait être réécrit après coup, la comparaison entre les deux
-- ne vaudrait plus rien.

create table constat (
  id                uuid primary key default gen_random_uuid(),
  stationnement_id  uuid not null references stationnement(id) on delete cascade,
  phase             text not null check (phase in ('depot', 'reprise')),
  etat_du_velo      text not null check (etat_du_velo in ('ok', 'usure', 'defaut', 'batterie')),
  note              text check (note is null or length(note) <= 600),
  etabli_par        uuid references membre(id) on delete set null,
  etabli_le         timestamptz not null default now(),
  constraint constat_defaut_decrit
    check (etat_du_velo <> 'defaut' or (note is not null and length(trim(note)) > 0)),
  unique (stationnement_id, phase)
);

-- Les photos sont ré-encodées en WebP avant d'arriver ici : l'opération retire
-- toutes les métadonnées, coordonnées GPS comprises (règle 4).
create table photo_de_constat (
  id          uuid primary key default gen_random_uuid(),
  constat_id  uuid not null references constat(id) on delete cascade,
  rang        integer not null check (rang between 0 and 1),
  contenu     bytea not null,
  type_mime   text not null check (type_mime = 'image/webp'),
  largeur     integer not null check (largeur > 0),
  hauteur     integer not null check (hauteur > 0),
  unique (constat_id, rang)
);

-- --- Les notifications ---------------------------------------------------------------
-- Une notification est une porte : elle mène à l'écran dont elle parle. Celles
-- qui arrivent la nuit attendent la fin des heures de tranquillité, sauf
-- l'urgence (un désistement de dernière minute, un litige).

create table notification (
  id              uuid primary key default gen_random_uuid(),
  membre_id       uuid not null references membre(id) on delete cascade,
  texte           text not null check (length(trim(texte)) between 1 and 400),
  lien            text check (lien is null or lien ~ '^/[a-z0-9/_-]*$'),
  urgente         boolean not null default false,
  creee_le        timestamptz not null default now(),
  -- Renseigné quand la notification est différée pendant la nuit.
  visible_le      timestamptz not null default now(),
  lue_le          timestamptz
);

create index notification_par_membre on notification (membre_id, visible_le desc);

-- --- Les avis sur une personne ------------------------------------------------------
-- La note appartient à la personne, jamais à un lieu. Les avis se publient à
-- l'aveugle : les deux ensemble, ou seul au bout de sept jours. Rien ici ne
-- permet de trier des membres par leur note (règle 3).

create table avis_sur_une_garde (
  id                uuid primary key default gen_random_uuid(),
  stationnement_id  uuid not null references stationnement(id) on delete cascade,
  auteur_id         uuid not null references membre(id) on delete cascade,
  cible_id          uuid not null references membre(id) on delete cascade,
  sens              text not null check (sens in ('cycliste_vers_bike_sitter', 'bike_sitter_vers_cycliste')),
  note              integer not null check (note between 1 and 5),
  criteres          jsonb not null default '{}'::jsonb,
  texte             text check (texte is null or length(texte) <= 1000),
  ecrit_le          timestamptz not null default now(),
  publie_le         timestamptz,
  masque_le         timestamptz,
  motif_de_masquage text,
  reponse           text check (reponse is null or length(reponse) between 10 and 600),
  repondu_le        timestamptz,
  conteste_le       timestamptz,
  unique (stationnement_id, auteur_id)
);

create index avis_par_cible on avis_sur_une_garde (cible_id, publie_le desc);

-- --- Le blocage, les signalements, les alertes ---------------------------------------

create table blocage (
  membre_id   uuid not null references membre(id) on delete cascade,
  bloque_id   uuid not null references membre(id) on delete cascade,
  cree_le     timestamptz not null default now(),
  primary key (membre_id, bloque_id),
  constraint blocage_pas_soi_meme check (membre_id <> bloque_id)
);

create table signalement (
  id          uuid primary key default gen_random_uuid(),
  auteur_id   uuid references membre(id) on delete set null,
  cible_type  text not null check (cible_type in ('membre', 'emplacement', 'garde', 'avis')),
  cible       text not null,
  motif       text not null check (length(trim(motif)) between 1 and 120),
  details     text check (details is null or length(details) <= 1000),
  etat        text not null default 'ouvert' check (etat in ('ouvert', 'en_cours', 'traite')),
  cree_le     timestamptz not null default now()
);

create index signalement_a_traiter on signalement (cree_le) where etat <> 'traite';

create table alerte_de_recherche (
  id          uuid primary key default gen_random_uuid(),
  membre_id   uuid not null references membre(id) on delete cascade,
  lieu        text not null check (length(trim(lieu)) between 1 and 120),
  latitude    double precision not null,
  longitude   double precision not null,
  jour        date,
  heure_de    time,
  heure_a     time,
  creee_le    timestamptz not null default now()
);

create index alerte_par_membre on alerte_de_recherche (membre_id);
