-- =============================================================================
-- La file d'attente des courriels.
--
-- Pourquoi une file plutôt qu'un envoi direct : un message part au moment où
-- un stationnement change d'état, c'est-à-dire au milieu d'une transaction. Si
-- l'envoi est direct, ou bien le serveur SMTP est lent et le membre attend
-- devant un formulaire figé, ou bien l'envoi échoue et le message est perdu
-- sans que personne ne le sache.
--
-- Écrit dans la même transaction que le changement d'état, le message ne peut
-- ni partir pour un stationnement qui n'a pas été enregistré, ni se perdre
-- parce que le serveur de messagerie redémarrait.
-- =============================================================================

create table courriel (
  id              uuid primary key default gen_random_uuid(),
  destinataire    text not null,
  sujet           text not null,
  corps           text not null,
  -- Ce à quoi le message se rapporte, pour retrouver un envoi depuis une
  -- conversation avec un membre.
  sujet_technique text,
  cree_le         timestamptz not null default now(),
  envoye_le       timestamptz,
  tentatives      integer not null default 0 check (tentatives >= 0),
  derniere_erreur text
);

-- Ce que lit l'expéditeur : les messages en attente, dans l'ordre d'arrivée.
create index courriel_a_envoyer on courriel (cree_le)
  where envoye_le is null;

comment on table courriel is
  'File d''attente sortante. Rien n''est envoyé depuis une requête web : '
  'un script draine cette table.';
