const defaults = {
  link: {
    menuItems: ['title', 'separator', 'plain', 'html', 'separator', 'markdown', 'bbcode'],
    title: browser.i18n.getMessage('copyLinkLocationString')
  },
  page: {
    menuItems: ['plain', 'html', 'separator', 'markdown', 'bbcode'],
    title: browser.i18n.getMessage('copyPageLocationString')
  }
};

const menuItems = {
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
    menuSettings.title = `${defaults[context].title.trim()} ${item.displayName}`;
  }
  menuSettings.contexts = [context];

  return menuSettings;
}

for (item of defaults.link.menuItems) {
  browser.contextMenus.create(getMenuSettings(menuItems[item], 'link'));
}

for (item of defaults.page.menuItems) {
  browser.contextMenus.create(getMenuSettings(menuItems[item], 'page'));
}

browser.contextMenus.onClicked.addListener(function(info, tab) {
  let title,
      link,
      outputtext,
      clickedContext = info.menuItemId.substring(0, info.menuItemId.indexOf('-')),
      clickedItemName = info.menuItemId.substring(info.menuItemId.indexOf('-') + 1);

  console.log(info)

  link = (info.pageUrl) ? info.pageUrl : '';

  switch(clickedContext) {
    case 'page':
      text = tab.title;
      break;
    case 'selection':
      text = info.selectionText;
      break;
    default:
      text = (info.linkText) ? info.linkText : '';
      break;
  }

  outputtext = menuItems[clickedItemName].template;
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
