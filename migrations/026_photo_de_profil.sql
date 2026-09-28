-- =============================================================================
-- La photo de profil d'un membre.
--
-- Un visage rassure, des deux côtés d'une porte : le cycliste sait qui va lui
-- ouvrir, le bike sitter sait qui arrive. La photo est facultative ; sans
-- elle, l'application montre l'initiale du prénom.
--
-- Comme toutes les photos du réseau, elle est ré-encodée à l'arrivée (carré,
-- WebP) et perd ses métadonnées EXIF, coordonnées GPS comprises (règle 4).
-- Elle ne voyage que par une route réservée aux membres connectés.
-- =============================================================================

create table photo_de_profil (
  membre_id       uuid primary key references membre(id) on delete cascade,
  contenu         bytea not null,
  type_mime       text  not null default 'image/webp'
                  check (type_mime = 'image/webp'),
  largeur         int   not null,
  hauteur         int   not null,
  mise_a_jour_le  timestamptz not null default now()
);

comment on table photo_de_profil is
  'La photo de profil d''un membre, facultative. Ré-encodée sans métadonnées.';
