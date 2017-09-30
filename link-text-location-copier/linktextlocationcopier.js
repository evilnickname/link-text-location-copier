const defaults = {
  contexts: {
    link: {
      menuItems: ['title', 'separator', 'plain', 'html', 'separator', 'markdown', 'bbcode'],
      title: browser.i18n.getMessage('copyLinkLocationString')
    },
    page: {
      menuItems: ['plain', 'html', 'separator', 'markdown', 'bbcode'],
      title: browser.i18n.getMessage('copyPageLocationString')
    },
    selection: {
      menuItems: ['plain', 'html', 'separator', 'markdown', 'bbcode'],
      title: browser.i18n.getMessage('copySelectionLocationString')
    }
  },
  menuItems: {
    title: {
      slug: 'title',
      title: browser.i18n.getMessage('copyLinkTextString'),
      template: '%T'
    },
    separator: { type: 'separator' },
    plain: {
      slug: 'plain',
      displayName: browser.i18n.getMessage('plainTextString'),
      template: '%T — %U'
    },
    html: {
      slug: 'html',
      displayName: 'HTML',
      template: '<a href="%U">%T</a>'
    },
    markdown: {
      slug: 'markdown',
      displayName: 'Markdown',
      template: '[%T](%U)'
    },
    bbcode: {
      slug: 'bbcode',
      displayName: 'BB Code',
      template: '[url=%U]%T[/url]'
    }
  }
};

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
  }
  if (item.displayName) {
    menuSettings.title = `${defaults.contexts[context].title.trim()} ${item.displayName}`;
  }
  menuSettings.contexts = [context];

  return menuSettings;
}

for (let context in defaults.contexts) {
  for (let menuItem of defaults.contexts[context].menuItems) {
    browser.contextMenus.create(getMenuSettings(defaults.menuItems[menuItem], context));
  }
}

browser.contextMenus.onClicked.addListener(function(info, tab) {
  let text,
      link,
      outputtext,
      clickedContext = info.menuItemId.substring(0, info.menuItemId.indexOf('-')),
      clickedItemName = info.menuItemId.substring(info.menuItemId.indexOf('-') + 1);

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

  outputtext = defaults.menuItems[clickedItemName].template;
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
