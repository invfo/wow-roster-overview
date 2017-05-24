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
};

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

var rosterInfo = {
  'roster-tank': [],
  'roster-heal': [],
  'roster-cac': [],
  'roster-mage': []
};

var stats = ['ilvl', 'ilvl-weapon', 'weapon-traits',
              'relic-1', 'relic-2', 'relic-3'];

var sortable = ['ilvl', 'ilvl-weapon', 'weapon-traits'];
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
  'weapon-traits': {
    'en': 'Weapon traits',
    'fr': 'Rang d\'arme'
  },
  'relic-1': {
    'en': '1',
    'fr': '1'
  },
  'relic-2': {
    'en': '2',
    'fr': '2'
  },
  'relic-3': {
    'en': '3',
    'fr': '3'
  },
  'relics': {
    'en': 'Relics',
    'fr': 'Réliques'
  }
}

var langButtonLabel = {
  'en': 'Passer en FR',
  'fr': 'Switch to EN'
};

function translate(lang) {
  Object.keys(translations).forEach(function(label){
    var elts = $('.' + label);
    for (var i = 0; i < elts.length; i++) {
      var elt = elts[i];
      if (elt.tagName == 'TH') {
        elt.textContent = translations[label][lang];
      }
    }
  });
}

function addEmptyCell(row, cl) {
  var cell = document.createElement('td');
  cell.classList.add(cl);
  row.appendChild(cell);
}

function updateCell(name, cl, value) {
  $('#' + name + ' td.' + cl).text(value);
}

function calculateArtifactTraitLvl(weapon) {
  var artifactTraitLvl;
  if (weapon.artifactTraits.length != 0){
    var traits = weapon.artifactTraits;
    artifactTraitLvl = -3;
    for (var j = 0; j < traits.length; j++) {
      artifactTraitLvl += traits[j].rank;
    }
  } else {
    artifactTraitLvl = 0;
  }
  return artifactTraitLvl;
}

function getRelicsIlvls(weapon) {
  var relicsIlvls = [];
  if (weapon.relics.length != 0) {
    var relics = weapon.relics;
    for (var j = 0; j < 3; j++) {
      var relicIlvl = weapon.bonusLists[j+1] - 1472;
      relicsIlvls.push(relicIlvl);
    }
  } else {
    relicsIlvls = [0, 0, 0];
  }
  return relicsIlvls;
}

function addEmptyPlayerRow(player, rosterType) {
  var playerRow = document.createElement('tr');
  playerRow.id = player;
  var cell = document.createElement('td');
  cell.textContent = player;
  playerRow.appendChild(cell);
  for (var j = 0; j < stats.length; j++) {
    addEmptyCell(playerRow, stats[j]);
  }
  document.getElementById(rosterType).appendChild(playerRow);
}

function getWeapon(items) {
  var weapon = items.mainHand;
  if (weapon.artifactAppearanceId != 0 && weapon.artifactTraits.length == 0) {
    weapon = items.offHand;
  }
  return weapon;
}

$(function(){});

var lang = 'fr'; //default language
translate(lang);

var langButton = $('#change-language')
langButton.html(langButtonLabel[lang]);
langButton.on('mouseup', function(event){
  lang = (lang == 'fr') ? 'en' : 'fr'
  translate(lang);
  langButton.html(langButtonLabel[lang]);
});


for (var l = 0; l < sortable.length; l++)
{
  for (var j = 0; j < $('.' + sortable[l]).length; j++){
    $($('.' + sortable[l])[j]).on('mouseup', function(event){
      var sortVar = $(event.target).attr('class');
      var roster_ = $(event.target).parents("table").attr('id');
      var rosterList = rosterInfo[roster_];

      if (rosterList[0][sortVar] < rosterList[rosterList.length-1][sortVar]) {
        rosterList.sort(function(first, second){
          return second[sortVar] - first[sortVar];
        });
      } else {
        rosterList.sort(function(first, second){
          return first[sortVar] - second[sortVar];
        });
      }

      var children = $('#' + roster_).children();
      for (var i = 0; i < rosterList.length; i++) {
        var info = rosterList[i];
        var playerRow = document.createElement('tr');
        playerRow.id = info['player'];
        playerRow.classList.add(info['charClass']);
        var name = document.createElement('td');
        name.textContent = info['player'];
        playerRow.appendChild(name);
        for (var k = 0; k < stats.length; k++) {
          var cell = document.createElement('td');
          cell.textContent = info[stats[k]];
          playerRow.appendChild(cell);
        }
        $('#' + roster_).children().eq(i+1).replaceWith(playerRow);
      }
    });
  }
}


Object.keys(roster).forEach(function(rosterType) {
  var rosterPlayers = roster[rosterType];
  for (var i = 0; i < rosterPlayers.length; i++) {
    var player = rosterPlayers[i];
    addEmptyPlayerRow(player, rosterType);

    var requestURL = 'https://eu.api.battle.net/wow/character/'
                    + server + '/'
                    + player +
                    '?fields=items&locale=en_GB&apikey='
                    + apiKey;
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(event) {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          var data = JSON.parse(this.responseText);

          var name = data.name;
          var charClass = data.class;
          var items = data.items;
          var ilvlEquipped = items.averageItemLevelEquipped;
          var weapon = getWeapon(items);
          var artifactTraitLvl = calculateArtifactTraitLvl(weapon);
          var ilvlWeapon = weapon.itemLevel;
          var relicsIlvls = getRelicsIlvls(weapon);

          var playerRow = $('#' + name);
          playerRow.addClass(classes[charClass]);

          var statValues = {
            'ilvl': ilvlEquipped,
            'ilvl-weapon': ilvlWeapon,
            'weapon-traits': artifactTraitLvl,
            'relic-1': relicsIlvls[0],
            'relic-2': relicsIlvls[1],
            'relic-3': relicsIlvls[2]
          };

          for (var key in statValues) {
            updateCell(name, key, statValues[key]);
          }

          statValues.player = name;
          statValues.charClass = classes[charClass];
          rosterInfo[rosterType].push(statValues);
        }
      }
    };

    request.open('GET', requestURL, true);
    request.send(null);
  }
});
