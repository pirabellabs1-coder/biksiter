-- =============================================================================
-- Une photo dans un message.
--
-- Autour d'une garde, on a parfois besoin de montrer plutôt que décrire : l'état
-- d'un vélo, l'endroit où il est rangé, un cadenas. On autorise donc une photo
-- par message, à côté du texte (qui devient facultatif quand une photo suffit).
--
-- Comme les photos d'emplacement, le contenu est ré-encodé à l'arrivée et perd
-- ses métadonnées EXIF, coordonnées GPS comprises (règle 4). Il ne voyage que
-- par une route dédiée, réservée aux deux membres de la conversation.
-- =============================================================================

-- Le texte devient facultatif : un message peut n'être qu'une photo. On garde
-- le plafond de 2000 caractères.
alter table message
  drop constraint message_corps_check;

alter table message
  alter column corps set default '',
  add constraint message_corps_check
  check (char_length(corps) <= 2000);

create table photo_message (
  message_id  uuid primary key references message(id) on delete cascade,
  contenu     bytea not null,
  type_mime   text  not null default 'image/webp',
  largeur     int   not null,
  hauteur     int   not null,
  ajoutee_le  timestamptz not null default now()
);

comment on table photo_message is
  'La photo jointe à un message. Une par message. Ré-encodée sans métadonnées.';
