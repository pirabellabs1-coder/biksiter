-- La réservation d'un message sortant avant son envoi.
--
-- Un message est réservé dans une transaction courte, puis envoyé hors de
-- toute transaction : un serveur de messagerie lent ne retient plus de verrou,
-- et deux expéditions lancées en même temps ne prennent jamais le même
-- message. Une réservation abandonnée (fonction interrompue) se reprend au
-- bout de dix minutes.

alter table message_sortant add column reserve_le timestamptz;
