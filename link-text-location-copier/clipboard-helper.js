function copyToClipboard(toBePasted, outputAsHTML) {
  function oncopy(event) {
    document.removeEventListener('copy', oncopy, true);
    event.stopImmediatePropagation();
    event.preventDefault();

    if (outputAsHTML) {
      event.clipboardData.setData('text/html', toBePasted);
    }
    else {
      event.clipboardData.setData('text/plain', toBePasted);
    }
  }
  document.addEventListener('copy', oncopy, true);
  document.execCommand('copy');
}
