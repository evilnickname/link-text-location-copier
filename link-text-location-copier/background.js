browser.contextMenus.create({
  id: "link-text-only",
  title: "Copy link text",
  contexts: ["link"]
});

browser.contextMenus.create({
  id: "separator-1",
  type: "separator",
  contexts: ["link"]
});

browser.contextMenus.create({
  id: "link-plain-text",
  title: "Copy link text and location as plain text",
  contexts: ["link"]
});

browser.contextMenus.create({
  id: "link-html",
  title: "Copy link text and location as HTML",
  contexts: ["link"]
});

browser.contextMenus.create({
  id: "page-plain-text",
  title: "Copy page title and location as plain text",
  contexts: ["page"]
});

browser.contextMenus.create({
  id: "page-html",
  title: "Copy page title and location as HTML",
  contexts: ["page"]
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
    let title, link, outputtext;
    
    if (info.menuItemId.indexOf('link-') === 0) {
        link = info.linkUrl;
        title = info.linkText;
    } else if (info.menuItemId.indexOf('page-') === 0) {
        link = tab.url;
        title = tab.title;
    }

    switch (info.menuItemId) {
        case "link-text-only":
            outputtext = title;
            break;
        case "link-plain-text":
            outputtext = `${title} — ${link}`;
            break;
        case "link-html":
            outputtext = `<a href="${link}">${title}</a>`;
            break;
        case "page-plain-text":
            outputtext = `${title} — ${link}`;
            break;
        case "page-html":
            outputtext = `<a href="${link}">${title}</a>`;
            break;

    }

    const code = "copyToClipboard(" + JSON.stringify(outputtext) + ");";

    browser.tabs.executeScript({
        code: "typeof copyToClipboard === 'function';",
    }).then((results) => {
        if (!results || results[0] !== true) {
            return browser.tabs.executeScript(tab.id, {
                file: "clipboard-helper.js",
            });
        }
    }).then(() => {
        return browser.tabs.executeScript(tab.id, {
            code,
        });
    }).catch((error) => {
        console.error("Failed to copy text: " + error);
    });
});
