/**
 * Les textes écrits en français dans les écrans, et leur traduction.
 *
 * `PHRASES` traduit un texte entier ; `MOTS` traduit les morceaux qui
 * s'assemblent à l'exécution (« 3 vélos · 400 m »). Le français est la source :
 * un texte absent reste en français plutôt que d'être à moitié traduit.
 */

export const MOTS: Record<'nl' | 'en', Record<string, string>> = {
  nl: {
    ' de la Place Flagey': ' van het Flageyplein',
    ' demande à traiter': ' aanvraag te behandelen',
    ' demandes à traiter': ' aanvragen te behandelen',
    ' emplacement': ' plek',
    ' emplacements': ' plekken',
    ' garde en cours': ' oppasbeurt bezig',
    ' garde terminée': ' afgeronde oppasbeurt',
    ' gardes': ' oppasbeurten',
    ' gardes terminées': ' afgeronde oppasbeurten',
    ' heures': ' uur',
    ' jour': ' dag',
    ' jours': ' dagen',
    ' minutes': ' minuten',
    ' mois': ' maanden',
    ' place libre': ' vrije plaats',
    ' places libres': ' vrije plaatsen',
    ' vélo': ' fiets',
    ' vélo confié': ' toevertrouwde fiets',
    ' vélos': ' fietsen',
    ' vélos accueillis': ' opgevangen fietsen',
    ' vélos confiés': ' toevertrouwde fietsen',
    'Absence imprévue': 'Onverwachte afwezigheid',
    'Accès au réseau': 'Toegang tot het netwerk',
    'Annonce en double': 'Dubbele aankondiging',
    'Après-midi': 'Namiddag',
    'Aucun avis donné.': 'Geen beoordeling gegeven.',
    'Aucun vélo enregistré.': 'Geen fiets geregistreerd.',
    'Aucune déclaration.': 'Geen aangifte.',
    'Balcon ou loggia': 'Balkon of loggia',
    "C'est vraiment gratuit ?": 'Is het echt gratis?',
    'Chez ': 'Bij ',
    "Comment ça s'est passé ?": 'Hoe is het verlopen?',
    'Demande et garde': 'Aanvraag en oppasbeurt',
    'Demande introuvable.': 'Aanvraag niet gevonden.',
    'Devant un commerce': 'Voor een handelszaak',
    "Disponibilités d'un emplacement": 'Beschikbaarheid van een plek',
    'Détail et déroulé': 'Detail en verloop',
    'Emplacement partagé': 'Gedeelde plek',
    Enfant: 'Kinderfiets',
    "Entièrement à l'intérieur": 'Volledig binnen',
    'Envoyer la proposition': 'Het voorstel versturen',
    'Envoyer le lien': 'De link versturen',
    'Envoyer le signalement': 'De melding versturen',
    'Erreur dans ma demande': 'Fout in mijn aanvraag',
    'Fermé à clé': 'Op slot',
    'Fiche emplacement': 'Fiche van de plek',
    'Formulaire de demande': 'Aanvraagformulier',
    Garde: 'Oppasbeurt',
    'Gare ou station': 'Station of halte',
    'Gonflage des pneus': 'Banden oppompen',
    Gravel: 'Gravel',
    'Inscription et connexion': 'Inschrijven en aanmelden',
    'Intérieur du logement': 'Binnen in de woning',
    "Je n'ai pas d'invitation": 'Ik heb geen uitnodiging',
    'Je ne sais pas': 'Ik weet het niet',
    'Journal des actions': 'Logboek van de acties',
    Longtail: 'Longtail',
    'Membre depuis ': 'Lid sinds ',
    'Modifier un emplacement': 'Een plek bewerken',
    'Non acceptés :': 'Niet aanvaard:',
    'Où le vélo était-il ?': 'Waar stond de fiets?',
    Pliant: 'Plooifiets',
    Route: 'Race',
    'Serrure et clé': 'Slot en sleutel',
    "Statistiques d'un emplacement": 'Statistieken van een plek',
    Tandem: 'Tandem',
    VTC: 'Hybride',
    VTT: 'MTB',
    Ville: 'Stad',
    'Vélo de ': 'Fiets van ',
    'Vélos acceptés :': 'Aanvaarde fietsen:',
    'expire dans ': 'vervalt over ',
    'sur votre créneau': 'in uw tijdslot',
    Électrique: 'Elektrisch',
    'à environ ': 'ongeveer ',
    ": c'est en le saisissant qu'il confirme la remise, et vous gardez la trace de ce que vous lui avez confié.":
      ': door hem in te voeren bevestigt hij de overdracht, en u houdt bij wat u hebt toevertrouwd.',
    "Certaines pages n'ont de contenu qu'après avoir créé une demande. Faites d'abord le parcours, puis revenez ici.":
      "Sommige pagina's tonen pas iets nadat u een aanvraag hebt gemaakt. Doorloop eerst het traject en kom dan terug.",
    "Il sera examiné par un modérateur avec l'historique complet.":
      'Een moderator bekijkt ze samen met de volledige geschiedenis.',
    'La suppression est définitive. Vos emplacements sont retirés, vos avis anonymisés, vos conversations effacées.':
      'De verwijdering is definitief. Uw plekken worden ingetrokken, uw beoordelingen geanonimiseerd, uw gesprekken gewist.',
    "Le numéro de cadre est chiffré et n'est jamais affiché publiquement. Il sert uniquement en cas de vol.":
      'Het framenummer wordt versleuteld en nooit openbaar getoond. Het dient enkel bij diefstal.',
    'Le vocabulaire partagé — navigation, statuts, actions du cycle de garde — est traduit ; le reste suit.':
      'De gedeelde woordenschat — navigatie, statussen, acties van de oppascyclus — is vertaald; de rest volgt.',
    'Les autres membres voient «': 'Andere leden zien «',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation.":
      'Plekken worden in een benaderende zone getoond. Het exacte adres wordt na aanvaarding meegedeeld.',
    "Les notifications internes liées à une garde en cours ne peuvent pas être désactivées : quelqu'un attend une réponse.":
      'Interne meldingen over een lopende oppasbeurt kunnen niet worden uitgeschakeld: iemand wacht op een antwoord.',
    'Les notifications reçues pendant cette plage ne sonnent pas : elles vous sont présentées à la fin de la plage.':
      'Meldingen binnen dit tijdvak maken geen geluid: u krijgt ze aan het eind van het tijdvak te zien.',
    "Réponse sous 24 heures en semaine. En cas de danger immédiat, appelez les secours : nous ne sommes pas un service d'urgence.":
      'Antwoord binnen 24 uur op weekdagen. Bij onmiddellijk gevaar belt u de hulpdiensten: wij zijn geen noodhulpdienst.',
    'Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent tout le reste.':
      'Kunt u een fiets opvangen, zeg het dan: het zijn de bike sitters die al de rest op gang brengen.',
    'Tous ces emplacements sont privés. Un local collectif, une cave commune ou une partie commune ne sont jamais acceptés.':
      'Al deze plekken zijn privé. Een gemeenschappelijke berging, een gedeelde kelder of een gemene deel worden nooit aanvaard.',
    'Votre avis reste invisible tant que':
      'Uw beoordeling blijft onzichtbaar zolang',
    "Votre document est supprimé dès la validation, et au plus tard après sept jours. Ni l'image ni le numéro ne sont conservés.":
      'Uw document wordt gewist zodra de validatie rond is, en uiterlijk na zeven dagen. Noch de afbeelding noch het nummer worden bewaard.',
    'Votre signalement concerne': 'Uw melding gaat over',
    "Votre signalement concerne cette annonce. Il sera examiné par un modérateur avec l'historique complet.":
      'Uw melding gaat over deze plek. Een moderator bekijkt ze samen met de volledige geschiedenis.',
    'Vous remettez le vélo. Lisez ce code à voix haute à':
      'U geeft de fiets af. Lees deze code hardop voor aan',
    "avait bloqué sa place pour vous. Il sera prévenu immédiatement, et l'annulation est enregistrée sur la garde — pas sur votre profil.":
      'had een plaats voor u vrijgehouden. Hij wordt onmiddellijk verwittigd, en de annulering wordt op de oppasbeurt genoteerd — niet op uw profiel.',
    'fait partie de ce que nous avons vérifié. Un modérateur lira votre demande. Si elle est acceptée, votre identité devra être vérifiée à nouveau.':
      'maakt deel uit van wat wij hebben geverifieerd. Een moderator leest uw aanvraag. Wordt ze aanvaard, dan moet uw identiteit opnieuw worden geverifieerd.',
    "n'a pas déposé le sien. Publication automatique après sept jours.":
      'de zijne niet heeft geplaatst. Automatische publicatie na zeven dagen.',
    'vous remet le vélo et voit un code à quatre chiffres sur son écran. Demandez-le-lui et saisissez-le.':
      'geeft u de fiets terug en ziet een code van vier cijfers op zijn scherm. Vraag hem en voer hem in.',
    "». Votre nom complet et votre e-mail ne sont visibles par personne. Votre numéro de téléphone est communiqué à l'autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.":
      '». Uw volledige naam en uw e-mail zijn voor niemand zichtbaar. Uw telefoonnummer wordt tijdens een aanvaarde oppasbeurt enkel aan de andere persoon meegedeeld: het verdwijnt bij de afsluiting.',
    "Accessible sans vérification d'identité. Votre fiche sera publique, vos coordonnées ne le seront pas.":
      'Toegankelijk zonder identiteitsverificatie. Uw fiche wordt openbaar, uw contactgegevens niet.',
    'Chaque filtre écarte des emplacements. Sans filtre, vous voyez tout ce qui est libre sur votre créneau.':
      'Elke filter sluit plekken uit. Zonder filter ziet u alles wat vrij is in uw tijdslot.',
    "Description — le lieu, l'accès, et ce que vous proposez":
      'Beschrijving — de plek, de toegang, en wat u aanbiedt',
    "La personne signalée n'est pas informée de votre identité.":
      'De gemelde persoon verneemt uw identiteit niet.',
    "La vérification d'identité est obligatoire pour publier un emplacement et pour demander une garde. Pas pour déclarer un vol.":
      'Identiteitsverificatie is verplicht om een plek te publiceren en om een oppasbeurt aan te vragen. Niet om een diefstal aan te geven.',
    "Le numéro de cadre est chiffré et n'est jamais affiché publiquement. Il sert uniquement en cas de déclaration de vol.":
      'Het framenummer wordt versleuteld en nooit openbaar getoond. Het dient enkel bij een diefstalaangifte.',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation d'une demande.":
      'Plekken worden in een benaderende zone getoond. Het exacte adres wordt meegedeeld nadat een aanvraag is aanvaard.',
    'Les notifications reçues pendant cette plage ne sonnent pas : elles vous sont présentées à la fin de la plage de silence.':
      'Meldingen binnen dit tijdvak maken geen geluid: u krijgt ze te zien aan het eind van de stilteperiode.',
    "Modifier l'emplacement": 'De plek bewerken',
    'Problème avec une garde': 'Probleem met een oppasbeurt',
    "Renseigné, pas encore vérifié · communiqué à l'autre personne pendant une garde acceptée, et à elle seule.":
      'Opgegeven, nog niet geverifieerd · enkel tijdens een aanvaarde oppasbeurt aan de andere persoon meegedeeld.',
    'Votre avis sur': 'Uw beoordeling over',
    'Votre fiche indiquera : non acceptés —':
      'Uw fiche vermeldt: niet aanvaard —',
    'Votre identité reste vérifiée ; le nouveau lieu repasse en validation.':
      'Uw identiteit blijft geverifieerd; de nieuwe plek gaat opnieuw in validatie.',
    "Votre pièce d'identité": 'Uw identiteitsbewijs',
    'Vous seriez plutôt': 'U bent eerder',
    'demande en attente de réponse. Répondez-y ou laissez-la expirer avant de supprimer votre compte.':
      'aanvraag wacht op antwoord. Beantwoord ze of laat ze vervallen voor u uw account verwijdert.',
    'demande en attente de votre réponse': 'aanvraag wacht op uw antwoord',
    'garde déjà confirmé sur cet emplacement. Vos modifications ne les annulent pas.':
      'oppasbeurt al bevestigd op deze plek. Uw wijzigingen annuleren ze niet.',
    'gardes en cours. Terminez-les avant de supprimer votre compte.':
      'oppasbeurten bezig. Rond ze af voor u uw account verwijdert.',
    'ne demande aucune contribution.': 'vraagt geen enkele bijdrage.',
    'Ce prénom figure sur la pièce que nous avons vérifiée. Pour le changer, demandez-le en expliquant pourquoi.':
      'Deze voornaam staat op het document dat wij hebben gecontroleerd. Wilt u hem wijzigen, vraag het dan en leg uit waarom.',
    "Données d'essai — le réseau n'est pas encore ouvert.":
      'Testgegevens — het netwerk is nog niet open.',
    'Encore 15 avant le jalon des 50': 'Nog 15 tot de mijlpaal van 50',
    'La journée entière': 'De hele dag',
    'Le catalogue': 'De catalogus',
    "Le numéro de cadre est chiffré et n'est jamais affiché.":
      'Het framenummer wordt versleuteld en nooit getoond.',
    "Le réseau ouvre quartier par quartier. On y entre aujourd'hui sur invitation d'un membre.":
      'Het netwerk opent buurt per buurt. Vandaag komt men erin op uitnodiging van een lid.',
    'Les deux': 'Beide',
    'Modifier la recherche': 'De zoekopdracht aanpassen',
    Modèle: 'Model',
    'Où les vélos sont gardés': 'Waar de fietsen bewaard worden',
    'Publier la déclaration': 'De aangifte publiceren',
    "Recto de la carte d'identité": 'Voorzijde van de identiteitskaart',
    'Rejoindre le réseau': 'Lid worden van het netwerk',
    'Toutes les pages': "Alle pagina's",
    "Trois langues au lancement : français, néerlandais et anglais. Bruxelles est bilingue, et l'anglais couvre les résidents internationaux et les personnes de passage. Le vocabulaire partagé — navigation, statuts, actions du cycle de garde — est traduit ; le reste suit.":
      'Drie talen bij de start: Frans, Nederlands en Engels. Brussel is tweetalig, en het Engels dekt internationale bewoners en mensen op doorreis. De gedeelde woordenschat — navigatie, statussen, acties van de oppascyclus — is vertaald; de rest volgt.',
    'Votre adresse': 'Uw adres',
    'Votre e-mail': 'Uw e-mail',
    'Votre message': 'Uw bericht',
    'Votre quartier': 'Uw buurt',
    'Vélo reçu': 'Fiets ontvangen',
    'Vélo à confier': 'Toe te vertrouwen fiets',
    '[Votre prénom]': '[Uw voornaam]',
    'le mien': 'de mijne',
    'libres sur le même créneau': 'vrij in hetzelfde tijdslot',
    'non acceptés —': 'niet aanvaard —',
    "s'est désisté pour le": 'heeft zich teruggetrokken voor',
    'vol déclaré sur la période': 'aangegeven diefstal in de periode',
    "Aucune pièce d'identité n'apparaît dans l'export : elle n'est pas conservée.":
      'Geen enkel identiteitsbewijs staat in de export: het wordt niet bewaard.',
    'Avec remorque': 'Met aanhangwagen',
    'Carte des vols': 'Kaart van de diefstallen',
    "Certaines pages n'ont de contenu qu'après avoir créé une demande. Faites d'abord le parcours, puis revenez ici pour les voir peuplées.":
      "Sommige pagina's tonen pas iets nadat u een aanvraag hebt gemaakt. Doorloop eerst het traject en kom dan terug om ze gevuld te zien.",
    'Galerie des vélos volés': 'Galerij van gestolen fietsen',
    "Il sera examiné par un modérateur avec l'historique de la garde.":
      'Een moderator bekijkt ze samen met de geschiedenis van de oppasbeurt.',
    "La vérification d'identité est obligatoire pour publier un emplacement et pour demander une garde. Pas pour déclarer un vol ni pour signaler une observation.":
      'Identiteitsverificatie is verplicht om een plek te publiceren en om een oppasbeurt aan te vragen. Niet om een diefstal of een waarneming te melden.',
    "Le numéro de cadre est chiffré et n'est jamais affiché publiquement. Il sert uniquement à retrouver un vélo déclaré volé.":
      'Het framenummer wordt versleuteld en nooit openbaar getoond. Het dient enkel om een als gestolen gemelde fiets terug te vinden.',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation, et à la seule personne concernée.":
      'Plekken worden in een benaderende zone getoond. Het exacte adres wordt na aanvaarding meegedeeld, en enkel aan de betrokken persoon.',
    'Les notifications internes liées à une garde en cours ne peuvent pas être désactivées : elles concernent un vélo confié.':
      'Interne meldingen over een lopende oppasbeurt kunnen niet worden uitgeschakeld: ze gaan over een toevertrouwde fiets.',
    "Ne s'est pas présenté": 'Is niet komen opdagen',
    "Nouveau membre — la note s'affiche à partir de trois avis.":
      'Nieuw lid — de score verschijnt vanaf drie beoordelingen.',
    "Renseigné, pas encore vérifié · communiqué à l'autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.":
      'Opgegeven, nog niet geverifieerd · enkel tijdens een aanvaarde oppasbeurt aan de andere persoon meegedeeld: het verdwijnt bij de afsluiting.',
    "Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent l'ouverture d'un quartier.":
      'Kunt u een fiets opvangen, zeg het dan: het zijn de bike sitters die een buurt doen opengaan.',
    "Une conversation s'ouvre dès qu'une demande est acceptée, ou quand quelqu'un signale avoir vu un vélo volé.":
      'Een gesprek gaat open zodra een aanvraag is aanvaard, of wanneer iemand meldt een gestolen fiets gezien te hebben.',
    'Zone des vélos': 'Zone van de fietsen',
    '— vous': '— u',
    "Certaines pages n'ont de contenu qu'après avoir créé une demande. Faites d'abord le parcours : Explorer → un emplacement → Demander.":
      "Sommige pagina's tonen pas iets nadat u een aanvraag hebt gemaakt. Doorloop eerst het traject: Verkennen → een plek → Aanvragen.",
    "Il sera examiné par un modérateur avec l'historique de la garde concerné.":
      'Een moderator bekijkt ze samen met de geschiedenis van de betrokken oppasbeurt.',
    "La vérification d'identité est obligatoire pour publier un emplacement et pour demander une garde. Elle n'est pas requise pour déclarer un vol.":
      'Identiteitsverificatie is verplicht om een plek te publiceren en om een oppasbeurt aan te vragen. Ze is niet vereist om een diefstal aan te geven.',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation de votre demande.":
      'Plekken worden in een benaderende zone getoond. Het exacte adres wordt meegedeeld nadat uw aanvraag is aanvaard.',
    'Les notifications internes liées à une garde en cours ne peuvent pas être désactivées : elles portent les actions attendues de vous.':
      'Interne meldingen over een lopende oppasbeurt kunnen niet worden uitgeschakeld: ze bevatten de acties die van u verwacht worden.',
    'Les notifications reçues pendant cette plage ne sonnent pas : elles vous sont présentées à':
      'Meldingen binnen dit tijdvak maken geen geluid: u krijgt ze te zien om',
    'Où sont vos données': 'Waar uw gegevens staan',
    "Renseigné, pas encore vérifié · communiqué à l'autre personne pendant une garde acceptée, et à elle seule":
      'Opgegeven, nog niet geverifieerd · enkel tijdens een aanvaarde oppasbeurt aan de andere persoon meegedeeld',
    "Rien n'est perdu.": 'Er gaat niets verloren.',
    "Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent l'ouverture d'un quartier, pas les cyclistes.":
      'Kunt u een fiets opvangen, zeg het dan: het zijn de bike sitters die een buurt doen opengaan, niet de fietsers.',
    'Tous ces emplacements sont privés. Un local collectif, une cave commune ou une partie commune ne peuvent pas être proposés.':
      'Al deze plekken zijn privé. Een gemeenschappelijke berging, een gedeelde kelder of een gemene deel kunnen niet worden aangeboden.',
    "Trois langues au lancement : français, néerlandais et anglais. Bruxelles est bilingue, et l'anglais couvre les résidents internationaux et les personnes de passage. Le vocabulaire partagé — navigation, statuts, actions du cycle de vie — est traduit dans le prototype ; le contenu éditorial reste en français.":
      'Drie talen bij de start: Frans, Nederlands en Engels. Brussel is tweetalig, en het Engels dekt internationale bewoners en mensen op doorreis. De gedeelde woordenschat — navigatie, statussen, acties uit de levenscyclus — is vertaald in het prototype; de redactionele inhoud blijft in het Frans.',
    "Une conversation s'ouvre dès qu'une demande est acceptée, ou quand quelqu'un signale avoir vu votre vélo.":
      'Een gesprek gaat open zodra een aanvraag is aanvaard, of wanneer iemand meldt uw fiets gezien te hebben.',
    "n'a pas déposé le sien. Publication automatique après 14 jours.":
      'de zijne niet heeft geplaatst. Automatische publicatie na 14 dagen.',
    ' m de ': ' m van ',
    ' sur ': ' op ',
    Demain: 'Morgen',
    Dim: 'Zo',
    Dimanche: 'Zondag',
    Disponible: 'Beschikbaar',
    'En ligne': 'Online',
    'Hors ligne': 'Offline',
    Jeu: 'Do',
    Jeudi: 'Donderdag',
    Lun: 'Ma',
    Lundi: 'Maandag',
    Mar: 'Di',
    Mardi: 'Dinsdag',
    Mer: 'Wo',
    Mercredi: 'Woensdag',
    Sam: 'Za',
    Samedi: 'Zaterdag',
    Ven: 'Vr',
    Vendredi: 'Vrijdag',
    août: 'augustus',
    "aujourd'hui": 'vandaag',
    hier: 'gisteren',
    juillet: 'juli',
    octobre: 'oktober',
    septembre: 'september',
    'vu il y a': 'gezien',
    "à l'instant": 'zonet',
    'Ajouter une photo': 'Een foto toevoegen',
    Aucune: 'Geen',
    'Aucune conversation.': 'Geen gesprekken.',
    'Aucune notification.': 'Geen meldingen.',
    'Bonjour Thomas, je passe la journée en centre-ville':
      'Hallo Thomas, ik breng de dag door in het centrum',
    "Ce canal reste ouvert quoi qu'il arrive : compte suspendu, litige en cours, ou simple question.":
      'Dit kanaal blijft altijd open: geschorst account, lopend geschil, of gewoon een vraag.',
    'Ce champ': 'Dit veld',
    'Ce profil': 'Dit profiel',
    Cette: 'Deze',
    'Cette déclaration': 'Deze aangifte',
    'Cette offre': 'Dit aanbod',
    'Cherchez un': 'Zoek een',
    'Comment était-il attaché ?': 'Hoe stond hij vast?',
    Dernière: 'Laatste',
    'Dois-je vérifier mon identité ?': 'Moet ik mijn identiteit verifiëren?',
    'Espérons que ça dure.': 'Laten we hopen dat het zo blijft.',
    "Fiche d'une offre": 'Fiche van een aanbod',
    'Gare du Midi': 'Zuidstation',
    'Hoe vind je een gestolen fiets terug?':
      'Hoe vind je een gestolen fiets terug?',
    'Jour de la récupération': 'Dag van ophaling',
    'Jour du dépôt': 'Dag van afgifte',
    "L'horaire actuel reste valable tant que":
      'Het huidige tijdstip blijft geldig zolang',
    'Nous joindre': 'Ons contacteren',
    'Pas de fermeture': 'Geen sluiting',
    'Pourquoi ce changement ?': 'Waarom deze wijziging?',
    'Signaler une observation': 'Een waarneming melden',
    'Une autre solution': 'Een andere oplossing',
    'Uw melding gaat over cette annonce.': 'Uw melding gaat over deze plek.',
    'il y a 1 minute': '1 minuut geleden',
    "mis à l'abri ce mois-ci": 'deze maand in veiligheid gebracht',
    "n'a pas répondu. Rien ne change avant son accord.":
      'niet heeft geantwoord. Er verandert niets voor zijn akkoord.',
    "par l'ensemble du réseau": 'door het hele netwerk',
    'pour commencer.': 'om te beginnen.',
    "pour l'instant.": 'voorlopig.',
    'Date du vol': 'Datum van de diefstal',
    'Deux heures': 'Twee uur',
    'Pièce dédiée': 'Aparte kamer',
    'Une demi-journée': 'Een halve dag',
    'Une heure': 'Eén uur',
    'Une journée': 'Eén dag',
    'Vos droits': 'Uw rechten',
    'cette annonce': 'deze plek',
    'et la': 'en het',
    Administration: 'Beheer',
    'Messagerie et alertes': 'Berichten en meldingen',
    'Mot de passe': 'Wachtwoord',
    'Mot de passe oublié': 'Wachtwoord vergeten',
    'Profil et réglages': 'Profiel en instellingen',
    Recherche: 'Zoeken',
    'Recherche et': 'Zoeken en',
    'Site public': 'Openbare site',
    'Vélos volés — module désactivé': 'Gestolen fietsen — module uitgeschakeld',
    'Laisser un avis': 'Een beoordeling achterlaten',
    Motif: 'Reden',
    "Motif d'annulation": 'Reden van annulering',
    'Motif de refus': 'Reden van weigering',
    Accepter: 'Aanvaarden',
    Ajouter: 'Toevoegen',
    Appeler: 'Bellen',
    Confirmer: 'Bevestigen',
    Copier: 'Kopiëren',
    Demander: 'Aanvragen',
    Enregistrer: 'Opslaan',
    Envoyer: 'Versturen',
    Fermer: 'Sluiten',
    Filtrer: 'Filteren',
    Modifier: 'Bewerken',
    Précédent: 'Vorige',
    Publier: 'Publiceren',
    Rechercher: 'Zoeken',
    Refuser: 'Weigeren',
    Retour: 'Terug',
    Répondre: 'Antwoorden',
    Signaler: 'Melden',
    Suivant: 'Volgende',
    Supprimer: 'Verwijderen',
    Terminer: 'Afronden',
    Valider: 'Bevestigen',
    Voir: 'Bekijken',
    'Abri de jardin ou remise': 'Tuinhuis of berging',
    Annulée: 'Geannuleerd',
    Annulées: 'Geannuleerd',
    'Autre espace privé': 'Andere privéruimte',
    'Box de garage individuel': 'Individuele garagebox',
    Brouillon: 'Ontwerp',
    'Cave privative': 'Privékelder',
    'Cour privée': 'Privékoer',
    'Débarras ou cellier': 'Berging of bijkeuken',
    'En attente': 'In afwachting',
    'En cours': 'Bezig',
    'En pause': 'Gepauzeerd',
    'En validation': 'In validatie',
    Expirée: 'Vervallen',
    Expirées: 'Vervallen',
    'Garage privé fermé': 'Afgesloten privégarage',
    Introuvable: 'Niet gevonden',
    'Jardin privé clôturé': 'Omheinde privétuin',
    'Litige en cours': 'Geschil lopend',
    'Local privatif': 'Privélokaal',
    Publié: 'Gepubliceerd',
    Refusée: 'Geweigerd',
    Refusées: 'Geweigerd',
    Suspendu: 'Geschorst',
    Terminé: 'Afgerond',
    Terminées: 'Afgerond',
    Terminés: 'Afgerond',
    'Terrasse privée': 'Privéterras',
    'Véranda fermée': 'Gesloten veranda',
    "moins d'1 km": 'minder dan 1 km',
    'À traiter': 'Te behandelen',
    'Demande acceptée': 'Aanvraag aanvaard',
    'Demande annulée': 'Aanvraag geannuleerd',
    'Demande en attente': 'Aanvraag in afwachting',
    'Demande expirée': 'Aanvraag vervallen',
    'Demande refusée': 'Aanvraag geweigerd',
    'Garde annulée': 'Oppasbeurt geannuleerd',
    'Garde confirmée': 'Oppasbeurt bevestigd',
    'Garde en cours': 'Oppasbeurt bezig',
    'Garde terminée': 'Oppasbeurt afgerond',
    "Liste d'attente": 'Wachtlijst',
    'Activité interne. Ces chiffres ne sont jamais affichés aux membres et ne constituent pas un classement.':
      'Interne activiteit. Deze cijfers worden nooit aan leden getoond en vormen geen rangschikking.',
    'Aucun bon pour le moment.': 'Voorlopig geen bon.',
    'Aucun message. Envoyez-en un depuis la page Contact du site public.':
      'Geen bericht. Stuur er een via de contactpagina van de openbare site.',
    'Autoriser les contributions': 'Bijdragen toestaan',
    "Ce qui a été vérifié ne se modifie pas seul. Accepter un changement de prénom annule la vérification d'identité : elle devra être refaite.":
      'Wat geverifieerd is, wijzigt men niet alleen. Een naamswijziging aanvaarden annuleert de identiteitsverificatie: die moet opnieuw gebeuren.',
    "Ces avantages remercient les personnes qui accueillent des vélos chez elles. Ils ne s'achètent pas.":
      'Deze voordelen bedanken de mensen die fietsen bij hen thuis opvangen. Ze zijn niet te koop.',
    'Déclaration, carte et galerie sont accessibles, sans compte.':
      'Aangifte, kaart en galerij zijn toegankelijk, zonder account.',
    'Délai visé : 24 heures ouvrées. Le document est supprimé dès la décision, et au plus tard après sept jours. Approuver active le compte et prévient le parrain.':
      'Streeftermijn: 24 werkuren. Het document wordt gewist zodra de beslissing valt, en uiterlijk na zeven dagen. Goedkeuren activeert het account en verwittigt de peter.',
    'Elle dit où ouvrir le prochain quartier. Ce sont les bike sitters en attente qui comptent, pas les cyclistes.':
      'Ze zegt waar de volgende buurt te openen. Het zijn de wachtende bike sitters die tellen, niet de fietsers.',
    "Fermée pendant la bêta : l'entrée se fait sur invitation, avec une pièce d'identité regardée par un humain. Le numéro reste obligatoire, simplement marqué « renseigné » plutôt que « vérifié ».":
      'Gesloten tijdens de bèta: men komt binnen op uitnodiging, met een identiteitsbewijs dat een mens bekijkt. Het nummer blijft verplicht, enkel aangeduid als « opgegeven » in plaats van « geverifieerd ».',
    "Fermés pendant la bêta. Les lignes continuent d'être écrites à chaque garde close : le jour où on les ouvre, l'historique est déjà là.":
      'Gesloten tijdens de bèta. De lijnen worden bij elke afgesloten oppasbeurt toch geschreven: de dag dat we ze openen, is de geschiedenis er al.',
    "Il ne s'ouvre que lorsque des commerçants se sont engagés. Chaque offre annonce son stock ; à zéro, on rappelle le partenaire.":
      'Hij gaat pas open wanneer handelaars zich hebben geëngageerd. Elk aanbod vermeldt zijn voorraad; op nul bellen we de partner terug.',
    'Inscrire une trace': 'Een spoor noteren',
    "L'emplacement semble partagé avec d'autres locataires.":
      'De plek lijkt gedeeld met andere huurders.',
    "L'ouverture ne supprime rien d'autre : la vérification d'identité, la validation humaine et les invitations restent en place. Seule la condition d'entrée change.":
      'Het openstellen schrapt niets anders: de identiteitsverificatie, de menselijke validatie en de uitnodigingen blijven. Enkel de toegangsvoorwaarde verandert.',
    'La phase fermée sert à densifier quartier par quartier. Elle se lève quand le réseau tient debout — pas à une date, mais sur des critères.':
      'De gesloten fase dient om buurt per buurt te verdichten. Ze eindigt wanneer het netwerk overeind blijft — niet op een datum, maar op criteria.',
    'Le Comptoir': 'Le Comptoir',
    "Le lancement ne propose que des gardes ponctuelles. Le mécanisme de série reste en place — rien n'est supprimé, seul l'affichage disparaît.":
      'De start biedt enkel losse oppasbeurten aan. Het reeksmechanisme blijft bestaan — er wordt niets geschrapt, enkel de weergave verdwijnt.',
    'Le réseau est entièrement gratuit. Les montants déjà saisis sont ignorés, pas effacés.':
      'Het netwerk is volledig gratis. Reeds ingevoerde bedragen worden genegeerd, niet gewist.',
    "Non modifiable. Chaque action d'administration y est inscrite.":
      'Niet wijzigbaar. Elke beheersactie wordt erin opgenomen.',
    'Ouvrir le réseau': 'Het netwerk openstellen',
    "Personne pour l'instant. Inscrivez-vous depuis la page publique pour tester.":
      'Voorlopig niemand. Schrijf u in via de openbare pagina om te testen.',
    'Soumis le': 'Ingediend op',
    'Aucun créneau libre ce jour-là. Essayez une autre date.':
      'Geen vrij tijdslot die dag. Probeer een andere datum.',
    'Aucune demande ne vous parviendra sur ces dates, et vos gardes déjà acceptées vous seront rappelés.':
      'Op die data bereikt u geen enkele aanvraag, en uw reeds aanvaarde oppasbeurten worden u in herinnering gebracht.',
    "Confirmé par SMS · communiqué à l'autre personne pendant une garde acceptée, et à elle seule":
      'Bevestigd via sms · enkel tijdens een aanvaarde oppasbeurt aan de andere persoon meegedeeld',
    "Emplacement réservé pour les vélos, près du comptoir. Quelqu'un est toujours en salle.":
      'Plek voorbehouden voor fietsen, bij de toog. Er is altijd iemand in de zaal.',
    Encore: 'Nog',
    'Le propriétaire pourra vous écrire via la messagerie interne. Vos coordonnées restent privées.':
      'De eigenaar kan u schrijven via de interne berichten. Uw contactgegevens blijven privé.',
    'Les coordonnées du propriétaire ne sont jamais publiques. Votre signalement lui parvient sans révéler votre identité.':
      'De contactgegevens van de eigenaar zijn nooit openbaar. Uw melding bereikt hem zonder uw identiteit prijs te geven.',
    'Nouveaux bike sitters dans': 'Nieuwe bike sitters in',
    "Où l'avez-vous vu ?": 'Waar hebt u hem gezien?',
    'Où sera placé votre vélo': 'Waar uw fiets komt te staan',
    "Pas encore assez d'avis pour une note":
      'Nog niet genoeg beoordelingen voor een score',
    'Près du comptoir': 'Bij de toog',
    "Un modérateur examine ce signalement. L'identité de l'auteur ne vous est pas communiquée.":
      'Een moderator bekijkt deze melding. De identiteit van de melder wordt u niet meegedeeld.',
    'Une seule fois': 'Eén enkele keer',
    'Vous concernant': 'Over u',
    'Vous proposez 2 emplacements, le maximum. Vous devez être présent pour accueillir : deux adresses actives en même temps ne sont pas tenables.':
      'U biedt 2 plekken aan, het maximum. U moet aanwezig zijn om op te vangen: twee actieve adressen tegelijk zijn niet houdbaar.',
    'a prévu de venir dans moins de 2 heures. Il sera prévenu immédiatement et verra les emplacements encore libres sur son créneau. Le désistement est enregistré.':
      'komt binnen minder dan 2 uur. Hij wordt onmiddellijk verwittigd en ziet de plekken die nog vrij zijn in zijn tijdslot. De afzegging wordt genoteerd.',
    'avant le jalon des': 'tot de mijlpaal van',
    'du parvis de Saint-Gilles': 'van het Sint-Gillisvoorplein',
    'garde en cours. Terminez-le avant de supprimer votre compte.':
      'oppasbeurt bezig. Rond ze af voor u uw account verwijdert.',
    'Émis par vous': 'Door u ingediend',
    Clos: 'Afgesloten',
    "En cours d'examen": 'In onderzoek',
    'Faux profil': 'Vals profiel',
    Harcèlement: 'Intimidatie',
    "Hors périmètre du MVP 1. Les déclarations existantes sont conservées, seul l'accès est fermé.":
      'Buiten het bereik van MVP 1. Bestaande aangiften blijven bewaard, enkel de toegang is gesloten.',
    'Lieu non sûr': 'Onveilige plek',
    'Messages insistants après un refus.':
      'Aandringende berichten na een weigering.',
    Ouvert: 'Open',
    'Photos trompeuses': "Misleidende foto's",
    Traiter: 'Behandelen',
  },
  en: {
    ' de la Place Flagey': ' from Place Flagey',
    ' demande à traiter': ' request to handle',
    ' demandes à traiter': ' requests to handle',
    ' emplacement': ' spot',
    ' emplacements': ' spots',
    ' garde en cours': ' stay in progress',
    ' garde terminée': ' completed stay',
    ' gardes': ' stays',
    ' gardes terminées': ' completed stays',
    ' heures': ' hours',
    ' jour': ' day',
    ' jours': ' days',
    ' minutes': ' minutes',
    ' mois': ' months',
    ' place libre': ' place free',
    ' places libres': ' places free',
    ' vélo': ' bike',
    ' vélo confié': ' bike entrusted',
    ' vélos': ' bikes',
    ' vélos accueillis': ' bikes hosted',
    ' vélos confiés': ' bikes entrusted',
    'Absence imprévue': 'Unexpected absence',
    'Accès au réseau': 'Network access',
    'Annonce en double': 'Duplicate listing',
    'Après-midi': 'Afternoon',
    'Aucun avis donné.': 'No review given.',
    'Aucun vélo enregistré.': 'No bike registered.',
    'Aucune déclaration.': 'No declaration.',
    'Balcon ou loggia': 'Balcony or loggia',
    "C'est vraiment gratuit ?": 'Is it really free?',
    'Chez ': 'At ',
    "Comment ça s'est passé ?": 'How did it go?',
    'Demande et garde': 'Request and sitting',
    'Demande introuvable.': 'Request not found.',
    'Devant un commerce': 'Outside a shop',
    "Disponibilités d'un emplacement": 'Availability of a spot',
    'Détail et déroulé': 'Detail and timeline',
    'Emplacement partagé': 'Shared spot',
    Enfant: 'Child',
    "Entièrement à l'intérieur": 'Entirely indoors',
    'Envoyer la proposition': 'Send the proposal',
    'Envoyer le lien': 'Send the link',
    'Envoyer le signalement': 'Send the report',
    'Erreur dans ma demande': 'Mistake in my request',
    'Fermé à clé': 'Locked',
    'Fiche emplacement': 'Spot details',
    'Formulaire de demande': 'Request form',
    Garde: 'Bike-sitting',
    'Gare ou station': 'Station or stop',
    'Gonflage des pneus': 'Tyre inflation',
    Gravel: 'Gravel',
    'Inscription et connexion': 'Sign-up and sign-in',
    'Intérieur du logement': 'Inside the home',
    "Je n'ai pas d'invitation": 'I have no invitation',
    'Je ne sais pas': "I don't know",
    'Journal des actions': 'Action log',
    Longtail: 'Longtail',
    'Membre depuis ': 'Member since ',
    'Modifier un emplacement': 'Edit a spot',
    'Non acceptés :': 'Not accepted:',
    'Où le vélo était-il ?': 'Where was the bike?',
    Pliant: 'Folding',
    Route: 'Road',
    'Serrure et clé': 'Lock and key',
    "Statistiques d'un emplacement": 'Statistics of a spot',
    Tandem: 'Tandem',
    VTC: 'Hybrid',
    VTT: 'MTB',
    Ville: 'City',
    'Vélo de ': 'Bike of ',
    'Vélos acceptés :': 'Bikes accepted:',
    'expire dans ': 'expires in ',
    'sur votre créneau': 'for your time slot',
    Électrique: 'Electric',
    'à environ ': 'about ',
    ": c'est en le saisissant qu'il confirme la remise, et vous gardez la trace de ce que vous lui avez confié.":
      ': by entering it they confirm the handover, and you keep a record of what you entrusted.',
    "Certaines pages n'ont de contenu qu'après avoir créé une demande. Faites d'abord le parcours, puis revenez ici.":
      'Some pages only show content once you have created a request. Do the journey first, then come back.',
    "Il sera examiné par un modérateur avec l'historique complet.":
      'A moderator will review it with the full history.',
    'La suppression est définitive. Vos emplacements sont retirés, vos avis anonymisés, vos conversations effacées.':
      'Deletion is final. Your spots are withdrawn, your reviews anonymised, your conversations erased.',
    "Le numéro de cadre est chiffré et n'est jamais affiché publiquement. Il sert uniquement en cas de vol.":
      'The frame number is encrypted and never shown publicly. It is used only in case of theft.',
    'Le vocabulaire partagé — navigation, statuts, actions du cycle de garde — est traduit ; le reste suit.':
      'The shared vocabulary — navigation, statuses, sitting-cycle actions — is translated; the rest follows.',
    'Les autres membres voient «': 'Other members see «',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation.":
      'Spots are shown as an approximate area. The exact address is given after acceptance.',
    "Les notifications internes liées à une garde en cours ne peuvent pas être désactivées : quelqu'un attend une réponse.":
      'Internal notifications about an ongoing stay cannot be switched off: someone is waiting for an answer.',
    'Les notifications reçues pendant cette plage ne sonnent pas : elles vous sont présentées à la fin de la plage.':
      'Notifications received in this window make no sound: they are shown at the end of the window.',
    "Réponse sous 24 heures en semaine. En cas de danger immédiat, appelez les secours : nous ne sommes pas un service d'urgence.":
      'Answer within 24 hours on weekdays. In case of immediate danger, call the emergency services: we are not an emergency service.',
    'Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent tout le reste.':
      'If you can host a bike, say so: bike sitters are what sets everything else going.',
    'Tous ces emplacements sont privés. Un local collectif, une cave commune ou une partie commune ne sont jamais acceptés.':
      'All these spots are private. A shared room, a common cellar or a communal area are never accepted.',
    'Votre avis reste invisible tant que': 'Your review stays hidden until',
    "Votre document est supprimé dès la validation, et au plus tard après sept jours. Ni l'image ni le numéro ne sont conservés.":
      'Your document is deleted as soon as validation is done, and within seven days at the latest. Neither the image nor the number is kept.',
    'Votre signalement concerne': 'Your report concerns',
    "Votre signalement concerne cette annonce. Il sera examiné par un modérateur avec l'historique complet.":
      'Your report concerns this listing. A moderator will review it with the full history.',
    'Vous remettez le vélo. Lisez ce code à voix haute à':
      'You hand over the bike. Read this code aloud to',
    "avait bloqué sa place pour vous. Il sera prévenu immédiatement, et l'annulation est enregistrée sur la garde — pas sur votre profil.":
      'had kept a place for you. They will be told immediately, and the cancellation is recorded on the stay — not on your profile.',
    'fait partie de ce que nous avons vérifié. Un modérateur lira votre demande. Si elle est acceptée, votre identité devra être vérifiée à nouveau.':
      'is part of what we verified. A moderator will read your request. If it is accepted, your identity will have to be verified again.',
    "n'a pas déposé le sien. Publication automatique après sept jours.":
      'has not left theirs. Automatic publication after seven days.',
    'vous remet le vélo et voit un code à quatre chiffres sur son écran. Demandez-le-lui et saisissez-le.':
      'hands you the bike and sees a four-digit code on their screen. Ask for it and enter it.',
    "». Votre nom complet et votre e-mail ne sont visibles par personne. Votre numéro de téléphone est communiqué à l'autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.":
      '». Your full name and email are visible to nobody. Your phone number is shared with the other person during an accepted stay, and with them alone: it disappears at closing.',
    "Accessible sans vérification d'identité. Votre fiche sera publique, vos coordonnées ne le seront pas.":
      'Available without identity verification. Your listing will be public, your contact details will not.',
    'Chaque filtre écarte des emplacements. Sans filtre, vous voyez tout ce qui est libre sur votre créneau.':
      'Each filter rules out spots. With no filter, you see everything free in your time slot.',
    "Description — le lieu, l'accès, et ce que vous proposez":
      'Description — the place, the access, and what you offer',
    "La personne signalée n'est pas informée de votre identité.":
      'The person reported is not told who you are.',
    "La vérification d'identité est obligatoire pour publier un emplacement et pour demander une garde. Pas pour déclarer un vol.":
      'Identity verification is required to publish a spot and to request bike-sitting. Not to report a theft.',
    "Le numéro de cadre est chiffré et n'est jamais affiché publiquement. Il sert uniquement en cas de déclaration de vol.":
      'The frame number is encrypted and never shown publicly. It is used only when a theft is reported.',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation d'une demande.":
      'Spots are shown as an approximate area. The exact address is given once a request is accepted.',
    'Les notifications reçues pendant cette plage ne sonnent pas : elles vous sont présentées à la fin de la plage de silence.':
      'Notifications received in this window make no sound: they are shown to you at the end of the quiet period.',
    "Modifier l'emplacement": 'Edit the spot',
    'Problème avec une garde': 'Problem with a sitting',
    "Renseigné, pas encore vérifié · communiqué à l'autre personne pendant une garde acceptée, et à elle seule.":
      'Provided, not yet verified · shared only with the other person during an accepted stay.',
    'Votre avis sur': 'Your review of',
    'Votre fiche indiquera : non acceptés —':
      'Your listing will say: not accepted —',
    'Votre identité reste vérifiée ; le nouveau lieu repasse en validation.':
      'Your identity stays verified; the new place goes back for validation.',
    "Votre pièce d'identité": 'Your ID document',
    'Vous seriez plutôt': 'You would rather be',
    'demande en attente de réponse. Répondez-y ou laissez-la expirer avant de supprimer votre compte.':
      'request awaiting an answer. Answer it or let it expire before deleting your account.',
    'demande en attente de votre réponse': 'request awaiting your answer',
    'garde déjà confirmé sur cet emplacement. Vos modifications ne les annulent pas.':
      'sitting already confirmed on this spot. Your changes do not cancel it.',
    'gardes en cours. Terminez-les avant de supprimer votre compte.':
      'stays in progress. Finish them before deleting your account.',
    'ne demande aucune contribution.': 'asks for no contribution.',
    'Ce prénom figure sur la pièce que nous avons vérifiée. Pour le changer, demandez-le en expliquant pourquoi.':
      'This first name is on the document we checked. To change it, ask and explain why.',
    "Données d'essai — le réseau n'est pas encore ouvert.":
      'Test data — the network is not open yet.',
    'Encore 15 avant le jalon des 50': '15 more to the 50 milestone',
    'La journée entière': 'The whole day',
    'Le catalogue': 'The catalogue',
    "Le numéro de cadre est chiffré et n'est jamais affiché.":
      'The frame number is encrypted and never shown.',
    "Le réseau ouvre quartier par quartier. On y entre aujourd'hui sur invitation d'un membre.":
      "The network opens neighbourhood by neighbourhood. Today you join on a member's invitation.",
    'Les deux': 'Both',
    'Modifier la recherche': 'Change the search',
    Modèle: 'Model',
    'Où les vélos sont gardés': 'Where the bikes are kept',
    'Publier la déclaration': 'Publish the report',
    "Recto de la carte d'identité": 'Front of the ID card',
    'Rejoindre le réseau': 'Join the network',
    'Toutes les pages': 'All pages',
    "Trois langues au lancement : français, néerlandais et anglais. Bruxelles est bilingue, et l'anglais couvre les résidents internationaux et les personnes de passage. Le vocabulaire partagé — navigation, statuts, actions du cycle de garde — est traduit ; le reste suit.":
      'Three languages at launch: French, Dutch and English. Brussels is bilingual, and English covers international residents and people passing through. The shared vocabulary — navigation, statuses, sitting-cycle actions — is translated; the rest follows.',
    'Votre adresse': 'Your address',
    'Votre e-mail': 'Your email',
    'Votre message': 'Your message',
    'Votre quartier': 'Your neighbourhood',
    'Vélo reçu': 'Bike received',
    'Vélo à confier': 'Bike to entrust',
    '[Votre prénom]': '[Your first name]',
    'le mien': 'mine',
    'libres sur le même créneau': 'free in the same slot',
    'non acceptés —': 'not accepted —',
    "s'est désisté pour le": 'withdrew for',
    'vol déclaré sur la période': 'theft reported in the period',
    "Aucune pièce d'identité n'apparaît dans l'export : elle n'est pas conservée.":
      'No ID document appears in the export: it is not kept.',
    'Avec remorque': 'With trailer',
    'Carte des vols': 'Theft map',
    "Certaines pages n'ont de contenu qu'après avoir créé une demande. Faites d'abord le parcours, puis revenez ici pour les voir peuplées.":
      'Some pages only show content once a request exists. Do the journey first, then come back to see them filled.',
    'Galerie des vélos volés': 'Gallery of stolen bikes',
    "Il sera examiné par un modérateur avec l'historique de la garde.":
      "A moderator will review it with the stay's history.",
    "La vérification d'identité est obligatoire pour publier un emplacement et pour demander une garde. Pas pour déclarer un vol ni pour signaler une observation.":
      'Identity verification is required to publish a spot and to request bike-sitting. Not to report a theft or a sighting.',
    "Le numéro de cadre est chiffré et n'est jamais affiché publiquement. Il sert uniquement à retrouver un vélo déclaré volé.":
      'The frame number is encrypted and never shown publicly. It serves only to recover a bike reported stolen.',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation, et à la seule personne concernée.":
      'Spots are shown as an approximate area. The exact address is given after acceptance, and only to the person concerned.',
    'Les notifications internes liées à une garde en cours ne peuvent pas être désactivées : elles concernent un vélo confié.':
      'Internal notifications about an ongoing stay cannot be switched off: they concern an entrusted bike.',
    "Ne s'est pas présenté": 'Did not show up',
    "Nouveau membre — la note s'affiche à partir de trois avis.":
      'New member — the score appears from three reviews onwards.',
    "Renseigné, pas encore vérifié · communiqué à l'autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.":
      'Provided, not yet verified · shared with the other person during an accepted stay, and them alone: it disappears at closing.',
    "Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent l'ouverture d'un quartier.":
      'If you can host a bike, say so: bike sitters are what opens a neighbourhood.',
    "Une conversation s'ouvre dès qu'une demande est acceptée, ou quand quelqu'un signale avoir vu un vélo volé.":
      'A conversation opens as soon as a request is accepted, or when someone reports seeing a stolen bike.',
    'Zone des vélos': 'Bike area',
    '— vous': '— you',
    "Certaines pages n'ont de contenu qu'après avoir créé une demande. Faites d'abord le parcours : Explorer → un emplacement → Demander.":
      'Some pages only show content once a request exists. Do the journey first: Explore → a spot → Request.',
    "Il sera examiné par un modérateur avec l'historique de la garde concerné.":
      'A moderator will review it with the history of the stay concerned.',
    "La vérification d'identité est obligatoire pour publier un emplacement et pour demander une garde. Elle n'est pas requise pour déclarer un vol.":
      'Identity verification is required to publish a spot and to request bike-sitting. It is not required to report a theft.',
    "Les emplacements sont affichés en zone approximative. L'adresse exacte est communiquée après acceptation de votre demande.":
      'Spots are shown as an approximate area. The exact address is given once your request is accepted.',
    'Les notifications internes liées à une garde en cours ne peuvent pas être désactivées : elles portent les actions attendues de vous.':
      'Internal notifications about an ongoing stay cannot be switched off: they carry the actions expected of you.',
    'Les notifications reçues pendant cette plage ne sonnent pas : elles vous sont présentées à':
      'Notifications received in this window make no sound: they are shown to you at',
    'Où sont vos données': 'Where your data lives',
    "Renseigné, pas encore vérifié · communiqué à l'autre personne pendant une garde acceptée, et à elle seule":
      'Provided, not yet verified · shared with the other person during an accepted stay, and them alone',
    "Rien n'est perdu.": 'Nothing is lost.',
    "Si vous pouvez accueillir un vélo, dites-le : ce sont les bike sitters qui déclenchent l'ouverture d'un quartier, pas les cyclistes.":
      'If you can host a bike, say so: bike sitters open a neighbourhood, not cyclists.',
    'Tous ces emplacements sont privés. Un local collectif, une cave commune ou une partie commune ne peuvent pas être proposés.':
      'All these spots are private. A shared room, a common cellar or a communal area cannot be offered.',
    "Trois langues au lancement : français, néerlandais et anglais. Bruxelles est bilingue, et l'anglais couvre les résidents internationaux et les personnes de passage. Le vocabulaire partagé — navigation, statuts, actions du cycle de vie — est traduit dans le prototype ; le contenu éditorial reste en français.":
      'Three languages at launch: French, Dutch and English. Brussels is bilingual, and English covers international residents and people passing through. The shared vocabulary — navigation, statuses, lifecycle actions — is translated in the prototype; editorial content stays in French.',
    "Une conversation s'ouvre dès qu'une demande est acceptée, ou quand quelqu'un signale avoir vu votre vélo.":
      'A conversation opens as soon as a request is accepted, or when someone reports seeing your bike.',
    "n'a pas déposé le sien. Publication automatique après 14 jours.":
      'has not left theirs. Automatic publication after 14 days.',
    ' m de ': ' m from ',
    ' sur ': ' of ',
    Demain: 'Tomorrow',
    Dim: 'Sun',
    Dimanche: 'Sunday',
    Disponible: 'Available',
    'En ligne': 'Online',
    'Hors ligne': 'Offline',
    Jeu: 'Thu',
    Jeudi: 'Thursday',
    Lun: 'Mon',
    Lundi: 'Monday',
    Mar: 'Tue',
    Mardi: 'Tuesday',
    Mer: 'Wed',
    Mercredi: 'Wednesday',
    Sam: 'Sat',
    Samedi: 'Saturday',
    Ven: 'Fri',
    Vendredi: 'Friday',
    août: 'August',
    "aujourd'hui": 'today',
    hier: 'yesterday',
    juillet: 'July',
    octobre: 'October',
    septembre: 'September',
    'vu il y a': 'seen',
    "à l'instant": 'just now',
    'Ajouter une photo': 'Add a photo',
    Aucune: 'No',
    'Aucune conversation.': 'No conversations.',
    'Aucune notification.': 'No notifications.',
    'Bonjour Thomas, je passe la journée en centre-ville':
      "Hello Thomas, I'm spending the day in the city centre",
    "Ce canal reste ouvert quoi qu'il arrive : compte suspendu, litige en cours, ou simple question.":
      'This channel stays open whatever happens: suspended account, ongoing dispute, or a simple question.',
    'Ce champ': 'This field',
    'Ce profil': 'This profile',
    Cette: 'This',
    'Cette déclaration': 'This report',
    'Cette offre': 'This offer',
    'Cherchez un': 'Look for a',
    'Comment était-il attaché ?': 'How was it locked?',
    Dernière: 'Latest',
    'Dois-je vérifier mon identité ?': 'Do I have to verify my identity?',
    'Espérons que ça dure.': "Let's hope it lasts.",
    "Fiche d'une offre": 'Offer details',
    'Gare du Midi': 'Brussels-South',
    'Hoe vind je een gestolen fiets terug?':
      'How do you recover a stolen bike?',
    'Jour de la récupération': 'Pick-up day',
    'Jour du dépôt': 'Drop-off day',
    "L'horaire actuel reste valable tant que":
      'The current time stays valid until',
    'Nous joindre': 'Contact us',
    'Pas de fermeture': 'No closure',
    'Pourquoi ce changement ?': 'Why this change?',
    'Signaler une observation': 'Report a sighting',
    'Une autre solution': 'Another option',
    'Uw melding gaat over cette annonce.': 'Your report concerns this listing.',
    'il y a 1 minute': '1 minute ago',
    "mis à l'abri ce mois-ci": 'kept safe this month',
    "n'a pas répondu. Rien ne change avant son accord.":
      'has not answered. Nothing changes before their agreement.',
    "par l'ensemble du réseau": 'by the whole network',
    'pour commencer.': 'to get started.',
    "pour l'instant.": 'for now.',
    'Date du vol': 'Date of the theft',
    'Deux heures': 'Two hours',
    'Pièce dédiée': 'Dedicated room',
    'Une demi-journée': 'Half a day',
    'Une heure': 'One hour',
    'Une journée': 'One day',
    'Vos droits': 'Your rights',
    'cette annonce': 'this listing',
    'et la': 'and the',
    Administration: 'Administration',
    'Messagerie et alertes': 'Messages and alerts',
    'Mot de passe': 'Password',
    'Mot de passe oublié': 'Forgotten password',
    'Profil et réglages': 'Profile and settings',
    Recherche: 'Search',
    'Recherche et': 'Search and',
    'Site public': 'Public site',
    'Vélos volés — module désactivé': 'Stolen bikes — module disabled',
    'Laisser un avis': 'Leave a review',
    Motif: 'Reason',
    "Motif d'annulation": 'Reason for cancelling',
    'Motif de refus': 'Reason for refusal',
    Accepter: 'Accept',
    Ajouter: 'Add',
    Appeler: 'Call',
    Confirmer: 'Confirm',
    Copier: 'Copy',
    Demander: 'Request',
    Enregistrer: 'Save',
    Envoyer: 'Send',
    Fermer: 'Close',
    Filtrer: 'Filter',
    Modifier: 'Edit',
    Précédent: 'Previous',
    Publier: 'Publish',
    Rechercher: 'Search',
    Refuser: 'Refuse',
    Retour: 'Back',
    Répondre: 'Reply',
    Signaler: 'Report',
    Suivant: 'Next',
    Supprimer: 'Delete',
    Terminer: 'Finish',
    Valider: 'Confirm',
    Voir: 'View',
    'Abri de jardin ou remise': 'Garden shed or outbuilding',
    Annulée: 'Cancelled',
    Annulées: 'Cancelled',
    'Autre espace privé': 'Other private space',
    'Box de garage individuel': 'Individual garage box',
    Brouillon: 'Draft',
    'Cave privative': 'Private cellar',
    'Cour privée': 'Private courtyard',
    'Débarras ou cellier': 'Storage room or pantry',
    'En attente': 'Pending',
    'En cours': 'In progress',
    'En pause': 'Paused',
    'En validation': 'Under review',
    Expirée: 'Expired',
    Expirées: 'Expired',
    'Garage privé fermé': 'Locked private garage',
    Introuvable: 'Not found',
    'Jardin privé clôturé': 'Enclosed private garden',
    'Litige en cours': 'Dispute in progress',
    'Local privatif': 'Private room',
    Publié: 'Published',
    Refusée: 'Refused',
    Refusées: 'Refused',
    Suspendu: 'Suspended',
    Terminé: 'Completed',
    Terminées: 'Completed',
    Terminés: 'Completed',
    'Terrasse privée': 'Private terrace',
    'Véranda fermée': 'Enclosed veranda',
    "moins d'1 km": 'under 1 km',
    'À traiter': 'To handle',
    'Demande acceptée': 'Request accepted',
    'Demande annulée': 'Request cancelled',
    'Demande en attente': 'Request pending',
    'Demande expirée': 'Request expired',
    'Demande refusée': 'Request refused',
    'Garde annulée': 'Stay cancelled',
    'Garde confirmée': 'Stay confirmed',
    'Garde en cours': 'Stay in progress',
    'Garde terminée': 'Stay completed',
    "Liste d'attente": 'Waiting list',
    'Activité interne. Ces chiffres ne sont jamais affichés aux membres et ne constituent pas un classement.':
      'Internal activity. These figures are never shown to members and do not form a ranking.',
    'Aucun bon pour le moment.': 'No voucher for now.',
    'Aucun message. Envoyez-en un depuis la page Contact du site public.':
      'No message. Send one from the Contact page of the public site.',
    'Autoriser les contributions': 'Allow contributions',
    "Ce qui a été vérifié ne se modifie pas seul. Accepter un changement de prénom annule la vérification d'identité : elle devra être refaite.":
      'What has been verified is not changed on your own. Accepting a first-name change cancels identity verification: it will have to be redone.',
    "Ces avantages remercient les personnes qui accueillent des vélos chez elles. Ils ne s'achètent pas.":
      'These benefits thank the people who host bikes at home. They cannot be bought.',
    'Déclaration, carte et galerie sont accessibles, sans compte.':
      'Report, map and gallery are accessible, without an account.',
    'Délai visé : 24 heures ouvrées. Le document est supprimé dès la décision, et au plus tard après sept jours. Approuver active le compte et prévient le parrain.':
      'Target delay: 24 working hours. The document is deleted as soon as the decision is made, and within seven days at the latest. Approving activates the account and tells the sponsor.',
    'Elle dit où ouvrir le prochain quartier. Ce sont les bike sitters en attente qui comptent, pas les cyclistes.':
      'It tells us where to open the next neighbourhood. It is the waiting bike sitters who count, not the cyclists.',
    "Fermée pendant la bêta : l'entrée se fait sur invitation, avec une pièce d'identité regardée par un humain. Le numéro reste obligatoire, simplement marqué « renseigné » plutôt que « vérifié ».":
      'Closed during the beta: entry is by invitation, with an ID document looked at by a human. The number stays required, simply marked "provided" rather than "verified".',
    "Fermés pendant la bêta. Les lignes continuent d'être écrites à chaque garde close : le jour où on les ouvre, l'historique est déjà là.":
      'Closed during the beta. The lines keep being written at each closed stay: the day we open them, the history is already there.',
    "Il ne s'ouvre que lorsque des commerçants se sont engagés. Chaque offre annonce son stock ; à zéro, on rappelle le partenaire.":
      'It only opens once shops have committed. Each offer states its stock; at zero, we call the partner back.',
    'Inscrire une trace': 'Record a trace',
    "L'emplacement semble partagé avec d'autres locataires.":
      'The spot appears to be shared with other tenants.',
    "L'ouverture ne supprime rien d'autre : la vérification d'identité, la validation humaine et les invitations restent en place. Seule la condition d'entrée change.":
      'Opening up removes nothing else: identity verification, human validation and invitations stay in place. Only the entry condition changes.',
    'La phase fermée sert à densifier quartier par quartier. Elle se lève quand le réseau tient debout — pas à une date, mais sur des critères.':
      'The closed phase serves to build density neighbourhood by neighbourhood. It lifts when the network stands on its own — not on a date, but on criteria.',
    'Le Comptoir': 'Le Comptoir',
    "Le lancement ne propose que des gardes ponctuelles. Le mécanisme de série reste en place — rien n'est supprimé, seul l'affichage disparaît.":
      'The launch offers one-off stays only. The series mechanism stays in place — nothing is removed, only the display disappears.',
    'Le réseau est entièrement gratuit. Les montants déjà saisis sont ignorés, pas effacés.':
      'The network is entirely free. Amounts already entered are ignored, not erased.',
    "Non modifiable. Chaque action d'administration y est inscrite.":
      'Not editable. Every administration action is recorded there.',
    'Ouvrir le réseau': 'Open the network',
    "Personne pour l'instant. Inscrivez-vous depuis la page publique pour tester.":
      'Nobody for now. Sign up from the public page to test.',
    'Soumis le': 'Submitted on',
    'Aucun créneau libre ce jour-là. Essayez une autre date.':
      'No free slot that day. Try another date.',
    'Aucune demande ne vous parviendra sur ces dates, et vos gardes déjà acceptées vous seront rappelés.':
      'No request will reach you on those dates, and your already accepted stays will be recalled to you.',
    "Confirmé par SMS · communiqué à l'autre personne pendant une garde acceptée, et à elle seule":
      'Confirmed by SMS · shared with the other person during an accepted stay, and them alone',
    "Emplacement réservé pour les vélos, près du comptoir. Quelqu'un est toujours en salle.":
      'Space reserved for bikes, near the counter. Someone is always in the room.',
    Encore: 'Still',
    'Le propriétaire pourra vous écrire via la messagerie interne. Vos coordonnées restent privées.':
      'The owner can write to you through internal messaging. Your contact details stay private.',
    'Les coordonnées du propriétaire ne sont jamais publiques. Votre signalement lui parvient sans révéler votre identité.':
      "The owner's contact details are never public. Your report reaches them without revealing your identity.",
    'Nouveaux bike sitters dans': 'New bike sitters in',
    "Où l'avez-vous vu ?": 'Where did you see it?',
    'Où sera placé votre vélo': 'Where your bike will be placed',
    "Pas encore assez d'avis pour une note":
      'Not enough reviews yet for a score',
    'Près du comptoir': 'Near the counter',
    "Un modérateur examine ce signalement. L'identité de l'auteur ne vous est pas communiquée.":
      "A moderator is reviewing this report. The reporter's identity is not disclosed to you.",
    'Une seule fois': 'Just once',
    'Vous concernant': 'About you',
    'Vous proposez 2 emplacements, le maximum. Vous devez être présent pour accueillir : deux adresses actives en même temps ne sont pas tenables.':
      'You are offering 2 spots, the maximum. You must be there to host: two active addresses at once is not workable.',
    'a prévu de venir dans moins de 2 heures. Il sera prévenu immédiatement et verra les emplacements encore libres sur son créneau. Le désistement est enregistré.':
      'is due within less than 2 hours. They will be told immediately and will see the spots still free in their slot. The withdrawal is recorded.',
    'avant le jalon des': 'to the milestone of',
    'du parvis de Saint-Gilles': 'from Parvis de Saint-Gilles',
    'garde en cours. Terminez-le avant de supprimer votre compte.':
      'stay in progress. Finish it before deleting your account.',
    'Émis par vous': 'Filed by you',
    Clos: 'Closed',
    "En cours d'examen": 'Under review',
    'Faux profil': 'Fake profile',
    Harcèlement: 'Harassment',
    "Hors périmètre du MVP 1. Les déclarations existantes sont conservées, seul l'accès est fermé.":
      'Outside the scope of MVP 1. Existing reports are kept, only access is closed.',
    'Lieu non sûr': 'Unsafe place',
    'Messages insistants après un refus.':
      'Insistent messages after a refusal.',
    Ouvert: 'Open',
    'Photos trompeuses': 'Misleading photos',
    Traiter: 'Handle',
  },
};

export const PHRASES: Record<'nl' | 'en', Record<string, string>> = {
  nl: {
    'Abri de jardin ou remise': 'Tuinhuis of berging',
    Acceptée: 'Aanvaard',
    Acceptées: 'Aanvaard',
    Accueil: 'Start',
    'Accueil chaleureux, garage vraiment sécurisé, explications claires.':
      'Hartelijk onthaal, echt beveiligde garage, duidelijke uitleg.',
    'Accueille souvent': 'Vangt vaak op',
    'Accès et services': 'Toegang en diensten',
    Actif: 'Actief',
    Activité: 'Activiteit',
    Actuellement: 'Momenteel',
    Adresse: 'Adres',
    "Adresse de l'emplacement": 'Adres van de plek',
    'Adresse exacte': 'Exact adres',
    'Ajouter un emplacement': 'Een plek toevoegen',
    'Ajouter un vélo': 'Een fiets toevoegen',
    'Ajouter une photo': 'Een foto toevoegen',
    'Ajoutez deux photos du vélo.': "Voeg twee foto's van de fiets toe.",
    "Ajoutez votre emplacement à ce profil. Rien d'autre à créer : c'est le même compte.":
      'Voeg uw plek toe aan dit profiel. Verder niets aan te maken: het is hetzelfde account.',
    Alarme: 'Alarm',
    'Ancrage au sol': 'Verankering in de vloer',
    'Ancrage mural': 'Muurverankering',
    Annuler: 'Annuleren',
    'Arceau ou barre fixe': 'Beugel of vaste stang',
    'Arrivée signalée': 'Aankomst gemeld',
    Ascenseur: 'Lift',
    Association: 'Vereniging',
    Atelier: 'Werkplaats',
    'Aucun compte bloqué.': 'Geen geblokkeerde accounts.',
    'Aucun signalement.': 'Geen meldingen.',
    'Aucun échange.': 'Geen gesprekken.',
    'Aucune alerte.': 'Geen meldingen.',
    'Aucune modification': 'Geen wijziging',
    Autre: 'Andere',
    'Autre espace privé': 'Andere privéruimte',
    'Autre système': 'Ander systeem',
    'Avec remorque': 'Met aanhangwagen',
    Avis: 'Beoordelingen',
    'Avis reçus': 'Ontvangen beoordelingen',
    'Batterie inquiétante — gonflée, chaude ou odorante':
      'Zorgwekkende batterij — gezwollen, warm of ruikend',
    'Bien reçu, le vélo est rangé au fond de la cour.':
      'Goed ontvangen, de fiets staat achteraan de koer.',
    'Bike Sitter vérifié': 'Bike sitter geverifieerd',
    "Bike Sitters met en relation des cyclistes et des habitants disposant d'un espace privé. La plateforme n'assure ni la garde ni le transport des vélos.":
      'Bike Sitters brengt fietsers in contact met bewoners die over een privéruimte beschikken. Het platform verzekert noch de oppasbeurt noch het vervoer van de fietsen.',
    Bloquer: 'Blokkeren',
    'Bon état, rien à signaler': 'Goede staat, niets te melden',
    "Bonjour ! C'est noté pour cet après-midi.":
      'Hallo! Genoteerd voor vanmiddag.',
    'Bouton de test du prototype, pour voir ce que la règle bloque réellement.':
      'Testknop van het prototype, om te zien wat de regel echt tegenhoudt.',
    'Box de garage individuel': 'Individuele garagebox',
    "C'est votre propre emplacement.": 'Dit is uw eigen plek.',
    'Caméra de surveillance': 'Oppasbeurtscamera',
    Capacité: 'Capaciteit',
    'Capacité et vélos': 'Capaciteit en fietsen',
    Cargo: 'Bakfiets',
    Carte: 'Kaart',
    'Cave privative': 'Privékelder',
    'Ce constat protège les deux parties. Il est horodaté, visible par vous deux, et ne peut plus être modifié une fois validé.':
      'Deze vaststelling beschermt beide partijen. Ze krijgt een tijdstempel, is voor u beiden zichtbaar, en kan na bevestiging niet meer worden gewijzigd.',
    'Ce que nos badges veulent dire': 'Wat onze badges betekenen',
    'Ce que vous contestez': 'Wat u betwist',
    "Ce qui est conservé malgré la suppression : les traces de modération et le journal des actions d'administration, pour des raisons légales.":
      'Wat ondanks de verwijdering bewaard blijft: de moderatiesporen en het logboek van de beheersacties, om juridische redenen.',
    'Ce rythme indique la fréquence à laquelle cette personne souhaite recevoir des demandes ponctuelles.':
      'Dit ritme geeft aan hoe vaak deze persoon losse aanvragen wil ontvangen.',
    'Cette garde ne vous concerne pas.': 'Deze oppasbeurt gaat u niet aan.',
    "Chaque bike sitter indique les types qu'il peut accueillir, du vélo de ville au cargo.":
      'Elke bike sitter geeft aan welke types hij kan opvangen, van stadsfiets tot bakfiets.',
    'Chaque invitation est nominative, à usage unique, et expire au bout de 30 jours.':
      'Elke uitnodiging is op naam, eenmalig te gebruiken, en vervalt na 30 dagen.',
    'Chercher un bike sitter': 'Een bike sitter zoeken',
    Chez: 'Bij',
    'Chez moi': 'Bij mij',
    Choisi: 'Gekozen',
    'Choisir une date': 'Een datum kiezen',
    'Cliquez une date pour la fermer. Vos jours de fermeture habituels sont déjà grisés.':
      'Klik op een datum om die te sluiten. Uw gewone sluitingsdagen staan al in het grijs.',
    "Code d'invitation": 'Uitnodigingscode',
    'Code de remise': 'Overdrachtscode',
    'Code postal': 'Postcode',
    'Combien de temps puis-je laisser mon vélo ?':
      'Hoe lang mag ik mijn fiets achterlaten?',
    'Comment retrouver un vélo volé ?': 'Hoe vind je een gestolen fiets terug?',
    'Comment ça marche': 'Hoe het werkt',
    Commerce: 'Handelszaak',
    Communauté: 'Gemeenschap',
    Communication: 'Communicatie',
    'Complément (facultatif)': 'Aanvulling (optioneel)',
    'Comportement inapproprié': 'Ongepast gedrag',
    Compte: 'Account',
    'Comptes bloqués': 'Geblokkeerde accounts',
    'Conditions générales': 'Algemene voorwaarden',
    Confidentialité: 'Privacy',
    Confirmation: 'Bevestiging',
    'Confirmer la remise': 'De overdracht bevestigen',
    'Confirmé par lien': 'Bevestigd via link',
    'Connectez-vous': 'Meld u aan',
    Connexion: 'Aanmelden',
    'Constat au dépôt': 'Vaststelling bij afgifte',
    'Constat au retour': 'Vaststelling bij teruggave',
    Contact: 'Contact',
    Contester: 'Betwisten',
    'Contester un avis': 'Een beoordeling betwisten',
    Continuer: 'Doorgaan',
    'Continuer avec Apple': 'Doorgaan met Apple',
    'Continuer avec Google': 'Doorgaan met Google',
    Contribution: 'Bijdrage',
    'Contribution demandée': 'Gevraagde bijdrage',
    Conversation: 'Gesprek',
    Couleur: 'Kleur',
    'Cour privée': 'Privékoer',
    'Créer un compte': 'Een account aanmaken',
    'Créer votre compte': 'Maak uw account aan',
    "Créez-en une depuis une recherche sans résultat : vous serez prévenu dès qu'un emplacement ouvre.":
      'Maak er een aan vanuit een zoekopdracht zonder resultaat: u wordt verwittigd zodra er een plek opengaat.',
    "Créneau repris de votre recherche. Vous pouvez encore l'ajuster.":
      'Tijdslot overgenomen uit uw zoekopdracht. U kunt het nog aanpassen.',
    'Côté bike sitter': 'Kant van de bike sitter',
    'Côté cycliste': 'Kant van de fietser',
    'DEVENIR BIKE SITTER': 'BIKE SITTER WORDEN',
    'Date du dépôt': 'Datum van afgifte',
    'Date du retour': 'Datum van ophaling',
    'Demande envoyée': 'Aanvraag verstuurd',
    "Demander l'export": 'Export aanvragen',
    'Demander une garde': 'Een oppasbeurt aanvragen',
    'Demander une modification': 'Een wijziging aanvragen',
    Demandes: 'Aanvragen',
    'Demandes récentes': 'Recente aanvragen',
    'Devenir bike sitter': 'Bike sitter worden',
    'Disponibilité sur votre créneau': 'Beschikbaarheid in uw tijdslot',
    Disponibilités: 'Beschikbaarheid',
    Distance: 'Afstand',
    'Distance, vélo, sécurité…': 'Afstand, fiets, veiligheid…',
    'Donnez une note générale.': 'Geef een algemene score.',
    Dupliquer: 'Dupliceren',
    Durée: 'Duur',
    'Durée acceptée': 'Aanvaarde duur',
    "Durée d'accueil": 'Opvangduur',
    'Durée maximale acceptée': 'Maximale aanvaarde duur',
    'Débarras ou cellier': 'Berging of bijkeuken',
    'Déclarations de vol': 'Diefstalmeldingen',
    "Déclarez-le : votre fiche devient publique et n'importe qui peut signaler l'avoir aperçu.":
      'Geef het aan: uw fiche wordt openbaar en iedereen kan melden de fiets gezien te hebben.',
    'Défaut visible': 'Zichtbaar gebrek',
    'Délai habituel : moins de 24 heures. Vous serez notifié du résultat.':
      'Gebruikelijke termijn: minder dan 24 uur. U wordt op de hoogte gebracht.',
    Dépôt: 'Afgifte',
    'Dépôt à partir de': 'Afgifte vanaf',
    'Détail des notes': 'Detail van de scores',
    Détails: 'Details',
    "Détecteur d'ouverture": 'Openingsdetector',
    'Détecteur de mouvement': 'Bewegingsmelder',
    'E-mail': 'E-mail',
    'E-mail vérifié': 'E-mail geverifieerd',
    'Emplacements proposés': 'Aangeboden plekken',
    'Emplacements récents': 'Recente plekken',
    'En attente de réponse': 'Wacht op antwoord',
    'En continuant, vous acceptez les': 'Door verder te gaan aanvaardt u de',
    'Entrez une adresse e-mail valide.': 'Vul een geldig e-mailadres in.',
    'Entrez votre e-mail. Vous recevrez un lien pour définir un nouveau mot de passe.':
      'Vul uw e-mail in. U ontvangt een link om een nieuw wachtwoord in te stellen.',
    'Envoyer la demande': 'De aanvraag versturen',
    "Espace privé : cet emplacement n'est accessible ni au public, ni aux autres résidents de l'immeuble.":
      'Privéruimte: deze plek is niet toegankelijk voor het publiek, noch voor andere bewoners van het gebouw.',
    'Espace réservé à la modération.': 'Ruimte voorbehouden aan de moderatie.',
    Explorer: 'Verkennen',
    'Export complet et suppression de compte disponibles à tout moment depuis les paramètres.':
      'Volledige export en verwijdering van het account zijn op elk moment beschikbaar in de instellingen.',
    'Exporter mes données': 'Mijn gegevens exporteren',
    'Faire vivre le réseau compte aussi : sans demande, un emplacement libre ne sert à personne.':
      'Het netwerk levend houden telt ook: zonder aanvraag dient een vrije plek niemand.',
    'Fermetures exceptionnelles': 'Uitzonderlijke sluitingen',
    'Fréquence acceptée': 'Aanvaarde frequentie',
    'Garage fermé à clé au rez-de-chaussée. Le vélo est rangé contre le mur du fond, à côté des nôtres. Accès par la porte latérale.':
      'Afgesloten garage op het gelijkvloers. De fiets staat tegen de achtermuur, naast de onze. Toegang via de zijdeur.',
    'Garage privé fermé': 'Afgesloten privégarage',
    'Garde introuvable.': 'Oppasbeurt niet gevonden.',
    'Générer un nouveau code': 'Een nieuwe code aanmaken',
    'Heure du dépôt': 'Uur van afgifte',
    'Heure du retour': 'Uur van ophaling',
    "Hébergement dans l'Union européenne. Aucune donnée n'est transférée hors UE.":
      'Hosting binnen de Europese Unie. Geen enkel gegeven wordt buiten de EU overgebracht.',
    'Identité vérifiée': 'Identiteit geverifieerd',
    'Il a peut-être été supprimé, ou le lien est incomplet.':
      'Het is misschien verwijderd, of de link is onvolledig.',
    'Ils ont rejoint grâce à vous': 'Zij kwamen erbij dankzij u',
    "Indiquez l'état constaté.": 'Geef de vastgestelde staat op.',
    'Indiquez une adresse e-mail valide.': 'Geef een geldig e-mailadres op.',
    'Indiquez votre prénom.': 'Geef uw voornaam op.',
    'Inscrivez-vous': 'Schrijf u in',
    "Inviter quelqu'un": 'Iemand uitnodigen',
    "Inviter quelqu'un du même lieu": 'Iemand van dezelfde plek uitnodigen',
    "J'ai récupéré mon vélo": 'Ik heb mijn fiets opgehaald',
    "J'ai trouvé une autre solution": 'Ik heb een andere oplossing gevonden',
    'Je déclare être majeur. La bêta est réservée aux personnes de 18 ans ou plus.':
      'Ik verklaar meerderjarig te zijn. De bèta is voorbehouden aan personen van 18 jaar of ouder.',
    "Je n'en ai pas": 'Ik heb er geen',
    'Je passe devant trois arceaux vides chaque matin. Autant que mon garage serve à quelque chose.':
      'Ik fiets elke ochtend langs drie lege beugels. Laat mijn garage dan maar nuttig zijn.',
    "Jusqu'à 1 heure — le temps d'un café":
      'Tot 1 uur — de tijd van een koffie',
    "Jusqu'à 3 heures — un restaurant, un cinéma":
      'Tot 3 uur — een restaurant, een bioscoop',
    "Jusqu'à 8 heures — une journée de travail": 'Tot 8 uur — een werkdag',
    "L'adresse exacte de votre emplacement n'est lisible que par vous, par un cycliste dont vous avez accepté la demande, et par un administrateur.":
      'Het exacte adres van uw plek is enkel leesbaar voor uzelf, voor een fietser wiens aanvraag u hebt aanvaard, en voor een beheerder.',
    "L'emplacement": 'De plek',
    "L'emplacement n'est plus accessible": 'De plek is niet meer toegankelijk',
    "L'inscription demande une invitation.":
      'Inschrijven vereist een uitnodiging.',
    "La précision sert aux statistiques sur les zones à risque et aide quelqu'un à reconnaître votre vélo. La fiche publique affiche la rue, pas le numéro.":
      'De precisie dient voor statistieken over risicozones en helpt iemand uw fiets te herkennen. De openbare fiche toont de straat, niet het huisnummer.',
    "La vérification d'identité est obligatoire pour publier un emplacement et pour demander une garde.":
      'Identiteitsverificatie is verplicht om een plek te publiceren en om een oppasbeurt aan te vragen.',
    "Le bike sitter ne remettra le vélo qu'à la personne que vous désignez.":
      'De bike sitter geeft de fiets enkel terug aan de persoon die u aanduidt.',
    "Le bike sitter saura ce qu'il accueille.":
      'De bike sitter weet dan wat hij opvangt.',
    'Le catalogue remercie les gardes que vous avez rendues.':
      'De catalogus bedankt u voor de oppasbeurten die u hebt gedaan.',
    'Le créneau est convenu à la demande. Les gardes longues se discutent directement avec le bike sitter.':
      'Het tijdslot wordt per aanvraag afgesproken. Lange oppasbeurten bespreekt u rechtstreeks met de bike sitter.',
    'Le dépôt et la récupération doivent tomber dans ces heures. Entre les deux, le vélo reste sur place.':
      'Afgifte en ophaling moeten binnen deze uren vallen. Daartussen blijft de fiets ter plaatse.',
    'Le mot de passe doit faire au moins 8 caractères.':
      'Het wachtwoord moet minstens 8 tekens lang zijn.',
    'Le mot de passe fait au moins 8 caractères.':
      'Het wachtwoord telt minstens 8 tekens.',
    "Le réseau fonctionne entièrement gratuitement. Aucun bike sitter ne demande de contribution — c'est ce qui rend le service simple à expliquer et à rejoindre.":
      'Het netwerk werkt volledig gratis. Geen enkele bike sitter vraagt een bijdrage — dat maakt de dienst eenvoudig uit te leggen en om erbij te komen.',
    'Les autres membres voient': 'Andere leden zien',
    "Les bike sitters ne sont visibles qu'une fois connecté. C'est ce qui protège leur adresse et leur vie privée : ce réseau n'est pas un annuaire public.":
      'Bike sitters zijn pas zichtbaar wanneer u aangemeld bent. Dat beschermt hun adres en hun privéleven: dit netwerk is geen openbare gids.',
    'Les conditions générales détaillent la répartition. Chaque garde est horodaté et confirmé des deux côtés, ce qui donne une trace en cas de litige.':
      'De algemene voorwaarden beschrijven de verdeling. Elke oppasbeurt krijgt een tijdstempel en wordt langs beide kanten bevestigd, wat een spoor nalaat bij een geschil.',
    'Les demandes de garde sont ouvertes sur 7 jours.':
      'Oppasaanvragen staan 7 dagen open.',
    'Manoelle a publié un nouvel emplacement près de la Place Flagey.':
      'Manoelle heeft een nieuwe plek gepubliceerd bij het Flageyplein.',
    'Mes emplacements': 'Mijn plekken',
    'Mes invitations': 'Mijn uitnodigingen',
    'Mes signalements': 'Mijn meldingen',
    'Mes vérifications': 'Mijn verificaties',
    'Message (facultatif)': 'Bericht (optioneel)',
    Messages: 'Berichten',
    'Modifier mon profil': 'Mijn profiel bewerken',
    'Mon espace bike sitter': 'Mijn bike sitter-ruimte',
    'Ne pas me notifier la nuit': "Verwittig mij niet 's nachts",
    'Ne sont pas acceptés : local vélo collectif, hall ou couloir commun, cave commune, parking collectif ouvert, cour ou jardin collectif, autres parties communes. Une cave privative fermée ou un box individuel dans un immeuble, oui.':
      'Niet aanvaard: gemeenschappelijke fietsenberging, gedeelde hal of gang, gemeenschappelijke kelder, open collectieve parking, gedeelde koer of tuin, andere gemene delen. Een afgesloten privékelder of een individuele box in een gebouw, wel.',
    'Note générale': 'Algemene score',
    'Nous avons accueilli le vélo de Yanis pendant un mois, rangé avec les nôtres dans notre cour fermée. On se sent un peu grands-parents avec la garde du petit pendant les vacances.':
      'We hebben de fiets van Yanis een maand opgevangen, bij de onze in onze afgesloten koer. Het voelt een beetje als grootouders die tijdens de vakantie op de kleine passen.',
    "Nous ouvrons un quartier quand il y a assez de bike sitters pour qu'un cycliste y trouve une place à chaque fois. Votre inscription nous dit où ouvrir ensuite.":
      'We openen een buurt zodra er genoeg bike sitters zijn opdat een fietser er telkens een plek vindt. Uw inschrijving vertelt ons waar we daarna openen.',
    "Nouveau — aucune garde pour l'instant": 'Nieuw — nog geen oppasbeurt',
    Occasionnellement: 'Af en toe',
    'Oui, pour demander une garde comme pour publier un emplacement. Pas pour déclarer un vol.':
      'Ja, zowel om een oppasbeurt aan te vragen als om een plek te publiceren. Niet om een diefstal aan te geven.',
    "Oui. Les bike sitters ne sont pas rémunérés, c'est un réseau d'entraide.":
      'Ja. Bike sitters worden niet betaald, het is een netwerk van onderlinge hulp.',
    'Où souhaitez-vous stationner votre vélo ?':
      'Waar wilt u uw fiets achterlaten?',
    "Passage par l'intérieur du logement": 'Doorgang via de woning',
    'Petit outillage à disposition': 'Klein gereedschap beschikbaar',
    'Photos du vélo': "Foto's van de fiets",
    'Pièce vérifiée puis supprimée': 'Document gecontroleerd en daarna gewist',
    'Places restantes': 'Resterende plaatsen',
    'Plusieurs jours — ouvert par la modération':
      'Meerdere dagen — geopend door de moderatie',
    "Point d'ancrage": 'Verankeringspunt',
    'Ponctuel, très respectueux du lieu. À revoir avec plaisir.':
      'Stipt, erg respectvol voor de plek. Graag opnieuw.',
    Profil: 'Profiel',
    'Proposer mon emplacement': 'Mijn plek aanbieden',
    'Proposer un autre emplacement': 'Een andere plek voorstellen',
    'Proposer un autre horaire': 'Een ander tijdstip voorstellen',
    'Protection contre les intempéries': 'Bescherming tegen weer en wind',
    'Précision — à quelle hauteur ?': 'Precisie — op welke hoogte?',
    'Préférences de notification': 'Meldingsvoorkeuren',
    "Prévenez la veille — ne répond pas dans l'urgence":
      'Verwittig de dag ervoor — reageert niet in spoedgevallen',
    'Publier mon avis': 'Mijn beoordeling publiceren',
    'Qualité du lieu': 'Kwaliteit van de plek',
    "Quelqu'un d'autre viendra reprendre le vélo ?":
      'Komt iemand anders de fiets ophalen?',
    'Quels vélos sont acceptés ?': 'Welke fietsen worden aanvaard?',
    'Questions fréquentes': 'Veelgestelde vragen',
    'Qui est responsable en cas de vol chez le bike sitter ?':
      'Wie is aansprakelijk bij diefstal bij de bike sitter?',
    'Qui peut tenir cet emplacement': 'Wie deze plek mag beheren',
    'Rejoignez la communauté des bike sitters':
      'Word lid van de gemeenschap van bike sitters',
    'Remise du vélo': 'Overdracht van de fiets',
    'Restitution du vélo': 'Teruggave van de fiets',
    Retour: 'Ophaling',
    "Rythme d'accueil souhaité": 'Gewenst ontvangstritme',
    'Récupération confirmée': 'Ophaling bevestigd',
    'Répond dans la journée': 'Antwoordt binnen de dag',
    "Répond généralement dans l'heure": 'Antwoordt meestal binnen het uur',
    'Répond sous 24 heures': 'Antwoordt binnen 24 uur',
    'Se déconnecter': 'Afmelden',
    'Seules les deux personnes qui y participent peuvent le consulter.':
      'Enkel de twee betrokken personen kunnen het inkijken.',
    "Si vous pensez devoir y accéder, écrivez à l'association.":
      'Denkt u er toegang toe te moeten hebben, schrijf dan de vereniging aan.',
    'Signaler cette annonce': 'Deze plek melden',
    'Signaler un problème': 'Een probleem melden',
    'Signalez un membre ou une annonce depuis sa page.':
      'Meld een lid of een plek vanaf zijn pagina.',
    "Simuler : retirer ma vérification d'identité":
      'Simuleren: mijn identiteitsverificatie intrekken',
    "Souvent une question de place ou d'accès : un cargo ne passe pas par toutes les portes.":
      'Vaak een kwestie van plaats of toegang: een bakfiets raakt niet door elke deur.',
    'Supprimer mon compte': 'Mijn account verwijderen',
    "Sur la carte et dans les résultats, seule une zone approximative est affichée. L'adresse exacte n'est communiquée qu'après votre acceptation d'une demande.":
      'Op de kaart en in de resultaten wordt enkel een benaderende zone getoond. Het exacte adres wordt pas meegedeeld nadat u een aanvraag hebt aanvaard.',
    "Sur une seule journée, jusqu'à": 'Op één dag, tot',
    'Système électronique ou code': 'Elektronisch systeem of code',
    'Tout compte peut être suspendu en cas de manquement. Les actions de modération sont journalisées.':
      'Elk account kan bij een inbreuk worden geschorst. Moderatie-acties worden gelogd.',
    "Traces d'usage habituelles": 'Gewone gebruikssporen',
    "Trois essais par code, qui expire au bout de 6 heures. Si vous ne parvenez pas à l'obtenir, écrivez-vous : la remise peut attendre, un vélo mal remis non.":
      'Drie pogingen per code, die na 6 uur vervalt. Lukt het niet, schrijf elkaar dan: de overdracht kan wachten, een slecht overgedragen fiets niet.',
    "Trois langues au lancement : français, néerlandais et anglais. Bruxelles est bilingue, et l'anglais couvre les résidents internationaux et les personnes de passage.":
      'Drie talen bij de start: Frans, Nederlands en Engels. Brussel is tweetalig, en het Engels dekt internationale bewoners en mensen op doorreis.',
    'Trouvez où laisser votre vélo': 'Vind waar u uw fiets achterlaat',
    'Téléphone renseigné': 'Telefoon opgegeven',
    'Un bike sitter ouvre près de chez moi':
      'Een bike sitter opent bij mij in de buurt',
    'Un compte bloqué ne peut plus vous contacter, et ses emplacements disparaissent de vos résultats.':
      'Een geblokkeerd account kan u niet meer contacteren, en zijn plekken verdwijnen uit uw resultaten.',
    "Un compte unique par personne. Les vérifications d'e-mail, de téléphone et d'identité sont requises pour demander ou proposer une garde.":
      'Eén account per persoon. Verificatie van e-mail, telefoon en identiteit is vereist om een oppasbeurt aan te vragen of aan te bieden.',
    'Un garage fermé, une cave privative, une cour suffisent.':
      'Een afgesloten garage, een privékelder of een koer volstaat.',
    "Un garage, une cave, une cour fermée suffisent. Accueillir ne coûte rien, ne vous engage à rien, et votre adresse reste masquée tant que vous n'avez pas accepté une demande.":
      'Een garage, een kelder, een afgesloten koer volstaat. Opvangen kost niets, verplicht u tot niets, en uw adres blijft verborgen zolang u geen aanvraag hebt aanvaard.',
    'Un vélo est déclaré volé près de chez moi':
      'Een fiets wordt als gestolen gemeld bij mij in de buurt',
    'Un vélo signalé volé correspond à une recherche dans votre quartier.':
      'Een als gestolen gemelde fiets komt overeen met een zoekopdracht in uw buurt.',
    'Une autre solution après désistement': 'Een andere oplossing na afzegging',
    'Une demande expire au bout de 24 heures sans réponse.':
      'Een aanvraag vervalt na 24 uur zonder antwoord.',
    'Valider le constat': 'De vaststelling bevestigen',
    'Version de travail. Ce texte doit être rédigé et validé par un juriste avant toute mise en ligne.':
      'Werkversie. Deze tekst moet door een jurist worden opgesteld en goedgekeurd vóór publicatie.',
    'Voir mon profil public': 'Mijn openbaar profiel bekijken',
    'Votre avis reste invisible tant que':
      'Uw beoordeling blijft onzichtbaar zolang',
    'Votre demande': 'Uw aanvraag',
    'Votre délai de réponse habituel': 'Uw gebruikelijke antwoordtijd',
    "Votre invitation a le plus de valeur si elle va à quelqu'un de votre quartier : c'est la densité qui rend le service utilisable, pas le nombre.":
      'Uw uitnodiging is het meest waard als ze naar iemand uit uw buurt gaat: het is de dichtheid die de dienst bruikbaar maakt, niet het aantal.',
    "Votre nom complet et votre e-mail ne sont visibles par personne. Votre numéro de téléphone est communiqué à l'autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.":
      'Uw volledige naam en uw e-mail zijn voor niemand zichtbaar. Uw telefoonnummer wordt tijdens een aanvaarde oppasbeurt enkel aan de andere persoon meegedeeld: het verdwijnt bij de afsluiting.',
    "Votre pièce d'identité n'est jamais conservée. Elle est supprimée dès la validation, et au plus tard après sept jours. Seul le résultat est enregistré.":
      'Uw identiteitsbewijs wordt nooit bewaard. Het wordt gewist zodra de validatie rond is, en uiterlijk na zeven dagen. Enkel het resultaat wordt bewaard.',
    'Vous accueillez des vélos': 'U vangt fietsen op',
    "Vous ne proposez pas encore d'emplacement.": 'U biedt nog geen plek aan.',
    'Vous recevrez un fichier lisible contenant tout ce que la plateforme conserve sur vous.':
      'U ontvangt een leesbaar bestand met alles wat het platform over u bewaart.',
    "Vous rejoignez le réseau comme membre. Vous cherchez une place quand vous en avez besoin, et vous devenez bike sitter si vous décidez d'en proposer une — même personne, même compte.":
      'U wordt lid van het netwerk. U zoekt een plek wanneer u er een nodig hebt, en u wordt bike sitter zodra u er zelf een aanbiedt — dezelfde persoon, hetzelfde account.',
    'Vous remettez le vélo. Lisez ce code à voix haute à':
      'U geeft de fiets af. Lees deze code hardop voor aan',
    'Vélo actuellement stationné': 'Fiets momenteel gestald',
    'Vélo concerné': 'Betrokken fiets',
    'Vélo restitué': 'Fiets teruggegeven',
    'Vélos acceptés': 'Aanvaarde fietsen',
    'Vérifier mon identité': 'Mijn identiteit verifiëren',
    "Vérifiée puis supprimée, au plus tard après sept jours. Ni l'image ni le numéro ne sont conservés.":
      'Gecontroleerd en daarna gewist, uiterlijk na zeven dagen. Noch de afbeelding noch het nummer worden bewaard.',
    'Zones approximatives': 'Bij benadering aangeduide zones',
    'après acceptation': 'na aanvaarding',
    "avait bloqué sa place pour vous. Il sera prévenu immédiatement, et l'annulation est enregistrée sur la garde — pas sur votre profil.":
      'had een plaats voor u vrijgehouden. Hij wordt onmiddellijk verwittigd, en de annulering wordt op de oppasbeurt genoteerd — niet op uw profiel.',
    "c'est en le saisissant qu'il confirme la remise, et vous gardez la trace de ce que vous lui avez confié.":
      'door hem in te voeren bevestigt hij de overdracht, en u houdt het spoor bij van wat u hebt toevertrouwd.',
    'fait partie de ce que nous avons vérifié. Un modérateur lira votre demande. Si elle est acceptée, votre identité devra être vérifiée à nouveau.':
      'maakt deel uit van wat wij hebben geverifieerd. Een moderator leest uw aanvraag. Wordt ze aanvaard, dan moet uw identiteit opnieuw worden geverifieerd.',
    'moins de 2 km': 'minder dan 2 km',
    'moins de 500 m': 'minder dan 500 m',
    "n'a pas déposé le sien.": 'de zijne niet heeft geplaatst.',
    'politique de confidentialité': 'privacybeleid',
    'une de plus à chaque garde terminée':
      'eentje extra bij elke afgeronde oppasbeurt',
    '· pour cette garde seulement': '· enkel voor deze oppasbeurt',
    "À compléter avec le conseil juridique avant l'ouverture. C'est la clause qui détermine ce que la plateforme peut promettre.":
      'Aan te vullen met juridisch advies vóór de opening. Deze clausule bepaalt wat het platform mag beloven.',
    "À l'extérieur sans couverture": 'Buiten zonder afdak',
    "À l'intérieur": 'Binnen',
    'État constaté': 'Vastgestelde staat',
  },
  en: {
    'Abri de jardin ou remise': 'Garden shed or outbuilding',
    Acceptée: 'Accepted',
    Acceptées: 'Accepted',
    Accueil: 'Home',
    'Accueil chaleureux, garage vraiment sécurisé, explications claires.':
      'Warm welcome, genuinely secure garage, clear explanations.',
    'Accueille souvent': 'Hosts often',
    'Accès et services': 'Access and services',
    Actif: 'Active',
    Activité: 'Activity',
    Actuellement: 'Currently',
    Adresse: 'Address',
    "Adresse de l'emplacement": 'Address of the spot',
    'Adresse exacte': 'Exact address',
    'Ajouter un emplacement': 'Add a spot',
    'Ajouter un vélo': 'Add a bike',
    'Ajouter une photo': 'Add a photo',
    'Ajoutez deux photos du vélo.': 'Add two photos of the bike.',
    "Ajoutez votre emplacement à ce profil. Rien d'autre à créer : c'est le même compte.":
      'Add your spot to this profile. Nothing else to create: it is the same account.',
    Alarme: 'Alarm',
    'Ancrage au sol': 'Floor anchor',
    'Ancrage mural': 'Wall anchor',
    Annuler: 'Cancel',
    'Arceau ou barre fixe': 'Hoop or fixed bar',
    'Arrivée signalée': 'Arrival reported',
    Ascenseur: 'Lift',
    Association: 'Association',
    Atelier: 'Workshop',
    'Aucun compte bloqué.': 'No blocked accounts.',
    'Aucun signalement.': 'No reports.',
    'Aucun échange.': 'No conversations.',
    'Aucune alerte.': 'No alerts.',
    'Aucune modification': 'No change',
    Autre: 'Other',
    'Autre espace privé': 'Other private space',
    'Autre système': 'Other system',
    'Avec remorque': 'With trailer',
    Avis: 'Reviews',
    'Avis reçus': 'Reviews received',
    'Batterie inquiétante — gonflée, chaude ou odorante':
      'Worrying battery — swollen, hot or smelling',
    'Bien reçu, le vélo est rangé au fond de la cour.':
      'Got it, the bike is stored at the back of the yard.',
    'Bike Sitter vérifié': 'Bike sitter verified',
    "Bike Sitters met en relation des cyclistes et des habitants disposant d'un espace privé. La plateforme n'assure ni la garde ni le transport des vélos.":
      'Bike Sitters connects cyclists with residents who have a private space. The platform insures neither the keeping nor the transport of bikes.',
    Bloquer: 'Block',
    'Bon état, rien à signaler': 'Good condition, nothing to report',
    "Bonjour ! C'est noté pour cet après-midi.":
      'Hello! Noted for this afternoon.',
    'Bouton de test du prototype, pour voir ce que la règle bloque réellement.':
      'Prototype test button, to see what the rule actually blocks.',
    'Box de garage individuel': 'Individual garage box',
    "C'est votre propre emplacement.": 'This is your own spot.',
    'Caméra de surveillance': 'Security camera',
    Capacité: 'Capacity',
    'Capacité et vélos': 'Capacity and bikes',
    Cargo: 'Cargo',
    Carte: 'Map',
    'Cave privative': 'Private cellar',
    'Ce constat protège les deux parties. Il est horodaté, visible par vous deux, et ne peut plus être modifié une fois validé.':
      'This report protects both parties. It is timestamped, visible to you both, and can no longer be changed once validated.',
    'Ce que nos badges veulent dire': 'What our badges mean',
    'Ce que vous contestez': 'What you dispute',
    "Ce qui est conservé malgré la suppression : les traces de modération et le journal des actions d'administration, pour des raisons légales.":
      'What is kept despite deletion: moderation traces and the log of administration actions, for legal reasons.',
    'Ce rythme indique la fréquence à laquelle cette personne souhaite recevoir des demandes ponctuelles.':
      'This rhythm shows how often this person wishes to receive one-off requests.',
    'Cette garde ne vous concerne pas.':
      'This bike-sitting does not concern you.',
    "Chaque bike sitter indique les types qu'il peut accueillir, du vélo de ville au cargo.":
      'Each bike sitter states the types they can host, from city bike to cargo bike.',
    'Chaque invitation est nominative, à usage unique, et expire au bout de 30 jours.':
      'Each invitation is personal, single-use, and expires after 30 days.',
    'Chercher un bike sitter': 'Find a bike sitter',
    Chez: 'At',
    'Chez moi': 'At my place',
    Choisi: 'Chosen',
    'Choisir une date': 'Choose a date',
    'Cliquez une date pour la fermer. Vos jours de fermeture habituels sont déjà grisés.':
      'Click a date to close it. Your usual closing days are already greyed out.',
    "Code d'invitation": 'Invitation code',
    'Code de remise': 'Handover code',
    'Code postal': 'Postal code',
    'Combien de temps puis-je laisser mon vélo ?':
      'How long can I leave my bike?',
    'Comment retrouver un vélo volé ?': 'How do you recover a stolen bike?',
    'Comment ça marche': 'How it works',
    Commerce: 'Business',
    Communauté: 'Community',
    Communication: 'Communication',
    'Complément (facultatif)': 'Extra detail (optional)',
    'Comportement inapproprié': 'Inappropriate behaviour',
    Compte: 'Account',
    'Comptes bloqués': 'Blocked accounts',
    'Conditions générales': 'Terms of use',
    Confidentialité: 'Privacy',
    Confirmation: 'Confirmation',
    'Confirmer la remise': 'Confirm the handover',
    'Confirmé par lien': 'Confirmed by link',
    'Connectez-vous': 'Sign in',
    Connexion: 'Sign in',
    'Constat au dépôt': 'Report at drop-off',
    'Constat au retour': 'Report at pick-up',
    Contact: 'Contact',
    Contester: 'Dispute',
    'Contester un avis': 'Dispute a review',
    Continuer: 'Continue',
    'Continuer avec Apple': 'Continue with Apple',
    'Continuer avec Google': 'Continue with Google',
    Contribution: 'Contribution',
    'Contribution demandée': 'Requested contribution',
    Conversation: 'Conversation',
    Couleur: 'Colour',
    'Cour privée': 'Private courtyard',
    'Créer un compte': 'Create an account',
    'Créer votre compte': 'Create your account',
    "Créez-en une depuis une recherche sans résultat : vous serez prévenu dès qu'un emplacement ouvre.":
      'Create one from a search with no results: you will be told as soon as a spot opens.',
    "Créneau repris de votre recherche. Vous pouvez encore l'ajuster.":
      'Time slot taken from your search. You can still adjust it.',
    'Côté bike sitter': "Bike sitter's side",
    'Côté cycliste': "Cyclist's side",
    'DEVENIR BIKE SITTER': 'BECOME A BIKE SITTER',
    'Date du dépôt': 'Drop-off date',
    'Date du retour': 'Pick-up date',
    'Demande envoyée': 'Request sent',
    "Demander l'export": 'Request export',
    'Demander une garde': 'Request bike-sitting',
    'Demander une modification': 'Request a change',
    Demandes: 'Requests',
    'Demandes récentes': 'Recent requests',
    'Devenir bike sitter': 'Become a bike sitter',
    'Disponibilité sur votre créneau': 'Availability for your time slot',
    Disponibilités: 'Availability',
    Distance: 'Distance',
    'Distance, vélo, sécurité…': 'Distance, bike, security…',
    'Donnez une note générale.': 'Give an overall score.',
    Dupliquer: 'Duplicate',
    Durée: 'Duration',
    'Durée acceptée': 'Accepted duration',
    "Durée d'accueil": 'Hosting duration',
    'Durée maximale acceptée': 'Maximum accepted duration',
    'Débarras ou cellier': 'Storage room or pantry',
    'Déclarations de vol': 'Theft reports',
    "Déclarez-le : votre fiche devient publique et n'importe qui peut signaler l'avoir aperçu.":
      'Report it: your listing becomes public and anyone can say they have spotted it.',
    'Défaut visible': 'Visible defect',
    'Délai habituel : moins de 24 heures. Vous serez notifié du résultat.':
      'Usual delay: under 24 hours. You will be notified of the outcome.',
    Dépôt: 'Drop-off',
    'Dépôt à partir de': 'Drop-off from',
    'Détail des notes': 'Score breakdown',
    Détails: 'Details',
    "Détecteur d'ouverture": 'Door sensor',
    'Détecteur de mouvement': 'Motion sensor',
    'E-mail': 'Email',
    'E-mail vérifié': 'Email verified',
    'Emplacements proposés': 'Spots offered',
    'Emplacements récents': 'Recent spots',
    'En attente de réponse': 'Awaiting an answer',
    'En continuant, vous acceptez les': 'By continuing, you accept the',
    'Entrez une adresse e-mail valide.': 'Enter a valid email address.',
    'Entrez votre e-mail. Vous recevrez un lien pour définir un nouveau mot de passe.':
      'Enter your email. You will receive a link to set a new password.',
    'Envoyer la demande': 'Send the request',
    "Espace privé : cet emplacement n'est accessible ni au public, ni aux autres résidents de l'immeuble.":
      'Private space: this spot is accessible neither to the public nor to other residents of the building.',
    'Espace réservé à la modération.': 'Area reserved for moderation.',
    Explorer: 'Explore',
    'Export complet et suppression de compte disponibles à tout moment depuis les paramètres.':
      'Full export and account deletion are available at any time from the settings.',
    'Exporter mes données': 'Export my data',
    'Faire vivre le réseau compte aussi : sans demande, un emplacement libre ne sert à personne.':
      'Keeping the network alive counts too: with no requests, a free spot serves nobody.',
    'Fermetures exceptionnelles': 'Exceptional closures',
    'Fréquence acceptée': 'Accepted frequency',
    'Garage fermé à clé au rez-de-chaussée. Le vélo est rangé contre le mur du fond, à côté des nôtres. Accès par la porte latérale.':
      'Locked garage on the ground floor. The bike goes against the back wall, next to ours. Access through the side door.',
    'Garage privé fermé': 'Locked private garage',
    'Garde introuvable.': 'Bike-sitting not found.',
    'Générer un nouveau code': 'Generate a new code',
    'Heure du dépôt': 'Drop-off time',
    'Heure du retour': 'Pick-up time',
    "Hébergement dans l'Union européenne. Aucune donnée n'est transférée hors UE.":
      'Hosted within the European Union. No data is transferred outside the EU.',
    'Identité vérifiée': 'Identity verified',
    'Il a peut-être été supprimé, ou le lien est incomplet.':
      'It may have been deleted, or the link is incomplete.',
    'Ils ont rejoint grâce à vous': 'They joined thanks to you',
    "Indiquez l'état constaté.": 'State the condition observed.',
    'Indiquez une adresse e-mail valide.': 'Enter a valid email address.',
    'Indiquez votre prénom.': 'Enter your first name.',
    'Inscrivez-vous': 'Sign up',
    "Inviter quelqu'un": 'Invite someone',
    "Inviter quelqu'un du même lieu": 'Invite someone from the same place',
    "J'ai récupéré mon vélo": 'I have collected my bike',
    "J'ai trouvé une autre solution": 'I found another solution',
    'Je déclare être majeur. La bêta est réservée aux personnes de 18 ans ou plus.':
      'I declare that I am of age. The beta is reserved for people aged 18 or over.',
    "Je n'en ai pas": "I don't have one",
    'Je passe devant trois arceaux vides chaque matin. Autant que mon garage serve à quelque chose.':
      'I ride past three empty racks every morning. My garage might as well be useful.',
    "Jusqu'à 1 heure — le temps d'un café":
      'Up to 1 hour — the time for a coffee',
    "Jusqu'à 3 heures — un restaurant, un cinéma":
      'Up to 3 hours — a restaurant, a cinema',
    "Jusqu'à 8 heures — une journée de travail":
      'Up to 8 hours — a working day',
    "L'adresse exacte de votre emplacement n'est lisible que par vous, par un cycliste dont vous avez accepté la demande, et par un administrateur.":
      'The exact address of your spot is readable only by you, by a cyclist whose request you accepted, and by an administrator.',
    "L'emplacement": 'The spot',
    "L'emplacement n'est plus accessible": 'The spot is no longer accessible',
    "L'inscription demande une invitation.":
      'Signing up requires an invitation.',
    "La précision sert aux statistiques sur les zones à risque et aide quelqu'un à reconnaître votre vélo. La fiche publique affiche la rue, pas le numéro.":
      'Precision serves statistics on risk areas and helps someone recognise your bike. The public listing shows the street, not the number.',
    "La vérification d'identité est obligatoire pour publier un emplacement et pour demander une garde.":
      'Identity verification is required to publish a spot and to request bike-sitting.',
    "Le bike sitter ne remettra le vélo qu'à la personne que vous désignez.":
      'The bike sitter will only hand the bike back to the person you designate.',
    "Le bike sitter saura ce qu'il accueille.":
      'The bike sitter will know what they are hosting.',
    'Le catalogue remercie les gardes que vous avez rendues.':
      'The catalogue thanks you for the stays you have done.',
    'Le créneau est convenu à la demande. Les gardes longues se discutent directement avec le bike sitter.':
      'The time slot is agreed per request. Longer stays are discussed directly with the bike sitter.',
    'Le dépôt et la récupération doivent tomber dans ces heures. Entre les deux, le vélo reste sur place.':
      'Drop-off and pick-up must fall within these hours. In between, the bike stays put.',
    'Le mot de passe doit faire au moins 8 caractères.':
      'The password must be at least 8 characters long.',
    'Le mot de passe fait au moins 8 caractères.':
      'The password is at least 8 characters long.',
    "Le réseau fonctionne entièrement gratuitement. Aucun bike sitter ne demande de contribution — c'est ce qui rend le service simple à expliquer et à rejoindre.":
      'The network runs entirely free of charge. No bike sitter asks for a contribution — that is what makes the service simple to explain and to join.',
    'Les autres membres voient': 'Other members see',
    "Les bike sitters ne sont visibles qu'une fois connecté. C'est ce qui protège leur adresse et leur vie privée : ce réseau n'est pas un annuaire public.":
      'Bike sitters are only visible once you are signed in. That protects their address and their privacy: this network is not a public directory.',
    'Les conditions générales détaillent la répartition. Chaque garde est horodaté et confirmé des deux côtés, ce qui donne une trace en cas de litige.':
      'The terms set out how responsibility is shared. Every sitting is timestamped and confirmed by both sides, which leaves a trace in case of dispute.',
    'Les demandes de garde sont ouvertes sur 7 jours.':
      'Bike-sitting requests open 7 days ahead.',
    'Manoelle a publié un nouvel emplacement près de la Place Flagey.':
      'Manoelle has published a new spot near Place Flagey.',
    'Mes emplacements': 'My spots',
    'Mes invitations': 'My invitations',
    'Mes signalements': 'My reports',
    'Mes vérifications': 'My verifications',
    'Message (facultatif)': 'Message (optional)',
    Messages: 'Messages',
    'Modifier mon profil': 'Edit my profile',
    'Mon espace bike sitter': 'My bike sitter space',
    'Ne pas me notifier la nuit': 'Do not notify me at night',
    'Ne sont pas acceptés : local vélo collectif, hall ou couloir commun, cave commune, parking collectif ouvert, cour ou jardin collectif, autres parties communes. Une cave privative fermée ou un box individuel dans un immeuble, oui.':
      'Not accepted: shared bike room, common hall or corridor, shared cellar, open collective car park, shared yard or garden, other common areas. A locked private cellar or an individual box in a building, yes.',
    'Note générale': 'Overall score',
    'Nous avons accueilli le vélo de Yanis pendant un mois, rangé avec les nôtres dans notre cour fermée. On se sent un peu grands-parents avec la garde du petit pendant les vacances.':
      "We hosted Yanis's bike for a month, stored with ours in our enclosed yard. It feels a bit like grandparents minding the little one over the holidays.",
    "Nous ouvrons un quartier quand il y a assez de bike sitters pour qu'un cycliste y trouve une place à chaque fois. Votre inscription nous dit où ouvrir ensuite.":
      'We open a neighbourhood once there are enough bike sitters for a cyclist to find a place every time. Your sign-up tells us where to open next.',
    "Nouveau — aucune garde pour l'instant": 'New — no bike-sitting yet',
    Occasionnellement: 'Occasionally',
    'Oui, pour demander une garde comme pour publier un emplacement. Pas pour déclarer un vol.':
      'Yes, both to request bike-sitting and to publish a spot. Not to report a theft.',
    "Oui. Les bike sitters ne sont pas rémunérés, c'est un réseau d'entraide.":
      'Yes. Bike sitters are not paid; this is a mutual-aid network.',
    'Où souhaitez-vous stationner votre vélo ?':
      'Where would you like to leave your bike?',
    "Passage par l'intérieur du logement": 'Access through the home',
    'Petit outillage à disposition': 'Basic tools available',
    'Photos du vélo': 'Photos of the bike',
    'Pièce vérifiée puis supprimée': 'Document checked then deleted',
    'Places restantes': 'Places left',
    'Plusieurs jours — ouvert par la modération':
      'Several days — opened by moderation',
    "Point d'ancrage": 'Anchor point',
    'Ponctuel, très respectueux du lieu. À revoir avec plaisir.':
      'Punctual, very respectful of the place. Happy to host again.',
    Profil: 'Profile',
    'Proposer mon emplacement': 'Offer my spot',
    'Proposer un autre emplacement': 'Suggest another spot',
    'Proposer un autre horaire': 'Suggest another time',
    'Protection contre les intempéries': 'Protection from the weather',
    'Précision — à quelle hauteur ?': 'Precision — at what level?',
    'Préférences de notification': 'Notification preferences',
    "Prévenez la veille — ne répond pas dans l'urgence":
      'Let them know the day before — does not answer last minute',
    'Publier mon avis': 'Publish my review',
    'Qualité du lieu': 'Quality of the place',
    "Quelqu'un d'autre viendra reprendre le vélo ?":
      'Will someone else come to collect the bike?',
    'Quels vélos sont acceptés ?': 'Which bikes are accepted?',
    'Questions fréquentes': 'Frequently asked questions',
    'Qui est responsable en cas de vol chez le bike sitter ?':
      "Who is liable if the bike is stolen at the bike sitter's?",
    'Qui peut tenir cet emplacement': 'Who may hold this spot',
    'Rejoignez la communauté des bike sitters':
      'Join the community of bike sitters',
    'Remise du vélo': 'Handing over the bike',
    'Restitution du vélo': 'Returning the bike',
    Retour: 'Pick-up',
    "Rythme d'accueil souhaité": 'Preferred hosting rhythm',
    'Récupération confirmée': 'Pick-up confirmed',
    'Répond dans la journée': 'Answers within the day',
    "Répond généralement dans l'heure": 'Usually answers within the hour',
    'Répond sous 24 heures': 'Answers within 24 hours',
    'Se déconnecter': 'Sign out',
    'Seules les deux personnes qui y participent peuvent le consulter.':
      'Only the two people involved can consult it.',
    "Si vous pensez devoir y accéder, écrivez à l'association.":
      'If you believe you need access to it, write to the association.',
    'Signaler cette annonce': 'Report this listing',
    'Signaler un problème': 'Report a problem',
    'Signalez un membre ou une annonce depuis sa page.':
      'Report a member or a listing from their page.',
    "Simuler : retirer ma vérification d'identité":
      'Simulate: remove my identity verification',
    "Souvent une question de place ou d'accès : un cargo ne passe pas par toutes les portes.":
      'Often a matter of space or access: a cargo bike does not fit through every door.',
    'Supprimer mon compte': 'Delete my account',
    "Sur la carte et dans les résultats, seule une zone approximative est affichée. L'adresse exacte n'est communiquée qu'après votre acceptation d'une demande.":
      'On the map and in the results, only an approximate area is shown. The exact address is given only after you accept a request.',
    "Sur une seule journée, jusqu'à": 'Within a single day, up to',
    'Système électronique ou code': 'Electronic system or code',
    'Tout compte peut être suspendu en cas de manquement. Les actions de modération sont journalisées.':
      'Any account may be suspended in case of a breach. Moderation actions are logged.',
    "Traces d'usage habituelles": 'Ordinary signs of use',
    "Trois essais par code, qui expire au bout de 6 heures. Si vous ne parvenez pas à l'obtenir, écrivez-vous : la remise peut attendre, un vélo mal remis non.":
      'Three attempts per code, which expires after 6 hours. If you cannot get it, write to each other: the handover can wait, a badly handed-over bike cannot.',
    "Trois langues au lancement : français, néerlandais et anglais. Bruxelles est bilingue, et l'anglais couvre les résidents internationaux et les personnes de passage.":
      'Three languages at launch: French, Dutch and English. Brussels is bilingual, and English covers international residents and people passing through.',
    'Trouvez où laisser votre vélo': 'Find where to leave your bike',
    'Téléphone renseigné': 'Phone provided',
    'Un bike sitter ouvre près de chez moi': 'A bike sitter opens near me',
    'Un compte bloqué ne peut plus vous contacter, et ses emplacements disparaissent de vos résultats.':
      'A blocked account can no longer contact you, and its spots disappear from your results.',
    "Un compte unique par personne. Les vérifications d'e-mail, de téléphone et d'identité sont requises pour demander ou proposer une garde.":
      'One account per person. Email, phone and identity verification are required to request or offer bike-sitting.',
    'Un garage fermé, une cave privative, une cour suffisent.':
      'A locked garage, a private cellar or a yard is enough.',
    "Un garage, une cave, une cour fermée suffisent. Accueillir ne coûte rien, ne vous engage à rien, et votre adresse reste masquée tant que vous n'avez pas accepté une demande.":
      'A garage, a cellar, an enclosed yard is enough. Hosting costs nothing, commits you to nothing, and your address stays hidden until you accept a request.',
    'Un vélo est déclaré volé près de chez moi':
      'A bike is reported stolen near me',
    'Un vélo signalé volé correspond à une recherche dans votre quartier.':
      'A bike reported stolen matches a search in your neighbourhood.',
    'Une autre solution après désistement': 'Another option after a withdrawal',
    'Une demande expire au bout de 24 heures sans réponse.':
      'A request expires after 24 hours without an answer.',
    'Valider le constat': 'Validate the report',
    'Version de travail. Ce texte doit être rédigé et validé par un juriste avant toute mise en ligne.':
      'Working draft. This text must be written and approved by a lawyer before going live.',
    'Voir mon profil public': 'View my public profile',
    'Votre avis reste invisible tant que': 'Your review stays hidden until',
    'Votre demande': 'Your request',
    'Votre délai de réponse habituel': 'Your usual response time',
    "Votre invitation a le plus de valeur si elle va à quelqu'un de votre quartier : c'est la densité qui rend le service utilisable, pas le nombre.":
      'Your invitation is worth most if it goes to someone in your neighbourhood: density makes the service usable, not headcount.',
    "Votre nom complet et votre e-mail ne sont visibles par personne. Votre numéro de téléphone est communiqué à l'autre personne pendant une garde acceptée, et à elle seule : il disparaît à la clôture.":
      'Your full name and email are visible to nobody. Your phone number is given to the other person during an accepted stay, and to them alone: it disappears at closing.',
    "Votre pièce d'identité n'est jamais conservée. Elle est supprimée dès la validation, et au plus tard après sept jours. Seul le résultat est enregistré.":
      'Your ID document is never kept. It is deleted as soon as validation is done, and within seven days at the latest. Only the outcome is recorded.',
    'Vous accueillez des vélos': 'You host bikes',
    "Vous ne proposez pas encore d'emplacement.":
      'You are not offering a spot yet.',
    'Vous recevrez un fichier lisible contenant tout ce que la plateforme conserve sur vous.':
      'You will receive a readable file containing everything the platform keeps about you.',
    "Vous rejoignez le réseau comme membre. Vous cherchez une place quand vous en avez besoin, et vous devenez bike sitter si vous décidez d'en proposer une — même personne, même compte.":
      'You join the network as a member. You look for a spot when you need one, and you become a bike sitter if you decide to offer one — same person, same account.',
    'Vous remettez le vélo. Lisez ce code à voix haute à':
      'You hand over the bike. Read this code aloud to',
    'Vélo actuellement stationné': 'Bike currently parked',
    'Vélo concerné': 'Bike concerned',
    'Vélo restitué': 'Bike returned',
    'Vélos acceptés': 'Bikes accepted',
    'Vérifier mon identité': 'Verify my identity',
    "Vérifiée puis supprimée, au plus tard après sept jours. Ni l'image ni le numéro ne sont conservés.":
      'Checked then deleted, within seven days at the latest. Neither the image nor the number is kept.',
    'Zones approximatives': 'Approximate areas',
    'après acceptation': 'after acceptance',
    "avait bloqué sa place pour vous. Il sera prévenu immédiatement, et l'annulation est enregistrée sur la garde — pas sur votre profil.":
      'had kept a place for you. They will be told immediately, and the cancellation is recorded on the stay — not on your profile.',
    "c'est en le saisissant qu'il confirme la remise, et vous gardez la trace de ce que vous lui avez confié.":
      'by entering it they confirm the handover, and you keep a record of what you entrusted.',
    'fait partie de ce que nous avons vérifié. Un modérateur lira votre demande. Si elle est acceptée, votre identité devra être vérifiée à nouveau.':
      'is part of what we verified. A moderator will read your request. If it is accepted, your identity will have to be verified again.',
    'moins de 2 km': 'under 2 km',
    'moins de 500 m': 'under 500 m',
    "n'a pas déposé le sien.": 'has not left theirs.',
    'politique de confidentialité': 'privacy policy',
    'une de plus à chaque garde terminée':
      'one more with each completed bike-sitting',
    '· pour cette garde seulement': '· for this bike-sitting only',
    "À compléter avec le conseil juridique avant l'ouverture. C'est la clause qui détermine ce que la plateforme peut promettre.":
      'To be completed with legal advice before opening. This clause determines what the platform may promise.',
    "À l'extérieur sans couverture": 'Outdoors with no cover',
    "À l'intérieur": 'Indoors',
    'État constaté': 'Condition observed',
  },
};
