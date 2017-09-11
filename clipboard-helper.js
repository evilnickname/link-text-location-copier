function copyToClipboard(text, html) {
    function oncopy(event) {
        document.removeEventListener("copy", oncopy, true);
        event.stopImmediatePropagation();
        event.preventDefault();
        event.clipboardData.setData("text/plain", text);
    }
    document.addEventListener("copy", oncopy, true);
    document.execCommand("copy");
}
