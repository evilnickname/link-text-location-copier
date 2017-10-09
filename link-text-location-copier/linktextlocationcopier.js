let _settings;

function onError(e) {
  console.error(e);
}

function checkStoredSettings(storedSettings) {
  if (!storedSettings.length) {
    browser.storage.local.set(defaults);
    _settings = defaults;
  } else {
    _settings = storedSettings;
  }
  setupMenus();
  browser.storage.onChanged.addListener(refreshMenu);
}

function getMenuSettings(item, context) {
  let menuSettings = {};
  if (item.slug) {
    menuSettings.id = `${context}-${item.slug}`;
  }
  if (item.type){
    menuSettings.type = item.type
  }
  if (item.title) {
    menuSettings.title = item.title.trim();
  } else if (item.displayName) {
    menuSettings.title = `${_settings.strings[context].trim()} ${item.displayName}`;
  }
  menuSettings.contexts = [context];

  return menuSettings;
}

function refreshMenu(changes, area) {
  _settings.menuItems = changes.menuItems.newValue;
  browser.contextMenus.removeAll();
  setupMenus();
}

function setupMenus() {
  for (let menuItem of _settings.menuItems) {
    for (let context of menuItem.contexts) {
      browser.contextMenus.create(getMenuSettings(menuItem, context));
    }
  }
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

browser.contextMenus.onClicked.addListener(function(info, tab) {
  let text,
      link,
      outputtext,
      clickedContext = info.menuItemId.substring(0, info.menuItemId.indexOf('-')),
      clickedItemName = info.menuItemId.substring(info.menuItemId.indexOf('-') + 1),
      clickedItem = _settings.menuItems.filter(function( obj ) {
        return obj.slug === clickedItemName;
      });

  if (clickedContext === 'link') {
    link = info.linkUrl;
    text = info.linkText;
  } else if (clickedContext === 'page') {
    link = tab.url;
    text = tab.title;
  } else if (clickedContext === 'selection') {
    link = info.pageUrl;
    text = info.selectionText;
  }

  outputtext = clickedItem[0].template;
  outputtext = outputtext.replace(/%T/, text);
  outputtext = outputtext.replace(/%U/, link);

  const code = 'copyToClipboard(' + JSON.stringify(outputtext) + ');';

  browser.tabs.executeScript({
    code: 'typeof copyToClipboard === "function";',
  }).then((results) => {
    if (!results || results[0] !== true) {
      return browser.tabs.executeScript(tab.id, { file: 'clipboard-helper.js' });
    }
  }).then(() => {
    return browser.tabs.executeScript(tab.id, { code });
  }).catch((error) => {
    console.error('Failed to copy text: ' + error);
  });
});
