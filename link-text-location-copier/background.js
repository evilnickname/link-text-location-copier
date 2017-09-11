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
    let text;

    switch (info.menuItemId) {
        case "link-text-only":
            text = info.linkText;
            break;
        case "link-plain-text":
            text = `${info.linkText} — ${info.linkUrl}`;
            break;
        case "link-html":
            text = `<a href="${info.linkUrl}">${info.linkText}</a>`;
            break;
        case "page-plain-text":
            text = `${tab.title} — ${tab.url}`;
            break;
        case "page-html":
            text = `<a href="${tab.title}">${tab.url}</a>`;
            break;

    }

    const code = "copyToClipboard(" + JSON.stringify(text) + ");";

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
