-- Les limites d'essais et d'envois.
--
-- Un code SMS de quatre chiffres, un mot de passe, un code d'invitation ne
-- résistent aux essais répétés que si les essais sont comptés. Chaque essai
-- laisse ici une ligne datée ; les règles de lib/regles/limites.ts décident
-- à partir de combien on s'arrête.
--
-- La clé est l'empreinte SHA-256 de ce qu'on compte (une adresse, un numéro,
-- un membre) : cette table n'a pas à devenir une liste d'adresses e-mail et
-- de numéros de téléphone.

create table tentative (
  nature    text not null check (nature in (
              'code_sms_envoye',
              'code_sms_refuse',
              'connexion_refusee',
              'courriel_de_compte',
              'consultation_invitation',
              'inscription_refusee')),
  cle       text not null,
  faite_le  timestamptz not null default now()
);

create index tentative_recente on tentative (nature, cle, faite_le);

comment on table tentative is
  'Essais et envois comptés pour les limites. Clé hachée ; purgée après deux jours.';

-- --- Une invitation dont l'invité supprime son compte ------------------------
-- La contrainte d'origine exigeait « utilisée par » et « utilisée le » tous
-- deux vides ou tous deux remplis. Or la suppression d'un compte vide
-- « utilisée par » : la contrainte empêchait alors de supprimer le compte.
-- L'invitation reste consommée, et sa date le dit.

alter table invitation drop constraint invitation_usage_coherent;
alter table invitation add constraint invitation_usage_date
  check (utilisee_par is null or utilisee_le is not null);
