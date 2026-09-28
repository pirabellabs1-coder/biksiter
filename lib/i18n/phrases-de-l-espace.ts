/**
 * Les traductions de l'espace membre : les écrans, et les phrases que les
 * règles et le dépôt renvoient (motifs de refus, notifications, erreurs).
 *
 * Vocabulaire tenu dans les trois langues : emplacement = plek = place ;
 * garde = oppasbeurt = stay ; membre = lid = member ; avis = beoordeling =
 * review ; signalement = melding = report ; alerte = zoekmelding = alert.
 */
export const PHRASES_DE_L_ESPACE: Record<
  'nl' | 'en',
  Record<string, string>
> = {
  nl: {
    "Continuer sans photo": "Doorgaan zonder foto",
    "Les photos sont facultatives : vous pourrez les ajouter plus tard depuis votre espace.": "Foto’s zijn optioneel: u kunt ze later toevoegen vanuit uw ruimte.",
    "L’adresse n’est plus affichée depuis l’annulation.": "Het adres wordt sinds de annulering niet meer getoond.",
    "Demande acceptée : {prenom} reçoit votre adresse et votre numéro pour le dépôt.": "Aanvraag aanvaard: {prenom} krijgt uw adres en uw nummer voor het afzetten.",
    "Modifier mon numéro": "Mijn nummer wijzigen",
    "La confirmation par SMS n’est pas encore disponible : enregistrez simplement votre numéro.": "Bevestiging via sms is nog niet beschikbaar: sla uw nummer gewoon op.",
    "Pas encore confirmé": "Nog niet bevestigd",
    "Non renseigné": "Niet ingevuld",
    "Confirmé par SMS": "Bevestigd via sms",
    "Enregistré sans code SMS": "Geregistreerd zonder sms-code",
    "Communiqué à l’autre personne pendant une garde acceptée, et à elle seule": "Gedeeld met de andere persoon tijdens een aanvaarde oppasbeurt, en alleen met haar",
    "Enregistré": "Geregistreerd",
    "Plus tard": "Later",
    "Demandez un code par SMS pour confirmer votre numéro.": "Vraag een sms-code aan om uw nummer te bevestigen.",
    "Indiquez un numéro de mobile : c’est lui qui sert à vous joindre le jour de la garde.": "Geef een gsm-nummer op: daarmee kunnen we u bereiken op de dag van de oppasbeurt.",
    "Enregistrer mon numéro": "Mijn nummer opslaan",
    "Garde close par la modération": "Oppasbeurt afgesloten door de moderatie",
    "Garde annulée par la modération": "Oppasbeurt geannuleerd door de moderatie",
    "Décision : {motif}": "Beslissing: {motif}",
    "Un modérateur a examiné le signalement et pris une décision.": "Een moderator heeft de melding onderzocht en een beslissing genomen.",
    "Ces files rassemblent ce qui attend une décision. Les adresses complètes et les conversations ne s’affichent que dans un dossier ouvert, le temps de l’instruire.": "Deze wachtrijen verzamelen wat op een beslissing wacht. Volledige adressen en gesprekken verschijnen alleen in een open dossier, zolang het onderzocht wordt.",
    "Fiche de {prenom} (cycliste)": "Fiche van {prenom} (fietser)",
    "Fiche de {prenom} (Bike Sitter)": "Fiche van {prenom} (Bike Sitter)",
    "Conversation de la garde": "Gesprek over de oppasbeurt",
    "Les deux membres ne se sont pas écrit.": "De twee leden hebben elkaar niet geschreven.",
    "(photo jointe)": "(foto bijgevoegd)",
    "Le vélo est encore chez le Bike Sitter. Si le problème est réglé, classez le litige : la garde reprend son cours. Clore la garde met fin à son suivi : vérifiez d’abord avec les deux membres que le vélo a bien été rendu.": "De fiets is nog bij de Bike Sitter. Is het probleem opgelost, sluit het geschil dan af: de oppasbeurt loopt verder. De oppasbeurt afsluiten beëindigt de opvolging: controleer eerst bij beide leden dat de fiets is teruggegeven.",
    "Votre signalement est transmis à la modération. Vous recevez une notification dès qu’il a été examiné.": "Uw melding is doorgestuurd naar de moderatie. U krijgt een melding zodra ze is onderzocht.",
    "Classer, la garde continue": "Afsluiten, de oppasbeurt loopt verder",
    "Le problème est réglé et le vélo reste chez le Bike Sitter : la garde reprend son cours, jusqu’à la reprise avec le code.": "Het probleem is opgelost en de fiets blijft bij de Bike Sitter: de oppasbeurt loopt verder tot het ophalen met de code.",
    "Le vélo a déjà été rendu : la garde ne peut plus reprendre. Choisissez de la clore.": "De fiets is al teruggegeven: de oppasbeurt kan niet verder lopen. Kies om ze af te sluiten.",
    "Photo": "Foto",
    "Demande acceptée : {prenom} reçoit votre adresse pour le dépôt.": "Aanvraag aanvaard: {prenom} krijgt uw adres voor het afzetten.",
    "Demande déclinée : {prenom} reçoit une notification.": "Aanvraag geweigerd: {prenom} krijgt een melding.",
    "Voir la demande suivante": "Volgende aanvraag bekijken",
    "Tout se passe chez vous.": "Alles gebeurt bij u thuis.",
    "Aucune demande en attente.": "Geen aanvragen in afwachting.",
    "Vous recevez une notification dès qu’un cycliste vous écrit.": "U krijgt een melding zodra een fietser u schrijft.",
    "Aucune garde à venir.": "Geen komende oppasbeurten.",
    "Les demandes que vous acceptez apparaissent ici jusqu’à la reprise du vélo.": "De aanvragen die u aanvaardt, staan hier tot de fiets is opgehaald.",
    "Aucune garde terminée pour l’instant.": "Nog geen afgeronde oppasbeurten.",
    "Chaque garde menée à son terme s’ajoute ici, avec les points qu’elle vous a rapportés.": "Elke afgeronde oppasbeurt komt hier, met de punten die ze u opleverde.",
    "Aucune demande refusée ou expirée.": "Geen geweigerde of verlopen aanvragen.",
    "Les demandes déclinées, annulées ou restées sans réponse s’afficheraient ici.": "Geweigerde, geannuleerde of onbeantwoorde aanvragen zouden hier verschijnen.",
    "Terminées": "Afgerond",
    "Jours et horaires": "Dagen en uren",
    "Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez qu’il est recopié tel quel, ou videz le champ : l’inscription est ouverte sans code.": "Deze uitnodigingscode bestaat niet of is al gebruikt. Controleer of hij exact is overgenomen, of maak het veld leeg: inschrijven kan ook zonder code.",
    "Les photos de votre emplacement aident les cyclistes à voir où leur vélo sera accueilli.": "De foto’s van uw plek helpen fietsers te zien waar hun fiets wordt opgevangen.",
    "Protéger votre adresse": "Uw adres beschermen",
    "Cadrez l’emplacement lui-même : un numéro de rue, une plaque ou un visage n’apportent rien aux cyclistes. Les coordonnées GPS des photos sont retirées automatiquement.": "Fotografeer de plek zelf: een huisnummer, een nummerplaat of een gezicht voegen niets toe voor fietsers. De gps-gegevens van de foto’s worden automatisch verwijderd.",
    "À vérifier avant de repartir": "Te controleren voor u vertrekt",
    "Merci pour votre avis. Au plaisir d’une prochaine garde.": "Bedankt voor uw beoordeling. Tot een volgende oppasbeurt.",
    "Fermer la photo": "De foto sluiten",
    "Votre signalement a été examiné par la modération. Merci de nous avoir prévenus.": "Uw melding is door de moderatie bekeken. Bedankt om ons te verwittigen.",
    "Acceptez les règles du réseau et la charte de garde pour continuer.": "Aanvaard de regels van het netwerk en het oppascharter om verder te gaan.",
    "Votre compte est suspendu par la modération. Pour en connaître la raison ou demander sa réactivation, écrivez-nous depuis la page Contact.": "Uw account is geschorst door de moderatie. Schrijf ons via de contactpagina om de reden te kennen of heractivering te vragen.",
    "Contact": "Contact",
    "La garde est close.": "De oppasbeurt is afgesloten.",
    "Clore la garde met fin à son suivi : l’adresse reste visible deux heures, puis disparaît. Vérifiez d’abord avec les deux membres que le vélo a bien été rendu.": "De oppasbeurt afsluiten beëindigt de opvolging: het adres blijft twee uur zichtbaar en verdwijnt dan. Controleer eerst bij beide leden dat de fiets is teruggegeven.",
    "Il reste masqué aux membres tant qu’il n’est pas activé.": "Het blijft verborgen voor leden zolang het niet is geactiveerd.",
    "Pièce non validée : {motif}": "Identiteitsbewijs niet goedgekeurd: {motif}",
    "Envoyer une nouvelle pièce": "Een nieuw identiteitsbewijs sturen",
    "Votre identité est vérifiée. Vous pouvez envoyer des demandes et proposer un emplacement.": "Uw identiteit is geverifieerd. U kunt aanvragen sturen en een stalplaats aanbieden.",
    "Votre pièce d’identité n’a pas pu être validée : {motif}. Vous pouvez en envoyer une nouvelle.": "Uw identiteitsbewijs kon niet worden goedgekeurd: {motif}. U kunt een nieuw sturen.",
    "Décrire votre emplacement": "Uw stalplaats beschrijven",
    "La garde a lieu dans votre emplacement privé et sécurisé.": "De oppasbeurt vindt plaats in uw private, beveiligde stalplaats.",
    "L’emplacement où vous accueillez les vélos doit être privé, fermé et sécurisé. Vous en précisez ici le type et les caractéristiques.": "De stalplaats waar u fietsen ontvangt moet privé, afgesloten en beveiligd zijn. Hier geeft u het type en de kenmerken op.",
    "Votre emplacement": "Uw stalplaats",
    "Vous pouvez proposer un emplacement privé pour recevoir des demandes de garde.": "U kunt een private stalplaats aanbieden om aanvragen te ontvangen.",
    "Photo {n}": "Foto {n}",
    "Retirer cette photo ? Elle disparaît aussitôt de votre fiche.": "Deze foto verwijderen? Ze verdwijnt meteen van uw fiche.",
    "Retirer « {titre} »": "« {titre} » verwijderen",
    "Chiffres du lieu": "Cijfers van de plek",
    "places": "plaatsen",
    "place": "plaats",
    "vue de la fiche": "weergave van de fiche",
    "Cette demande n’a pas pu être acceptée. D’autres bike sitters accueillent peut-être sur ce créneau.": "Deze aanvraag kon niet worden aanvaard. Misschien kunnen andere bike sitters op dit tijdstip ontvangen.",
    "{n} messages": "{n} berichten",
    "{n} message": "{n} bericht",
    "{n} candidatures d’emplacement": "{n} aanvragen voor een stalplaats",
    "{n} candidature d’emplacement": "{n} aanvraag voor een stalplaats",
    "Répondez avant l’heure du dépôt, et au plus tard sous {n} heures : sans réponse, la demande expire.": "Antwoord vóór het afgiftemoment, en uiterlijk binnen {n} uur: zonder antwoord vervalt de aanvraag.",
    "Avantages des partenaires": "Voordelen van de partners",
    "{n} échanges": "{n} gesprekken",
    "{n} échange": "{n} gesprek",
    "{n} membres affichés": "{n} leden getoond",
    "{n} membre affiché": "{n} lid getoond",
    "Pas encore de période précédente à comparer.": "Nog geen vorige periode om mee te vergelijken.",
    "garde réalisée": "oppasbeurt voltooid",
    "{n} vélo": "{n} fiets",
    "Jusqu’à {n} h dans la journée": "Tot {n} u overdag",
    "Jusqu’à {n} h d’affilée": "Tot {n} u aan één stuk",
    "{prenom} peut répondre pendant encore {delai}. Sans réponse, la demande expire et vous recevez une notification.": "{prenom} kan nog {delai} antwoorden. Zonder antwoord vervalt de aanvraag en krijgt u een bericht.",
    "Le vélo n’a pas été récupéré": "De fiets is niet opgehaald",
    "Joignez une image.": "Voeg een afbeelding toe.",
    "Cette photo est trop lourde (8 Mo maximum).": "Deze foto is te groot (maximaal 8 MB).",
    "Les réponses arrivent quand chacun est disponible.": "Antwoorden komen wanneer iedereen tijd heeft.",
    "Photo envoyée": "Verstuurde foto",
    "Joindre une photo": "Een foto toevoegen",
    "Retirer la photo": "De foto verwijderen",
    "{n} photo": "{n} foto",
    "{prenom} vous remet le vélo et voit un code à six chiffres sur son écran. Demandez-le-lui et saisissez-le.": "{prenom} geeft u de fiets en ziet een code van zes cijfers op het scherm. Vraag erom en voer ze in.",
    "La remise se confirme avec le code à six chiffres.": "De overdracht wordt bevestigd met de code van zes cijfers.",
    "Saisissez les six chiffres.": "Voer de zes cijfers in.",
    "Cette conversation ne reçoit plus de messages.": "Dit gesprek ontvangt geen berichten meer.",
    "Vous avez écrit beaucoup de messages en peu de temps. Vous pourrez continuer dans un moment.": "U hebt veel berichten in korte tijd geschreven. Over een moment kunt u verdergaan.",
    "Capacité atteinte sur ce créneau.": "Capaciteit bereikt voor dit tijdslot.",
    "Cette demande a expiré : elle n’a pas reçu de réponse à temps.": "Deze aanvraag is verlopen: er kwam niet op tijd een antwoord.",
    "Vous pourrez signaler votre arrivée une demi-heure avant l’heure du dépôt.": "U kunt uw aankomst melden vanaf een halfuur voor het afgesproken tijdstip.",
    "Plusieurs codes incorrects ont été saisis pour cette remise. Par sécurité, la saisie reprendra demain ; en attendant, vous pouvez signaler un problème depuis la garde.": "Voor deze overdracht zijn meerdere onjuiste codes ingevoerd. Voor de veiligheid kan het morgen opnieuw; intussen kunt u een probleem melden vanuit de oppasbeurt.",
    "Cet emplacement n'est pas disponible.": "Deze plek is niet beschikbaar.",
    "Vous avez déjà une demande en attente pour cet emplacement : {prenom} vous répondra.": "U hebt al een openstaande aanvraag voor deze plek: {prenom} antwoordt u.",
    "Vous avez envoyé beaucoup de demandes aujourd’hui. Vous pourrez en envoyer d’autres demain.": "U hebt vandaag veel aanvragen verstuurd. Morgen kunt u er opnieuw versturen.",
    "Un signalement est en cours d’examen par la modération. Vous pourrez supprimer votre compte une fois qu’il sera traité.": "Een melding wordt door de moderatie bekeken. U kunt uw account verwijderen zodra die behandeld is.",
    '{n} emplacements': '{n} plekken',
    'Un emplacement': 'Eén plek',
    'Un vélo accueilli': 'Eén fiets onthaald',
    'Signaler ce membre': 'Dit lid melden',
    'Pas encore d’avis publié.': 'Nog geen gepubliceerde beoordeling.',
    Téléphone: 'Telefoon',
    'Confirmé par SMS · communiqué à l’autre personne pendant une garde acceptée, et à elle seule':
      'Bevestigd per sms · gedeeld met de andere persoon tijdens een aanvaarde oppasbeurt, en alleen met haar',
    Identité: 'Identiteit',
    Vérifié: 'Geverifieerd',
    'En cours d’examen': 'Wordt nagekeken',
    Vérifier: 'Verifiëren',
    '1 jour': '1 dag',
    'A prévenu de son retard': 'Liet weten later te komen',
    'Absence imprévue': 'Onverwachte afwezigheid',
    'Accueille occasionnellement': 'Past af en toe op fietsen',
    'Accès : {acces}': 'Toegang: {acces}',
    Actuelle: 'Huidige',
    'Afficher le code de restitution': 'Teruggavecode tonen',
    'Afficher mon code de remise': 'Mijn overdrachtscode tonen',
    'Ajouter deux photos du vélo': 'Twee foto’s van de fiets toevoegen',
    "Ajoutez d'abord le vélo que vous souhaitez confier : le bike sitter saura ce qu'il accueille.":
      'Voeg eerst de fiets toe die u wilt toevertrouwen: zo weet de bike sitter wat hij mag verwachten.',
    'Alerte créée': 'Zoekmelding aangemaakt',
    "Alerte créée pour {lieu}. Vous recevez une notification dès qu'un emplacement ouvre.":
      'Zoekmelding aangemaakt voor {lieu}. U krijgt een bericht zodra er een plek vrijkomt.',
    // Notifications déjà enregistrées en base avant la reformulation du texte.
    "Alerte créée pour {lieu}. Vous serez prévenu dès qu'un emplacement ouvre.":
      'Zoekmelding aangemaakt voor {lieu}. U krijgt een bericht zodra er een plek vrijkomt.',
    'Ancien membre': 'Voormalig lid',
    'Appeler {prenom}': '{prenom} bellen',
    'Arrivée dépassée de {n} min': 'Aankomst {n} min te laat',
    "Attendez au moins trente minutes après l'heure convenue.":
      'Wacht minstens dertig minuten na het afgesproken uur.',
    "Attendez vingt minutes après votre arrivée, et appelez d'abord votre bike sitter.":
      'Wacht twintig minuten na uw aankomst, en bel eerst uw bike sitter.',
    'Au dépôt': 'Bij afgifte',
    'Au-delà d’une semaine, à convenir': 'Langer dan een week, in overleg',
    'Aucun autre emplacement libre sur ce créneau.':
      'Geen andere plek vrij in dit tijdslot.',
    'Aucun avis donné.': 'Nog geen beoordeling gegeven.',
    "Aucun code n'est encore affiché : demandez à l'autre personne d'ouvrir l'écran de remise.":
      'Er wordt nog geen code getoond. Vraag de andere persoon om het overdrachtsscherm te openen.',
    'Aucun créneau libre ce jour-là. Essayez une autre date.':
      'Geen vrij tijdslot op die dag. Probeer een andere datum.',
    'Aucun emplacement disponible sur ce créneau':
      'Geen plek beschikbaar in dit tijdslot',
    'Aucun emplacement sur ce créneau.': 'Geen plekken in dit tijdslot.',
    "Aucun message pour l'instant.": 'Nog geen berichten.',
    'Aucun vélo enregistré.': 'Nog geen fiets geregistreerd.',
    'Aucune conversation.': 'Geen gesprekken.',
    "Aucune garde pour l'instant.": 'Nog geen oppasbeurten.',
    'Aucune notification.': 'Geen notificaties.',
    'Avis contesté': 'Beoordeling betwist',
    'Avis enregistré. Il sera publié dès que {prenom} aura laissé le sien.':
      'Beoordeling opgeslagen. Ze wordt gepubliceerd zodra {prenom} de zijne heeft achtergelaten.',
    'Batterie jugée dangereuse au moment du dépôt.':
      'Batterij bij het afzetten als gevaarlijk beoordeeld.',
    Bleu: 'Blauw',
    'Bonjour {prenom}, je passe la journée en centre-ville…':
      'Hallo {prenom}, ik breng de dag door in het centrum…',
    "C'est à l'autre personne de saisir ce code.":
      'De andere persoon voert deze code in.',
    'Capacité atteinte sur ce créneau : {capacite} vélos.':
      'Dit tijdslot is vol: {capacite} fietsen.',
    'Ce code a expiré.': 'Deze code is vervallen.',
    'Ce code a expiré. Demandez-en un nouveau.':
      'Deze code is verlopen. Vraag een nieuwe aan.',
    "Ce code n'est pas le vôtre.": 'Deze code is niet voor u bestemd.',
    'Ce constat est déjà enregistré et ne peut plus être modifié.':
      'Deze vaststelling is al opgeslagen en kan niet meer worden gewijzigd.',
    'Ce constat revient à l’autre personne.':
      'Deze vaststelling doet de andere persoon.',
    'Ce créneau est déjà passé : choisissez une heure à venir.':
      'Dit tijdslot is al voorbij. Kies een tijdstip dat nog moet komen.',
    'Ce lieu ne nous dit rien.': 'We herkennen deze locatie niet.',
    "Ce membre n'existe pas.": 'Dit lid bestaat niet.',
    'Ce mot de passe ne correspond pas.': 'Dit wachtwoord klopt niet.',
    'Ce profil n’est pas public.': 'Dit profiel is niet openbaar.',
    'Ce prénom figure sur la pièce que nous avons vérifiée. Pour le changer, écrivez-nous en expliquant pourquoi.':
      'Deze voornaam staat op het identiteitsbewijs dat we hebben gecontroleerd. Wilt u hem wijzigen? Schrijf ons dan en leg uit waarom.',
    'Ce qui est conservé malgré la suppression : les gardes passées sans votre nom, et les traces de modération, pour des raisons légales.':
      'Wat na de verwijdering bewaard blijft: de voorbije oppasbeurten zonder uw naam, en de sporen van moderatie, om wettelijke redenen.',
    'Ce qui ne va pas': 'Wat er niet klopt',
    "Ce qui s'est bien passé, ce qui pourrait aider le prochain cycliste…":
      'Wat goed ging, wat de volgende fietser kan helpen…',
    'Ce qui s’est passé…': 'Wat er gebeurd is…',
    "Ce signalement n'a pas de cible.": 'Deze melding is aan niets gekoppeld.',
    "Ce vélo est déjà confié chez {prenom} sur ce créneau. Annulez cette garde avant d'en demander une autre.":
      'Deze fiets is in dit tijdslot al toevertrouwd aan {prenom}. Annuleer die oppasbeurt voordat u een andere aanvraagt.',
    'Ce vélo est engagé dans une garde en cours.':
      'Deze fiets maakt deel uit van een lopende oppasbeurt.',
    "Ce vélo n'est pas le vôtre.": 'Deze fiets is niet van u.',
    'Cet avis décrit une autre garde…':
      'Deze beoordeling beschrijft een andere oppasbeurt…',
    'Cet avis est déjà signalé.': 'Deze beoordeling is al gemeld.',
    'Cet emplacement est en pause. Republiez-le avant d’accepter.':
      'Deze plek is gepauzeerd. Zet ze opnieuw online voordat u aanvaardt.',
    "Cet emplacement n'est plus disponible.":
      'Deze plek is niet meer beschikbaar.',
    'Cet emplacement se libère à partir de {heure}.':
      'Deze plek komt vrij vanaf {heure}.',
    "Cette action n'a pas pu aboutir : la garde a peut-être changé entre-temps.":
      'Deze actie is niet gelukt: de oppasbeurt is intussen misschien gewijzigd.',
    "Cette action n'est plus possible : la garde a changé entre-temps.":
      'Deze actie is niet meer mogelijk: de oppasbeurt is intussen gewijzigd.',
    'Cette conversation ne vous concerne pas.': 'Dit gesprek gaat u niet aan.',
    'Cette garde est close : la conversation ne reçoit plus de messages.':
      'Deze oppasbeurt is afgesloten: in dit gesprek kunnen geen berichten meer worden verstuurd.',
    "Cette réponse n'est pas possible.": 'Dit antwoord is niet mogelijk.',
    'Changement de programme': 'Gewijzigde plannen',
    "Changer d'horaire": 'Ander tijdstip kiezen',
    'Changer de créneau': 'Ander tijdslot kiezen',
    "Changez d'horaire ou élargissez la zone.":
      'Kies een ander tijdstip of vergroot de zone.',
    'Chaque filtre écarte des emplacements. Sans filtre, vous voyez tout ce qui est libre sur votre créneau.':
      'Elke filter sluit plekken uit. Zonder filter ziet u alles wat vrij is in uw tijdslot.',
    'Chercher un emplacement': 'Een plek zoeken',
    'Cherchez un emplacement pour commencer.': 'Zoek een plek om te beginnen.',
    'Chez {prenom}': 'Bij {prenom}',
    'Choisissez la date du dépôt.': 'Kies de datum waarop u de fiets afzet.',
    'Choisissez le type de votre vélo.': 'Kies het type van uw fiets.',
    'Choisissez le vélo concerné.': 'Kies de fiets waarover het gaat.',
    'Choisissez un motif.': 'Kies een reden.',
    'Clore la garde': 'Oppasbeurt afsluiten',
    'Cochez la case pour confirmer la suppression.':
      'Vink het vakje aan om de verwijdering te bevestigen.',
    'Code incorrect. Il reste un essai.':
      'Onjuiste code. U hebt nog één poging.',
    'Code incorrect. Il reste {n} essais.':
      'Onjuiste code. U hebt nog {n} pogingen.',
    "Comment ça s'est passé ?": 'Hoe is het verlopen?',
    'Comparez avec le dépôt': 'Vergelijk met de afgifte',
    'Complet sur ce créneau': 'Volzet in dit tijdslot',
    'Complet toute la journée': 'De hele dag volzet',
    'Complets sur ce créneau ({n})': 'Volzet in dit tijdslot ({n})',
    'Compte suspendu : action impossible.':
      'Uw account is opgeschort: deze actie is niet mogelijk.',
    "Confirmer l'absence": 'Afwezigheid bevestigen',
    "Confirmer l'annulation": 'Annulering bevestigen',
    'Confirmer le refus': 'Weigering bevestigen',
    'Constat enregistré': 'Vaststelling opgeslagen',
    Constaté: 'Vastgesteld',
    'Contactez le propriétaire du vélo, et gardez-le chez vous sans le sortir.':
      'Neem contact op met de eigenaar van de fiets en houd de fiets bij u thuis, zonder hem buiten te zetten.',
    'Créer une alerte': 'Zoekmelding aanmaken',
    'Créneau hors des disponibilités du bike sitter : {horaires}.':
      'Dit tijdslot valt buiten de beschikbaarheden van de bike sitter: {horaires}.',
    'Créneau qui ne me convient pas': 'Het tijdslot past me niet',
    'Demande envoyée à {prenom}.': 'Aanvraag verstuurd naar {prenom}.',
    'Dernière garde il y a moins d’une heure':
      'Laatste oppasbeurt minder dan een uur geleden',
    'Dernière garde il y a {n} h': 'Laatste oppasbeurt {n} u geleden',
    'Dernière garde il y a {n} j': 'Laatste oppasbeurt {n} d geleden',
    'Dernière garde il y a {n} mois': 'Laatste oppasbeurt {n} mnd geleden',
    'Dernière garde il y a {n} sem.': 'Laatste oppasbeurt {n} wk geleden',
    "Deux photos et un état constaté. Sans lui, un désaccord sur l'état du vélo oppose deux paroles.":
      'Twee foto’s en een vastgestelde staat. Zonder vaststelling staat het bij onenigheid over de staat van de fiets woord tegen woord.',
    Dim: 'Zo',
    'Disponible sur votre créneau · {creneau}':
      'Beschikbaar in uw tijdslot · {creneau}',
    'Donnez un nom à votre vélo.': 'Geef uw fiets een naam.',
    'Donnés ({n})': 'Gegeven ({n})',
    Débloquer: 'Deblokkeren',
    'Décrivez le défaut': 'Beschrijf het defect',
    'Décrivez le défaut constaté.':
      'Beschrijf het gebrek dat u hebt vastgesteld.',
    Défaut: 'Gebrek',
    'E-mail — jamais public': 'E-mail — nooit openbaar',
    Emplacement: 'Plek',
    'En attente de publication': 'Wacht op publicatie',
    'En attente de {prenom}.': 'Wachten op {prenom}.',
    'En cours': 'Lopend',
    'En ligne': 'Online',
    'En pause': 'Gepauzeerd',
    Enfant: 'Kinderfiets',
    Enregistrer: 'Opslaan',
    'Entièrement à l’intérieur': 'Volledig binnen',
    'Envoyer le signalement': 'De melding versturen',
    'Envoyer à la modération': 'Naar de moderatie sturen',
    'Envoyez des photos (JPEG, PNG ou WebP).':
      'Stuur foto’s (JPEG, PNG of WebP).',
    'Erreur dans ma demande': 'Fout in mijn aanvraag',
    'Erreur de ma part': 'Vergissing van mijn kant',
    Escalier: 'Trap',
    'Essayer cet horaire': 'Dit tijdstip proberen',
    'Essayez le nom d’un quartier, d’une place ou d’une commune de Bruxelles.':
      'Probeer de naam van een wijk, een plein of een gemeente in Brussel.',
    'Fermé : {jours}': 'Gesloten: {jours}',
    'Fermé à clé': 'Op slot',
    Filtres: 'Filters',
    Garde: 'Oppasbeurt',
    'Garde annulée par {prenom} : {motif}':
      'Oppasbeurt geannuleerd door {prenom}: {motif}',
    'Garde confirmée ailleurs pour le même vélo':
      'Oppasbeurt elders bevestigd voor dezelfde fiets',
    'Garde de {jours} jours : seuls les bike sitters qui acceptent cette durée seront proposés.':
      'Oppasbeurt van {jours} dagen: enkel bike sitters die deze duur aanvaarden, worden voorgesteld.',
    'Garde de {jours} jours. Votre vélo reste chez {prenom} pendant {nuits} nuit(s).':
      'Oppasbeurt van {jours} dagen. Uw fiets blijft {nuits} nacht(en) bij {prenom}.',
    'Garde terminée avec {prenom}. Vous pouvez laisser un avis.':
      'Oppasbeurt met {prenom} afgerond. U kunt een beoordeling achterlaten.',
    'Gonflage des pneus': 'Banden oppompen',
    Gravel: 'Gravelbike',
    'Heures de tranquillité': 'Rusturen',
    'Identité non vérifiée': 'Identiteit niet geverifieerd',
    'Il court pendant {n} jours après la fin de la garde.':
      'U hebt daarvoor {n} dagen na het einde van de oppasbeurt.',
    'Il reste un essai. Au-delà, un nouveau code est généré et {prenom} doit vous le relire.':
      'Nog één poging. Daarna wordt een nieuwe code aangemaakt, die {prenom} u opnieuw moet voorlezen.',
    'Il reste {n} essais. Au-delà, un nouveau code est généré et {prenom} doit vous le relire.':
      'Nog {n} pogingen. Daarna wordt een nieuwe code aangemaakt, die {prenom} u opnieuw moet voorlezen.',
    'Indisponible sur votre créneau · {creneau}':
      'Niet beschikbaar in uw tijdslot · {creneau}',
    'Injoignable par téléphone': 'Telefonisch onbereikbaar',
    Intérieur: 'Binnen',
    'Je comprends que cette action est définitive.':
      'Ik begrijp dat deze actie definitief is.',
    'Je préfère ne pas répondre': 'Ik antwoord liever niet',
    'Je suis en retard': 'Ik ben te laat',
    Jeu: 'Do',
    'Jusqu’à': 'Tot',
    "L'autre personne est injoignable": 'De andere persoon is onbereikbaar',
    "L'heure de récupération est dépassée.": 'Het ophaaluur is verstreken.',
    "L'état constaté au retour diffère de celui du dépôt.":
      'De staat bij het ophalen verschilt van die bij het afzetten.',
    'La date de récupération doit suivre celle du dépôt.':
      'De ophaaldatum moet na de afzetdatum liggen.',
    'La garde est gelée.': 'De oppasbeurt is opgeschort.',
    'La journée entière': 'De hele dag',
    'La personne signalée n’est pas informée de votre identité.':
      'De gemelde persoon komt niet te weten wie u bent.',
    'La remise se confirme avec le code à quatre chiffres.':
      'De overdracht wordt bevestigd met de viercijferige code.',
    "La récupération doit suivre l'arrivée.":
      'Het ophalen moet na de aankomst vallen.',
    'La suppression est définitive. Vos emplacements sont retirés, vos vélos et vos conversations effacés, vos avis anonymisés.':
      'De verwijdering is definitief. Uw plekken worden ingetrokken, uw fietsen en gesprekken gewist, uw beoordelingen geanonimiseerd.',
    'Laisser un avis': 'Beoordeling geven',
    Langue: 'Taal',
    'Le bike sitter accueille {horaires}.':
      'De bike sitter ontvangt fietsen: {horaires}.',
    'Le constat se fait au moment où le vélo change de mains.':
      'De vaststelling gebeurt op het moment dat de fiets wordt overgedragen.',
    "Le créneau demandé n'est plus disponible chez {prenom}.":
      'Het gevraagde tijdslot is niet meer beschikbaar bij {prenom}.',
    'Le délai pour laisser un avis est passé.':
      'De termijn om een beoordeling achter te laten is verstreken.',
    "Le lieu ne correspond pas à l'annonce":
      'De plek komt niet overeen met de beschrijving',
    "Le numéro de cadre n'est jamais affiché publiquement. Il sert uniquement à retrouver un vélo déclaré volé.":
      'Het framenummer wordt nooit openbaar getoond. Het dient enkel om een als gestolen gemelde fiets terug te vinden.',
    'Le vélo est endommagé': 'De fiets is beschadigd',
    "Le vélo n'a pas été remis": 'De fiets is niet overgedragen',
    "Le vélo n'a pas été restitué": 'De fiets is niet teruggegeven',
    'Les autres membres voient « {nom} ». Votre nom complet et votre e-mail ne sont visibles par personne. Votre numéro de téléphone est communiqué à l’autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.':
      'Andere leden zien ‘{nom}’. Uw volledige naam en uw e-mailadres zijn voor niemand zichtbaar. Uw telefoonnummer wordt tijdens een aanvaarde oppasbeurt gedeeld met de andere persoon, en met niemand anders: het verdwijnt zodra de oppasbeurt is afgesloten.',
    'Les avis de votre garde sont publiés.':
      'De beoordelingen van uw oppasbeurt zijn gepubliceerd.',
    "Les demandes de garde s'ouvrent {jours} jours à l'avance.":
      'Aanvragen voor een oppasbeurt openen {jours} dagen op voorhand.',
    'Les deux avis sont déposés : ils sont publiés.':
      'Beide beoordelingen zijn ingediend: ze zijn nu gepubliceerd.',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation de votre demande.":
      'De plekken worden in een benaderende zone getoond. Het exacte adres krijgt u zodra uw aanvraag is aanvaard.',
    'Les notifications liées à une garde en cours restent actives : elles portent les actions attendues de vous.':
      'Notificaties over een lopende oppasbeurt blijven actief: ze bevatten de acties die van u verwacht worden.',
    'Les notifications reçues pendant cette plage ne sonnent pas : elles vous sont présentées à la fin de la plage. Rien n’est perdu.':
      'Notificaties die u tijdens deze periode ontvangt, maken geen geluid: u krijgt ze te zien zodra de periode voorbij is. Er gaat niets verloren.',
    'Les profils des membres ne sont visibles que de ceux avec qui ils ont eu une garde. Ce réseau n’est pas un annuaire.':
      'Profielen van leden zijn alleen zichtbaar voor wie al een oppasbeurt met hen had. Dit netwerk is geen adresboek.',
    'Litige sur une garde': 'Geschil over een oppasbeurt',
    Longtail: 'Longtail',
    Lun: 'Ma',
    Mar: 'Di',
    Marque: 'Merk',
    'Membre depuis {annee}': 'Lid sinds {annee}',
    'Membre depuis {annee} · {n} gardes':
      'Lid sinds {annee} · {n} oppasbeurten',
    Mer: 'Wo',
    'Merci pour votre retour…': 'Bedankt voor uw feedback…',
    'Mes alertes': 'Mijn zoekmeldingen',
    'Mes avis': 'Mijn beoordelingen',
    'Modifications enregistrées': 'Wijzigingen opgeslagen',
    Modifier: 'Wijzigen',
    'Modifier la recherche': 'Zoekopdracht wijzigen',
    'Modifier ma recherche': 'Mijn zoekopdracht wijzigen',
    'Mon compte': 'Mijn account',
    'Mon vélo de ville': 'Mijn stadsfiets',
    Motif: 'Reden',
    'Motif : {motif}': 'Reden: {motif}',
    'Nom — seule l’initiale est affichée':
      'Achternaam — enkel de initiaal wordt getoond',
    'Non lue': 'Ongelezen',
    'Non partagé': 'Niet gedeeld',
    Notifications: 'Notificaties',
    'Notifications, {n} non lues': 'Notificaties, {n} ongelezen',
    'Nous joindre': 'Contact opnemen',
    "Nous vous écrivons dès qu'un emplacement ouvre dans ce quartier.":
      'We laten het u weten zodra er in deze wijk een plek opent.',
    'Nouveau membre': 'Nieuw lid',
    'Nouveau membre — la note s’affiche à partir de trois avis.':
      'Nieuw lid — de score verschijnt vanaf drie beoordelingen.',
    'Nouveau membre — pas encore d’avis.':
      'Nieuw lid — nog geen beoordelingen.',
    'Nouveau message de {prenom}.': 'Nieuw bericht van {prenom}.',
    'Nouvelle conversation': 'Nieuw gesprek',
    'Nouvelle demande de garde de {prenom}.':
      'Nieuwe aanvraag voor een oppasbeurt van {prenom}.',
    'Numéro de cadre (facultatif)': 'Framenummer (optioneel)',
    'Numéro de cadre enregistré': 'Framenummer geregistreerd',
    'Ouvrir le litige': 'Geschil openen',
    Paramètres: 'Instellingen',
    'Partiellement couvert': 'Gedeeltelijk overdekt',
    'Pas de fermeture': 'Geen afsluiting',
    "Pas encore assez d'avis pour une note":
      'Nog niet genoeg beoordelingen voor een score',
    'Passage étroit': 'Smalle doorgang',
    "Personne n'a répondu à la porte": 'Niemand deed de deur open',
    "Personne n'ouvre ? Appelez {prenom} : il descend peut-être.":
      'Doet niemand open? Bel {prenom}: misschien komt er al iemand naar beneden.',
    "Personne ne m'a ouvert": 'Niemand deed open',
    "Personne ne s'est présenté": 'Niemand is komen opdagen',
    'Photo de l’emplacement': 'Foto van de plek',
    'Photo du dépôt': 'Foto bij afgifte',
    'Photo {n} du constat': 'Foto {n} van de vaststelling',
    'Plain-pied': 'Gelijkvloers',
    Pliant: 'Plooifiets',
    'Plus de place ce jour-là': 'Geen plaats meer die dag',
    'Plus de place sur ce créneau': 'Geen plaats meer in dit tijdslot',
    'Plus de place sur ce créneau. Une place déjà réservée reste indisponible {marge} minutes avant et après, pour que personne ne se croise devant la porte.':
      'Geen plaats meer in dit tijdslot. Een plaats die al is vastgelegd, blijft {marge} minuten ervoor en erna onbeschikbaar, zodat niemand elkaar aan de deur tegenkomt.',
    'Plus de place à cette heure-là.': 'Geen plaats meer op dat uur.',
    'Plusieurs essais n’ont pas abouti. Par sécurité, patientez un quart d’heure.':
      'Meerdere pogingen zijn niet gelukt. Voor uw veiligheid vragen we u een kwartier te wachten.',
    Ponctualité: 'Stiptheid',
    'Pour {prenom}': 'Voor {prenom}',
    'Prise électrique à proximité': 'Stopcontact in de buurt',
    'Problème de santé': 'Gezondheidsprobleem',
    'Précisez la durée souhaitée dans votre message : elle se convient entre vous.':
      'Vermeld de gewenste duur in uw bericht: u spreekt die samen af.',
    'Précision (facultatif)': 'Toelichting (optioneel)',
    'Prénom — affiché publiquement': 'Voornaam — openbaar getoond',
    'Prévenez votre bike sitter, même si vous arrivez dans une heure.':
      'Verwittig uw bike sitter, ook als u pas over een uur aankomt.',
    'Prévenez votre bike sitter, même si vous ne pouvez pas venir tout de suite.':
      'Verwittig uw bike sitter, ook als u niet meteen kunt komen.',
    'Prévenu trop tard': 'Te laat verwittigd',
    'Publication…': 'Publiceren…',
    'Publier la réponse': 'Antwoord publiceren',
    Publié: 'Gepubliceerd',
    'Quelques marches': 'Enkele treden',
    Rampe: 'Helling',
    'Rayure sur le cadre, garde-boue tordu…':
      'Kras op het frame, verbogen spatbord…',
    'Recharge VAE': 'Opladen e-bike',
    'Refuser la demande': 'De aanvraag weigeren',
    'Refusés et annulés': 'Geweigerd en geannuleerd',
    'Rendez-vous manqué': 'Afspraak gemist',
    Respect: 'Respect',
    'Reçus ({n})': 'Ontvangen ({n})',
    Route: 'Racefiets',
    'Râtelier fixe': 'Vast fietsrek',
    Répondre: 'Antwoorden',
    'Répondre à un avis': 'Een beoordeling beantwoorden',
    Réponse: 'Antwoord',
    'Saisissez les quatre chiffres.': 'Voer de vier cijfers in.',
    Sam: 'Za',
    "Sans nouvelles, vous pouvez signaler que personne n'est venu.":
      'Hoort u niets, dan kunt u melden dat er niemand is gekomen.',
    'Serrure et clé': 'Slot en sleutel',
    'Seul le cycliste peut prévenir.': 'Alleen de fietser kan dit laten weten.',
    'Si personne ne vient, vous pouvez clore cette garde et repartir.':
      'Als niemand komt, kunt u deze oppasbeurt afsluiten en vertrekken.',
    Signaler: 'Melden',
    'Signalé à la modération.': 'Gemeld aan de moderatie.',
    Souvent: 'Vaak',
    Statistiques: 'Statistieken',
    'Suppression…': 'Verwijderen…',
    'Supprimer définitivement': 'Definitief verwijderen',
    'Supprimer l’alerte « {lieu} »': 'Zoekmelding ‘{lieu}’ verwijderen',
    'Supprimer « {nom} »': '‘{nom}’ verwijderen',
    Tandem: 'Tandem',
    Terminés: 'Afgerond',
    'Tous les jours': 'Elke dag',
    'Tout effacer': 'Alles wissen',
    'Tout lire': 'Alles gelezen',
    "Trois essais manqués. Un nouveau code vient d'être généré : demandez-le de nouveau.":
      'Drie mislukte pogingen. Er is zonet een nieuwe code aangemaakt: vraag hem opnieuw.',
    "Trois essais par code, qui expire au bout de {n} heures. Si vous ne parvenez pas à l'obtenir, écrivez-vous : la remise peut attendre, un vélo mal remis non.":
      'Drie pogingen per code, die na {n} uur vervalt. Lukt het niet, schrijf elkaar dan: de overdracht kan wachten, een slecht overgedragen fiets niet.',
    'Trois saisies erronées : un nouveau code a été généré. Relisez-le à voix haute.':
      'Drie onjuiste invoerpogingen: er is een nieuwe code aangemaakt. Lees hem hardop voor.',
    Type: 'Type',
    'Type de vélo non accepté': 'Type fiets niet aanvaard',
    'Téléphone — jamais public': 'Telefoon — nooit openbaar',
    'Un avis déposé en attente : il reste invisible tant que l’autre personne n’a pas noté, ou pendant sept jours.':
      'Eén beoordeling in afwachting: ze blijft onzichtbaar tot de andere persoon ook een score heeft gegeven, of gedurende zeven dagen.',
    'Un avis se dépose une fois la garde terminée.':
      'U kunt een beoordeling achterlaten zodra de oppasbeurt is afgelopen.',
    "Un bike sitter est près d'ici, mais complet sur ce créneau. Un autre horaire suffirait peut-être.":
      'Een bike sitter is in de buurt, maar volzet in dit tijdslot. Misschien lukt het met een ander tijdstip.',
    'Un emplacement libre sur le même créneau':
      'Eén plek vrij in hetzelfde tijdslot',
    'Un fichier JSON avec tout ce que le réseau sait de vous':
      'Een JSON-bestand met alles wat het netwerk over u weet',
    'Un litige a été ouvert sur votre garde. La modération reprend le dossier.':
      'Er is een geschil geopend over uw oppasbeurt. De moderatie neemt het dossier over.',
    'Un message peut contenir jusqu’à 2000 caractères.':
      'Een bericht kan tot 2000 tekens bevatten.',
    'Un modérateur relit l’avis avec l’historique de la garde. S’il ne respecte pas la charte, il est masqué. L’auteur ne sait pas que vous l’avez contesté.':
      'Een moderator herleest de beoordeling met de geschiedenis van de oppasbeurt. Respecteert ze het charter niet, dan wordt ze verborgen. De auteur weet niet dat u ze hebt betwist.',
    "Un modérateur reprend le dossier avec l'historique complet de la garde. La garde est gelée : ni vous ni {prenom} ne pouvez plus la faire avancer.":
      'Een moderator neemt het dossier over, met de volledige geschiedenis van de oppasbeurt. De oppasbeurt wordt bevroren: u noch {prenom} kan ze nog verder laten verlopen.',
    "Un modérateur reprend le dossier avec l'historique complet. Vous serez recontacté.":
      'Een moderator neemt het dossier over met de volledige geschiedenis. We nemen opnieuw contact met u op.',
    'Un vélo confié': 'Eén fiets toevertrouwd',
    "Un vélo est déjà accueilli à un autre emplacement tenu par la même personne sur ce créneau. Elle doit être présente, et ne peut pas l'être à deux endroits à la fois.":
      'Dezelfde persoon vangt in dit tijdslot al een fiets op op een andere plek. Die persoon moet aanwezig zijn en kan niet op twee plaatsen tegelijk zijn.',
    "Un vélo mis à l'abri ce mois-ci":
      'Eén fiets deze maand veilig ondergebracht',
    "Une autre demande pour ce vélo a été annulée : un vélo ne peut être gardé qu'à un endroit.":
      'Een andere aanvraag voor deze fiets is geannuleerd: een fiets kan maar op één plek worden opgevangen.',
    'Une autre garde a été confirmée pour ce vélo sur le même créneau.':
      'Voor deze fiets is een andere oppasbeurt in hetzelfde tijdslot bevestigd.',
    'Une autre solution': 'Een andere oplossing',
    "Une conversation s'ouvre dès qu'une demande est envoyée ou acceptée.":
      'Een gesprek start zodra een aanvraag is verstuurd of aanvaard.',
    'Une demande en attente de votre réponse':
      'Eén aanvraag wacht op uw antwoord',
    'Une demande ou une garde est encore en cours. Vous pourrez supprimer votre compte une fois qu’elle sera terminée : quelqu’un compte sur vous.':
      'Er loopt nog een aanvraag of oppasbeurt. U kunt uw account verwijderen zodra die is afgerond: iemand rekent op u.',
    'Une demande ou une garde est encore en cours. Vous pourrez supprimer votre compte une fois qu’elle sera terminée.':
      'Er loopt nog een aanvraag of een oppasbeurt. U kunt uw account verwijderen zodra die is afgerond.',
    "Une garde dure au moins une heure : le temps de se retrouver, d'ouvrir et de faire les constats.":
      'Een oppasbeurt duurt minstens een uur: de tijd om elkaar te ontmoeten, open te doen en de vaststellingen te doen.',
    'Une journée': 'Eén dag',
    'Une note de critère n’est pas valable.':
      'Een score voor een criterium is ongeldig.',
    'Une photo dépasse 8 Mo. Une photo prise au téléphone suffit largement.':
      'Een foto is groter dan 8 MB. Een foto met uw telefoon volstaat ruimschoots.',
    'Une photo n’a pas pu être lue. Essayez d’en prendre une autre.':
      'Een foto kon niet worden gelezen. Probeer er een andere te nemen.',
    'Une place libre': 'Eén vrije plaats',
    'Une place libre sur {capacite}.': 'Eén vrije plaats op {capacite}.',
    'Une réponse peut contenir jusqu’à 600 caractères.':
      'Een antwoord kan tot 600 tekens bevatten.',
    VTC: 'Hybride fiets',
    VTT: 'Mountainbike',
    'Valable {n} heures': '{n} uur geldig',
    Ven: 'Vr',
    Ville: 'Stadsfiets',
    'Voir le profil de {prenom}': 'Profiel van {prenom} bekijken',
    'Voir mon activité': 'Mijn activiteit bekijken',
    'Votre avis a reçu une réponse.':
      'Uw beoordeling heeft een antwoord gekregen.',
    'Votre avis peut contenir jusqu’à 1000 caractères.':
      'Uw beoordeling mag tot 1000 tekens bevatten.',
    "Votre avis reste invisible tant que {prenom} n'a pas déposé le sien. Publication automatique après 7 jours.":
      'Uw beoordeling blijft onzichtbaar zolang {prenom} nog geen beoordeling heeft gegeven. Na 7 dagen wordt ze automatisch gepubliceerd.',
    'Votre avis sur {prenom}': 'Uw beoordeling over {prenom}',
    'Votre bike sitter est prévenu.': 'Uw bike sitter is verwittigd.',
    'Votre compte est suspendu : vous ne pouvez pas envoyer de demande.':
      'Uw account is opgeschort: u kunt geen aanvraag versturen.',
    'Votre contestation a été transmise à la modération.':
      'Uw betwisting is doorgestuurd naar de moderatie.',
    "Votre demande a été acceptée. L'adresse exacte est maintenant visible.":
      'Uw aanvraag is aanvaard. Het exacte adres is nu zichtbaar.',
    'Votre demande a été refusée.': 'Uw aanvraag is geweigerd.',
    "Votre demande chez {prenom} n'a pas reçu de réponse à temps : elle a expiré.":
      'Uw aanvraag bij {prenom} kreeg niet op tijd een antwoord en is verlopen.',
    'Votre message': 'Uw bericht',
    'Votre mot de passe': 'Uw wachtwoord',
    'Votre nom figure sur la pièce vérifiée. Pour le modifier, écrivez-nous en expliquant pourquoi.':
      'Uw naam staat op het geverifieerde identiteitsdocument. Wilt u hem wijzigen? Schrijf ons dan en leg uit waarom.',
    'Votre réponse': 'Uw antwoord',
    'Votre réponse est publiée sous l’avis.':
      'Uw antwoord staat nu onder de beoordeling.',
    'Votre réponse s’affiche sous l’avis, sur votre profil. Une seule réponse est possible : prenez le temps de la relire.':
      'Uw antwoord verschijnt onder de beoordeling, op uw profiel. U kunt maar één keer antwoorden: neem de tijd om het na te lezen.',
    'Votre signalement a été transmis à la modération.':
      'Uw melding is doorgestuurd naar de moderatie.',
    'Votre signalement concerne {cible} et sera examiné par un modérateur, avec l’historique des gardes concernées.':
      'Uw melding over {cible} wordt door een moderator bekeken, samen met de geschiedenis van de betrokken oppasbeurten.',
    'Votre vélo est bien chez {prenom}. Bonne journée !':
      'Uw fiets is goed aangekomen bij {prenom}. Nog een fijne dag!',
    "Votre vélo n'a pas été accueilli : la batterie a été jugée inquiétante — gonflée, chaude ou odorante. Faites-la vérifier avant de redemander une garde.":
      'Uw fiets kon niet worden opgevangen: de batterij gaf reden tot zorg — opgezwollen, warm of met een vreemde geur. Laat ze nakijken voordat u opnieuw een oppasbeurt aanvraagt.',
    'Vous accueillez déjà un vélo à un autre emplacement sur ce créneau : vous ne pouvez pas être à deux endroits à la fois.':
      'In dit tijdslot vangt u al een fiets op op een andere plek. U kunt niet op twee plaatsen tegelijk zijn.',
    'Vous attendez depuis {n} minutes': 'U wacht al {n} minuten',
    "Vous avez attendu {prenom} sans le voir venir. La garde se ferme, la place se libère, et l'absence est enregistrée. Elle n'apparaît sur aucun profil public.":
      'U hebt gewacht, maar {prenom} is niet gekomen. De oppasbeurt wordt afgesloten, de plaats komt vrij en de afwezigheid wordt geregistreerd. Ze verschijnt op geen enkel openbaar profiel.',
    'Vous avez bloqué ce compte. Il ne peut plus vous contacter.':
      'U hebt dit account geblokkeerd. Het kan geen contact meer met u opnemen.',
    'Vous avez bloqué ce membre. Débloquez-le pour lui demander une garde.':
      'U hebt dit lid geblokkeerd. Deblokkeer het lid om een oppasbeurt aan te vragen.',
    'Vous avez déjà enregistré huit vélos.':
      'U hebt al acht fietsen geregistreerd.',
    'Vous avez déjà laissé un avis sur cette garde.':
      'U hebt al een beoordeling achtergelaten voor deze oppasbeurt.',
    'Vous avez déjà un signalement en cours sur cette cible.':
      'U hebt al een lopende melding over dit onderwerp.',
    'Vous ne pouvez pas vous bloquer vous-même.':
      'U kunt uzelf niet blokkeren.',
    'Vous ne pouvez pas vous signaler vous-même.': 'U kunt uzelf niet melden.',
    "Vous remettez le vélo. Lisez ce code à voix haute à {prenom} : c'est en le saisissant que {prenom} confirme la remise, et vous gardez la trace de ce que vous avez confié.":
      'U draagt de fiets over. Lees deze code luidop voor aan {prenom}: door ze in te voeren bevestigt {prenom} de overdracht, en u houdt een spoor bij van wat u hebt toevertrouwd.',
    "Vu il y a moins d'une heure": 'Minder dan een uur geleden gezien',
    'Vu il y a {n} h': '{n} u geleden gezien',
    'Vu il y a {n} j': '{n} d. geleden gezien',
    Vélo: 'Fiets',
    'Vélo de {prenom}': 'Fiets van {prenom}',
    'Vélo enregistré': 'Fiets opgeslagen',
    'Vélo refusé : batterie inquiétante':
      'Fiets geweigerd: batterij geeft reden tot zorg',
    'Vélo supprimé': 'Fiets verwijderd',
    'Vélo à confier': 'Toe te vertrouwen fiets',
    "Vérifiez votre identité avant d'envoyer une demande.":
      'Laat uw identiteit verifiëren voordat u een aanvraag verstuurt.',
    'accès contraint': 'moeilijke toegang',
    automatique: 'automatisch',
    'chaque vélo peut être attaché': 'elke fiets kan worden vastgemaakt',
    'expire dans {n} h': 'verloopt over {n} u',
    'fermé à clé': 'afgesloten',
    "moins d'1 km": 'minder dan 1 km',
    "par l'ensemble du réseau": 'door het hele netwerk',
    "point d'ancrage": 'verankeringspunt',
    'pour cette garde seulement': 'alleen voor deze oppasbeurt',
    'sous abri': 'overdekt',
    sur: 'op',
    'sur 5': 'op 5',
    'sur {capacite} · {creneau}': 'op {capacite} · {creneau}',
    '{jour} {de} → {jourFin} {a} (une nuit)':
      '{jour} {de} → {jourFin} {a} (één nacht)',
    '{jour} {de} → {jourFin} {a} ({jours} jours)':
      '{jour} {de} → {jourFin} {a} ({jours} dagen)',
    '{jour} · {de} → {a}': '{jour} · {de} → {a}',
    "{nombre} autres demandes pour ce vélo ont été annulées : un vélo ne peut être gardé qu'à un endroit.":
      '{nombre} andere aanvragen voor deze fiets zijn geannuleerd: een fiets kan maar op één plek worden opgevangen.',
    '{n} / 2 photos choisies': '{n} / 2 foto’s gekozen',
    '{n} avis déposés en attente : ils restent invisibles tant que l’autre personne n’a pas noté, ou pendant sept jours.':
      '{n} beoordelingen in afwachting: ze blijven onzichtbaar tot de andere persoon ook een score heeft gegeven, of gedurende zeven dagen.',
    "{n} bike sitters sont près d'ici, mais complets sur ce créneau. Un autre horaire suffirait peut-être.":
      '{n} bike sitters zijn in de buurt, maar volzet in dit tijdslot. Misschien lukt het met een ander tijdstip.',
    '{n} demandes en attente de votre réponse':
      '{n} aanvragen wachten op uw antwoord',
    '{n} emplacement(s) · {v} vélos accueillis':
      '{n} plek(ken) · {v} fietsen ontvangen',
    '{n} emplacements libres sur le même créneau':
      '{n} plekken vrij in hetzelfde tijdslot',
    '{n} garde': '{n} oppasbeurt',
    '{n} gardes': '{n} oppasbeurten',
    '{n} jours': '{n} dagen',
    '{n} photos · établi par {prenom}': '{n} foto’s · opgesteld door {prenom}',
    '{n} places libres': '{n} vrije plaatsen',
    '{n} places libres sur {capacite}.': '{n} vrije plaatsen op {capacite}.',
    '{n} résultats': '{n} resultaten',
    '{n} vélos': '{n} fietsen',
    '{n} vélos accueillis': '{n} fietsen ontvangen',
    '{n} vélos confiés': '{n} fietsen toevertrouwd',
    "{n} vélos mis à l'abri ce mois-ci":
      '{n} fietsen deze maand veilig ondergebracht',
    '{n} vélos · {distance}': '{n} fietsen · {distance}',
    '{n} vélos · {quartier}': '{n} fietsen · {quartier}',
    '{prenom} a annulé sa demande.': '{prenom} heeft de aanvraag geannuleerd.',
    '{prenom} a annulé à moins de deux heures : {motif}. La place est de nouveau libre sur ce créneau.':
      '{prenom} heeft minder dan twee uur op voorhand geannuleerd: {motif}. Er is weer plaats vrij in dit tijdslot.',
    '{prenom} a confirmé une garde ailleurs sur ce créneau. Sa demande chez vous est annulée, et la place est de nouveau libre.':
      '{prenom} heeft in dit tijdslot elders een oppasbeurt bevestigd. De aanvraag bij u is geannuleerd en er is weer plaats vrij.',
    "{prenom} a indiqué que le vélo n'a pas été déposé : {motif}. La garde est close.":
      '{prenom} heeft aangegeven dat de fiets niet werd afgezet: {motif}. De oppasbeurt is afgesloten.',
    '{prenom} a prévu de venir dans moins de {heures} heures. Il sera prévenu immédiatement et verra les emplacements encore libres sur son créneau. Le désistement est enregistré.':
      '{prenom} is van plan om binnen {heures} uur te komen. Er volgt meteen een bericht, met de plekken die in dat tijdslot nog vrij zijn. De terugtrekking wordt geregistreerd.',
    '{prenom} accueille au maximum : {duree}. Votre demande porte sur {jours} jours.':
      'Maximale oppasbeurt bij {prenom}: {duree}. Uw aanvraag loopt over {jours} dagen.',
    "{prenom} accueille un vélo jusqu'à {heures} heures d'affilée.":
      '{prenom} vangt een fiets op voor maximaal {heures} uur aan één stuk.',
    "{prenom} avait bloqué sa place pour vous. Il sera prévenu immédiatement, et l'annulation est enregistrée sur la garde — pas sur votre profil.":
      '{prenom} had een plaats voor u vrijgehouden. Er volgt meteen een bericht, en de annulering wordt geregistreerd bij de oppasbeurt — niet op uw profiel.',
    '{prenom} est devant chez vous avec son vélo.':
      '{prenom} staat met de fiets aan uw deur.',
    "{prenom} n'accueille pas ce type de vélo.":
      '{prenom} vangt dit type fiets niet op.',
    '{prenom} ne demande aucune contribution.':
      '{prenom} vraagt geen enkele bijdrage.',
    "{prenom} s'est désisté pour le {jour} de {de} à {a}.":
      '{prenom} heeft zich teruggetrokken voor de oppasbeurt op {jour} van {de} tot {a}.',
    "{prenom} s'est désisté à moins de deux heures : {motif}. Voici les emplacements encore libres sur votre créneau.":
      '{prenom} heeft minder dan twee uur op voorhand afgezegd: {motif}. Hier zijn de plekken die in uw tijdslot nog vrij zijn.',
    "Personne n'a ouvert à l'arrivée de {prenom} : le vélo repart avec son propriétaire, la garde est close et la place est de nouveau libre.":
      'Niemand deed open toen {prenom} aankwam: de fiets gaat mee met de eigenaar, de oppasbeurt is afgesloten en er is weer plaats vrij.',
    '{prenom} sera prévenu que vous êtes reparti avec votre vélo. La place redevient libre.':
      '{prenom} krijgt te horen dat u met uw fiets bent vertrokken. De plaats komt weer vrij.',
    '{prenom} sera prévenu. Le motif l’aide à mieux demander la prochaine fois.':
      '{prenom} wordt verwittigd. De reden helpt om een volgende aanvraag beter af te stemmen.',
    '{prenom} vient récupérer son vélo. Votre code de restitution est prêt.':
      '{prenom} komt de fiets ophalen. Uw overdrachtscode voor het ophalen staat klaar.',
    '{prenom} vous a prévenu de son retard.':
      '{prenom} heeft u laten weten later te komen.',
    "{prenom} vous prévient qu'il arrive en retard.":
      '{prenom} laat u weten wat later te komen.',
    '{prenom} vous remet le vélo et voit un code à quatre chiffres sur son écran. Demandez-le-lui et saisissez-le.':
      '{prenom} draagt de fiets aan u over en ziet een code van vier cijfers op het scherm. Vraag naar die code en voer ze in.',
    '{quartier} — adresse masquée': '{quartier} — adres verborgen',
    '{type} à {quartier}': '{type} in {quartier}',
    'À l’extérieur sous abri': 'Buiten onder een afdak',
    'À partir de': 'Vanaf',
    'À traiter': 'In afwachting',
    'Écrire à {prenom}': 'Bericht aan {prenom}',
    'Écrivez au moins une phrase.': 'Schrijf minstens één zin.',
    'Élargir la recherche': 'Zoekgebied vergroten',
    "Élargissez l'horaire ou la zone : une place se libère souvent en décalant d'une heure.":
      'Verbreed het tijdslot of de zone: door een uur te verschuiven komt er vaak een plaats vrij.',
    Électrique: 'Elektrische fiets',
    'Être prévenu': 'Hou mij op de hoogte',
    à: 'om',
    'à environ {distance} de {lieu}': 'op ongeveer {distance} van {lieu}',
    "à l'intérieur": 'binnen',
    'à {lieu}.': 'in {lieu}.',
    '★ {note} · {n} avis': '★ {note} · {n} beoordelingen',
    // --- Espace de modération -------------------------------------------------
    'Ajouter un avantage.': 'Een voordeel toevoegen.',
    'Aucun avantage n’est proposé pour le moment.': 'Er wordt momenteel geen voordeel aangeboden.',
    'Aucun dossier d’identité en attente pour le moment.': 'Momenteel geen identiteitsdossier in behandeling.',
    'Aucun litige en cours pour le moment.': 'Momenteel geen lopende geschillen.',
    'Aucun litige en cours': 'Geen lopende geschillen',
    'Aucun membre ne correspond': 'Geen enkel lid komt overeen',
    'Aucun signalement ouvert pour le moment.': 'Momenteel geen openstaande meldingen.',
    'Aucun signalement à afficher': 'Geen meldingen om te tonen',
    'Aucune pièce en attente pour le moment.': 'Momenteel geen document in behandeling.',
    'Avantage enregistré': 'Voordeel opgeslagen',
    'Avantages des partenaires.': 'Voordelen van partners.',
    'Catalogue vide': 'Catalogus is leeg',
    'Ce litige est clos.': 'Dit geschil is afgesloten.',
    'Ce que le modérateur a sous les yeux.': 'Wat de moderator voor ogen heeft.',
    'Ce que le modérateur ne voit pas': 'Wat de moderator niet ziet',
    'Ce signalement a déjà changé d’état, peut-être par une autre personne de l’équipe.':
      'Deze melding is al van status veranderd, mogelijk door een ander teamlid.',
    'Ces avantages sont offerts aux membres du réseau contre leurs points. Modifier un avantage n’affecte jamais les bons déjà remis.':
      'Deze voordelen worden aan de leden van het netwerk aangeboden in ruil voor hun punten. Een voordeel wijzigen heeft nooit invloed op reeds uitgereikte bonnen.',
    'Ces personnes ont écrit depuis le site pour proposer un emplacement. Elles seront recontactées par l’équipe pour la suite.':
      'Deze personen schreven via de website om een plek voor te stellen. Ze worden door het team gecontacteerd voor de vervolgstappen.',
    'Cette explication est transmise au cycliste et au Bike Sitter. Merci de la rédiger à leur attention.':
      'Deze uitleg wordt bezorgd aan de fietser en de Bike Sitter. Schrijf ze voor hen.',
    'Chaque pièce d’identité est examinée par une personne de l’équipe, puis supprimée dès que la décision a été enregistrée.':
      'Elk identiteitsdocument wordt door een teamlid bekeken en verwijderd zodra de beslissing is genoteerd.',
    'Chaque pièce est examinée par une personne puis supprimée.':
      'Elk document wordt door een persoon bekeken en daarna verwijderd.',
    'Compte actif': 'Actief account',
    'Constats du vélo': 'Vaststellingen over de fiets',
    'Correction enregistrée': 'Correctie opgeslagen',
    'Créneau': 'Tijdslot',
    'Dossiers d’identité en attente': 'Openstaande identiteitsdossiers',
    'Dossiers d’identité à examiner': 'Te onderzoeken identiteitsdossiers',
    'Décision enregistrée': 'Beslissing opgeslagen',
    'Déjà changé': 'Reeds gewijzigd',
    'Détail du litige': 'Detail van het geschil',
    'Détails de l’avantage': 'Details van het voordeel',
    'Encore chez le Bike Sitter': 'Nog bij de Bike Sitter',
    'Envoi d’e-mails en échec': 'Verzending van e-mails mislukt',
    'Espace de modération': 'Moderatieruimte',
    'Essayez un autre prénom, nom ou e-mail.': 'Probeer een andere voornaam, familienaam of e-mail.',
    'Examiner le litige': 'Het geschil onderzoeken',
    'Fiche de membre': 'Ledenfiche',
    'Fiche d’avantage': 'Voordelenfiche',
    'Gardes accueillies': 'Ontvangen oppasbeurten',
    'Gardes confiées': 'Toevertrouwde oppasbeurten',
    'Gardes engagées': 'Lopende oppasbeurten',
    'Gestion des litiges.': 'Beheer van de geschillen.',
    'Identité vérifiée. La pièce a été supprimée et le membre reçoit une notification.':
      'Identiteit geverifieerd. Het document is verwijderd en het lid is verwittigd.',
    'Il est déjà visible dans le catalogue des membres.':
      'Het is al zichtbaar in de catalogus van de leden.',
    'Jamais déposé': 'Nooit afgegeven',
    'La photo d’identité n’est conservée que le temps de la décision. Le motif d’un refus est envoyé au membre pour qu’il puisse renvoyer une pièce valide.':
      'De identiteitsfoto wordt alleen bewaard tot de beslissing is genomen. De reden van een weigering wordt aan het lid gestuurd zodat het een geldig document kan opsturen.',
    'La pièce est examinée avec attention. Elle sera supprimée dès que la décision aura été enregistrée.':
      'Het document wordt zorgvuldig bekeken. Het wordt verwijderd zodra de beslissing is opgeslagen.',
    'La pièce n’est visible ici que le temps de la décision. Elle est déchiffrée à la volée et n’est mise en cache nulle part.':
      'Het document is hier enkel zichtbaar tot de beslissing valt. Het wordt live ontsleuteld en nergens in cache bewaard.',
    'Le membre a été prévenu de la correction.': 'Het lid werd verwittigd van de correctie.',
    'Les alertes remontées par les membres du réseau.': 'De meldingen die de leden van het netwerk hebben opgeworpen.',
    'Les avantages proposés par les partenaires sont échangés contre les points gagnés par les membres au fil de leurs gardes.':
      'De voordelen die de partners aanbieden worden ingewisseld tegen de punten die de leden verdienen tijdens hun oppasbeurten.',
    'Les conversations': 'De gesprekken',
    'Les deux membres ont été prévenus de la décision.': 'Beide leden werden verwittigd van de beslissing.',
    'Les gardes ayant fait l’objet d’un signalement, du plus urgent au plus ancien. Chaque décision est envoyée au cycliste et au Bike Sitter.':
      'De oppasbeurten waarover een melding werd gemaakt, van dringend naar oudst. Elke beslissing wordt bezorgd aan de fietser en de Bike Sitter.',
    'Les gardes signalées, à examiner des deux côtés.': 'De gemelde oppasbeurten, langs beide kanten te bekijken.',
    'Les indicateurs collectifs, pour comprendre comment se portent les gardes du réseau. Aucune donnée individuelle n’apparaît ici.':
      'De collectieve indicatoren om te begrijpen hoe het met de oppasbeurten van het netwerk gaat. Geen enkel individueel gegeven verschijnt hier.',
    'Les pièces d’identité': 'De identiteitsdocumenten',
    'Les profils, emplacements, gardes et avis qui ont fait l’objet d’une alerte. Chaque décision reste dans l’historique du compte concerné.':
      'De profielen, plekken, oppasbeurten en beoordelingen waarover een melding werd gemaakt. Elke beslissing blijft in de geschiedenis van het betrokken account.',
    'Litige tranché': 'Geschil beslecht',
    'Litiges en cours': 'Lopende geschillen',
    'L’activité du réseau.': 'De activiteit van het netwerk.',
    'L’adresse complète': 'Het volledige adres',
    'Membre de l’équipe de modération': 'Lid van het moderatieteam',
    'Membres du réseau.': 'Leden van het netwerk.',
    'Modifier l’avantage.': 'Het voordeel wijzigen.',
    'Note de modération :': 'Moderatienota:',
    'Ouvrez la fiche d’un membre pour ajuster son statut ou corriger son solde de points. Chaque geste laisse une trace motivée.':
      'Open de fiche van een lid om de status aan te passen of het puntensaldo te corrigeren. Elke actie laat een gemotiveerd spoor achter.',
    'Ouvrir la file des litiges': 'De geschillen openen',
    'Ouvrir la file des signalements': 'De meldingen openen',
    'Ouvrir la file d’identité': 'De identiteitsdossiers openen',
    'Refus enregistré. La pièce a été supprimée et le membre a reçu le motif.':
      'Weigering opgeslagen. Het document werd verwijderd en het lid heeft de reden ontvangen.',
    'Repris par le cycliste': 'Opgehaald door de fietser',
    'Rien dans cette file pour le moment.': 'Momenteel niets in deze wachtrij.',
    'Rien à trancher pour le moment.': 'Momenteel niets te beslechten.',
    'Signalements ouverts': 'Openstaande meldingen',
    'Signalements reçus': 'Ontvangen meldingen',
    'Signalements.': 'Meldingen.',
    'Signalé par {qui}': 'Gemeld door {qui}',
    'Statut mis à jour': 'Status bijgewerkt',
    'Trois files d’attente, et rien d’autre. Un modérateur ne voit ni les adresses complètes, ni les conversations qui ne sont pas liées à un dossier ouvert.':
      'Drie wachtrijen, niets meer. Een moderator ziet noch de volledige adressen, noch de gesprekken die niet aan een lopend dossier verbonden zijn.',
    'Un ou plusieurs e-mails n’ont pas pu être envoyés. Le paramétrage du serveur d’envoi mérite d’être vérifié.':
      'Een of meer e-mails konden niet worden verstuurd. De configuratie van de verzendserver verdient een controle.',
    'Un signalement est examiné, puis classé avec une note qui reste dans l’historique. Les membres impliqués sont prévenus quand une décision est prise.':
      'Een melding wordt onderzocht en vervolgens geklasseerd met een nota die in de geschiedenis blijft. De betrokken leden worden verwittigd wanneer een beslissing valt.',
    'Une décision explique ce qui a été retenu et comment les points sont attribués. Elle est envoyée au cycliste et au Bike Sitter.':
      'Een beslissing legt uit wat werd weerhouden en hoe de punten worden toegekend. Ze wordt bezorgd aan de fietser en de Bike Sitter.',
    'Vérifications d’identité.': 'Identiteitsverificaties.',
    'Vérifier une identité.': 'Een identiteit verifiëren.',
    'batterie vérifiée': 'batterij nagekeken',
    'candidatures d’emplacement': 'kandidaturen voor een plek',
    'cible du signalement': 'doelwit van de melding',
    'comptes suspendus': 'geschorste accounts',
    'demandes ou gardes en cours': 'lopende aanvragen of oppasbeurten',
    'dossiers d’identité': 'identiteitsdossiers',
    'd’un membre, sauf sur un dossier ouvert et seulement le temps de l’instruire.':
      'van een lid, behalve op een lopend dossier en enkel gedurende het onderzoek.',
    'e-mails à renvoyer': 'te heruitzenden e-mails',
    'gardes en cours': 'lopende oppasbeurten',
    'gardes menées à terme (30 jours)': 'succesvol afgeronde oppasbeurten (30 dagen)',
    'gardes menées à terme': 'succesvol afgeronde oppasbeurten',
    'identité vérifiée': 'identiteit geverifieerd',
    'modération': 'moderatie',
    'objectif : 95 %': 'doel: 95 %',
    'objectif : chacune menée à son terme': 'doel: elk tot een goed einde brengen',
    'objectif : rester sous les 2': 'doel: onder de 2 blijven',
    'objectif : rester sous les 3': 'doel: onder de 3 blijven',
    'ouvert le {date} à {heure}': 'geopend op {date} om {heure}',
    'ouvert le {date}': 'geopend op {date}',
    'par {prenom}': 'door {prenom}',
    'qui ne sont pas liées à un dossier ouvert.': 'die niet aan een lopend dossier verbonden zijn.',
    'remarque : {remarque}': 'opmerking: {remarque}',
    'signalements ouverts': 'openstaande meldingen',
    'signalé le {date}': 'gemeld op {date}',
    'sont supprimées dès que la décision a été enregistrée.': 'worden verwijderd zodra de beslissing is opgeslagen.',
    'supprimée aujourd’hui': 'vandaag verwijderd',
    'supprimée dans {n} j': 'over {n} d verwijderd',
    'suspendu': 'geschorst',
    '{n} candidature(s) d’emplacement': '{n} kandidatuur(en) voor een plek',
    '{n} en attente': '{n} in behandeling',
    '{n} membre(s) affiché(s)': '{n} lid(leden) weergegeven',
    '{n} message(s)': '{n} bericht(en)',
    '{n} à examiner': '{n} te onderzoeken',
    '{n} à traiter': '{n} te behandelen',
    '{n} à trancher': '{n} te beslechten',
  },
  en: {
    "Continuer sans photo": "Continue without a photo",
    "Les photos sont facultatives : vous pourrez les ajouter plus tard depuis votre espace.": "Photos are optional: you can add them later from your space.",
    "L’adresse n’est plus affichée depuis l’annulation.": "The address is no longer shown since the cancellation.",
    "Demande acceptée : {prenom} reçoit votre adresse et votre numéro pour le dépôt.": "Request accepted: {prenom} now receives your address and your number for the drop-off.",
    "Modifier mon numéro": "Change my number",
    "La confirmation par SMS n’est pas encore disponible : enregistrez simplement votre numéro.": "Confirmation by text message is not available yet: simply save your number.",
    "Pas encore confirmé": "Not confirmed yet",
    "Non renseigné": "Not provided",
    "Confirmé par SMS": "Confirmed by text message",
    "Enregistré sans code SMS": "Saved without a text-message code",
    "Communiqué à l’autre personne pendant une garde acceptée, et à elle seule": "Shared with the other person during an accepted stay, and with them only",
    "Enregistré": "Saved",
    "Plus tard": "Later",
    "Demandez un code par SMS pour confirmer votre numéro.": "Request a code by text message to confirm your number.",
    "Indiquez un numéro de mobile : c’est lui qui sert à vous joindre le jour de la garde.": "Enter a mobile number: it is used to reach you on the day of the stay.",
    "Enregistrer mon numéro": "Save my number",
    "Garde close par la modération": "Stay closed by the moderators",
    "Garde annulée par la modération": "Stay cancelled by the moderators",
    "Décision : {motif}": "Decision: {motif}",
    "Un modérateur a examiné le signalement et pris une décision.": "A moderator reviewed the report and made a decision.",
    "Ces files rassemblent ce qui attend une décision. Les adresses complètes et les conversations ne s’affichent que dans un dossier ouvert, le temps de l’instruire.": "These queues gather what is waiting for a decision. Full addresses and conversations only appear in an open case, while it is being reviewed.",
    "Fiche de {prenom} (cycliste)": "{prenom}’s profile (cyclist)",
    "Fiche de {prenom} (Bike Sitter)": "{prenom}’s profile (Bike Sitter)",
    "Conversation de la garde": "Conversation about the stay",
    "Les deux membres ne se sont pas écrit.": "The two members have not written to each other.",
    "(photo jointe)": "(photo attached)",
    "Le vélo est encore chez le Bike Sitter. Si le problème est réglé, classez le litige : la garde reprend son cours. Clore la garde met fin à son suivi : vérifiez d’abord avec les deux membres que le vélo a bien été rendu.": "The bike is still with the Bike Sitter. If the problem is solved, close the dispute: the stay continues. Ending the stay stops its follow-up: first check with both members that the bike has been returned.",
    "Votre signalement est transmis à la modération. Vous recevez une notification dès qu’il a été examiné.": "Your report has been sent to the moderators. You will get a notification once it has been reviewed.",
    "Classer, la garde continue": "Close, the stay continues",
    "Le problème est réglé et le vélo reste chez le Bike Sitter : la garde reprend son cours, jusqu’à la reprise avec le code.": "The problem is solved and the bike stays with the Bike Sitter: the stay continues until pick-up with the code.",
    "Le vélo a déjà été rendu : la garde ne peut plus reprendre. Choisissez de la clore.": "The bike has already been returned: the stay cannot continue. Choose to close it.",
    "Photo": "Photo",
    "Demande acceptée : {prenom} reçoit votre adresse pour le dépôt.": "Request accepted: {prenom} now receives your address for the drop-off.",
    "Demande déclinée : {prenom} reçoit une notification.": "Request declined: {prenom} gets a notification.",
    "Voir la demande suivante": "See the next request",
    "Tout se passe chez vous.": "Everything happens at your place.",
    "Aucune demande en attente.": "No pending requests.",
    "Vous recevez une notification dès qu’un cycliste vous écrit.": "You get a notification as soon as a cyclist writes to you.",
    "Aucune garde à venir.": "No upcoming stays.",
    "Les demandes que vous acceptez apparaissent ici jusqu’à la reprise du vélo.": "The requests you accept appear here until the bike is picked up.",
    "Aucune garde terminée pour l’instant.": "No completed stays yet.",
    "Chaque garde menée à son terme s’ajoute ici, avec les points qu’elle vous a rapportés.": "Each completed stay is added here, with the points it earned you.",
    "Aucune demande refusée ou expirée.": "No declined or expired requests.",
    "Les demandes déclinées, annulées ou restées sans réponse s’afficheraient ici.": "Declined, cancelled or unanswered requests would appear here.",
    "Terminées": "Completed",
    "Jours et horaires": "Days and hours",
    "Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez qu’il est recopié tel quel, ou videz le champ : l’inscription est ouverte sans code.": "This invitation code doesn’t exist, or it has already been used. Check that it is copied exactly, or clear the field: you can sign up without a code.",
    "Les photos de votre emplacement aident les cyclistes à voir où leur vélo sera accueilli.": "Photos of your spot help cyclists see where their bike will be kept.",
    "Protéger votre adresse": "Protecting your address",
    "Cadrez l’emplacement lui-même : un numéro de rue, une plaque ou un visage n’apportent rien aux cyclistes. Les coordonnées GPS des photos sont retirées automatiquement.": "Frame the spot itself: a house number, a number plate or a face add nothing for cyclists. GPS data is removed from photos automatically.",
    "À vérifier avant de repartir": "To check before you leave",
    "Merci pour votre avis. Au plaisir d’une prochaine garde.": "Thank you for your review. Looking forward to another stay.",
    "Fermer la photo": "Close the photo",
    "Votre signalement a été examiné par la modération. Merci de nous avoir prévenus.": "Your report has been reviewed by moderation. Thank you for letting us know.",
    "Acceptez les règles du réseau et la charte de garde pour continuer.": "Accept the network rules and the care charter to continue.",
    "Votre compte est suspendu par la modération. Pour en connaître la raison ou demander sa réactivation, écrivez-nous depuis la page Contact.": "Your account has been suspended by moderation. To learn why or ask for reactivation, write to us from the Contact page.",
    "Contact": "Contact",
    "La garde est close.": "The stay is closed.",
    "Clore la garde met fin à son suivi : l’adresse reste visible deux heures, puis disparaît. Vérifiez d’abord avec les deux membres que le vélo a bien été rendu.": "Closing the stay ends its follow-up: the address stays visible for two hours, then disappears. First check with both members that the bike was returned.",
    "Il reste masqué aux membres tant qu’il n’est pas activé.": "It stays hidden from members until it is activated.",
    "Pièce non validée : {motif}": "Document not approved: {motif}",
    "Envoyer une nouvelle pièce": "Send a new document",
    "Votre identité est vérifiée. Vous pouvez envoyer des demandes et proposer un emplacement.": "Your identity is verified. You can send requests and offer a parking spot.",
    "Votre pièce d’identité n’a pas pu être validée : {motif}. Vous pouvez en envoyer une nouvelle.": "Your identity document could not be approved: {motif}. You can send a new one.",
    "Décrire votre emplacement": "Describe your parking spot",
    "La garde a lieu dans votre emplacement privé et sécurisé.": "The stay takes place in your private, secure parking spot.",
    "L’emplacement où vous accueillez les vélos doit être privé, fermé et sécurisé. Vous en précisez ici le type et les caractéristiques.": "The spot where you host bikes must be private, closed and secure. Here you specify its type and features.",
    "Votre emplacement": "Your parking spot",
    "Vous pouvez proposer un emplacement privé pour recevoir des demandes de garde.": "You can offer a private parking spot to receive requests.",
    "Photo {n}": "Photo {n}",
    "Retirer cette photo ? Elle disparaît aussitôt de votre fiche.": "Remove this photo? It disappears from your listing right away.",
    "Retirer « {titre} »": "Remove “{titre}”",
    "Chiffres du lieu": "Place figures",
    "places": "spots",
    "place": "spot",
    "vue de la fiche": "listing view",
    "Cette demande n’a pas pu être acceptée. D’autres bike sitters accueillent peut-être sur ce créneau.": "This request could not be accepted. Other bike sitters may be hosting at this time.",
    "{n} messages": "{n} messages",
    "{n} message": "{n} message",
    "{n} candidatures d’emplacement": "{n} parking spot applications",
    "{n} candidature d’emplacement": "{n} parking spot application",
    "Répondez avant l’heure du dépôt, et au plus tard sous {n} heures : sans réponse, la demande expire.": "Reply before the drop-off time, and within {n} hours at most: without a reply, the request expires.",
    "Avantages des partenaires": "Partner perks",
    "{n} échanges": "{n} conversations",
    "{n} échange": "{n} conversation",
    "{n} membres affichés": "{n} members shown",
    "{n} membre affiché": "{n} member shown",
    "Pas encore de période précédente à comparer.": "No previous period to compare with yet.",
    "garde réalisée": "stay completed",
    "{n} vélo": "{n} bike",
    "Jusqu’à {n} h dans la journée": "Up to {n} h during the day",
    "Jusqu’à {n} h d’affilée": "Up to {n} h in a row",
    "{prenom} peut répondre pendant encore {delai}. Sans réponse, la demande expire et vous recevez une notification.": "{prenom} can still reply for {delai}. Without a reply, the request expires and you will be notified.",
    "Le vélo n’a pas été récupéré": "The bike was not picked up",
    "Joignez une image.": "Attach an image.",
    "Cette photo est trop lourde (8 Mo maximum).": "This photo is too large (8 MB maximum).",
    "Les réponses arrivent quand chacun est disponible.": "Replies come when each of you is available.",
    "Photo envoyée": "Photo sent",
    "Joindre une photo": "Attach a photo",
    "Retirer la photo": "Remove the photo",
    "{n} photo": "{n} photo",
    "{prenom} vous remet le vélo et voit un code à six chiffres sur son écran. Demandez-le-lui et saisissez-le.": "{prenom} is handing you the bike and sees a six-digit code on their screen. Ask for it and enter it.",
    "La remise se confirme avec le code à six chiffres.": "The handover is confirmed with the six-digit code.",
    "Saisissez les six chiffres.": "Enter the six digits.",
    "Cette conversation ne reçoit plus de messages.": "This conversation no longer accepts messages.",
    "Vous avez écrit beaucoup de messages en peu de temps. Vous pourrez continuer dans un moment.": "You have written many messages in a short time. You can continue in a moment.",
    "Capacité atteinte sur ce créneau.": "Capacity reached for this time slot.",
    "Cette demande a expiré : elle n’a pas reçu de réponse à temps.": "This request has expired: it did not receive a reply in time.",
    "Vous pourrez signaler votre arrivée une demi-heure avant l’heure du dépôt.": "You can report your arrival from half an hour before the drop-off time.",
    "Plusieurs codes incorrects ont été saisis pour cette remise. Par sécurité, la saisie reprendra demain ; en attendant, vous pouvez signaler un problème depuis la garde.": "Several incorrect codes have been entered for this handover. For safety, entry will resume tomorrow; meanwhile, you can report a problem from the stay.",
    "Cet emplacement n'est pas disponible.": "This place is not available.",
    "Vous avez déjà une demande en attente pour cet emplacement : {prenom} vous répondra.": "You already have a pending request for this place: {prenom} will reply to you.",
    "Vous avez envoyé beaucoup de demandes aujourd’hui. Vous pourrez en envoyer d’autres demain.": "You have sent many requests today. You can send more tomorrow.",
    "Un signalement est en cours d’examen par la modération. Vous pourrez supprimer votre compte une fois qu’il sera traité.": "A report is being reviewed by moderation. You can delete your account once it has been handled.",
    '{n} emplacements': '{n} places',
    'Un emplacement': 'One place',
    'Un vélo accueilli': 'One bike welcomed',
    'Signaler ce membre': 'Report this member',
    'Pas encore d’avis publié.': 'No review published yet.',
    Téléphone: 'Phone',
    'Confirmé par SMS · communiqué à l’autre personne pendant une garde acceptée, et à elle seule':
      'Confirmed by text message · shared with the other person during an accepted stay, and with them only',
    Identité: 'Identity',
    Vérifié: 'Verified',
    'En cours d’examen': 'Under review',
    Vérifier: 'Verify',
    '1 jour': '1 day',
    'A prévenu de son retard': 'Said they would be late',
    'Absence imprévue': 'Unexpected absence',
    'Accueille occasionnellement': 'Looks after bikes occasionally',
    'Accès : {acces}': 'Access: {acces}',
    Actuelle: 'Current',
    'Afficher le code de restitution': 'Show the return code',
    'Afficher mon code de remise': 'Show my handover code',
    'Ajouter deux photos du vélo': 'Add two photos of the bike',
    "Ajoutez d'abord le vélo que vous souhaitez confier : le bike sitter saura ce qu'il accueille.":
      'First add the bike you’d like to leave: that way the bike sitter knows what to expect.',
    'Alerte créée': 'Alert created',
    "Alerte créée pour {lieu}. Vous recevez une notification dès qu'un emplacement ouvre.":
      'Alert created for {lieu}. We’ll let you know as soon as a place opens up.',
    // Notifications déjà enregistrées en base avant la reformulation du texte.
    "Alerte créée pour {lieu}. Vous serez prévenu dès qu'un emplacement ouvre.":
      'Alert created for {lieu}. We’ll let you know as soon as a place opens up.',
    'Ancien membre': 'Former member',
    'Appeler {prenom}': 'Call {prenom}',
    'Arrivée dépassée de {n} min': 'Arrival {n} min overdue',
    "Attendez au moins trente minutes après l'heure convenue.":
      'Please wait at least thirty minutes after the agreed time.',
    "Attendez vingt minutes après votre arrivée, et appelez d'abord votre bike sitter.":
      'Please wait twenty minutes after arriving, and call your bike sitter first.',
    'Au dépôt': 'At drop-off',
    'Au-delà d’une semaine, à convenir': 'Over a week, to be agreed',
    'Aucun autre emplacement libre sur ce créneau.':
      'No other place is free in this time slot.',
    'Aucun avis donné.': 'No reviews given yet.',
    "Aucun code n'est encore affiché : demandez à l'autre personne d'ouvrir l'écran de remise.":
      'No code is showing yet. Ask the other person to open the handover screen.',
    'Aucun créneau libre ce jour-là. Essayez une autre date.':
      'No free time slot that day. Try another date.',
    'Aucun emplacement disponible sur ce créneau':
      'No place available for this time slot',
    'Aucun emplacement sur ce créneau.': 'No places for this time slot.',
    "Aucun message pour l'instant.": 'No messages yet.',
    'Aucun vélo enregistré.': 'No bikes registered yet.',
    'Aucune conversation.': 'No conversations.',
    "Aucune garde pour l'instant.": 'No stays yet.',
    'Aucune notification.': 'No notifications.',
    'Avis contesté': 'Review challenged',
    'Avis enregistré. Il sera publié dès que {prenom} aura laissé le sien.':
      'Review saved. It will be published as soon as {prenom} has left theirs.',
    'Batterie jugée dangereuse au moment du dépôt.':
      'Battery judged unsafe at drop-off.',
    Bleu: 'Blue',
    'Bonjour {prenom}, je passe la journée en centre-ville…':
      'Hello {prenom}, I’m spending the day in the city centre…',
    "C'est à l'autre personne de saisir ce code.":
      'This code is for the other person to enter.',
    'Capacité atteinte sur ce créneau : {capacite} vélos.':
      'This time slot is full: {capacite} bikes.',
    'Ce code a expiré.': 'This code has expired.',
    'Ce code a expiré. Demandez-en un nouveau.':
      'This code has expired. Ask for a new one.',
    "Ce code n'est pas le vôtre.": 'This code isn’t for you.',
    'Ce constat est déjà enregistré et ne peut plus être modifié.':
      'This check has already been saved and can no longer be changed.',
    'Ce constat revient à l’autre personne.':
      'This check is for the other person to do.',
    'Ce créneau est déjà passé : choisissez une heure à venir.':
      'This time slot has already passed. Please choose a time still to come.',
    'Ce lieu ne nous dit rien.': 'We don’t recognise this location.',
    "Ce membre n'existe pas.": 'This member does not exist.',
    'Ce mot de passe ne correspond pas.': 'This password doesn’t match.',
    'Ce profil n’est pas public.': 'This profile isn’t public.',
    'Ce prénom figure sur la pièce que nous avons vérifiée. Pour le changer, écrivez-nous en expliquant pourquoi.':
      'This first name appears on the ID we checked. To change it, write to us and explain why.',
    'Ce qui est conservé malgré la suppression : les gardes passées sans votre nom, et les traces de modération, pour des raisons légales.':
      'What is kept after deletion: past stays without your name, and moderation records, for legal reasons.',
    'Ce qui ne va pas': 'What is wrong',
    "Ce qui s'est bien passé, ce qui pourrait aider le prochain cycliste…":
      'What went well, what could help the next cyclist…',
    'Ce qui s’est passé…': 'What happened…',
    "Ce signalement n'a pas de cible.": 'This report isn’t linked to anything.',
    "Ce vélo est déjà confié chez {prenom} sur ce créneau. Annulez cette garde avant d'en demander une autre.":
      'This bike is already with {prenom} for this time slot. Cancel that stay before requesting another one.',
    'Ce vélo est engagé dans une garde en cours.':
      'This bike is part of an ongoing stay.',
    "Ce vélo n'est pas le vôtre.": 'This bike is not yours.',
    'Cet avis décrit une autre garde…':
      'This review describes a different stay…',
    'Cet avis est déjà signalé.': 'This review has already been reported.',
    'Cet emplacement est en pause. Republiez-le avant d’accepter.':
      'This place is paused. Publish it again before accepting.',
    "Cet emplacement n'est plus disponible.":
      'This place is no longer available.',
    'Cet emplacement se libère à partir de {heure}.':
      'This place becomes free from {heure}.',
    "Cette action n'a pas pu aboutir : la garde a peut-être changé entre-temps.":
      'This action couldn’t be completed: the stay may have changed in the meantime.',
    "Cette action n'est plus possible : la garde a changé entre-temps.":
      'This action is no longer possible: the stay has changed in the meantime.',
    'Cette conversation ne vous concerne pas.':
      'This conversation does not concern you.',
    'Cette garde est close : la conversation ne reçoit plus de messages.':
      'This stay is closed: the conversation no longer accepts messages.',
    "Cette réponse n'est pas possible.": 'This reply is not possible.',
    'Changement de programme': 'Change of plans',
    "Changer d'horaire": 'Change time',
    'Changer de créneau': 'Change time slot',
    "Changez d'horaire ou élargissez la zone.":
      'Try another time or widen the area.',
    'Chaque filtre écarte des emplacements. Sans filtre, vous voyez tout ce qui est libre sur votre créneau.':
      'Each filter leaves out some places. Without filters, you see everything that is free in your time slot.',
    'Chercher un emplacement': 'Search for a place',
    'Cherchez un emplacement pour commencer.':
      'Search for a place to get started.',
    'Chez {prenom}': 'At {prenom}’s',
    'Choisissez la date du dépôt.': 'Choose the drop-off date.',
    'Choisissez le type de votre vélo.': 'Choose the type of your bike.',
    'Choisissez le vélo concerné.': 'Choose which bike this is for.',
    'Choisissez un motif.': 'Choose a reason.',
    'Clore la garde': 'Close the stay',
    'Cochez la case pour confirmer la suppression.':
      'Tick the box to confirm the deletion.',
    'Code incorrect. Il reste un essai.':
      'Incorrect code. You have one attempt left.',
    'Code incorrect. Il reste {n} essais.':
      'Incorrect code. You have {n} attempts left.',
    "Comment ça s'est passé ?": 'How did it go?',
    'Comparez avec le dépôt': 'Compare with the drop-off',
    'Complet sur ce créneau': 'Full for this time slot',
    'Complet toute la journée': 'Full all day',
    'Complets sur ce créneau ({n})': 'Full for this time slot ({n})',
    'Compte suspendu : action impossible.':
      'Your account is suspended: this action isn’t possible.',
    "Confirmer l'absence": 'Confirm the absence',
    "Confirmer l'annulation": 'Confirm the cancellation',
    'Confirmer le refus': 'Confirm the refusal',
    'Constat enregistré': 'Check saved',
    Constaté: 'Checked',
    'Contactez le propriétaire du vélo, et gardez-le chez vous sans le sortir.':
      'Contact the bike’s owner, and keep it at your home without taking it out.',
    'Créer une alerte': 'Create an alert',
    'Créneau hors des disponibilités du bike sitter : {horaires}.':
      'This time slot is outside the bike sitter’s availability: {horaires}.',
    'Créneau qui ne me convient pas': 'The time slot doesn’t suit me',
    'Demande envoyée à {prenom}.': 'Request sent to {prenom}.',
    'Dernière garde il y a moins d’une heure':
      'Last stay less than an hour ago',
    'Dernière garde il y a {n} h': 'Last stay {n} h ago',
    'Dernière garde il y a {n} j': 'Last stay {n} d ago',
    'Dernière garde il y a {n} mois': 'Last stay {n} mo ago',
    'Dernière garde il y a {n} sem.': 'Last stay {n} wk ago',
    "Deux photos et un état constaté. Sans lui, un désaccord sur l'état du vélo oppose deux paroles.":
      'Two photos and a recorded condition. Without it, a disagreement about the bike’s condition comes down to one word against another.',
    Dim: 'Sun',
    'Disponible sur votre créneau · {creneau}':
      'Available for your time slot · {creneau}',
    'Donnez un nom à votre vélo.': 'Give your bike a name.',
    'Donnés ({n})': 'Given ({n})',
    Débloquer: 'Unblock',
    'Décrivez le défaut': 'Describe the defect',
    'Décrivez le défaut constaté.': 'Describe the defect you noticed.',
    Défaut: 'Defect',
    'E-mail — jamais public': 'Email — never public',
    Emplacement: 'Place',
    'En attente de publication': 'Awaiting publication',
    'En attente de {prenom}.': 'Waiting for {prenom}.',
    'En cours': 'In progress',
    'En ligne': 'Online',
    'En pause': 'Paused',
    Enfant: 'Children’s',
    Enregistrer: 'Save',
    'Entièrement à l’intérieur': 'Fully indoors',
    'Envoyer le signalement': 'Send the report',
    'Envoyer à la modération': 'Send to moderation',
    'Envoyez des photos (JPEG, PNG ou WebP).':
      'Please send photos (JPEG, PNG or WebP).',
    'Erreur dans ma demande': 'Mistake in my request',
    'Erreur de ma part': 'My mistake',
    Escalier: 'Stairs',
    'Essayer cet horaire': 'Try this time',
    'Essayez le nom d’un quartier, d’une place ou d’une commune de Bruxelles.':
      'Try the name of a neighbourhood, square or municipality in Brussels.',
    'Fermé : {jours}': 'Closed: {jours}',
    'Fermé à clé': 'Locked',
    Filtres: 'Filters',
    Garde: 'Stay',
    'Garde annulée par {prenom} : {motif}':
      'Stay cancelled by {prenom}: {motif}',
    'Garde confirmée ailleurs pour le même vélo':
      'Stay confirmed elsewhere for the same bike',
    'Garde de {jours} jours : seuls les bike sitters qui acceptent cette durée seront proposés.':
      'A stay of {jours} days: only bike sitters who accept this length will be suggested.',
    'Garde de {jours} jours. Votre vélo reste chez {prenom} pendant {nuits} nuit(s).':
      'Stay of {jours} days. Your bike remains with {prenom} for {nuits} night(s).',
    'Garde terminée avec {prenom}. Vous pouvez laisser un avis.':
      'Your stay with {prenom} is complete. You can leave a review.',
    'Gonflage des pneus': 'Tyre inflation',
    Gravel: 'Gravel',
    'Heures de tranquillité': 'Quiet hours',
    'Identité non vérifiée': 'Identity not verified',
    'Il court pendant {n} jours après la fin de la garde.':
      'You have {n} days after the end of the stay to do so.',
    'Il reste un essai. Au-delà, un nouveau code est généré et {prenom} doit vous le relire.':
      'One attempt left. After that, a new code is generated and {prenom} will need to read it out to you again.',
    'Il reste {n} essais. Au-delà, un nouveau code est généré et {prenom} doit vous le relire.':
      '{n} attempts left. After that, a new code is generated and {prenom} will need to read it out to you again.',
    'Indisponible sur votre créneau · {creneau}':
      'Unavailable for your time slot · {creneau}',
    'Injoignable par téléphone': 'Unreachable by phone',
    Intérieur: 'Indoors',
    'Je comprends que cette action est définitive.':
      'I understand that this action is permanent.',
    'Je préfère ne pas répondre': 'I’d rather not say',
    'Je suis en retard': 'I’m running late',
    Jeu: 'Thu',
    'Jusqu’à': 'Until',
    "L'autre personne est injoignable": 'The other person can’t be reached',
    "L'heure de récupération est dépassée.": 'The pick-up time has passed.',
    "L'état constaté au retour diffère de celui du dépôt.":
      'The condition noted at pick-up differs from the one noted at drop-off.',
    'La date de récupération doit suivre celle du dépôt.':
      'The pick-up date must come after the drop-off date.',
    'La garde est gelée.': 'The stay is on hold.',
    'La journée entière': 'The whole day',
    'La personne signalée n’est pas informée de votre identité.':
      'The person reported is not told who you are.',
    'La remise se confirme avec le code à quatre chiffres.':
      'The handover is confirmed with the four-digit code.',
    "La récupération doit suivre l'arrivée.":
      'Pick-up must come after arrival.',
    'La suppression est définitive. Vos emplacements sont retirés, vos vélos et vos conversations effacés, vos avis anonymisés.':
      'Deletion is permanent. Your places are withdrawn, your bikes and conversations erased, your reviews anonymised.',
    'Laisser un avis': 'Leave a review',
    Langue: 'Language',
    'Le bike sitter accueille {horaires}.':
      'The bike sitter welcomes bikes: {horaires}.',
    'Le constat se fait au moment où le vélo change de mains.':
      'The check takes place when the bike changes hands.',
    "Le créneau demandé n'est plus disponible chez {prenom}.":
      'The requested time slot is no longer available with {prenom}.',
    'Le délai pour laisser un avis est passé.':
      'The time for leaving a review has passed.',
    "Le lieu ne correspond pas à l'annonce":
      'The place doesn’t match its description',
    "Le numéro de cadre n'est jamais affiché publiquement. Il sert uniquement à retrouver un vélo déclaré volé.":
      'The frame number is never shown publicly. It is only used to trace a bike reported stolen.',
    'Le vélo est endommagé': 'The bike is damaged',
    "Le vélo n'a pas été remis": 'The bike was not handed over',
    "Le vélo n'a pas été restitué": 'The bike was not returned',
    'Les autres membres voient « {nom} ». Votre nom complet et votre e-mail ne sont visibles par personne. Votre numéro de téléphone est communiqué à l’autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.':
      'Other members see ‘{nom}’. Your full name and email address are not visible to anyone. Your phone number is shared with the other person during an accepted stay, and with them alone: it disappears once the stay is closed.',
    'Les avis de votre garde sont publiés.':
      'The reviews of your stay have been published.',
    "Les demandes de garde s'ouvrent {jours} jours à l'avance.":
      'Stay requests open {jours} days in advance.',
    'Les deux avis sont déposés : ils sont publiés.':
      'Both reviews are in: they are now published.',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation de votre demande.":
      'Places are shown within an approximate area. The exact address is shared once your request has been accepted.',
    'Les notifications liées à une garde en cours restent actives : elles portent les actions attendues de vous.':
      'Notifications about an ongoing stay remain active: they carry the actions expected of you.',
    'Les notifications reçues pendant cette plage ne sonnent pas : elles vous sont présentées à la fin de la plage. Rien n’est perdu.':
      'Notifications received during this period stay silent: they are shown to you when the period ends. Nothing is lost.',
    'Les profils des membres ne sont visibles que de ceux avec qui ils ont eu une garde. Ce réseau n’est pas un annuaire.':
      'Members’ profiles are only visible to those who have shared a stay with them. This network isn’t a directory.',
    'Litige sur une garde': 'Dispute about a stay',
    Longtail: 'Longtail',
    Lun: 'Mon',
    Mar: 'Tue',
    Marque: 'Brand',
    'Membre depuis {annee}': 'Member since {annee}',
    'Membre depuis {annee} · {n} gardes': 'Member since {annee} · {n} stays',
    Mer: 'Wed',
    'Merci pour votre retour…': 'Thank you for your feedback…',
    'Mes alertes': 'My alerts',
    'Mes avis': 'My reviews',
    'Modifications enregistrées': 'Changes saved',
    Modifier: 'Edit',
    'Modifier la recherche': 'Edit search',
    'Modifier ma recherche': 'Change my search',
    'Mon compte': 'My account',
    'Mon vélo de ville': 'My city bike',
    Motif: 'Reason',
    'Motif : {motif}': 'Reason: {motif}',
    'Nom — seule l’initiale est affichée':
      'Last name — only the initial is shown',
    'Non lue': 'Unread',
    'Non partagé': 'Not shared',
    Notifications: 'Notifications',
    'Notifications, {n} non lues': 'Notifications, {n} unread',
    'Nous joindre': 'Contact us',
    "Nous vous écrivons dès qu'un emplacement ouvre dans ce quartier.":
      'We’ll write to you as soon as a place opens in this neighbourhood.',
    'Nouveau membre': 'New member',
    'Nouveau membre — la note s’affiche à partir de trois avis.':
      'New member — the score appears from three reviews onwards.',
    'Nouveau membre — pas encore d’avis.': 'New member — no reviews yet.',
    'Nouveau message de {prenom}.': 'New message from {prenom}.',
    'Nouvelle conversation': 'New conversation',
    'Nouvelle demande de garde de {prenom}.': 'New stay request from {prenom}.',
    'Numéro de cadre (facultatif)': 'Frame number (optional)',
    'Numéro de cadre enregistré': 'Frame number registered',
    'Ouvrir le litige': 'Open a dispute',
    Paramètres: 'Settings',
    'Partiellement couvert': 'Partly covered',
    'Pas de fermeture': 'No lock',
    "Pas encore assez d'avis pour une note":
      'Not enough reviews yet for a rating',
    'Passage étroit': 'Narrow passage',
    "Personne n'a répondu à la porte": 'Nobody answered the door',
    "Personne n'ouvre ? Appelez {prenom} : il descend peut-être.":
      'No one answering? Call {prenom}: they may be on their way down.',
    "Personne ne m'a ouvert": 'Nobody opened the door',
    "Personne ne s'est présenté": 'Nobody showed up',
    'Photo de l’emplacement': 'Photo of the place',
    'Photo du dépôt': 'Drop-off photo',
    'Photo {n} du constat': 'Check photo {n}',
    'Plain-pied': 'Ground level',
    Pliant: 'Folding',
    'Plus de place ce jour-là': 'No room left that day',
    'Plus de place sur ce créneau': 'No room left in this time slot',
    'Plus de place sur ce créneau. Une place déjà réservée reste indisponible {marge} minutes avant et après, pour que personne ne se croise devant la porte.':
      'No room left in this time slot. A spot that is already taken stays unavailable for {marge} minutes before and after, so that nobody crosses paths at the door.',
    'Plus de place à cette heure-là.': 'No spot left at that time.',
    'Plusieurs essais n’ont pas abouti. Par sécurité, patientez un quart d’heure.':
      'Several attempts were unsuccessful. For your security, please wait a quarter of an hour.',
    Ponctualité: 'Punctuality',
    'Pour {prenom}': 'For {prenom}',
    'Prise électrique à proximité': 'Power socket nearby',
    'Problème de santé': 'Health issue',
    'Précisez la durée souhaitée dans votre message : elle se convient entre vous.':
      'Mention how long you need in your message: you agree on it together.',
    'Précision (facultatif)': 'Details (optional)',
    'Prénom — affiché publiquement': 'First name — shown publicly',
    'Prévenez votre bike sitter, même si vous arrivez dans une heure.':
      'Let your bike sitter know, even if you’ll arrive in an hour.',
    'Prévenez votre bike sitter, même si vous ne pouvez pas venir tout de suite.':
      'Let your bike sitter know, even if you can’t come right away.',
    'Prévenu trop tard': 'Notified too late',
    'Publication…': 'Publishing…',
    'Publier la réponse': 'Publish the reply',
    Publié: 'Published',
    'Quelques marches': 'A few steps',
    Rampe: 'Ramp',
    'Rayure sur le cadre, garde-boue tordu…':
      'Scratch on the frame, bent mudguard…',
    'Recharge VAE': 'E-bike charging',
    'Refuser la demande': 'Decline the request',
    'Refusés et annulés': 'Declined and cancelled',
    'Rendez-vous manqué': 'Missed appointment',
    Respect: 'Respect',
    'Reçus ({n})': 'Received ({n})',
    Route: 'Road',
    'Râtelier fixe': 'Fixed bike rack',
    Répondre: 'Reply',
    'Répondre à un avis': 'Reply to a review',
    Réponse: 'Reply',
    'Saisissez les quatre chiffres.': 'Enter all four digits.',
    Sam: 'Sat',
    "Sans nouvelles, vous pouvez signaler que personne n'est venu.":
      'If you hear nothing, you can report that no one came.',
    'Serrure et clé': 'Lock and key',
    'Seul le cycliste peut prévenir.': 'Only the cyclist can send this notice.',
    'Si personne ne vient, vous pouvez clore cette garde et repartir.':
      'If no one comes, you can close this stay and leave.',
    Signaler: 'Report',
    'Signalé à la modération.': 'Reported to moderation.',
    Souvent: 'Often',
    Statistiques: 'Statistics',
    'Suppression…': 'Deleting…',
    'Supprimer définitivement': 'Delete permanently',
    'Supprimer l’alerte « {lieu} »': 'Delete the alert ‘{lieu}’',
    'Supprimer « {nom} »': 'Delete ‘{nom}’',
    Tandem: 'Tandem',
    Terminés: 'Completed',
    'Tous les jours': 'Every day',
    'Tout effacer': 'Clear all',
    'Tout lire': 'Mark all read',
    "Trois essais manqués. Un nouveau code vient d'être généré : demandez-le de nouveau.":
      'Three unsuccessful attempts. A new code has just been generated: ask for it again.',
    "Trois essais par code, qui expire au bout de {n} heures. Si vous ne parvenez pas à l'obtenir, écrivez-vous : la remise peut attendre, un vélo mal remis non.":
      'Three attempts per code, which expires after {n} hours. If you cannot get it, write to each other: the handover can wait, a badly handed-over bike cannot.',
    'Trois saisies erronées : un nouveau code a été généré. Relisez-le à voix haute.':
      'Three incorrect entries: a new code has been generated. Read it out loud.',
    Type: 'Type',
    'Type de vélo non accepté': 'Bike type not accepted',
    'Téléphone — jamais public': 'Phone — never public',
    'Un avis déposé en attente : il reste invisible tant que l’autre personne n’a pas noté, ou pendant sept jours.':
      'One review waiting: it stays hidden until the other person has given their rating too, or for seven days.',
    'Un avis se dépose une fois la garde terminée.':
      'You can leave a review once the stay has ended.',
    "Un bike sitter est près d'ici, mais complet sur ce créneau. Un autre horaire suffirait peut-être.":
      'A bike sitter is nearby, but full for this time slot. Another time might work.',
    'Un emplacement libre sur le même créneau':
      'One place free in the same time slot',
    'Un fichier JSON avec tout ce que le réseau sait de vous':
      'A JSON file with everything the network knows about you',
    'Un litige a été ouvert sur votre garde. La modération reprend le dossier.':
      'A dispute has been opened about your stay. Moderation is taking over the case.',
    'Un message peut contenir jusqu’à 2000 caractères.':
      'A message can contain up to 2000 characters.',
    'Un modérateur relit l’avis avec l’historique de la garde. S’il ne respecte pas la charte, il est masqué. L’auteur ne sait pas que vous l’avez contesté.':
      'A moderator rereads the review alongside the history of the stay. If it does not respect the charter, it is hidden. The author does not know that you challenged it.',
    "Un modérateur reprend le dossier avec l'historique complet de la garde. La garde est gelée : ni vous ni {prenom} ne pouvez plus la faire avancer.":
      'A moderator takes over the case, with the full history of the stay. The stay is frozen: neither you nor {prenom} can move it forward any more.',
    "Un modérateur reprend le dossier avec l'historique complet. Vous serez recontacté.":
      'A moderator is taking over the case with the full history. We’ll be in touch with you.',
    'Un vélo confié': 'One bike entrusted',
    "Un vélo est déjà accueilli à un autre emplacement tenu par la même personne sur ce créneau. Elle doit être présente, et ne peut pas l'être à deux endroits à la fois.":
      'The same person is already looking after a bike at another place during this time slot. They need to be present, and can’t be in two locations at once.',
    "Un vélo mis à l'abri ce mois-ci": 'One bike kept safe this month',
    "Une autre demande pour ce vélo a été annulée : un vélo ne peut être gardé qu'à un endroit.":
      'Another request for this bike has been cancelled: a bike can only be looked after in one place.',
    'Une autre garde a été confirmée pour ce vélo sur le même créneau.':
      'Another stay has been confirmed for this bike in the same time slot.',
    'Une autre solution': 'Another option',
    "Une conversation s'ouvre dès qu'une demande est envoyée ou acceptée.":
      'A conversation opens as soon as a request is sent or accepted.',
    'Une demande en attente de votre réponse':
      'One request awaiting your reply',
    'Une demande ou une garde est encore en cours. Vous pourrez supprimer votre compte une fois qu’elle sera terminée : quelqu’un compte sur vous.':
      'A request or stay is still in progress. You can delete your account once it is over: someone is counting on you.',
    'Une demande ou une garde est encore en cours. Vous pourrez supprimer votre compte une fois qu’elle sera terminée.':
      'A request or stay is still in progress. You can delete your account once it has finished.',
    "Une garde dure au moins une heure : le temps de se retrouver, d'ouvrir et de faire les constats.":
      'A stay lasts at least one hour: time to meet, open up and carry out the checks.',
    'Une journée': 'One day',
    'Une note de critère n’est pas valable.':
      'One of the criterion ratings is not valid.',
    'Une photo dépasse 8 Mo. Une photo prise au téléphone suffit largement.':
      'A photo is larger than 8 MB. A photo taken with your phone is more than enough.',
    'Une photo n’a pas pu être lue. Essayez d’en prendre une autre.':
      'A photo couldn’t be read. Try taking another one.',
    'Une place libre': 'One free spot',
    'Une place libre sur {capacite}.': 'One free spot out of {capacite}.',
    'Une réponse peut contenir jusqu’à 600 caractères.':
      'A reply can contain up to 600 characters.',
    VTC: 'Hybrid',
    VTT: 'Mountain',
    'Valable {n} heures': 'Valid for {n} hours',
    Ven: 'Fri',
    Ville: 'City',
    'Voir le profil de {prenom}': 'View {prenom}’s profile',
    'Voir mon activité': 'View my activity',
    'Votre avis a reçu une réponse.': 'Your review has received a reply.',
    'Votre avis peut contenir jusqu’à 1000 caractères.':
      'Your review can be up to 1,000 characters long.',
    "Votre avis reste invisible tant que {prenom} n'a pas déposé le sien. Publication automatique après 7 jours.":
      'Your review stays hidden until {prenom} has left theirs. It is published automatically after 7 days.',
    'Votre avis sur {prenom}': 'Your review of {prenom}',
    'Votre bike sitter est prévenu.': 'Your bike sitter has been notified.',
    'Votre compte est suspendu : vous ne pouvez pas envoyer de demande.':
      'Your account is suspended, so you can’t send a request.',
    'Votre contestation a été transmise à la modération.':
      'Your challenge has been passed on to moderation.',
    "Votre demande a été acceptée. L'adresse exacte est maintenant visible.":
      'Your request has been accepted. The exact address is now visible.',
    'Votre demande a été refusée.': 'Your request has been declined.',
    "Votre demande chez {prenom} n'a pas reçu de réponse à temps : elle a expiré.":
      'Your request to {prenom} didn’t receive a reply in time, so it has expired.',
    'Votre message': 'Your message',
    'Votre mot de passe': 'Your password',
    'Votre nom figure sur la pièce vérifiée. Pour le modifier, écrivez-nous en expliquant pourquoi.':
      'Your name appears on the verified ID document. To change it, write to us and explain why.',
    'Votre réponse': 'Your reply',
    'Votre réponse est publiée sous l’avis.':
      'Your reply is now published below the review.',
    'Votre réponse s’affiche sous l’avis, sur votre profil. Une seule réponse est possible : prenez le temps de la relire.':
      'Your reply appears below the review, on your profile. You can reply only once: take the time to read it over.',
    'Votre signalement a été transmis à la modération.':
      'Your report has been passed on to moderation.',
    'Votre signalement concerne {cible} et sera examiné par un modérateur, avec l’historique des gardes concernées.':
      'Your report about {cible} will be reviewed by a moderator, together with the history of the stays involved.',
    'Votre vélo est bien chez {prenom}. Bonne journée !':
      'Your bike is now safely with {prenom}. Have a lovely day!',
    "Votre vélo n'a pas été accueilli : la batterie a été jugée inquiétante — gonflée, chaude ou odorante. Faites-la vérifier avant de redemander une garde.":
      'Your bike could not be taken in: the battery gave cause for concern — swollen, hot or giving off a smell. Please have it checked before requesting another stay.',
    'Vous accueillez déjà un vélo à un autre emplacement sur ce créneau : vous ne pouvez pas être à deux endroits à la fois.':
      'You’re already looking after a bike at another place during this time slot. You can’t be in two places at once.',
    'Vous attendez depuis {n} minutes': 'You’ve been waiting for {n} minutes',
    "Vous avez attendu {prenom} sans le voir venir. La garde se ferme, la place se libère, et l'absence est enregistrée. Elle n'apparaît sur aucun profil public.":
      'You waited, but {prenom} did not come. The stay is closed, the place becomes free, and the absence is recorded. It does not appear on any public profile.',
    'Vous avez bloqué ce compte. Il ne peut plus vous contacter.':
      'You’ve blocked this account. It can no longer contact you.',
    'Vous avez bloqué ce membre. Débloquez-le pour lui demander une garde.':
      'You have blocked this member. Unblock them to request a stay.',
    'Vous avez déjà enregistré huit vélos.':
      'You have already registered eight bikes.',
    'Vous avez déjà laissé un avis sur cette garde.':
      'You have already left a review for this stay.',
    'Vous avez déjà un signalement en cours sur cette cible.':
      'You already have a report in progress about this.',
    'Vous ne pouvez pas vous bloquer vous-même.': 'You cannot block yourself.',
    'Vous ne pouvez pas vous signaler vous-même.': 'You can’t report yourself.',
    "Vous remettez le vélo. Lisez ce code à voix haute à {prenom} : c'est en le saisissant que {prenom} confirme la remise, et vous gardez la trace de ce que vous avez confié.":
      'You are handing over the bike. Read this code aloud to {prenom}: by entering it, {prenom} confirms the handover, and you keep a record of what you entrusted.',
    "Vu il y a moins d'une heure": 'Seen less than an hour ago',
    'Vu il y a {n} h': 'Seen {n} h ago',
    'Vu il y a {n} j': 'Seen {n} d ago',
    Vélo: 'Bike',
    'Vélo de {prenom}': '{prenom}’s bike',
    'Vélo enregistré': 'Bike saved',
    'Vélo refusé : batterie inquiétante': 'Bike not accepted: battery concern',
    'Vélo supprimé': 'Bike deleted',
    'Vélo à confier': 'Bike to entrust',
    "Vérifiez votre identité avant d'envoyer une demande.":
      'Please verify your identity before sending a request.',
    'accès contraint': 'difficult access',
    automatique: 'automatic',
    'chaque vélo peut être attaché': 'each bike can be secured',
    'expire dans {n} h': 'expires in {n} h',
    'fermé à clé': 'locked',
    "moins d'1 km": 'less than 1 km',
    "par l'ensemble du réseau": 'across the whole network',
    "point d'ancrage": 'anchor point',
    'pour cette garde seulement': 'for this stay only',
    'sous abri': 'under cover',
    sur: 'of',
    'sur 5': 'out of 5',
    'sur {capacite} · {creneau}': 'out of {capacite} · {creneau}',
    '{jour} {de} → {jourFin} {a} (une nuit)':
      '{jour} {de} → {jourFin} {a} (one night)',
    '{jour} {de} → {jourFin} {a} ({jours} jours)':
      '{jour} {de} → {jourFin} {a} ({jours} days)',
    '{jour} · {de} → {a}': '{jour} · {de} → {a}',
    "{nombre} autres demandes pour ce vélo ont été annulées : un vélo ne peut être gardé qu'à un endroit.":
      '{nombre} other requests for this bike have been cancelled: a bike can only be looked after in one place.',
    '{n} / 2 photos choisies': '{n} / 2 photos selected',
    '{n} avis déposés en attente : ils restent invisibles tant que l’autre personne n’a pas noté, ou pendant sept jours.':
      '{n} reviews waiting: they stay hidden until the other person has given their rating too, or for seven days.',
    "{n} bike sitters sont près d'ici, mais complets sur ce créneau. Un autre horaire suffirait peut-être.":
      '{n} bike sitters are nearby, but full for this time slot. Another time might work.',
    '{n} demandes en attente de votre réponse':
      '{n} requests awaiting your reply',
    '{n} emplacement(s) · {v} vélos accueillis':
      '{n} place(s) · {v} bikes welcomed',
    '{n} emplacements libres sur le même créneau':
      '{n} places free in the same time slot',
    '{n} garde': '{n} stay',
    '{n} gardes': '{n} stays',
    '{n} jours': '{n} days',
    '{n} photos · établi par {prenom}': '{n} photos · recorded by {prenom}',
    '{n} places libres': '{n} free spots',
    '{n} places libres sur {capacite}.': '{n} free spots out of {capacite}.',
    '{n} résultats': '{n} results',
    '{n} vélos': '{n} bikes',
    '{n} vélos accueillis': '{n} bikes welcomed',
    '{n} vélos confiés': '{n} bikes entrusted',
    "{n} vélos mis à l'abri ce mois-ci": '{n} bikes kept safe this month',
    '{n} vélos · {distance}': '{n} bikes · {distance}',
    '{n} vélos · {quartier}': '{n} bikes · {quartier}',
    '{prenom} a annulé sa demande.': '{prenom} has cancelled their request.',
    '{prenom} a annulé à moins de deux heures : {motif}. La place est de nouveau libre sur ce créneau.':
      '{prenom} cancelled less than two hours beforehand: {motif}. The spot is free again for this time slot.',
    '{prenom} a confirmé une garde ailleurs sur ce créneau. Sa demande chez vous est annulée, et la place est de nouveau libre.':
      '{prenom} has confirmed a stay elsewhere for this time slot. Their request with you has been cancelled, and the spot is free again.',
    "{prenom} a indiqué que le vélo n'a pas été déposé : {motif}. La garde est close.":
      '{prenom} reported that the bike was not dropped off: {motif}. The stay is now closed.',
    '{prenom} a prévu de venir dans moins de {heures} heures. Il sera prévenu immédiatement et verra les emplacements encore libres sur son créneau. Le désistement est enregistré.':
      '{prenom} is due to come in less than {heures} hours. They will be notified straight away and will see the places still free in their time slot. The withdrawal is recorded.',
    '{prenom} accueille au maximum : {duree}. Votre demande porte sur {jours} jours.':
      'Maximum stay with {prenom}: {duree}. Your request covers {jours} days.',
    "{prenom} accueille un vélo jusqu'à {heures} heures d'affilée.":
      '{prenom} looks after a bike for up to {heures} hours in a row.',
    "{prenom} avait bloqué sa place pour vous. Il sera prévenu immédiatement, et l'annulation est enregistrée sur la garde — pas sur votre profil.":
      '{prenom} had kept a place free for you. They will be notified straight away, and the cancellation is recorded on the stay — not on your profile.',
    '{prenom} est devant chez vous avec son vélo.':
      '{prenom} has arrived at your door with their bike.',
    "{prenom} n'accueille pas ce type de vélo.":
      '{prenom} doesn’t look after this type of bike.',
    '{prenom} ne demande aucune contribution.':
      '{prenom} doesn’t ask for any contribution.',
    "{prenom} s'est désisté pour le {jour} de {de} à {a}.":
      '{prenom} has withdrawn from the stay on {jour} from {de} to {a}.',
    "{prenom} s'est désisté à moins de deux heures : {motif}. Voici les emplacements encore libres sur votre créneau.":
      '{prenom} withdrew less than two hours beforehand: {motif}. Here are the places still free for your time slot.',
    "Personne n'a ouvert à l'arrivée de {prenom} : le vélo repart avec son propriétaire, la garde est close et la place est de nouveau libre.":
      'Nobody answered when {prenom} arrived: the bike leaves with its owner, the stay is closed and the spot is free again.',
    '{prenom} sera prévenu que vous êtes reparti avec votre vélo. La place redevient libre.':
      '{prenom} will be told that you left with your bike. The place becomes free again.',
    '{prenom} sera prévenu. Le motif l’aide à mieux demander la prochaine fois.':
      '{prenom} will be notified. The reason helps them make a better request next time.',
    '{prenom} vient récupérer son vélo. Votre code de restitution est prêt.':
      '{prenom} is coming to collect their bike. Your handover code for the return is ready.',
    '{prenom} vous a prévenu de son retard.':
      '{prenom} has let you know they’re running late.',
    "{prenom} vous prévient qu'il arrive en retard.":
      '{prenom} is letting you know they’re running late.',
    '{prenom} vous remet le vélo et voit un code à quatre chiffres sur son écran. Demandez-le-lui et saisissez-le.':
      '{prenom} is handing the bike over to you and sees a four-digit code on their screen. Ask for it and enter it.',
    '{quartier} — adresse masquée': '{quartier} — address hidden',
    '{type} à {quartier}': '{type} in {quartier}',
    'À l’extérieur sous abri': 'Outdoors under shelter',
    'À partir de': 'From',
    'À traiter': 'Pending',
    'Écrire à {prenom}': 'Write to {prenom}',
    'Écrivez au moins une phrase.': 'Write at least one sentence.',
    'Élargir la recherche': 'Widen the search',
    "Élargissez l'horaire ou la zone : une place se libère souvent en décalant d'une heure.":
      'Widen the time or the area: shifting by an hour often frees up a place.',
    Électrique: 'Electric',
    'Être prévenu': 'Get notified',
    à: 'at',
    'à environ {distance} de {lieu}': 'about {distance} from {lieu}',
    "à l'intérieur": 'indoors',
    'à {lieu}.': 'in {lieu}.',
    '★ {note} · {n} avis': '★ {note} · {n} reviews',
    // --- Espace de modération -------------------------------------------------
    'Ajouter un avantage.': 'Add a benefit.',
    'Aucun avantage n’est proposé pour le moment.': 'No benefit is being offered right now.',
    'Aucun dossier d’identité en attente pour le moment.': 'No identity dossier is pending right now.',
    'Aucun litige en cours pour le moment.': 'No dispute is open right now.',
    'Aucun litige en cours': 'No dispute is open',
    'Aucun membre ne correspond': 'No member matches',
    'Aucun signalement ouvert pour le moment.': 'No open report right now.',
    'Aucun signalement à afficher': 'No report to show',
    'Aucune pièce en attente pour le moment.': 'No document is pending right now.',
    'Avantage enregistré': 'Benefit saved',
    'Avantages des partenaires.': 'Partner benefits.',
    'Catalogue vide': 'Empty catalogue',
    'Ce litige est clos.': 'This dispute is closed.',
    'Ce que le modérateur a sous les yeux.': 'What the moderator sees.',
    'Ce que le modérateur ne voit pas': 'What the moderator does not see',
    'Ce signalement a déjà changé d’état, peut-être par une autre personne de l’équipe.':
      'This report has already changed status, perhaps by another team member.',
    'Ces avantages sont offerts aux membres du réseau contre leurs points. Modifier un avantage n’affecte jamais les bons déjà remis.':
      'These benefits are offered to members of the network in exchange for their points. Editing a benefit never affects vouchers already issued.',
    'Ces personnes ont écrit depuis le site pour proposer un emplacement. Elles seront recontactées par l’équipe pour la suite.':
      'These people wrote through the site to offer a place. The team will get back to them for the next steps.',
    'Cette explication est transmise au cycliste et au Bike Sitter. Merci de la rédiger à leur attention.':
      'This explanation is sent to the cyclist and the Bike Sitter. Please write it for them.',
    'Chaque pièce d’identité est examinée par une personne de l’équipe, puis supprimée dès que la décision a été enregistrée.':
      'Each identity document is reviewed by a team member, then deleted as soon as the decision has been recorded.',
    'Chaque pièce est examinée par une personne puis supprimée.':
      'Each document is reviewed by a person then deleted.',
    'Compte actif': 'Active account',
    'Constats du vélo': 'Bike observations',
    'Correction enregistrée': 'Correction saved',
    'Créneau': 'Time slot',
    'Dossiers d’identité en attente': 'Pending identity dossiers',
    'Dossiers d’identité à examiner': 'Identity dossiers to review',
    'Décision enregistrée': 'Decision saved',
    'Déjà changé': 'Already changed',
    'Détail du litige': 'Dispute details',
    'Détails de l’avantage': 'Benefit details',
    'Encore chez le Bike Sitter': 'Still with the Bike Sitter',
    'Envoi d’e-mails en échec': 'E-mail delivery failing',
    'Espace de modération': 'Moderation area',
    'Essayez un autre prénom, nom ou e-mail.': 'Try another first name, family name or e-mail.',
    'Examiner le litige': 'Review the dispute',
    'Fiche de membre': 'Member sheet',
    'Fiche d’avantage': 'Benefit sheet',
    'Gardes accueillies': 'Stays hosted',
    'Gardes confiées': 'Stays entrusted',
    'Gardes engagées': 'Ongoing stays',
    'Gestion des litiges.': 'Dispute management.',
    'Identité vérifiée. La pièce a été supprimée et le membre reçoit une notification.':
      'Identity verified. The document has been deleted and the member has been notified.',
    'Il est déjà visible dans le catalogue des membres.':
      'It is already visible in the members’ catalogue.',
    'Jamais déposé': 'Never dropped off',
    'La photo d’identité n’est conservée que le temps de la décision. Le motif d’un refus est envoyé au membre pour qu’il puisse renvoyer une pièce valide.':
      'The identity photo is only kept until the decision is made. The reason for a refusal is sent to the member so they can send in a valid document.',
    'La pièce est examinée avec attention. Elle sera supprimée dès que la décision aura été enregistrée.':
      'The document is reviewed with care. It will be deleted as soon as the decision has been saved.',
    'La pièce n’est visible ici que le temps de la décision. Elle est déchiffrée à la volée et n’est mise en cache nulle part.':
      'The document is only visible here until the decision is made. It is decrypted on the fly and cached nowhere.',
    'Le membre a été prévenu de la correction.': 'The member has been notified of the correction.',
    'Les alertes remontées par les membres du réseau.': 'The alerts raised by members of the network.',
    'Les avantages proposés par les partenaires sont échangés contre les points gagnés par les membres au fil de leurs gardes.':
      'The benefits offered by partners are exchanged for the points earned by members over their stays.',
    'Les conversations': 'Conversations',
    'Les deux membres ont été prévenus de la décision.': 'Both members have been notified of the decision.',
    'Les gardes ayant fait l’objet d’un signalement, du plus urgent au plus ancien. Chaque décision est envoyée au cycliste et au Bike Sitter.':
      'The stays that have been reported, from the most urgent to the oldest. Each decision is sent to the cyclist and the Bike Sitter.',
    'Les gardes signalées, à examiner des deux côtés.': 'The reported stays, to be reviewed from both sides.',
    'Les indicateurs collectifs, pour comprendre comment se portent les gardes du réseau. Aucune donnée individuelle n’apparaît ici.':
      'The collective indicators, to understand how the network’s stays are going. No individual data appears here.',
    'Les pièces d’identité': 'Identity documents',
    'Les profils, emplacements, gardes et avis qui ont fait l’objet d’une alerte. Chaque décision reste dans l’historique du compte concerné.':
      'The profiles, places, stays and reviews that have raised an alert. Each decision stays in the history of the account concerned.',
    'Litige tranché': 'Dispute settled',
    'Litiges en cours': 'Open disputes',
    'L’activité du réseau.': 'The network’s activity.',
    'L’adresse complète': 'The full address',
    'Membre de l’équipe de modération': 'Member of the moderation team',
    'Membres du réseau.': 'Members of the network.',
    'Modifier l’avantage.': 'Edit the benefit.',
    'Note de modération :': 'Moderation note:',
    'Ouvrez la fiche d’un membre pour ajuster son statut ou corriger son solde de points. Chaque geste laisse une trace motivée.':
      'Open a member’s sheet to adjust their status or correct their points balance. Every step leaves a motivated trace.',
    'Ouvrir la file des litiges': 'Open the dispute queue',
    'Ouvrir la file des signalements': 'Open the report queue',
    'Ouvrir la file d’identité': 'Open the identity queue',
    'Refus enregistré. La pièce a été supprimée et le membre a reçu le motif.':
      'Refusal saved. The document has been deleted and the member has received the reason.',
    'Repris par le cycliste': 'Picked up by the cyclist',
    'Rien dans cette file pour le moment.': 'Nothing in this queue right now.',
    'Rien à trancher pour le moment.': 'Nothing to settle right now.',
    'Signalements ouverts': 'Open reports',
    'Signalements reçus': 'Reports received',
    'Signalements.': 'Reports.',
    'Signalé par {qui}': 'Reported by {qui}',
    'Statut mis à jour': 'Status updated',
    'Trois files d’attente, et rien d’autre. Un modérateur ne voit ni les adresses complètes, ni les conversations qui ne sont pas liées à un dossier ouvert.':
      'Three queues, and nothing else. A moderator sees neither full addresses nor conversations that are not linked to an open dossier.',
    'Un ou plusieurs e-mails n’ont pas pu être envoyés. Le paramétrage du serveur d’envoi mérite d’être vérifié.':
      'One or more e-mails could not be sent. The outgoing-mail server settings deserve a check.',
    'Un signalement est examiné, puis classé avec une note qui reste dans l’historique. Les membres impliqués sont prévenus quand une décision est prise.':
      'A report is reviewed, then filed with a note that stays in the history. The members involved are notified when a decision is made.',
    'Une décision explique ce qui a été retenu et comment les points sont attribués. Elle est envoyée au cycliste et au Bike Sitter.':
      'A decision explains what has been retained and how the points are awarded. It is sent to the cyclist and the Bike Sitter.',
    'Vérifications d’identité.': 'Identity checks.',
    'Vérifier une identité.': 'Verify an identity.',
    'batterie vérifiée': 'battery checked',
    'candidatures d’emplacement': 'place applications',
    'cible du signalement': 'report target',
    'comptes suspendus': 'suspended accounts',
    'demandes ou gardes en cours': 'requests or stays in progress',
    'dossiers d’identité': 'identity dossiers',
    'd’un membre, sauf sur un dossier ouvert et seulement le temps de l’instruire.':
      'of a member, except on an open dossier and only for as long as it takes to review it.',
    'e-mails à renvoyer': 'e-mails to resend',
    'gardes en cours': 'stays in progress',
    'gardes menées à terme (30 jours)': 'stays taken to completion (30 days)',
    'gardes menées à terme': 'stays taken to completion',
    'identité vérifiée': 'identity verified',
    'modération': 'moderation',
    'objectif : 95 %': 'target: 95 %',
    'objectif : chacune menée à son terme': 'target: each one taken to completion',
    'objectif : rester sous les 2': 'target: stay under 2',
    'objectif : rester sous les 3': 'target: stay under 3',
    'ouvert le {date} à {heure}': 'opened on {date} at {heure}',
    'ouvert le {date}': 'opened on {date}',
    'par {prenom}': 'by {prenom}',
    'qui ne sont pas liées à un dossier ouvert.': 'that are not linked to an open dossier.',
    'remarque : {remarque}': 'note: {remarque}',
    'signalements ouverts': 'open reports',
    'signalé le {date}': 'reported on {date}',
    'sont supprimées dès que la décision a été enregistrée.': 'are deleted as soon as the decision has been saved.',
    'supprimée aujourd’hui': 'deleted today',
    'supprimée dans {n} j': 'deleted in {n} d',
    'suspendu': 'suspended',
    '{n} candidature(s) d’emplacement': '{n} place application(s)',
    '{n} en attente': '{n} pending',
    '{n} membre(s) affiché(s)': '{n} member(s) shown',
    '{n} message(s)': '{n} message(s)',
    '{n} à examiner': '{n} to review',
    '{n} à traiter': '{n} to handle',
    '{n} à trancher': '{n} to settle',
  },
};
