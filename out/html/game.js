(function() {
  var game;
  var ui;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // Add your custom code here.
  };

  var TITLE = "Social Democracy: An Alternate History" + '_' + "Autumn Chen";

  // the url is a link to game.json
  // test url: https://aucchen.github.io/social_democracy_mods/v0.1.json
  // TODO; 
  window.loadMod = function(url) {
      ui.loadGame(url);
  };

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('library')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('library');
    }
  };

    window.showSandbox = function() {
      if (window.dendryUI.dendryEngine.state.sceneId.startsWith('sandbox')) {
          window.dendryUI.dendryEngine.goToScene('backSpecialScene');
      } else {
          window.dendryUI.dendryEngine.goToScene('sandbox');
      }
  };

   window.showDebug = function() {
      if (window.dendryUI.dendryEngine.state.sceneId.startsWith('debug')) {
          window.dendryUI.dendryEngine.goToScene('backSpecialScene');
      } else {
          window.dendryUI.dendryEngine.goToScene('debug');
      }
  };

  window.showMods = function() {
    window.hideOptions();
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('mod_loader')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('mod_loader');
    }
  };

  window.getPerson = function(id) {
  return Q.personData && Q.personData[id] ? Q.personData[id] : null;
};

window.getPortraitPath = function(personId) {
  if (!personId) return null;
  var person = window.getPerson(personId);
  if (!person) return null;
  // Prefer explicit portrait field if available; otherwise infer from ID
  if (person.portrait) return "img/portraits/" + person.portrait;
  return "img/portraits/" + personId + ".jpg";
};

window.resolveRedirect = function(role, personId) {
    if (role === "party_executive") return "executive.scene";
    if (role === "party_factions") return "factions.scene";
    if (role === "landtags") return "landtags.scene";

    if (!personId) return null;

  if (role === "president") {
    if (Q.president_party == Q.spd_name) return personId + ".scene";
    if (Q.president == "hindenburg" || Q.president == "simons") return "presidential_relations.scene";
    return null;
  }

  if (role === "chancellor") {
    if (Q.chancellor_party == Q.spd_name) return personId + ".scene";
    if (Q.spd_in_government) return "chancellor_relations.scene";
    if (Q.spd_in_toleration || Q.spd_in_abstention) return "dealing_with_toleration.scene";
    return null;
  }

  if (role === "vice_chancellor") {
    if (Q.vice_chancellor_party == Q.spd_name) return personId + ".scene";
    return null;
  }

  if (role === "spd_chairman") return personId + ".scene";

  if (role === "party_executive") return "executive.scene";
  if (role === "party_factions") return "factions.scene";
  if (role === "landtags") return "landtags.scene";

  return null;
}
window.renderDashboard = function() {
    if (typeof Q === "undefined" || !Q) return;
    var panels = {
        government: document.getElementById("government-portraits"),
        spd: document.getElementById("spd-portraits"),
        politics: document.getElementById("politics-portraits")
    };
    // Do not try to populate a dashboard whose HTML is incomplete.
    if (!panels.government || !panels.spd || !panels.politics) {
        console.error("Dashboard: one or more portrait panels are missing.");
        return;
    }
    // Clear old cards before rendering the current state.
    panels.government.replaceChildren();
    panels.spd.replaceChildren();
    panels.politics.replaceChildren();  var panels = {
    government: document.getElementById("government-portraits"),
    spd: document.getElementById("spd-portraits"),
    politics: document.getElementById("politics-portraits")
  };
Object.keys(panels).forEach(function(key) {
    if (panels[key]) panels[key].replaceChildren();
});
  var createCard = function(label, personId, role, subtitle, disabled) {
    var person = window.getPerson(personId);
    if (!person) return null;

    var card = document.createElement("button");
    card.type = "button";
    card.className = "dashboard-person" + (disabled ? " disabled" : "");
    card.disabled = !!disabled;
    card.setAttribute("data-role", role);
    card.setAttribute("data-person", personId);

    var img = document.createElement("img");
    img.src = window.getPortraitPath(personId);
    img.alt = person.fullname || person.name || personId;

    var name = document.createElement("div");
    name.className = "dashboard-name";
    name.textContent = person.fullname || person.name || personId;

    var party = document.createElement("div");
    party.className = "dashboard-party";
var partyData = person.party && Q.partyData ? Q.partyData[person.party] : null; 
    party.textContent = partyData ? partyData.name : "";
    card.appendChild(img);
    card.appendChild(name);
    if (subtitle) {
      var sub = document.createElement("div");
      sub.className = "dashboard-subname";
      sub.textContent = subtitle;
      card.appendChild(sub);
    }
    if (party.textContent) card.appendChild(party);

    if (!disabled) {
      card.onclick = function() {
        var target = window.resolveRedirect(role, personId);
        if (target) {
          window.dendryUI.dendryEngine.goToScene(target);
        }
      };
    }

    return card;
  };

  // Government
  var presidentId = Q.president;
  var chancellorId = Q.chancellor;
  var viceId = Q.vice_chancellor;

  if (presidentId) {
    var president = createCard("President", presidentId, "president", null,
      !window.resolveRedirect("president", presidentId));
    if (president) panels.government.appendChild(president);
  }

  if (chancellorId) {
    var chancellor = createCard("Chancellor", chancellorId, "chancellor", null,
      !window.resolveRedirect("chancellor", chancellorId));
    if (chancellor) panels.government.appendChild(chancellor);
  }

  if (viceId) {
    var vice = createCard("Vice-Chancellor", viceId, "vice_chancellor", null,
      !window.resolveRedirect("vice_chancellor", viceId));
    if (vice) panels.government.appendChild(vice);
  }

  // SPD chairmen
  var spdChairmen = [Q.spd_coleader_1, Q.spd_coleader_2, Q.spd_coleader_3];
  spdChairmen.forEach(function(id) {
    if (!id) return;
    var card = createCard("SPD Chairman", id, "spd_chairman", null, false);
    if (card) panels.spd.appendChild(card);
  });

  // Party & State Politics
  var policyCards = [
    { id: "executive", label: "Party Executive", role: "party_executive" },
    { id: "factions", label: "Party Factions", role: "party_factions" },
    { id: "landtags", label: "Landtags", role: "landtags" }
  ];

  policyCards.forEach(function(item) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "dashboard-person";
    card.textContent = item.label;
    card.onclick = function() {
      var target = window.resolveRedirect(item.role, null);
      if (target) {
        window.dendryUI.dendryEngine.goToScene(target);
      }
    };
    panels.politics.appendChild(card);
  });
};
window.changeMiniTab = function(newTab, tabId) {
  var tabButton = document.getElementById(tabId);
  var tabButtons = document.getElementsByClassName('tab_button');
  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].className = tabButtons[i].className.replace(' active', '');
  }
  if (tabButton) tabButton.className += ' active';

  // This can either show a mini_status scene or reuse the existing sidebar logic
  // as a placeholder until you build mini_status.scene
  window.statusTab = newTab;
  window.updateSidebar();
};

  // TODO: update audio displays
  window.updateAudio = function(song) {
      var now_playing = document.getElementById('currently_playing');
      if (song) {
          var a = song.split('/');
          now_playing.textContent = a[a.length-1];
      } else {
          var s = window.dendryUI.currentAudioURL;
          var a = s.split('/');
          now_playing.textContent = a[a.length-1];
      }
  };

  // sets the volume
  window.setVolume = function(volume) {
      window.dendryUI.volume = volume/100;
      window.dendryUI.currentAudio.volume = volume/100;
  };

  // go to the next song - this just sets the time to 9999 lol.
  window.shuffle = function() {
      window.dendryUI.currentAudio.currentTime = 9999;
  };
  
  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  window.disableAudio = function() {
      window.dendryUI.toggle_audio(false);
      window.dendryUI.saveSettings();
  };

  window.enableAudio = function() {
      window.dendryUI.toggle_audio(true);
      window.dendryUI.saveSettings();
  };

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
  };
  window.enableDarkMode = function() {
      window.dendryUI.dark_mode = true;
      document.body.classList.add('dark-mode');
      window.dendryUI.saveSettings();
  };

  // populates the checkboxes in the options view
  window.populateOptions = function() {
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var disable_audio = window.dendryUI.disable_audio;
    var show_portraits = window.dendryUI.show_portraits;
    if (disable_bg) {
        $('#backgrounds_no')[0].checked = true;
    } else {
        $('#backgrounds_yes')[0].checked = true;
    }
    if (animate) {
        $('#animate_yes')[0].checked = true;
    } else {
        $('#animate_no')[0].checked = true;
    }
    if (disable_audio) {
        $('#audio_no')[0].checked = true;
    } else {
        $('#audio_yes')[0].checked = true;
    }
    if (show_portraits) {
        $('#images_yes')[0].checked = true;
    } else {
        $('#images_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
  };

  
  // This function allows you to modify the text before it's displayed.
  // E.g. wrapping chat-like messages in spans.
  window.displayText = function(text) {
      return text;
  };

  // This function allows you to do something in response to signals.
  window.handleSignal = function(signal, event, scene_id) {
  };
  
  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
        window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false;
    }
  };

  // TODO: have some code for tabbed sidebar browsing.
  window.updateSidebar = function() {
      $('#qualities').empty();
      var scene = dendryUI.game.scenes[window.statusTab];
      dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      $('#qualities').append(dendryUI.contentToHTML.convert(displayContent));
  };

  window.changeTab = function(newTab, tabId) {
      if (tabId == 'poll_tab' && dendryUI.dendryEngine.state.qualities.historical_mode) {
          window.alert('Polls are not available in historical mode.');
          return;
      }
      var tabButton = document.getElementById(tabId);
      var tabButtons = document.getElementsByClassName('tab_button');
      for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
      window.statusTab = newTab;
      window.updateSidebar();
  };

window.onDisplayContent = function() {
    window.updateSidebar();
    var sceneId = window.dendryUI.dendryEngine.state.sceneId;
    var dashboard = document.getElementById("dashboard");
    // Show the dashboard only on the two intended scenes.
    var showDashboard =
        sceneId === "main" || sceneId === "main.easy";
    if (dashboard) {
        dashboard.style.display = showDashboard ? "" : "none";
    }
    if (showDashboard && typeof window.renderDashboard === "function") {
        window.renderDashboard();
    }
};
  /*
   * This function copied from the code for Infinite Space Battle Simulator
   *
   * quality - a number between max and min
   * qualityName - the name of the quality
   * max and min - numbers
   * colors - if true/1, will use some color scheme - green to yellow to red for high to low
   * */
  window.generateBar = function(quality, qualityName, max, min, colors) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      var value = document.createElement('div');
      value.className = 'barValue';
      var width = (quality - min)/(max - min);
      if (width > 1) {
          width = 1;
      } else if (width < 0) {
          width = 0;
      }
      value.style.width = Math.round(width*100) + '%';
      if (colors) {
          value.style.backgroundColor = window.probToColor(width*100);
      }
      bar.textContent = qualityName + ': ' + quality;
      if (colors) {
          bar.textContent += '/' + max;
      }
      bar.appendChild(value);
      return bar;
  };


  window.justLoaded = true;
  window.statusTab = "status";
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");

  window.increaseFontSize = function() {
        window.dendryUI.font_size += 0.1;
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
        document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
        window.dendryUI.saveSettings();
  }

  window.decreaseFontSize = function() {
        window.dendryUI.font_size -= 0.1;
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
        document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
        window.dendryUI.saveSettings();
  }

window.onload = function() {
    window.dendryUI.loadSettings({show_portraits: false});
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
    if (window.dendryUI.font_size != 1.1) {
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
    }
    document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
    window.pinnedCardsDescription = "Advisor cards - actions are only usable once per 6 months.";
    
    // Render dashboard once game is loaded
    if (window.renderDashboard) {
      setTimeout(window.renderDashboard, 100);
    }
};

}());
