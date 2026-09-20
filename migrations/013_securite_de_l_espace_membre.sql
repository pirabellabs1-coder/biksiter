-- Les corrections de sécurité de l'espace membre.

-- --- Règle 4 : l'adresse d'une garde, et d'elle seule ----------------------------
-- L'ancienne fonction rendait l'adresse actuelle d'un emplacement à quiconque y
-- avait eu une garde terminée, à n'importe quelle date : un bike sitter qui
-- corrigeait son adresse après un déménagement la dévoilait à tous ses anciens
-- cyclistes. L'adresse se lit maintenant par garde, et disparaît deux heures
-- après la reprise (ADRESSE_APRES_REPRISE_HEURES, lib/regles/garde.ts).

create or replace function adresse_de_la_garde(
  garde    uuid,
  cycliste uuid
)
returns text
language sql
stable
as $$
  select e.adresse_exacte
  from stationnement s
  join emplacement e on e.id = s.emplacement_id
  where s.id = garde
    and s.cycliste_id = cycliste
    and (
      s.etat in ('accepte', 'arrivee', 'en_cours', 'reprise_demandee')
      or (s.etat = 'litige' and s.repris_le is null)
      or (s.etat = 'termine' and s.repris_le > now() - interval '2 hours')
    );
$$;

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
    and (
      s.etat in ('accepte', 'arrivee', 'en_cours', 'reprise_demandee')
      or (s.etat = 'litige' and s.repris_le is null)
      or (s.etat = 'termine' and s.repris_le > now() - interval '2 hours')
    )
  limit 1;
$$;

-- --- La vue publique, sans les précisions d'accès -----------------------------
-- Les précisions (« sonnez au 2 », parfois un code de hall) ne se lisent
-- qu'avec l'adresse, après acceptation : elles n'ont rien à faire dans la vue
-- que la recherche et la fiche consultent.

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

-- --- Les limites d'envoi ---------------------------------------------------------

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
  'remise_refusee'));
