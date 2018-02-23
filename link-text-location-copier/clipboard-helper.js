function copyToClipboard(toBePasted, outputAsHTML) {
  if ((document.activeElement instanceof HTMLIFrameElement) || (document.activeElement instanceof HTMLFrameElement)) {
    /* there is some bug with (i)frames, that prevent links from being copied. Fix suggested by and taken from Copy Link Text — https://github.com/def00111/copy-link-text */
    document.activeElement.blur();
    document.activeElement.blur();
  }

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
