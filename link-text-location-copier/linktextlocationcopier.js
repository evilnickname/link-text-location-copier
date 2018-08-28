let _addonSettings;

function onError(e) {
  console.error(e);
}

function checkStoredSettings(storedSettings) {
  if (!storedSettings.context && !storedSettings.menuItems) {
    _addonSettings = defaults;
  } else {
    _addonSettings = storedSettings;
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
    menuSettings.title = `${_addonSettings.strings[context].trim()} ${item.displayName}`;
  }
  menuSettings.contexts = [context];

  return menuSettings;
}

function refreshMenu(changes, area) {
  _addonSettings.menuItems = changes.menuItems.newValue;
  browser.contextMenus.removeAll();
  setupMenus();
}

function setupMenus() {
  if (!_addonSettings.menuItems) return;
  for (let menuItem of _addonSettings.menuItems) {
    for (let context of menuItem.contexts) {
      browser.contextMenus.create(getMenuSettings(menuItem, context));
    }
  }
}

function stripUTM(link) {
  const url = new URL(link);
  const searchParams = new URLSearchParams(url.search);
  const outParams = new URLSearchParams();

  for (let p of searchParams) {
    if (p[0].indexOf('utm_') < 0) {
      outParams.set(p[0], p[1])
    }
  }
  url.search = outParams.toString();

  return url.toString();
}

// https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
function escapeHTML(str) {
    // Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
    // Most often this is not the case though.
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

browser.contextMenus.onClicked.addListener(function(info, tab) {
  //console.log(info, tab)
  let text,
      link,
      outputtext,
      clickedContext = info.menuItemId.substring(0, info.menuItemId.indexOf('-')),
      clickedItemName = info.menuItemId.substring(info.menuItemId.indexOf('-') + 1),
      clickedItem = _addonSettings.menuItems.filter(function( obj ) {
        return obj.slug === clickedItemName;
      });

  clickedItem = clickedItem[0];

  if (clickedContext === 'link') {
    link = info.linkUrl;
    text = info.linkText;
  } else if (clickedContext === 'page') {
    link = tab.url;
    text = tab.title;
  } else if (clickedContext === 'selection') {
    link = (info.frameUrl === undefined) ? info.pageUrl : info.frameUrl;
    text = info.selectionText;
  }

  // strip UTM_ params from links
  if (_addonSettings.dontStripUTM !== true && link.indexOf('utm_') !== -1) { link = stripUTM(link) }
  // decoded URIs for non-ANSI links when option is toggled
  if (_addonSettings.useDecodedURI === true) { link = window.decodeURIComponent(link) }
  // Always HTML-escape external input to avoid XSS
  if (clickedItem.outputAsHTML) { link = escapeHTML(link) }

  outputtext = clickedItem.template;
  outputtext = outputtext.replace(/%N/g, '\n');
  outputtext = outputtext.replace(/%B/g, '\t');
  outputtext = outputtext.replace(/%L/g, function() {
    var _ts = new Date();
    return _ts.toLocaleString();
  });
  outputtext = outputtext.replace(/%I/g, function() {
    return (info.mediaType && info.mediaType === 'image') ? info.srcUrl : '';
  });

  outputtext = outputtext.replace(/%linktitle%/g, info.linkText);
  outputtext = outputtext.replace(/%linkurl%/g, info.linkUrl);
  outputtext = outputtext.replace(/%pagetitle%/g, tab.title);
  outputtext = outputtext.replace(/%pageurl%/g, tab.url);
  outputtext = outputtext.replace(/%documenturl%/g, info.frameUrl);
  outputtext = outputtext.replace(/%selection%/g, info.selectionText);

  outputtext = outputtext.replace(/%T/g, text);
  outputtext = outputtext.replace(/%U/g, link);

  const code = 'copyToClipboard(' + JSON.stringify(outputtext) + ',' + clickedItem.outputAsHTML +');';

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
