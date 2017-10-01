const defaults = {
  contexts: {
    link: {
      enabled: true,
      menuItems: ['title', 'separator', 'plain', 'html', 'separator', 'markdown', 'bbcode'],
      title: browser.i18n.getMessage('copyLinkLocationString')
    },
    page: {
      enabled: true,
      menuItems: ['plain', 'html', 'separator', 'markdown', 'bbcode'],
      title: browser.i18n.getMessage('copyPageLocationString')
    },
    selection: {
      enabled: false,
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
