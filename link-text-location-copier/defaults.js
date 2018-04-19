const defaults = {
  contexts: ['link', 'page', 'selection'],
  strings: {
    link: browser.i18n.getMessage('copyLinkLocationString'),
    page: browser.i18n.getMessage('copyPageLocationString'),
    selection: browser.i18n.getMessage('copySelectionLocationString')
  },
  menuItems: [
    {
      slug: 'title',
      displayName: 'link text',
      title: browser.i18n.getMessage('copyLinkTextString'),
      template: '%T',
      contexts: ['link']
    },
    {
      type: 'separator',
      contexts: ['link']
    },
    {
      slug: 'plain',
      displayName: browser.i18n.getMessage('plainTextString'),
      template: '%T — %U',
      contexts: ['link', 'page', 'selection']
    },
    {
      slug: 'html',
      displayName: 'HTML',
      template: '<a href="%U">%T</a>',
      contexts: ['link', 'page', 'selection']
    },
    {
      type: 'separator',
      contexts: ['link', 'page', 'selection']
    },
    {
      slug: 'markdown',
      displayName: 'Markdown',
      template: '[%T](%U)',
      contexts: ['link', 'page', 'selection']
    },
    {
      slug: 'bbcode',
      displayName: 'BB Code',
      template: '[url=%U]%T[/url]',
      contexts: ['link', 'page', 'selection']
    },
    {
      type: 'separator',
      contexts: ['link', 'page']
    },
    {
      slug: 'richtext',
      displayName: 'rich text',
      template: '<a href="%U">%T</a>',
      contexts: ['link', 'page'],
      outputAsHTML: true
    }
  ],
  customMenuItems: 0
};
