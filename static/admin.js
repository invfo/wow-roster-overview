var rosterTypes = ['heal', 'tank', 'mage', 'cac'];

var specs = {
  "Druid": ["Restoration", "Feral", "Balance", "Guardian"],
  "Shaman": ["Restoration", "Elemental", "Enhancement"],
  "Priest": ["Shadow", "Holy", "Discipline"],
  "Monk": ["Mistweaver", "Brewmaster", "Windwalker"],
  "Paladin": ["Holy", "Protection", "Retribution"],
  "Demon Hunter": ["Havoc", "Vengeance"],
  "Death Knight": ["Blood", "Frost", "Unholy"],
  "Warrior": ["Protection", "Arms", "Fury"],
  "Rogue": ["Subtlety", "Assasination", "Outlaw"],
  "Hunter": ["Survival", "Beast Mastery", "Marksmanship"],
  "Mage": ["Fire", "Arcane", "Frost"],
  "Warlock": ["Affliction", "Destruction", "Demonology"]
};

// Set initial values for 'spec' dropdown menu
specs["Druid"].forEach(function(spec){
  rosterTypes.forEach(function(rosterType) {
    var specElt = document.createElement('option');
    specElt.textContent = spec;
    $('#' + rosterType + ' select.spec').append(specElt);
  });
});


// Update option in dropdown 'spec' menu when class changes
rosterTypes.forEach(function(rosterType) {
  var selectClass = $('#' + rosterType + ' select.class');
  selectClass.on('change', function() {
    var selectedClass = this.value;
    $('#' + rosterType + ' select.spec').empty();
    specs[selectedClass].forEach(function(spec) {
      var specElt = document.createElement('option');
      specElt.textContent = spec;
      $('#' + rosterType + ' select.spec').append(specElt);
    });
  });
});


rosterTypes.forEach(function(rosterType) {
  var requestUrl = '/admin/' + rosterType;

  var request = new XMLHttpRequest();
  request.onreadystatechange = function(event) {
    if (this.readyState == XMLHttpRequest.DONE) {
      if (this.status === 200) {
        var data = JSON.parse(this.responseText);
        var players = data["players"];

        players.forEach(function(player) {
          var name = player.name;
          var cl = player.class;
          var spec = player.spec;
          //console.log(rosterType, name, spec);
          var playerRow = document.createElement('tr');
          var nameElt = document.createElement('td');
          nameElt.textContent = name;
          var specElt = document.createElement('td');
          specElt.textContent = spec;
          playerRow.appendChild(nameElt);
          playerRow.appendChild(specElt)

          var deleteButtonCell = document.createElement('td');
          var deleteButtonElt = document.createElement('button');

          deleteButtonElt.addEventListener('click', function(event) {
            console.log("DELETE!", name, spec);
            var reqDelete =  new XMLHttpRequest();
            reqDelete.onreadystatechange = function(event) {
              if (this.readyState == XMLHttpRequest.DONE) {
                if (this.status === 200) {
                  playerRow.parentNode.removeChild(playerRow);
                }
              }
            };
            reqDelete.open('POST', '/admin/delete/' + rosterType + '/' + name + '/' + spec, false);
            reqDelete.send(null);
          });
          deleteButtonElt.textContent = 'Delete';
          deleteButtonCell.appendChild(deleteButtonElt)
          playerRow.appendChild(deleteButtonCell);

          cl = cl.toLowerCase().replace(' ', '-');
          playerRow.classList.add(cl);

          $('#' + rosterType + ' table tbody').append(playerRow);
        });
      }
    }
  };
  request.open('GET', requestUrl, true);
  request.send(null);
})
