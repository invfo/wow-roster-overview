//var apiKey = prompt('Enter API key');

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
      {'Immé': 'Protection'},
      {'Zeckia': 'Brewmaster'},
      {'Hyübis': 'Vengeance'}
    ];

var rosterHeal = [
      {'Síal': 'Holy'},
      {'Prixoduron': 'Holy'},
      {'Eydeñ': 'Restoration'},
      {'Miwën': 'Restoration'},
      {'Arhyä': 'Restoration'},
      {'Leytere': 'Restoration'},
      {'Ranashe': 'Restoration'},
      {'Jaburã': 'Restoration'}
];

var rosterCac = [
      {'Wof': 'Beast Mastery'},
      {'Nilö': 'Beast Mastery'},
      {'Nahazgul': 'Feral'},
      {'Naurthoron': 'Outlaw'},
      {'Klÿnn': 'Assassination'},
      {'Olympee': 'Havoc'},
      {'Laethis': 'Havoc'},
      {'Hellpwn': 'Havoc'},
      {'Vàren': 'Frost'},
      {'Saharl': 'Enhancement'},
      {'Maéror': 'Enhancement'},
      {'Osha': 'Fury'},
      {'Amadeusdamus': 'Fury'},
      {'Skjoldd': 'Fury'},
      {'Triofu': 'Retribution'},
      {'Elpwn': 'Retribution'}
];

var rosterMage = [
      {'Twítwí': 'Frost'},
      {'Heâven': 'Arcane'},
      {'Crexie': 'Arcane'},
      {'Akaliana': 'Frost'},
      {'Ëlye': 'Affliction'},
      {'Bèhémoth': 'Affliction'},
      {'Pinpön': 'Shadow'},
      {'Hàdês': 'Shadow'},
      {'Drafy': 'Balance'},
      {'Glørung': 'Balance'},
      {'Galv': 'Balance'},
      {'Azzùraa': 'Elemental'},
      {'Calendra': 'Elemental'},
      {'Sosochamy': 'Elemental'}
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
  $('#' + name + ' td.' + cl).text((value == -1) ? 'N/A' : value);
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
  $('#' + rosterType).append(playerRow);
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
        if (! info.requiredSpecActive) {
          if (info.readFromDB) {
            name.innerHTML = '<span title="info taken from local database">'
            + info.player + ' /!\\</span>';
          } else {
            name.innerHTML = '<span title="active spec is '
              + info.activeSpec + '">'
              + info['player'] + ' /!!\\</span>';
          }
        } else {
          name.innerHTML = info['player'];
        }
        playerRow.appendChild(name);
        for (var k = 0; k < stats.length; k++) {
          var cell = document.createElement('td');
          cell.textContent = (info[stats[k]] == -1) ? 'N/A' : info[stats[k]];
          playerRow.appendChild(cell);
        }
        $('#' + roster_ + ' tbody').children().eq(i).replaceWith(playerRow);
      }
    });
  }
}


Object.keys(roster).forEach(function(rosterType) {
  var rosterPlayers = roster[rosterType];
  for (var i = 0; i < rosterPlayers.length; i++) {
    var player = Object.keys(rosterPlayers[i])[0];
    var spec = rosterPlayers[i][player]
    addEmptyPlayerRow(player, rosterType);

    /*
    var requestURL = 'https://eu.api.battle.net/wow/character/'
                    + server + '/'
                    + player +
                    '?fields=items&locale=en_GB&apikey='
                    + apiKey;
                    */
    var requestURL = '/player/'
                      + server + '/' + player + '/' + spec;
    console.log(requestURL);
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(event) {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          var data = JSON.parse(this.responseText);

          var name = data.name;
          var requiredSpecActive = data['requiredSpecActive'];
          if (! requiredSpecActive) {
            var activeSpec = data['activeSpec'];
            var readFromDB = data.readFromDB;
            if (readFromDB) {
              $('#' + name).children().eq(0).html(
                '<span title="info taken from local database">'
                + name + ' /!\\</span>');
            } else {
                $('#' + name).children().eq(0).html(
                '<span title="active spec is ' + activeSpec + '">'
                + name + ' /!!\\</span>');
            }
          }
          var charClass = data.class;
          var items = data.items;
          var ilvlEquipped = items.averageItemLevelEquipped;
          var weapon = getWeapon(items);
          var artifactTraitLvl = calculateArtifactTraitLvl(weapon);
          var ilvlWeapon = weapon.itemLevel;
          var relicsIlvls = getRelicsIlvls(weapon);

          var playerRow = $('#' + name);
          playerRow.addClass(classes[charClass]);

          if (! requiredSpecActive && ! readFromDB) {
            var statValues = {
              'ilvl': -1,
              'ilvl-weapon': -1,
              'weapon-traits': -1,
              'relic-1': -1,
              'relic-2': -1,
              'relic-3': -1,
              'requiredSpecActive': requiredSpecActive,
              'activeSpec': activeSpec,
              'readFromDB': readFromDB
            };
          } else {
            var statValues = {
              'ilvl': ilvlEquipped,
              'ilvl-weapon': ilvlWeapon,
              'weapon-traits': artifactTraitLvl,
              'relic-1': relicsIlvls[0],
              'relic-2': relicsIlvls[1],
              'relic-3': relicsIlvls[2],
              'requiredSpecActive': requiredSpecActive,
              'activeSpec': activeSpec,
              'readFromDB': readFromDB
            };
          }

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
