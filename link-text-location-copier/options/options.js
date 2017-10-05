let _settings,
    $modal = document.getElementById('formatDialog');

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
  e.preventDefault();
}

function buildCustomFormatTable() {
  console.log('ohai')
  let _buffer = document.createDocumentFragment();
  let _rowTemplate = document.getElementById('formatrow');
  let _templateTD = _rowTemplate.content.querySelectorAll('td');

  for (slug in _settings.menuItems) {
    let menuItem = _settings.menuItems[slug];
    console.log(menuItem)
    if (menuItem.displayName && menuItem.template) {
      _templateTD[0].textContent = menuItem.displayName;
      _templateTD[1].textContent = menuItem.template;

      _rowTemplate.content.querySelectorAll('[data-menuitem]').forEach(function(elem) {
        elem.dataset.menuitem = slug;
      });

      _buffer.appendChild(document.importNode(_rowTemplate.content, true));
    }
  }

  document.querySelector('#formats > tbody').innerHTML = '';
  document.querySelector('#formats > tbody').appendChild(_buffer);
  document.querySelectorAll('#formats button').forEach(function(elem) {
    elem.addEventListener('click', function (e) {
      let menuitem = e.target.dataset.menuitem,
            action = e.target.dataset.action;
      if (action === 'edit') {
        editFormat(menuitem);
      } else if (action === 'remove') {
        removeFormat(menuitem);
      }
    })
  })
}

function addFormat() {
  console.log('addformat')
}

function editFormat(menuItemToEdit) {
  console.log('edit', menuItemToEdit)
  let data = _settings.menuItems[menuItemToEdit],
      $inputName = document.getElementById('add-format-displayname'),
      $inputTemplate = document.getElementById('add-format-template');

  $modal.querySelector('button[data-action=cancel]').addEventListener('click', closeModal, { once: true });
  $modal.querySelector('button[data-action=save]').addEventListener('click', function (evt) {
    if ($inputName.value) { data.displayName = $inputName.value.trim() }
    if ($inputTemplate.value) { data.template = $inputTemplate.value }
    _settings.menuItems[menuItemToEdit] = data;
    console.log(_settings.menuItems)
    buildCustomFormatTable();
    closeModal();
   }, { once: true });

  $inputName.value = data.displayName;
  $inputTemplate.value = data.template;

  showModal();
}

function removeFormat(e) {
  console.log('remove', e)

}

function showModal() {
  $modal.setAttribute('open', true);
}

function closeModal() {
  $modal.removeAttribute('open');
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

    buildCustomFormatTable();
  });
}

function resetOptions() {
  let clearStorage = browser.storage.local.clear();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('reset').addEventListener('click', resetOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('addCustomFormat').addEventListener('click', addFormat);
