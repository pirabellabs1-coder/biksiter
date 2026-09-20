/**
 * Les traductions des textes propres au site, qui s'ajoutent au dictionnaire
 * général (`phrases.ts`) et priment sur lui.
 *
 * Vocabulaire tenu dans les trois langues : emplacement = plek = place ;
 * garde = oppasbeurt = stay ; membre = lid = member.
 */
export const PHRASES_DU_SITE: Record<'nl' | 'en', Record<string, string>> = {
  nl: {
    'Confirmer mon adresse': 'Mijn adres bevestigen',
    'Pour terminer, confirmez que cette adresse e-mail est bien la vôtre. C’est elle qui recevra les demandes et les réponses des autres membres.':
      'Bevestig tot slot dat dit e-mailadres van u is. Hier komen de aanvragen en antwoorden van andere leden binnen.',
    'Plusieurs essais n’ont pas abouti. Par sécurité, patientez un quart d’heure, ou choisissez un nouveau mot de passe.':
      'Meerdere pogingen zijn mislukt. Wacht voor de veiligheid een kwartier, of kies een nieuw wachtwoord.',
    'Beaucoup de codes ont été essayés depuis cette connexion. Vous pourrez réessayer dans une heure.':
      'Er zijn veel codes geprobeerd vanaf deze verbinding. U kunt het over een uur opnieuw proberen.',
    'Confirmez d’abord votre adresse e-mail et votre numéro de téléphone : la pièce d’identité vient ensuite.':
      'Bevestig eerst uw e-mailadres en uw telefoonnummer: het identiteitsbewijs komt daarna.',
    'Plusieurs codes ont déjà été envoyés aujourd’hui. Vous pourrez en demander un nouveau demain ; si le SMS n’arrive pas, écrivez-nous depuis la page Contact.':
      'Er zijn vandaag al meerdere codes verstuurd. Morgen kunt u een nieuwe aanvragen; komt de sms niet aan, schrijf ons dan via de contactpagina.',
    'Trois codes ont été envoyés dans l’heure. Le dernier reste valable dix minutes ; vous pourrez en demander un autre un peu plus tard.':
      'Er zijn binnen het uur drie codes verstuurd. De laatste blijft tien minuten geldig; iets later kunt u een nieuwe aanvragen.',
    'Trop de codes incorrects aujourd’hui. Par sécurité, la vérification reprendra demain.':
      'Vandaag zijn te veel onjuiste codes ingevuld. Voor de veiligheid gaat de verificatie morgen verder.',
    '8 caractères minimum': 'Minstens 8 tekens',
    'Adresse e-mail ou mot de passe incorrect.':
      'E-mailadres of wachtwoord onjuist.',
    'Aucun code en attente : demandez-en un nouveau.':
      'Er is geen code in afwachting: vraag een nieuwe aan.',
    'Bike sitter': 'Bike sitter',
    'Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez qu’il est recopié tel quel, par exemple MANO-4K29.':
      'Deze uitnodigingscode bestaat niet of is al gebruikt. Controleer of hij exact is overgenomen, bijvoorbeeld MANO-4K29.',
    'Ce code n’est plus valable : demandez-en un nouveau.':
      'Deze code is niet meer geldig: vraag een nieuwe aan.',
    'Ce format n’est pas accepté. Envoyez une photo (JPEG, PNG, WebP) ou un PDF.':
      'Dit formaat wordt niet aanvaard. Stuur een foto (JPEG, PNG, WebP) of een pdf.',
    'Ce lien de confirmation n’est plus valable.':
      'Deze bevestigingslink is niet meer geldig.',
    'Ce lien de confirmation n’est plus valable. Connectez-vous : vous pourrez en demander un nouveau.':
      'Deze bevestigingslink is niet meer geldig. Meld u aan: u kunt dan een nieuwe aanvragen.',
    'Ce lien n’est plus valable : il a déjà servi ou a expiré. Vous pouvez en demander un nouveau.':
      'Deze link is niet meer geldig: hij is al gebruikt of verlopen. U kunt een nieuwe aanvragen.',
    'Ce numéro n’est pas lisible. Exemple : 0470 12 34 56.':
      'Dit nummer is niet leesbaar. Voorbeeld: 0470 12 34 56.',
    'Cette adresse est déjà utilisée. Connectez-vous, ou demandez un nouveau mot de passe.':
      'Dit adres is al in gebruik. Meld u aan, of vraag een nieuw wachtwoord aan.',
    Chiffre: 'Cijfer',
    'Choisissez une photo de votre pièce d’identité, ou un PDF.':
      'Kies een foto van uw identiteitsbewijs, of een pdf.',
    "Code d'invitation (facultatif)": 'Uitnodigingscode (optioneel)',
    'Code incorrect. Il vous reste un essai.':
      'Onjuiste code. U hebt nog één poging.',
    'Code incorrect. Il vous reste {essais} essais.':
      'Onjuiste code. U hebt nog {essais} pogingen.',
    'Code incorrect. Les trois essais sont utilisés : demandez un nouveau code.':
      'Onjuiste code. De drie pogingen zijn gebruikt: vraag een nieuwe code aan.',
    'Code reçu par SMS': 'Code ontvangen per sms',
    "Confirmez d'abord que vous êtes majeur.":
      'Bevestig eerst dat u meerderjarig bent.',
    'Confirmez le mot de passe': 'Bevestig het wachtwoord',
    'Confirmez votre adresse : un lien vous a été envoyé à':
      'Bevestig uw adres: er is een link verstuurd naar',
    'Connexion…': 'Bezig met aanmelden…',
    'Création…': 'Bezig met aanmaken…',
    'Créer mon compte': 'Mijn account aanmaken',
    'Demander un nouveau lien': 'Een nieuwe link aanvragen',
    'Document choisi : {nom}': 'Gekozen document: {nom}',
    'Enregistrement…': 'Bezig met opslaan…',
    'Enregistrer le mot de passe': 'Wachtwoord opslaan',
    'Entrez les quatre chiffres reçus par SMS.':
      'Vul de vier cijfers in die u per sms kreeg.',
    'Entrez votre mot de passe.': 'Vul uw wachtwoord in.',
    'Entrez une adresse e-mail valide.': 'Vul een geldig e-mailadres in.',
    'Envoyer le lien': 'Link versturen',
    'Envoyer pour vérification': 'Versturen ter verificatie',
    'Envoyé. Un administrateur vérifie votre pièce sous 24 heures, et vous serez prévenu du résultat.':
      'Verstuurd. Een beheerder controleert uw document binnen 24 uur, en u krijgt bericht van het resultaat.',
    'Il sert à vous joindre le jour de la garde : le bike sitter le voit une fois votre demande acceptée, et à ce moment-là seulement.':
      'Het dient om u te bereiken op de dag van de oppasbeurt: de bike sitter ziet het zodra uw aanvraag aanvaard is, en pas dan.',
    'Indiquez ce que vous seriez plutôt.': 'Geef aan wat u eerder zou zijn.',
    'Indiquez un numéro de mobile : un SMS ne peut pas être reçu sur une ligne fixe.':
      'Geef een gsm-nummer op: een sms kan niet op een vaste lijn ontvangen worden.',
    'Indiquez votre nom.': 'Vul uw achternaam in.',
    'Indiquez votre prénom.': 'Vul uw voornaam in.',
    'Indiquez une adresse e-mail valide.': 'Vul een geldig e-mailadres in.',
    'Indiquez votre quartier.': 'Vul uw wijk in.',
    "Inscrit. Nous vous écrirons à l'ouverture de votre quartier.":
      'Ingeschreven. We schrijven u wanneer uw wijk opent.',
    "Je n'ai pas d'invitation": 'Ik heb geen uitnodiging',
    'La connexion est momentanément indisponible. Vous pouvez réessayer un peu plus tard.':
      'Aanmelden is tijdelijk niet mogelijk. U kunt het iets later opnieuw proberen.',
    'La création de compte est momentanément indisponible. Rien n’a été enregistré : vous pouvez réessayer un peu plus tard.':
      'Een account aanmaken is tijdelijk niet mogelijk. Er is niets bewaard: u kunt het iets later opnieuw proberen.',
    "La vérification d'identité reste obligatoire, et votre compte est activé après validation. Si vous avez reçu une invitation, renseignez-la : votre parrain sera prévenu de votre arrivée.":
      'De identiteitsverificatie blijft verplicht, en uw account wordt geactiveerd na goedkeuring. Hebt u een uitnodiging gekregen, vul ze dan in: uw peter of meter krijgt bericht van uw komst.',
    'Le code arrive en quelques secondes et reste valable dix minutes.':
      'De code komt binnen enkele seconden aan en blijft tien minuten geldig.',
    'Le dépôt est momentanément indisponible. Rien n’a été envoyé : vous pouvez réessayer un peu plus tard.':
      'Uploaden is tijdelijk niet mogelijk. Er is niets verstuurd: u kunt het iets later opnieuw proberen.',
    'Le faire plus tard': 'Later doen',
    'Le fichier dépasse {taille} Mo. Une photo prise au téléphone suffit largement.':
      'Het bestand is groter dan {taille} MB. Een foto met uw telefoon volstaat ruim.',
    'Le mot de passe doit faire au moins 8 caractères.':
      'Het wachtwoord moet minstens 8 tekens lang zijn.',
    'Le mot de passe peut contenir jusqu’à 200 caractères.':
      'Het wachtwoord mag tot 200 tekens bevatten.',
    'Le réseau est ouvert : vous pouvez créer un compte sans invitation.':
      'Het netwerk is open: u kunt een account aanmaken zonder uitnodiging.',
    "Le réseau ouvre quartier par quartier. On y entre aujourd'hui sur invitation d'un membre.":
      'Het netwerk opent wijk per wijk. Vandaag komt u binnen op uitnodiging van een lid.',
    'Les bike sitters acceptent plus volontiers un profil vérifié.':
      'Bike sitters aanvaarden liever een geverifieerd profiel.',
    'Les deux': 'Allebei',
    'Les deux mots de passe ne sont pas identiques.':
      'De twee wachtwoorden zijn niet hetzelfde.',
    'Les trois essais sont utilisés. Demandez un nouveau code.':
      'De drie pogingen zijn gebruikt. Vraag een nieuwe code aan.',
    "Liste d'attente": 'Wachtlijst',
    'L’envoi est momentanément indisponible. Vous pouvez réessayer un peu plus tard.':
      'Versturen is tijdelijk niet mogelijk. U kunt het iets later opnieuw proberen.',
    'L’inscription est momentanément indisponible. Rien n’a été enregistré : vous pouvez réessayer un peu plus tard.':
      'Inschrijven is tijdelijk niet mogelijk. Er is niets bewaard: u kunt het iets later opnieuw proberen.',
    "M'inscrire": 'Inschrijven',
    Membre: 'Lid',
    'Merci, votre adresse est confirmée.': 'Bedankt, uw adres is bevestigd.',
    'Merci, votre adresse est confirmée. Vous pouvez vous connecter.':
      'Bedankt, uw adres is bevestigd. U kunt zich aanmelden.',
    'Mot de passe': 'Wachtwoord',
    'Mot de passe oublié': 'Wachtwoord vergeten',
    'Mot de passe oublié ?': 'Wachtwoord vergeten?',
    Nom: 'Achternaam',
    'Nouveau mot de passe': 'Nieuw wachtwoord',
    'Numéro de téléphone': 'Telefoonnummer',
    'Obligatoire pour demander une garde ou proposer un emplacement.':
      'Verplicht om een oppasbeurt aan te vragen of een plek aan te bieden.',
    "Photographier ma carte d'identité": 'Mijn identiteitskaart fotograferen',
    Prénom: 'Voornaam',
    'Recevoir le code par SMS': 'Code per sms ontvangen',
    'Renvoyer le lien': 'Link opnieuw versturen',
    'Renvoyer un code': 'Nieuwe code versturen',
    'Revenir à la connexion': 'Terug naar aanmelden',
    'Se connecter': 'Aanmelden',
    "Si un compte existe pour cette adresse, un lien vient d'être envoyé.":
      'Als er een account bestaat voor dit adres, is er net een link verstuurd.',
    "Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent l'ouverture d'un quartier, pas les cyclistes.":
      'Kunt u een fiets opvangen, zeg het dan: het zijn de bike sitters die een wijk doen openen, niet de fietsers.',
    'Téléphone vérifié': 'Telefoon geverifieerd',
    'Un code à {chiffres} chiffres vient d’être envoyé au {numero}. Il reste valable {minutes} minutes.':
      'Er is net een code van {chiffres} cijfers verstuurd naar {numero}. Hij blijft {minutes} minuten geldig.',
    'Un nouveau lien vient de partir.': 'Er is net een nieuwe link verstuurd.',
    'Une personne déjà inscrite sur la liste.':
      'Eén persoon staat al op de lijst.',
    "Votre document est supprimé dès la validation, et au plus tard après sept jours. Ni l'image ni le numéro ne sont conservés.":
      'Uw document wordt gewist zodra het goedgekeurd is, en uiterlijk na zeven dagen. Noch de afbeelding noch het nummer wordt bewaard.',
    'Votre identité est déjà vérifiée.': 'Uw identiteit is al geverifieerd.',
    'Votre identité est vérifiée.': 'Uw identiteit is geverifieerd.',
    'Votre invitation a le plus de valeur si vous êtes du même quartier que {prenom} : c’est la densité qui rend le service utilisable.':
      'Uw uitnodiging is het meest waard als u in dezelfde wijk woont als {prenom}: het is de dichtheid die de dienst bruikbaar maakt.',
    'Votre mot de passe est changé. Connectez-vous avec le nouveau : vos autres appareils ont été déconnectés.':
      'Uw wachtwoord is gewijzigd. Meld u aan met het nieuwe: uw andere toestellen zijn afgemeld.',
    'Votre pièce a bien été reçue. Un administrateur la vérifie sous 24 heures, et vous serez prévenu du résultat.':
      'Uw document is goed ontvangen. Een beheerder controleert het binnen 24 uur, en u krijgt bericht van het resultaat.',
    'Votre quartier': 'Uw wijk',
    'Vous seriez plutôt': 'U zou eerder zijn',
    'Vérification…': 'Bezig met controleren…',
    'Vérifiez votre identité': 'Laat uw identiteit verifiëren',
    'Vérifions vos coordonnées': 'Laten we uw gegevens controleren',
    'bike sitter à {quartier} · membre depuis {annee}':
      'bike sitter in {quartier} · lid sinds {annee}',
    'et la': 'en het',
    'membre depuis {annee}': 'lid sinds {annee}',
    '{nombre} personnes déjà inscrites sur la liste.':
      '{nombre} personen staan al op de lijst.',
    '{prenom} vous invite': '{prenom} nodigt u uit',
    'Étape {etape} sur {total}': 'Stap {etape} van {total}',
    'Votre message peut contenir jusqu’à 5000 caractères.':
      'Uw bericht mag tot 5000 tekens bevatten.',
    'Votre message contient un caractère qui ne peut pas être enregistré. Essayez de le retaper plutôt que de le coller.':
      'Uw bericht bevat een teken dat niet bewaard kan worden. Typ het opnieuw in plaats van het te plakken.',
    'emplacement ouvert ces sept derniers jours':
      'plek geopend in de laatste zeven dagen',
    Connexion: 'Aanmelden',
    'Aller au contenu': 'Naar de inhoud',
    'Navigation principale': 'Hoofdnavigatie',
    Bienvenue: 'Welkom',
    'Pages du site': 'Pagina’s van de site',
    'S’inscrire': 'Registreren',
    'Vélos volés': 'Gestolen fietsen',
    FAQ: 'Veelgestelde vragen',
    Sécurité: 'Veiligheid',
    'À propos': 'Over ons',
    CGU: 'Voorwaarden',
    Revenir: 'Terug',
    'Revenir à l’accueil': 'Terug naar de startpagina',
    'Cette page est introuvable.': 'Deze pagina bestaat niet.',
    'Le lien est peut-être ancien, ou l’adresse a changé.':
      'De link is misschien verouderd, of het adres is gewijzigd.',
    'Carte des zones': 'Kaart van de zones',
    'Carte des zones : aucun emplacement n’est encore ouvert.':
      'Kaart van de zones: er is nog geen plek open.',
    'zone approximative': 'zone bij benadering',
    'zones approximatives': 'zones bij benadering',
    emplacement: 'plek',
    emplacements: 'plekken',
    'garde terminée': 'afgeronde oppasbeurt',
    'gardes terminées': 'afgeronde oppasbeurten',
    'Chaque emplacement est proposé par un habitant, dans son garage, sa cave ou sa cour. Le réseau s’agrandit quartier par quartier, au rythme des voisins qui ouvrent leur porte.':
      'Elke plek wordt aangeboden door een bewoner, in zijn garage, kelder of binnenplaats. Het netwerk groeit wijk per wijk, op het ritme van de buren die hun deur openen.',
    'Le réseau ouvre ses premiers emplacements à Bruxelles. Chaque emplacement est proposé par un habitant, dans son garage, sa cave ou sa cour.':
      'Het netwerk opent zijn eerste plekken in Brussel. Elke plek wordt aangeboden door een bewoner, in zijn garage, kelder of binnenplaats.',
    'Vous avez un garage, une cave ou une cour fermée ?':
      'Hebt u een garage, een kelder of een afgesloten binnenplaats?',
    'Vous pourrez proposer un emplacement depuis votre espace, une fois votre identité vérifiée. Vous restez libre d’accepter chaque demande.':
      'U kunt een plek aanbieden vanuit uw ruimte, zodra uw identiteit geverifieerd is. U beslist zelf over elke aanvraag.',
    'Rejoindre le réseau': 'Word lid van het netwerk',
    'Questions fréquentes': 'Veelgestelde vragen',
    'C’est vraiment gratuit ?': 'Is het echt gratis?',
    'Oui. Les bike sitters ne sont pas rémunérés, c’est un réseau d’entraide.':
      'Ja. Bike sitters worden niet betaald, het is een netwerk van wederzijdse hulp.',
    'Qui est responsable en cas de vol chez le bike sitter ?':
      'Wie is verantwoordelijk bij diefstal bij de bike sitter?',
    'Les conditions générales détaillent la répartition. Chaque garde est horodatée et confirmée des deux côtés, ce qui donne une trace en cas de litige.':
      'De algemene voorwaarden beschrijven de verdeling. Elke oppasbeurt wordt met tijdstip vastgelegd en door beide kanten bevestigd, wat een spoor geeft bij een geschil.',
    'Quels vélos sont acceptés ?': 'Welke fietsen worden aanvaard?',
    'Chaque bike sitter indique les types qu’il peut accueillir, du vélo de ville au cargo.':
      'Elke bike sitter geeft aan welke types hij kan opvangen, van stadsfiets tot bakfiets.',
    'Combien de temps puis-je laisser mon vélo ?':
      'Hoe lang mag ik mijn fiets laten staan?',
    'Le créneau est convenu à la demande. Les gardes longues se discutent directement avec le bike sitter.':
      'Het tijdslot wordt bij de aanvraag afgesproken. Lange oppasbeurten bespreekt u rechtstreeks met de bike sitter.',
    'Dois-je vérifier mon identité ?':
      'Moet ik mijn identiteit laten verifiëren?',
    'Oui, pour demander une garde comme pour publier un emplacement.':
      'Ja, om een oppasbeurt aan te vragen en om een plek te publiceren.',
    'Comment retrouver un vélo volé ?': 'Hoe vind ik een gestolen fiets terug?',
    'Déclarez-le : votre fiche devient publique et n’importe qui peut signaler l’avoir aperçu.':
      'Geef hem aan: uw fiche wordt openbaar en iedereen kan melden dat hij hem gezien heeft.',
    'Conditions générales': 'Algemene voorwaarden',
    'Version de travail. Ce texte doit être rédigé et validé par un juriste avant toute mise en ligne.':
      'Werkversie. Deze tekst moet door een jurist geschreven en goedgekeurd worden voor hij online gaat.',
    Objet: 'Voorwerp',
    'Bike Sitters met en relation des cyclistes et des habitants disposant d’un espace privé. La plateforme n’assure ni la garde ni le transport des vélos.':
      'Bike Sitters brengt fietsers in contact met bewoners die over een private ruimte beschikken. Het platform verzorgt noch het bewaren noch het vervoer van fietsen.',
    Compte: 'Account',
    'Un compte unique par personne. Les vérifications d’e-mail, de téléphone et d’identité sont requises pour demander ou proposer une garde.':
      'Eén account per persoon. De verificatie van e-mail, telefoon en identiteit is nodig om een oppasbeurt aan te vragen of aan te bieden.',
    Responsabilité: 'Aansprakelijkheid',
    'À compléter avec le conseil juridique avant l’ouverture. C’est la clause qui détermine ce que la plateforme peut promettre.':
      'Aan te vullen met juridisch advies voor de opening. Deze clausule bepaalt wat het platform kan beloven.',
    Modération: 'Moderatie',
    'Tout compte peut être suspendu en cas de manquement. Les actions de modération sont journalisées.':
      'Elk account kan bij een tekortkoming geschorst worden. Moderatieacties worden bijgehouden.',
    'Politique de confidentialité': 'Privacybeleid',
    'Où sont vos données': 'Waar uw gegevens staan',
    'Hébergement dans l’Union européenne. Aucune donnée n’est transférée hors UE.':
      'Hosting in de Europese Unie. Er worden geen gegevens buiten de EU doorgegeven.',
    'Votre adresse': 'Uw adres',
    'L’adresse exacte de votre emplacement n’est lisible que par vous, par un cycliste dont vous avez accepté la demande, et par un administrateur.':
      'Het exacte adres van uw plek is enkel zichtbaar voor u, voor een fietser van wie u de aanvraag hebt aanvaard, en voor een beheerder.',
    'Votre pièce d’identité': 'Uw identiteitsbewijs',
    'Vérifiée puis supprimée, au plus tard après sept jours. Ni l’image ni le numéro ne sont conservés.':
      'Geverifieerd en daarna gewist, uiterlijk na zeven dagen. Noch de afbeelding noch het nummer wordt bewaard.',
    'Vos droits': 'Uw rechten',
    'Export complet et suppression de compte disponibles à tout moment depuis les paramètres.':
      'Volledige export en verwijdering van uw account zijn altijd mogelijk via de instellingen.',
    'Votre e-mail': 'Uw e-mailadres',
    Sujet: 'Onderwerp',
    Message: 'Bericht',
    Envoyer: 'Versturen',
    'Envoi…': 'Bezig met versturen…',
    'Question générale': 'Algemene vraag',
    'Problème avec une garde': 'Probleem met een oppasbeurt',
    'Signaler un abus': 'Misbruik melden',
    Presse: 'Pers',
    'Message envoyé. Réponse sous 48 heures.':
      'Bericht verstuurd. U krijgt binnen 48 uur een antwoord.',
    'Indiquez une adresse e-mail valide, pour que nous puissions vous répondre.':
      'Geef een geldig e-mailadres op, zodat we u kunnen antwoorden.',
    'Choisissez le sujet qui correspond le mieux à votre message.':
      'Kies het onderwerp dat het best bij uw bericht past.',
    'Écrivez votre message.': 'Schrijf uw bericht.',
    'L’envoi est momentanément indisponible. Votre message n’a pas été transmis : vous pouvez réessayer un peu plus tard.':
      'Versturen is tijdelijk niet mogelijk. Uw bericht is niet doorgegeven: u kunt het iets later opnieuw proberen.',
    'Nous avons bien reçu vos messages d’aujourd’hui. Nous vous répondons dès que possible ; vous pourrez nous écrire à nouveau demain.':
      'We hebben uw berichten van vandaag goed ontvangen. We antwoorden zo snel mogelijk; morgen kunt u ons opnieuw schrijven.',
    'Nous soutenir': 'Ons steunen',
    'Aider Bike Sitters à rester gratuit': 'Bike Sitters helpen gratis te blijven',
    'Le service est gratuit pour tous les membres. Son fonctionnement a pourtant quelques coûts : hébergement, cartographie, envoi des e-mails et vérification des candidatures.': 'De dienst is gratis voor alle leden. Toch brengt de werking enkele kosten met zich mee: hosting, cartografie, e-mails versturen en kandidaturen controleren.',
    'Un don sans contrepartie': 'Een gift zonder tegenprestatie',
    'Tous les membres sont traités de la même manière : un don n’apporte ni priorité ni visibilité particulière.': 'Alle leden worden op dezelfde manier behandeld: een gift geeft geen voorrang of bijzondere zichtbaarheid.',
    'En savoir plus': 'Meer weten',
    'À propos de l’association': 'Over de vereniging',
    'À quoi servent vos dons': 'Waar uw giften naartoe gaan',
    'un mois de carte pour un quartier': 'een maand kaart voor een wijk',
    'la vérification de vingt candidatures': 'de controle van twintig kandidaturen',
    'un mois de fonctionnement complet': 'een volle maand werking',
    'Un don par virement': 'Een gift per overschrijving',
    'Nous privilégions le virement bancaire : il ne coûte rien, ni à vous ni à l’association, alors qu’un paiement par carte entraîne des frais sur chaque don.': 'Wij verkiezen de overschrijving: die kost niets, u niet en de vereniging niet, terwijl een kaartbetaling kosten meebrengt op elke gift.',
    'Le formulaire vous fournit une communication structurée à indiquer lors de votre virement : elle nous permet de le reconnaître et de vous remercier. Aucune donnée bancaire ne transite par ce site.': 'Het formulier bezorgt u een gestructureerde mededeling voor uw overschrijving: die stelt ons in staat om ze te herkennen en u te bedanken. Geen bankgegevens passeren via deze site.',
    'Les dons ne sont pas encore ouverts.': 'De giften staan nog niet open.',
    'L’association est en cours de constitution et n’a pas encore de compte bancaire. Les dons ouvriront dès qu’il sera créé.': 'De vereniging is in oprichting en heeft nog geen bankrekening. De giften openen zodra die er is.',
    'La base de données n’est pas branchée : le formulaire est indisponible pour l’instant.': 'De databank is niet aangesloten: het formulier is voorlopig niet beschikbaar.',
    'Votre prénom (facultatif)': 'Uw voornaam (facultatief)',
    'Montant en euros (facultatif)': 'Bedrag in euro (facultatief)',
    'Votre e-mail (facultatif)': 'Uw e-mail (facultatief)',
    'Pour recevoir les coordonnées par écrit. Nous ne nous en servons pour rien d’autre.': 'Om de gegevens schriftelijk te ontvangen. Wij gebruiken uw e-mail nergens anders voor.',
    'Obtenir les coordonnées du virement': 'De overschrijvingsgegevens krijgen',
    'Un instant…': 'Even geduld…',
  },
  en: {
    'Confirmer mon adresse': 'Confirm my address',
    'Pour terminer, confirmez que cette adresse e-mail est bien la vôtre. C’est elle qui recevra les demandes et les réponses des autres membres.':
      'To finish, confirm that this email address is yours. It is where requests and replies from other members will arrive.',
    'Plusieurs essais n’ont pas abouti. Par sécurité, patientez un quart d’heure, ou choisissez un nouveau mot de passe.':
      'Several attempts did not succeed. For your security, wait a quarter of an hour, or choose a new password.',
    'Beaucoup de codes ont été essayés depuis cette connexion. Vous pourrez réessayer dans une heure.':
      'Many codes have been tried from this connection. You can try again in an hour.',
    'Confirmez d’abord votre adresse e-mail et votre numéro de téléphone : la pièce d’identité vient ensuite.':
      'First confirm your email address and phone number: the identity document comes next.',
    'Plusieurs codes ont déjà été envoyés aujourd’hui. Vous pourrez en demander un nouveau demain ; si le SMS n’arrive pas, écrivez-nous depuis la page Contact.':
      'Several codes have already been sent today. You can request a new one tomorrow; if the text message does not arrive, write to us from the Contact page.',
    'Trois codes ont été envoyés dans l’heure. Le dernier reste valable dix minutes ; vous pourrez en demander un autre un peu plus tard.':
      'Three codes have been sent within the hour. The last one stays valid for ten minutes; you can request another a little later.',
    'Trop de codes incorrects aujourd’hui. Par sécurité, la vérification reprendra demain.':
      'Too many incorrect codes today. For your security, verification will resume tomorrow.',
    '8 caractères minimum': 'At least 8 characters',
    'Adresse e-mail ou mot de passe incorrect.':
      'Incorrect email address or password.',
    'Aucun code en attente : demandez-en un nouveau.':
      'No code is pending: request a new one.',
    'Bike sitter': 'Bike sitter',
    'Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez qu’il est recopié tel quel, par exemple MANO-4K29.':
      'This invitation code does not exist or has already been used. Check that it is copied exactly, for example MANO-4K29.',
    'Ce code n’est plus valable : demandez-en un nouveau.':
      'This code is no longer valid: request a new one.',
    'Ce format n’est pas accepté. Envoyez une photo (JPEG, PNG, WebP) ou un PDF.':
      'This format is not accepted. Send a photo (JPEG, PNG, WebP) or a PDF.',
    'Ce lien de confirmation n’est plus valable.':
      'This confirmation link is no longer valid.',
    'Ce lien de confirmation n’est plus valable. Connectez-vous : vous pourrez en demander un nouveau.':
      'This confirmation link is no longer valid. Sign in: you will be able to request a new one.',
    'Ce lien n’est plus valable : il a déjà servi ou a expiré. Vous pouvez en demander un nouveau.':
      'This link is no longer valid: it has already been used or has expired. You can request a new one.',
    'Ce numéro n’est pas lisible. Exemple : 0470 12 34 56.':
      'This number cannot be read. Example: 0470 12 34 56.',
    'Cette adresse est déjà utilisée. Connectez-vous, ou demandez un nouveau mot de passe.':
      'This address is already in use. Sign in, or request a new password.',
    Chiffre: 'Digit',
    'Choisissez une photo de votre pièce d’identité, ou un PDF.':
      'Choose a photo of your identity document, or a PDF.',
    "Code d'invitation (facultatif)": 'Invitation code (optional)',
    'Code incorrect. Il vous reste un essai.':
      'Incorrect code. You have one attempt left.',
    'Code incorrect. Il vous reste {essais} essais.':
      'Incorrect code. You have {essais} attempts left.',
    'Code incorrect. Les trois essais sont utilisés : demandez un nouveau code.':
      'Incorrect code. All three attempts have been used: request a new code.',
    'Code reçu par SMS': 'Code received by text message',
    "Confirmez d'abord que vous êtes majeur.":
      'First confirm that you are an adult.',
    'Confirmez le mot de passe': 'Confirm the password',
    'Confirmez votre adresse : un lien vous a été envoyé à':
      'Confirm your address: a link has been sent to',
    'Connexion…': 'Signing in…',
    'Création…': 'Creating…',
    'Créer mon compte': 'Create my account',
    'Demander un nouveau lien': 'Request a new link',
    'Document choisi : {nom}': 'Selected document: {nom}',
    'Enregistrement…': 'Saving…',
    'Enregistrer le mot de passe': 'Save the password',
    'Entrez les quatre chiffres reçus par SMS.':
      'Enter the four digits you received by text message.',
    'Entrez votre mot de passe.': 'Enter your password.',
    'Entrez une adresse e-mail valide.': 'Enter a valid email address.',
    'Envoyer le lien': 'Send the link',
    'Envoyer pour vérification': 'Send for verification',
    'Envoyé. Un administrateur vérifie votre pièce sous 24 heures, et vous serez prévenu du résultat.':
      'Sent. An administrator checks your document within 24 hours, and you will be told the result.',
    'Il sert à vous joindre le jour de la garde : le bike sitter le voit une fois votre demande acceptée, et à ce moment-là seulement.':
      'It is used to reach you on the day of the stay: the bike sitter sees it once your request is accepted, and only then.',
    'Indiquez ce que vous seriez plutôt.': 'Tell us what you would rather be.',
    'Indiquez un numéro de mobile : un SMS ne peut pas être reçu sur une ligne fixe.':
      'Enter a mobile number: a text message cannot be received on a landline.',
    'Indiquez votre nom.': 'Enter your last name.',
    'Indiquez votre prénom.': 'Enter your first name.',
    'Indiquez une adresse e-mail valide.': 'Enter a valid email address.',
    'Indiquez votre quartier.': 'Enter your neighbourhood.',
    "Inscrit. Nous vous écrirons à l'ouverture de votre quartier.":
      'You are on the list. We will write to you when your neighbourhood opens.',
    "Je n'ai pas d'invitation": "I don't have an invitation",
    'La connexion est momentanément indisponible. Vous pouvez réessayer un peu plus tard.':
      'Signing in is temporarily unavailable. You can try again a little later.',
    'La création de compte est momentanément indisponible. Rien n’a été enregistré : vous pouvez réessayer un peu plus tard.':
      'Account creation is temporarily unavailable. Nothing has been saved: you can try again a little later.',
    "La vérification d'identité reste obligatoire, et votre compte est activé après validation. Si vous avez reçu une invitation, renseignez-la : votre parrain sera prévenu de votre arrivée.":
      'Identity verification is still required, and your account is activated once approved. If you received an invitation, enter it: the person who invited you will be told you have arrived.',
    'Le code arrive en quelques secondes et reste valable dix minutes.':
      'The code arrives within a few seconds and stays valid for ten minutes.',
    'Le dépôt est momentanément indisponible. Rien n’a été envoyé : vous pouvez réessayer un peu plus tard.':
      'Uploading is temporarily unavailable. Nothing has been sent: you can try again a little later.',
    'Le faire plus tard': 'Do it later',
    'Le fichier dépasse {taille} Mo. Une photo prise au téléphone suffit largement.':
      'The file is larger than {taille} MB. A photo taken with your phone is plenty.',
    'Le mot de passe doit faire au moins 8 caractères.':
      'The password must be at least 8 characters long.',
    'Le mot de passe peut contenir jusqu’à 200 caractères.':
      'The password can be up to 200 characters long.',
    'Le réseau est ouvert : vous pouvez créer un compte sans invitation.':
      'The network is open: you can create an account without an invitation.',
    "Le réseau ouvre quartier par quartier. On y entre aujourd'hui sur invitation d'un membre.":
      "The network opens neighbourhood by neighbourhood. For now, you join on a member's invitation.",
    'Les bike sitters acceptent plus volontiers un profil vérifié.':
      'Bike sitters are more willing to accept a verified profile.',
    'Les deux': 'Both',
    'Les deux mots de passe ne sont pas identiques.':
      'The two passwords do not match.',
    'Les trois essais sont utilisés. Demandez un nouveau code.':
      'All three attempts have been used. Request a new code.',
    "Liste d'attente": 'Waiting list',
    'L’envoi est momentanément indisponible. Vous pouvez réessayer un peu plus tard.':
      'Sending is temporarily unavailable. You can try again a little later.',
    'L’inscription est momentanément indisponible. Rien n’a été enregistré : vous pouvez réessayer un peu plus tard.':
      'Signing up is temporarily unavailable. Nothing has been saved: you can try again a little later.',
    "M'inscrire": 'Sign me up',
    Membre: 'Member',
    'Merci, votre adresse est confirmée.':
      'Thank you, your address is confirmed.',
    'Merci, votre adresse est confirmée. Vous pouvez vous connecter.':
      'Thank you, your address is confirmed. You can sign in.',
    'Mot de passe': 'Password',
    'Mot de passe oublié': 'Forgotten password',
    'Mot de passe oublié ?': 'Forgotten your password?',
    Nom: 'Last name',
    'Nouveau mot de passe': 'New password',
    'Numéro de téléphone': 'Phone number',
    'Obligatoire pour demander une garde ou proposer un emplacement.':
      'Required to request a stay or offer a place.',
    "Photographier ma carte d'identité": 'Photograph my identity card',
    Prénom: 'First name',
    'Recevoir le code par SMS': 'Get the code by text message',
    'Renvoyer le lien': 'Send the link again',
    'Renvoyer un code': 'Send a new code',
    'Revenir à la connexion': 'Back to sign in',
    'Se connecter': 'Sign in',
    "Si un compte existe pour cette adresse, un lien vient d'être envoyé.":
      'If an account exists for this address, a link has just been sent.',
    "Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent l'ouverture d'un quartier, pas les cyclistes.":
      'If you can host a bike, say so: it is bike sitters, not cyclists, who make a neighbourhood open.',
    'Téléphone vérifié': 'Phone verified',
    'Un code à {chiffres} chiffres vient d’être envoyé au {numero}. Il reste valable {minutes} minutes.':
      'A {chiffres}-digit code has just been sent to {numero}. It stays valid for {minutes} minutes.',
    'Un nouveau lien vient de partir.': 'A new link has just been sent.',
    'Une personne déjà inscrite sur la liste.':
      'One person is already on the list.',
    "Votre document est supprimé dès la validation, et au plus tard après sept jours. Ni l'image ni le numéro ne sont conservés.":
      'Your document is deleted as soon as it is approved, and within seven days at the latest. Neither the image nor the number is kept.',
    'Votre identité est déjà vérifiée.': 'Your identity is already verified.',
    'Votre identité est vérifiée.': 'Your identity is verified.',
    'Votre invitation a le plus de valeur si vous êtes du même quartier que {prenom} : c’est la densité qui rend le service utilisable.':
      'Your invitation is most valuable if you live in the same neighbourhood as {prenom}: density is what makes the service usable.',
    'Votre mot de passe est changé. Connectez-vous avec le nouveau : vos autres appareils ont été déconnectés.':
      'Your password has been changed. Sign in with the new one: your other devices have been signed out.',
    'Votre pièce a bien été reçue. Un administrateur la vérifie sous 24 heures, et vous serez prévenu du résultat.':
      'Your document has been received. An administrator checks it within 24 hours, and you will be told the result.',
    'Votre quartier': 'Your neighbourhood',
    'Vous seriez plutôt': 'You would rather be',
    'Vérification…': 'Checking…',
    'Vérifiez votre identité': 'Verify your identity',
    'Vérifions vos coordonnées': "Let's check your details",
    'bike sitter à {quartier} · membre depuis {annee}':
      'bike sitter in {quartier} · member since {annee}',
    'et la': 'and the',
    'membre depuis {annee}': 'member since {annee}',
    '{nombre} personnes déjà inscrites sur la liste.':
      '{nombre} people are already on the list.',
    '{prenom} vous invite': '{prenom} is inviting you',
    'Étape {etape} sur {total}': 'Step {etape} of {total}',
    'Votre message peut contenir jusqu’à 5000 caractères.':
      'Your message can be up to 5000 characters long.',
    'Votre message contient un caractère qui ne peut pas être enregistré. Essayez de le retaper plutôt que de le coller.':
      'Your message contains a character that cannot be saved. Try typing it again rather than pasting it.',
    'emplacement ouvert ces sept derniers jours':
      'place opened in the last seven days',
    Connexion: 'Sign in',
    'Aller au contenu': 'Skip to content',
    'Navigation principale': 'Main navigation',
    Bienvenue: 'Welcome',
    'Pages du site': 'Site pages',
    'S’inscrire': 'Sign up',
    'Vélos volés': 'Stolen bikes',
    FAQ: 'FAQ',
    Sécurité: 'Safety',
    'À propos': 'About',
    CGU: 'Terms',
    Revenir: 'Back',
    'Revenir à l’accueil': 'Back to the home page',
    'Cette page est introuvable.': 'This page cannot be found.',
    'Le lien est peut-être ancien, ou l’adresse a changé.':
      'The link may be out of date, or the address may have changed.',
    'Carte des zones': 'Map of areas',
    'Carte des zones : aucun emplacement n’est encore ouvert.':
      'Map of areas: no place is open yet.',
    'zone approximative': 'approximate area',
    'zones approximatives': 'approximate areas',
    emplacement: 'place',
    emplacements: 'places',
    'garde terminée': 'completed stay',
    'gardes terminées': 'completed stays',
    'Chaque emplacement est proposé par un habitant, dans son garage, sa cave ou sa cour. Le réseau s’agrandit quartier par quartier, au rythme des voisins qui ouvrent leur porte.':
      'Every place is offered by a resident, in their garage, cellar or courtyard. The network grows neighbourhood by neighbourhood, as neighbours open their doors.',
    'Le réseau ouvre ses premiers emplacements à Bruxelles. Chaque emplacement est proposé par un habitant, dans son garage, sa cave ou sa cour.':
      'The network is opening its first places in Brussels. Every place is offered by a resident, in their garage, cellar or courtyard.',
    'Vous avez un garage, une cave ou une cour fermée ?':
      'Do you have a garage, a cellar or a closed courtyard?',
    'Vous pourrez proposer un emplacement depuis votre espace, une fois votre identité vérifiée. Vous restez libre d’accepter chaque demande.':
      'You can offer a place from your space once your identity has been verified. You remain free to accept each request.',
    'Rejoindre le réseau': 'Join the network',
    'Questions fréquentes': 'Frequently asked questions',
    'C’est vraiment gratuit ?': 'Is it really free?',
    'Oui. Les bike sitters ne sont pas rémunérés, c’est un réseau d’entraide.':
      'Yes. Bike sitters are not paid: it is a mutual-aid network.',
    'Qui est responsable en cas de vol chez le bike sitter ?':
      'Who is responsible if a bike is stolen at the bike sitter’s?',
    'Les conditions générales détaillent la répartition. Chaque garde est horodatée et confirmée des deux côtés, ce qui donne une trace en cas de litige.':
      'The terms of use set out how responsibility is shared. Every stay is time-stamped and confirmed by both sides, which leaves a record in case of a dispute.',
    'Quels vélos sont acceptés ?': 'Which bikes are accepted?',
    'Chaque bike sitter indique les types qu’il peut accueillir, du vélo de ville au cargo.':
      'Each bike sitter indicates the types they can host, from city bikes to cargo bikes.',
    'Combien de temps puis-je laisser mon vélo ?':
      'How long can I leave my bike?',
    'Le créneau est convenu à la demande. Les gardes longues se discutent directement avec le bike sitter.':
      'The time slot is agreed when you send the request. Longer stays are discussed directly with the bike sitter.',
    'Dois-je vérifier mon identité ?': 'Do I need to verify my identity?',
    'Oui, pour demander une garde comme pour publier un emplacement.':
      'Yes, both to request a stay and to publish a place.',
    'Comment retrouver un vélo volé ?': 'How can I find a stolen bike?',
    'Déclarez-le : votre fiche devient publique et n’importe qui peut signaler l’avoir aperçu.':
      'Report it: your listing becomes public and anyone can report having seen it.',
    'Conditions générales': 'Terms of use',
    'Version de travail. Ce texte doit être rédigé et validé par un juriste avant toute mise en ligne.':
      'Working draft. This text must be written and approved by a lawyer before going live.',
    Objet: 'Purpose',
    'Bike Sitters met en relation des cyclistes et des habitants disposant d’un espace privé. La plateforme n’assure ni la garde ni le transport des vélos.':
      'Bike Sitters connects cyclists with residents who have a private space. The platform neither looks after nor transports bikes.',
    Compte: 'Account',
    'Un compte unique par personne. Les vérifications d’e-mail, de téléphone et d’identité sont requises pour demander ou proposer une garde.':
      'One account per person. Email, phone and identity verification are required to request or offer a stay.',
    Responsabilité: 'Liability',
    'À compléter avec le conseil juridique avant l’ouverture. C’est la clause qui détermine ce que la plateforme peut promettre.':
      'To be completed with legal counsel before launch. This clause determines what the platform can promise.',
    Modération: 'Moderation',
    'Tout compte peut être suspendu en cas de manquement. Les actions de modération sont journalisées.':
      'Any account may be suspended in case of a breach. Moderation actions are logged.',
    'Politique de confidentialité': 'Privacy policy',
    'Où sont vos données': 'Where your data is stored',
    'Hébergement dans l’Union européenne. Aucune donnée n’est transférée hors UE.':
      'Hosted in the European Union. No data is transferred outside the EU.',
    'Votre adresse': 'Your address',
    'L’adresse exacte de votre emplacement n’est lisible que par vous, par un cycliste dont vous avez accepté la demande, et par un administrateur.':
      'The exact address of your place can only be read by you, by a cyclist whose request you have accepted, and by an administrator.',
    'Votre pièce d’identité': 'Your identity document',
    'Vérifiée puis supprimée, au plus tard après sept jours. Ni l’image ni le numéro ne sont conservés.':
      'Verified, then deleted within seven days at the latest. Neither the image nor the number is kept.',
    'Vos droits': 'Your rights',
    'Export complet et suppression de compte disponibles à tout moment depuis les paramètres.':
      'A full export and account deletion are available at any time from your settings.',
    'Votre e-mail': 'Your email',
    Sujet: 'Subject',
    Message: 'Message',
    Envoyer: 'Send',
    'Envoi…': 'Sending…',
    'Question générale': 'General question',
    'Problème avec une garde': 'Problem with a stay',
    'Signaler un abus': 'Report abuse',
    Presse: 'Press',
    'Message envoyé. Réponse sous 48 heures.':
      'Message sent. You will receive a reply within 48 hours.',
    'Indiquez une adresse e-mail valide, pour que nous puissions vous répondre.':
      'Please enter a valid email address so that we can reply to you.',
    'Choisissez le sujet qui correspond le mieux à votre message.':
      'Choose the subject that best matches your message.',
    'Écrivez votre message.': 'Write your message.',
    'L’envoi est momentanément indisponible. Votre message n’a pas été transmis : vous pouvez réessayer un peu plus tard.':
      'Sending is temporarily unavailable. Your message has not been sent: you can try again a little later.',
    'Nous avons bien reçu vos messages d’aujourd’hui. Nous vous répondons dès que possible ; vous pourrez nous écrire à nouveau demain.':
      'We have received your messages from today. We will reply as soon as possible; you can write to us again tomorrow.',
    'Nous soutenir': 'Support us',
    'Aider Bike Sitters à rester gratuit': 'Help Bike Sitters stay free',
    'Le service est gratuit pour tous les membres. Son fonctionnement a pourtant quelques coûts : hébergement, cartographie, envoi des e-mails et vérification des candidatures.': 'The service is free for every member. Yet running it has a few costs: hosting, mapping, sending emails and checking applications.',
    'Un don sans contrepartie': 'A gift with no strings attached',
    'Tous les membres sont traités de la même manière : un don n’apporte ni priorité ni visibilité particulière.': 'Every member is treated the same way: a gift brings neither priority nor extra visibility.',
    'En savoir plus': 'Learn more',
    'À propos de l’association': 'About the association',
    'À quoi servent vos dons': 'Where your gifts go',
    'un mois de carte pour un quartier': 'a month of map service for one neighbourhood',
    'la vérification de vingt candidatures': 'checking twenty applications',
    'un mois de fonctionnement complet': 'a full month of operation',
    'Un don par virement': 'A gift by bank transfer',
    'Nous privilégions le virement bancaire : il ne coûte rien, ni à vous ni à l’association, alors qu’un paiement par carte entraîne des frais sur chaque don.': 'We prefer bank transfers: they cost nothing, neither for you nor for the association, whereas a card payment carries a fee on every gift.',
    'Le formulaire vous fournit une communication structurée à indiquer lors de votre virement : elle nous permet de le reconnaître et de vous remercier. Aucune donnée bancaire ne transite par ce site.': 'The form gives you a structured reference to include with your transfer: it lets us recognise it and thank you. No banking data passes through this site.',
    'Les dons ne sont pas encore ouverts.': 'Donations are not yet open.',
    'L’association est en cours de constitution et n’a pas encore de compte bancaire. Les dons ouvriront dès qu’il sera créé.': 'The association is being set up and does not yet have a bank account. Donations will open as soon as one exists.',
    'La base de données n’est pas branchée : le formulaire est indisponible pour l’instant.': 'The database is not connected: the form is unavailable for now.',
    'Votre prénom (facultatif)': 'Your first name (optional)',
    'Montant en euros (facultatif)': 'Amount in euros (optional)',
    'Votre e-mail (facultatif)': 'Your email (optional)',
    'Pour recevoir les coordonnées par écrit. Nous ne nous en servons pour rien d’autre.': 'To receive the transfer details in writing. We do not use it for anything else.',
    'Obtenir les coordonnées du virement': 'Get the transfer details',
    'Un instant…': 'One moment…',
  },
};
