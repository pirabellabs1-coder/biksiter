-- Corrections issues de la revue du module progression et de l'administration.

-- 1. Le geste qui a produit un événement. Une annulation n'a pas le même sens
--    selon qu'on se désiste ou qu'on constate l'absence de l'autre : la
--    fiabilité d'un bike sitter ne doit compter que ses propres désistements.
alter table evenement_de_garde
  add column geste text check (geste is null or geste in (
    'accepter', 'refuser', 'annuler', 'arriver', 'absence', 'personne_n_ouvre',
    'recevoir', 'reprendre', 'restituer', 'signaler'));

-- Les annulations passées se relisent d'après leur motif, écrit depuis des
-- listes fermées : celles de l'absence sont reconnaissables.
update evenement_de_garde
   set geste = 'absence'
 where etape = 'annule' and acteur = 'bike_sitter'
   and note in ('Personne ne s''est présenté', 'Prévenu trop tard', 'Rendez-vous manqué');
update evenement_de_garde
   set geste = 'personne_n_ouvre'
 where etape = 'annule' and acteur = 'cycliste'
   and note in ('Personne n''a répondu à la porte', 'Injoignable par téléphone');
update evenement_de_garde
   set geste = 'annuler'
 where etape = 'annule' and acteur in ('cycliste', 'bike_sitter') and geste is null
   and coalesce(note, '') <> 'Vélo refusé : batterie inquiétante';

-- 2. La nature d'une ligne de points. Le classement et le niveau ne comptent
--    que les gardes (règle 3) ; une correction de l'équipe n'y entre pas.
alter table maillon
  add column nature text not null default 'garde'
    check (nature in ('garde', 'echange', 'correction'));
update maillon set nature = 'echange' where echange_id is not null or nombre < 0;
update maillon set nature = 'correction' where motif like 'Correction : %';

drop index if exists maillon_gains_par_date;
create index maillon_gains_par_date on maillon (cree_le, membre_id)
  where nature = 'garde' and etat = 'acquis';

-- 3. Les limites d'envoi des aménagements d'une garde.
alter table tentative drop constraint tentative_nature_check;
alter table tentative add constraint tentative_nature_check check (nature in (
  'code_sms_envoye',
  'code_sms_refuse',
  'connexion_refusee',
  'courriel_de_compte',
  'consultation_invitation',
  'inscription_refusee',
  'message_envoye',
  'demande_envoyee',
  'remise_refusee',
  'demande_modifiee',
  'prolongation_demandee'));
