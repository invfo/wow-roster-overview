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
