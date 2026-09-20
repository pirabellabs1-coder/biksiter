-- Le journal des points : chaque ligne dit d'où elle vient.

-- Une dépense se rattache à l'échange qui l'a causée, pour que le journal
-- puisse écrire « Éclairage vélo » plutôt que « échange au catalogue ».
alter table maillon
  add column echange_id uuid references echange(id) on delete set null;

update maillon m
   set echange_id = e.id
  from echange e
 where m.echange_id is null
   and m.nombre < 0
   and m.membre_id = e.membre_id
   and m.nombre = -e.cout_en_maillons
   and abs(extract(epoch from (m.cree_le - e.echange_le))) < 5;

-- L'ancienne contrainte exigeait qu'un gain garde sa garde. Or retirer un lieu
-- supprime ses gardes : la contrainte faisait alors échouer le retrait, et les
-- points déjà gagnés auraient dû disparaître avec lui. Un gain reste acquis
-- même quand sa garde n'existe plus ; seul le sens des rattachements compte.
alter table maillon drop constraint maillon_gain_rattache;
alter table maillon add constraint maillon_rattachement_coherent
  check ((nombre > 0 or stationnement_id is null)
     and (nombre < 0 or echange_id is null));

-- Le classement additionne les gains d'une période.
create index maillon_gains_par_date on maillon (cree_le, membre_id)
  where nombre > 0 and etat = 'acquis';

comment on table maillon is
  'Registre en ajout seul. Le solde est la somme des lignes « acquis » ; '
  'le classement (règle 3) n''additionne que les gains des membres qui l''ont choisi.';
