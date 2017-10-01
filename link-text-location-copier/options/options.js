let _settings;

function logError(error) {
  console.log(error);
}

function setDefaults() {
  let settingDefaults = browser.storage.local.set(defaults);
  settingDefaults.then(null, logError);
}

function saveOptions(e) {
  document.querySelectorAll('input[data-showmenu]').forEach(function (elem) {
    var _context = elem.getAttribute('data-showmenu');
    _settings.contexts[_context].enabled = elem.checked;
  })
  let savingOptions = browser.storage.local.set(_settings);
  savingOptions.then(null, logError);
  console.log('_settings after save', _settings)
  e.preventDefault();
}

function restoreOptions() {
  let gettingItem = browser.storage.local.get();
  gettingItem.then((res) => {
    if (!res.contexts && !res.menuItems) {
      setDefaults();
      _settings = defaults;
    } else {
      _settings = res;
    }

    for (context in _settings.contexts) {
      if (_settings.contexts[context].enabled) {
        document.getElementById(`showmenu-${context}`).checked = true;
      }
    }
  });
}

function resetOptions() {
  let clearStorage = browser.storage.local.clear();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('reset').addEventListener('click', resetOptions);
document.getElementById('save').addEventListener('click', saveOptions);
