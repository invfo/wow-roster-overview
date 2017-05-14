var apiKey = prompt('Enter API key');

var server = 'Hyjal';

var classes = {
  1: 'warrior',
  2: 'paladin',
  3: 'hunter',
  4: 'rogue',
  5: 'priest',
  6: 'death-knight',
  7: 'shaman',
  8: 'mage',
  9: 'warlock',
  10: 'monk',
  11: 'druid',
  12: 'demon-hunter'
}

var rosterTank = [
      'Jaburã',
      'Immé',
      'Zeckia'];

var rosterHeal = [
      'Síal',
      'Prixoduron',
      'Eydeñ',
      'Miwën',
      'Arhyä',
      'Leytere',
      'Ranashe'
];

var rosterCac = [
      'Wof',
      'Nilö',
      'Nahazgul',
      'Naurthoron',
      'Klÿnn',
      'Olympee',
      'Laethis',
      'Hellpwn',
      'Vàren',
      'Saharl',
      'Maéror',
      'Osha',
      'Amadeusdamus',
      'Skjoldd',
      'Triofu'
];

var rosterMage = [
      'Twítwí',
      'Heâven',
      'Crexie',
      'Akaliana',
      'Ëlye',
      'Bèhémoth',
      'Pinpön',
      'Drafy',
      'Glørung',
      'Galv',
      'Azzùraa',
      'Calendra',
      'Sosochamy'
];


var roster = {
  'roster-tank': rosterTank,
  'roster-heal': rosterHeal,
  'roster-cac': rosterCac,
  'roster-mage': rosterMage
};


// manage EN and FR

var translations = {
  'player': {
    'en': 'Player',
    'fr': 'Joueur'},
  'ilvl': {
    'en': 'ILVL',
    'fr': 'ILVL'
  },
  'ilvl-weapon': {
    'en': 'Weapon ILVL',
    'fr': 'ILVL arme'
  },
  'relic-1': {
    'en': 'Relic 1',
    'fr': 'Rélique 1'
  },
  'relic-2': {
    'en': 'Relic 1',
    'fr': 'Rélique 1'
  },
  'relic-3': {
    'en': 'Relic 3',
    'fr': 'Rélique 3'
  }
}

var langButtonLabel = {
  'en': 'Passer en FR',
  'fr': 'Switch to EN'
};

function translate(lang) {
  console.log('translate to ' + lang);
  Object.keys(translations).forEach(function(label){
    var elts = document.getElementsByClassName(label);
    for (var i = 0; i < elts.length; i++) {
      var elt = elts[i];
      console.log('old: ' + elt.textContent);
      elt.textContent = translations[label][lang];
      console.log('new: ' + elt.textContent);
    }
  });
}

var lang = 'fr'; //default language
var langButton = document.getElementById('change-language');
langButton.textContent = langButtonLabel[lang];

langButton.addEventListener('click', function(event){
  lang = (lang == 'fr') ? 'en' : 'fr'
  translate(lang);
  langButton.textContent = langButtonLabel[lang];
});

//

function addTableCell(value, row) {
  var cellElt = document.createElement('td')
  cellElt.textContent = value;
  row.appendChild(cellElt);
}


Object.keys(roster).forEach(function(rosterType) {
  var rosterPlayers = roster[rosterType];
  for (var i = 0; i < rosterPlayers.length; i++) {
    var player = rosterPlayers[i];

    var requestURL = 'https://eu.api.battle.net/wow/character/' + server + '/' + player +
                    '?fields=items&locale=en_GB&apikey=' + apiKey;
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(event) {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          var data = JSON.parse(this.responseText);

          var name = data.name;
          var charClass = data.class;

          var items = data.items;
          var ilvlEquipped = items.averageItemLevelEquipped;

          var weapon = items.mainHand;
          var ilvlWeapon = weapon.itemLevel;
          var relics = weapon.relics;

          var relicsIlvls = []

          for (var j = 0; j < 3; j++) {
            var relicIlvl = weapon.bonusLists[j+1] - 1472;
            relicsIlvls.push(relicIlvl);
          }

          var tableElt = document.getElementById(rosterType);
          var playerRow = document.createElement('tr');
          playerRow.classList.add(classes[charClass]);

          addTableCell(name, playerRow);
          addTableCell(ilvlEquipped, playerRow);
          addTableCell(ilvlWeapon, playerRow);
          addTableCell(relicsIlvls[0], playerRow);
          addTableCell(relicsIlvls[1], playerRow);
          addTableCell(relicsIlvls[2], playerRow);

          tableElt.appendChild(playerRow);
        }
      }
    };

    request.open('GET', requestURL, true);
    request.send(null);
  }
});
