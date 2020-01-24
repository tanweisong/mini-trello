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

    const nodeContent = document.createElement("div");
    nodeContent.className = "task-card-content";

    // create the view only element
    const nodeView = document.createElement("div");
    nodeView.className = "task-card-view";
    nodeView.addEventListener("click", this.handleCardClick);
    nodeContent.appendChild(nodeView);

    const nodeCreate = document.createElement("div");
    nodeCreate.style.display = "none";
    nodeCreate.style.flexDirection = "column";

    const nodeCreateTextArea = document.createElement("textarea");
    nodeCreateTextArea.rows = 5;
    nodeCreateTextArea.className = "task-card-title";
    nodeCreateTextArea.placeholder = "Enter a title for this card...";
    nodeCreateTextArea.style.resize = "none";
    nodeCreateTextArea.addEventListener(
      "focusout",
      this.handleTextAreaFocusout
    );
    nodeCreate.appendChild(nodeCreateTextArea);

    const nodeCreateFooter = document.createElement("div");
    nodeCreateFooter.display = "flex";

    const nodeAddCard = document.createElement("input");
    nodeAddCard.type = "submit";
    nodeAddCard.addEventListener("click", this.handleAddCard);
    nodeAddCard.value = "Add Card";

    const nodeCancelAdd = document.createElement("input");
    nodeCancelAdd.type = "button";
    nodeCancelAdd.value = "X";
    nodeCancelAdd.addEventListener("click", this.handleCancelAdd);
    nodeCancelAdd.style.marginLeft = "0.25rem";

    nodeCreateFooter.appendChild(nodeAddCard);
    nodeCreateFooter.appendChild(nodeCancelAdd);
    nodeCreate.appendChild(nodeCreateFooter);

    nodeContent.appendChild(nodeCreate);

    shadowRoot.appendChild(nodeContent);

    this.shadowRoot.appendChild(
      document.importNode(taskCardTemplate.content, true)
    );
  }

  get title() {
    this.shadowRoot.querySelector(".task-card-view").innerHTML;
  }

  set title(value) {
    this.shadowRoot.querySelector(".task-card-view").innerHTML = value;
  }

  async checkTaskExists(inTitle) {
    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();
      const url = `http://localhost:3000/tasks?title=${inTitle}`;
      Http.open("GET", url);

      Http.onload = e => {
        resolve(JSON.parse(Http.response));
      };

      Http.onerror = e => {
        reject(Http.status);
      };

      Http.send();
    });
  }

  async createTask(inLaneId, inTitle) {
    const host = this;
    const tasks = await host.getTasks();
    const taskId = tasks.length + 1;
    const task = {
      title: inTitle,
      laneId: inLaneId
    };
    const json = JSON.stringify(task);

    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();
      const url = `http://localhost:3000/tasks`;
      Http.open("POST", url);

      Http.onload = e => {
        resolve(JSON.parse(Http.response));
      };

      Http.onerror = e => {
        reject(Http.status);
      };

      Http.send(json);
    });
  }

  close() {
    const card = this;
    const nodeContent = card.shadowRoot.querySelector(".task-card-content");
    const nodeContentItems = nodeContent.children;
    const nodeView = nodeContentItems[0];
    const nodeCreate = nodeContentItems[1];

    nodeView.style.display = "block";

    nodeCreate.style.display = "none";
    nodeCreate.querySelector("textarea").value = "";
  }

  async getTasks() {
    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();
      const url = "http://localhost:3000/tasks";
      Http.open("GET", url);

      Http.onload = e => {
        resolve(JSON.parse(Http.response));
      };

      Http.onerror = e => {
        reject(Http.status);
      };

      Http.send();
    });
  }

  async handleAddCard(e) {
    e.stopPropagation();

    const host = e.target.getRootNode().host;
    const nodeCreateTextArea = host.shadowRoot.querySelector(
      ".task-card-title"
    );
    const title = nodeCreateTextArea.value;
    const laneId = host.getAttribute("laneId");

    if (title != null && title.trim() !== "") {
      const card = await host.checkTaskExists(title);

      if (card != null && card.length === 0) {
        const task = await host.createTask(laneId, title);

        if (task != null) {
        }
      }
    }
  }

  handleCancelAdd(e) {
    e.stopPropagation();

    const host = e.target.getRootNode().host;

    host.close();
  }

  handleCardClick(e) {
    e.stopPropagation();

    const host = e.target.getRootNode().host;
    const creator = host.getAttribute("creator");

    if (creator != null && creator === "true") {
      const nodeContent = host.shadowRoot.querySelector(".task-card-content");
      const nodeContentItems = nodeContent.children;
      const nodeView = nodeContentItems[0];
      const nodeCreate = nodeContentItems[1];

      nodeView.style.display = "none";

      nodeCreate.style.display = "flex";
      nodeCreate.querySelector("textarea").focus();
    }
  }

  connectedCallback() {
    const card = this;
    const creator = card.getAttribute("creator");

    if (creator != null || creator === true) {
      this.shadowRoot
        .querySelector(".task-card-view")
        .classList.add("transparent");
      this.setAttribute("title", "+ Add a card");
    }
  }

  static get observedAttributes() {
    return ["title", "creator"];
  }
  attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue !== newValue) this[attr] = newValue;
  }
}

// Define the custom element! This tells the browser that the <happy-thing>
// element uses _this_ implementation.
window.customElements.define("task-card", TaskCard);

function getTemplateString() {
  return `
  <style>
    :host {
     
    }
    :host(:not(:last-child)) {
      margin-bottom: 8px;
    }
    :host(:hover) {
      cursor: pointer;
    }
    .task-card-view.transparent  {
      background-color: transparent;
      box-shadow: none;
      color: #5e6c84;
    }
    .task-card-view.transparent:hover  {
      background-color: rgba(9,30,66,.08);
      color: #172b4d;
    }
    .task-card-view {
      padding: 0.5rem;
      background-color: #fff;
      border-radius: 3px;
      box-shadow: 0 1px 0 rgba(9,30,66,.25);
    }
    textarea {
      margin-bottom: 8px;
      padding: 0.25rem;
      border-radius: 3px;
      border: 1px solid transparent;
    }
    input {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important;
      padding: 0.25rem;
      border-radius: 3px;
      border: 1px solid transparent;
    }
    input[type="button"] {
      border: 1px solid transparent;
      padding: 0.25rem 0.5rem;
      background-color: #ebecf0;
      cursor : pointer;
    }
    input[type="submit"] {
      background-color: #49852e;
      color : #FFF;
      cursor : pointer;
    }
  </style>
  <slot></slot>
`;
}
