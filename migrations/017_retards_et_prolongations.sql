-- Prévenir d'un retard, demander une prolongation (planche 16 des maquettes).

-- Un retard s'annonce de part et d'autre, pour le dépôt comme pour la reprise,
-- une fois par personne et par moment : une annonce, pas une conversation.
create table retard_annonce (
  stationnement_id  uuid not null references stationnement(id) on delete cascade,
  acteur            text not null check (acteur in ('cycliste', 'bike_sitter')),
  phase             text not null check (phase in ('depot', 'reprise')),
  minutes           smallint not null check (minutes in (15, 30, 60)),
  annonce_le        timestamptz not null default now(),
  primary key (stationnement_id, acteur, phase)
);

-- Une prolongation se demande par le cycliste et s'accepte par le bike sitter.
-- L'ancienne fin est gardée : la frise dit ce qui était prévu au départ.
create table prolongation (
  id                uuid primary key default gen_random_uuid(),
  stationnement_id  uuid not null references stationnement(id) on delete cascade,
  ancienne_fin      timestamptz not null,
  nouvelle_fin      timestamptz not null,
  motif             text check (motif is null or length(motif) <= 200),
  etat              text not null default 'demandee'
                    check (etat in ('demandee', 'acceptee', 'refusee', 'annulee')),
  demandee_le       timestamptz not null default now(),
  repondue_le       timestamptz,
  constraint prolongation_plus_tard check (nouvelle_fin > ancienne_fin),
  constraint prolongation_reponse_datee
    check ((etat = 'demandee') = (repondue_le is null))
);

-- Une seule demande en attente par garde.
create unique index prolongation_une_en_attente
  on prolongation (stationnement_id) where etat = 'demandee';

alter table evenement_de_garde drop constraint evenement_de_garde_etape_check;
alter table evenement_de_garde add constraint evenement_de_garde_etape_check
  check (etape in (
    'demande', 'accepte', 'arrivee', 'velo_recu', 'en_cours',
    'reprise_demandee', 'velo_restitue', 'termine', 'refuse',
    'annule', 'expire', 'litige', 'retard_annonce',
    'prolongation_demandee', 'prolongation_acceptee', 'prolongation_refusee'));
