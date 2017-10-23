let _settings,
    _$modal = document.getElementById('formatDialog');

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {
  if (!storedSettings.context && !storedSettings.menuItems) {
    browser.storage.local.set(defaults);
    _settings = defaults;
  } else {
    _settings = storedSettings;
  }
  buildCustomFormatTable();
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, logError);

function logError(error) {
  console.error(error);
}

function saveOptions(event) {
  document.querySelectorAll('tr.format').forEach(function (elem) {
    let activeContexts = [];
    elem.querySelectorAll('input[data-context]').forEach(function (elem) {
      if (elem.checked) activeContexts.push(elem.dataset.context);
    });
    _settings.menuItems[elem.dataset.n].contexts = activeContexts;
  });

  let savingOptions = browser.storage.local.set(_settings);
  event.preventDefault();
}

function buildCustomFormatTable() {
  let _buffer = document.createDocumentFragment(),
      _$tbody = document.querySelector('#formats > tbody'),
      _n = 0;

  for (let menuItem of _settings.menuItems) {
    let _rowTemplate = document.getElementById('formatrow').content,
        _templateTD = _rowTemplate.querySelectorAll('td'),
        _separatorTemplate = document.getElementById('separator').content;

    if (menuItem.type && menuItem.type === 'separator') {
      _separatorTemplate.querySelector('tr').setAttribute('data-n', _n);
      for (let context of _settings.contexts) {
        _separatorTemplate.querySelector(`[data-context=${context}]`).checked = (menuItem.contexts.indexOf(context) > -1) ? true : false;
      }
      _buffer.appendChild(document.importNode(_separatorTemplate, true));
    } else if (menuItem.displayName && menuItem.template) {
      _templateTD[0].textContent = menuItem.displayName;
      _templateTD[1].textContent = menuItem.template;

      for (let context of _settings.contexts) {
        _rowTemplate.querySelector(`[data-context=${context}]`).checked = (menuItem.contexts.indexOf(context) > -1) ? true : false;
      }

      _rowTemplate.querySelector('tr').setAttribute('data-n', _n);
      _buffer.appendChild(document.importNode(_rowTemplate, true));
    }
    _n++;
  }

  _$tbody.innerHTML = '';
  _$tbody.appendChild(_buffer);
  document.querySelectorAll('#formats button').forEach(function(elem) {
    elem.addEventListener('click', function (e) {
      let menuitem = e.target.closest('[data-n]').dataset.n,
            action = e.target.dataset.action;
      switch (action) {
        case 'edit':
          editFormat(menuitem);
          break;
        case 'remove':
          removeMenuItem(menuitem);
          break;
        case 'up':
          moveMenuItem(menuitem, 'up');
          break;
        case 'down':
          moveMenuItem(menuitem, 'down');
          break;
      }
    })
  })
}

function addFormat() {
  let data = {},
      _$inputName = document.getElementById('format-displayname'),
      _$inputTemplate = document.getElementById('format-template');

  _$inputName.value = _$inputTemplate.value = '';

  _$modal.querySelector('button[data-action=cancel]').addEventListener('click', closeModal, { once: true });
  _$modal.querySelector('button[data-action=save]').addEventListener('click', function (evt) {
    if (!_$inputName.value && !_$inputTemplate.value) return;

    data.displayName = _$inputName.value.trim();
    data.template = _$inputTemplate.value;
    data.slug = 'custom' + _settings.customMenuItems;
    data.contexts = ['link', 'page', 'selection'];

    _settings.customMenuItems += 1;
    _settings.menuItems.push(data);

    buildCustomFormatTable();
    closeModal();
   }, { once: true });

  showModal();
}

function addSeparator() {
  _settings.menuItems.push({ type: 'separator', contexts: ['link', 'page', 'selection'] });
  buildCustomFormatTable();
}

function editFormat(menuItemToEdit) {
  let data = _settings.menuItems[menuItemToEdit],
      _$inputName = document.getElementById('format-displayname'),
      _$inputTemplate = document.getElementById('format-template');

  _$modal.querySelector('button[data-action=cancel]').addEventListener('click', closeModal, { once: true });
  _$modal.querySelector('button[data-action=save]').addEventListener('click', function (evt) {
    if (!_$inputName.value && !_$inputTemplate.value) return;

    data.displayName = _$inputName.value.trim();
    data.template = _$inputTemplate.value;

    _settings.menuItems[menuItemToEdit] = data;

    buildCustomFormatTable();
    closeModal();
   }, { once: true });

  _$inputName.value = data.displayName;
  _$inputTemplate.value = data.template;

  showModal();
}

function removeMenuItem(itemIndex) {
  _settings.menuItems.splice(itemIndex, 1);
  buildCustomFormatTable();
}

function moveMenuItem(itemIndex, direction) {
  let _toMove = parseInt(itemIndex, 10),
      _moveTo = (direction === 'up') ? _toMove - 1 : _toMove + 1;
      _moved = _settings.menuItems.move(_toMove, _moveTo);
  _settings.menuItems = _moved;
  buildCustomFormatTable();
}

Array.prototype.move = function (old_index, new_index) {
  /*https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another/5306832#5306832*/
  if (new_index >= this.length) {
    var k = new_index - this.length;
    while ((k--) + 1) {
      this.push(undefined);
    }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  return this;
};

function showModal() {
  _$modal.setAttribute('open', true);
}

function closeModal() {
  _$modal.removeAttribute('open');
}



function resetOptions() {
  let clearStorage = browser.storage.local.clear();
  restoreOptions();
}

document.getElementById('reset').addEventListener('click', resetOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('addCustomFormat').addEventListener('click', addFormat);
document.getElementById('addSeparator').addEventListener('click', addSeparator);
