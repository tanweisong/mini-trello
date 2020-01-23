let taskCardTemplate = document.createElement("template");
taskCardTemplate.innerHTML = getTemplateString();

if (window.ShadyCSS)
  window.ShadyCSS.prepareTemplate(taskCardTemplate, "task-card");

class TaskCard extends HTMLElement {
  constructor() {
    super();

    // This is needed for the Shady DOM polyfill, since it's not available on all browsers.
    if (window.ShadyCSS) {
      window.ShadyCSS.styleElement(this);
    }

    // Attach a shadow root to the element, so that the implementation is hidden in it
    let shadowRoot = this.attachShadow({
      mode: "open"
    });

    this.shadowRoot.appendChild(
      document.importNode(taskCardTemplate.content, true)
    );
  }
}
