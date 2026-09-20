-- Règle 4, avec le déroulé complet d'une garde : l'adresse reste lisible pour
-- le cycliste de l'acceptation jusqu'à la fin de la garde — devant la porte,
-- pendant la garde, et au moment de revenir chercher son vélo.

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
    and s.etat in ('accepte', 'arrivee', 'en_cours', 'reprise_demandee', 'termine')
  limit 1;
$$;
