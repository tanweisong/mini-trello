let taskLaneTemplate = document.createElement("template");
taskLaneTemplate.innerHTML = getTemplateString();

if (window.ShadyCSS)
  window.ShadyCSS.prepareTemplate(taskLaneTemplate, "task-lane");

class TaskLane extends HTMLElement {
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

    // create the lane title element and only show if creator attribute is null / "false"
    const nodeHeader = document.createElement("div");
    nodeHeader.className = "task-lane-header";
    nodeHeader.style.display = "flex";

    const title = document.createElement("input");
    title.className = "task-lane-title";
    title.addEventListener("focusout", this.handleTitleFocusOut);
    title.addEventListener("keydown", this.handleTitleKeyDown);
    nodeHeader.appendChild(title);

    const menu = document.createElement("input");
    menu.className = "task-lane-delete";
    menu.value = "X";
    menu.type = "button";
    menu.addEventListener("click", this.handleDeleteLane);
    nodeHeader.appendChild(menu);

    shadowRoot.appendChild(nodeHeader);

    // create the add another list element and only show if the creator attribute is "true"
    const createLaneHeader = document.createElement("div");
    createLaneHeader.className = "task-lane-create";
    createLaneHeader.style.display = "none";
    createLaneHeader.style.flexDirection = "column";

    createLaneHeader.addEventListener("click", function() {
      const createLaneHeader = this;
      const createLaneHeaderItems = createLaneHeader.children;
      const addAnotherListNode = createLaneHeaderItems[0];
      const createLaneForm = createLaneHeaderItems[1];

      // hide + add another list node
      addAnotherListNode.style.display = "none";

      // show create lane form
      createLaneForm.style.display = "flex";

      // set focus to title input
      createLaneForm.querySelector(".task-lane-create-title").focus();
    });

    // create the + Add another lane node
    const addAnotherListNode = document.createElement("div");
    const addAnotherListTextNode = document.createTextNode(
      "+ Add another list"
    );
    addAnotherListNode.appendChild(addAnotherListTextNode);
    createLaneHeader.appendChild(addAnotherListNode);

    // create the add lane form
    const createLaneForm = document.createElement("div");
    createLaneForm.style.display = "none";
    createLaneForm.style.flexDirection = "column";

    const createLaneTitle = document.createElement("input");
    createLaneTitle.type = "text";
    createLaneTitle.placeholder = "Enter list title...";
    createLaneTitle.classList.add("task-lane-create-title");
    createLaneForm.appendChild(createLaneTitle);

    const createLaneFormFooter = document.createElement("div");
    createLaneFormFooter.style.display = "flex";
    createLaneFormFooter.style.marginTop = "0.5rem";

    const createLaneFormAdd = document.createElement("input");
    createLaneFormAdd.type = "submit";
    createLaneFormAdd.value = "Add List";
    createLaneFormAdd.addEventListener("click", this.handleCreate);
    createLaneFormFooter.appendChild(createLaneFormAdd);

    const createLaneFormCancel = document.createElement("input");
    createLaneFormCancel.type = "button";
    createLaneFormCancel.value = "X";
    createLaneFormCancel.style.marginLeft = "0.25rem";
    createLaneFormCancel.addEventListener("click", this.handleCancelCreate);
    createLaneFormFooter.appendChild(createLaneFormCancel);

    createLaneForm.appendChild(createLaneFormFooter);
    createLaneHeader.appendChild(createLaneForm);

    shadowRoot.appendChild(createLaneHeader);

    this.shadowRoot.appendChild(
      document.importNode(taskLaneTemplate.content, true)
    );
  }

  get title() {
    this.shadowRoot.querySelector(".task-lane-title")[0].value;
  }
  set title(value) {
    this.shadowRoot.querySelector(".task-lane-title").value = value;
    this.shadowRoot.querySelector(
      ".task-lane-delete"
    ).title = `Click here to delete ${value}`;
  }

  set creator(value) {
    const taskLaneHeader = this.shadowRoot.querySelector(".task-lane-header");
    const taskLaneHeaderCreateNew = this.shadowRoot.querySelector(
      ".task-lane-create"
    );

    if (value != null && value === "true") {
      taskLaneHeader.style.display = "none";
      taskLaneHeaderCreateNew.style.display = "block";
      this.classList.add("transparent");
    } else {
      taskLaneHeader.style.display = "flex";
      taskLaneHeaderCreateNew.style.display = "none";
      this.classList.remove("transparent");
    }
  }

  checkLaneExists(title) {
    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();
      const url = `http://localhost:3000/lanes?title=${title}`;
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

  close() {
    const lane = this;
    const createLaneHeader = lane.shadowRoot.querySelector(".task-lane-create");
    const createLaneHeaderItems = createLaneHeader.children;
    const addAnotherListNode = createLaneHeaderItems[0];
    const createLaneForm = createLaneHeaderItems[1];

    // hide + add another list node
    addAnotherListNode.style.display = "block";

    // show create lane form
    createLaneForm.style.display = "none";

    // set focus to title input
    createLaneForm.querySelector(".task-lane-create-title").value = "";
  }

  async createLane(inTitle) {
    const lanes = await this.getLanes();
    const inId = lanes.length + 1;
    const lane = {
      title: inTitle
    };
    const json = JSON.stringify(lane);

    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();
      const url = "http://localhost:3000/lanes";
      Http.open("POST", url, true);
      Http.setRequestHeader("Content-type", "application/json; charset=utf-8");

      Http.onload = e => {
        resolve(JSON.parse(Http.response));
      };

      Http.onerror = e => {
        reject(Http.status);
      };

      Http.send(json);
    });
  }

  async deleteLane(id) {
    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();
      const url = `http://localhost:3000/lanes/${id}`;
      Http.open("DELETE", url, true);
      Http.setRequestHeader("Content-type", "application/json; charset=utf-8");

      Http.onload = e => {
        resolve(JSON.parse(Http.response));
      };

      Http.onerror = e => {
        reject(Http.status);
      };

      Http.send(null);
    });
  }

  async updateLane(id, inTitle) {
    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();
      const url = `http://localhost:3000/lanes/${id}`;
      Http.open("PATCH", url, true);
      Http.setRequestHeader("Content-type", "application/json; charset=utf-8");

      Http.onload = e => {
        resolve(JSON.parse(Http.response));
      };

      Http.onerror = e => {
        reject(Http.status);
      };

      const json = JSON.stringify({ title: inTitle });
      Http.send(json);
    });
  }

  getLanes() {
    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();
      const url = "http://localhost:3000/lanes";
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

  handleCancelCreate(e) {
    e.stopPropagation();

    const host = e.target.getRootNode().host;

    host.close();
  }

  async handleCreate(e) {
    e.stopPropagation();

    const createLaneFormAdd = this;
    const createLaneForm = createLaneFormAdd.parentElement.parentElement;
    const laneTitle = createLaneForm.querySelector('input[type="text"]').value;
    const host = e.target.getRootNode().host;

    if (laneTitle != null && laneTitle.trim() !== "") {
      const lanes = await host.checkLaneExists(laneTitle);

      if (lanes != null && lanes.length === 0) {
        const lane = await host.createLane(laneTitle);

        if (lane != null) {
          host.setAttribute("title", lane["title"]);
          host.setAttribute("_id", lane["id"]);
          host.setAttribute("creator", false);
        }
      }
    }
  }

  async handleDeleteLane(e) {
    const host = e.target.getRootNode().host;
    const _id = host.getAttribute("_id");

    host.deleteLane(_id);
  }

  async handleTitleFocusOut(e) {
    const nodeTitle = this;
    const title = nodeTitle.value;
    const host = e.target.getRootNode().host;

    if (title != null && title.trim() !== "") {
      const lanes = await host.checkLaneExists(title);

      if (lanes != null && lanes.length === 0) {
        const _id = host.getAttribute("_id");
        const lane = await host.updateLane(_id, title);

        if (lane != null) {
          host.setAttribute("title", lane["title"]);
        }
      } else {
        const oldTitle = host.getAttribute("title");
        nodeTitle.value = oldTitle;
      }
    }
  }

  async handleTitleKeyDown(e) {
    e.stopPropagation();

    const nodeTitle = this;
    const title = nodeTitle.value;
    const host = e.target.getRootNode().host;

    if (e.which === 13 && title != null && title.trim() !== "") {
      const lanes = await host.checkLaneExists(title);

      if (lanes != null && lanes.length === 0) {
        const _id = host.getAttribute("_id");
        const lane = await host.updateLane(_id, title);

        if (lane != null) {
          host.setAttribute("title", lane["title"]);
        }
      } else {
        const oldTitle = host.getAttribute("title");
        nodeTitle.value = oldTitle;
      }
    }
  }

  connectedCallback() {}

  static get observedAttributes() {
    return ["title", "creator"];
  }
  attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue !== newValue) this[attr] = newValue;
  }
}

// Define the custom element! This tells the browser that the <task-lane>
// element uses _this_ implementation.
window.customElements.define("task-lane", TaskLane);

function getTemplateString() {
  return `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 272px;
      height: auto;
      border-radius: 5px;
      background-color: #ebecf0;
      margin: 0.5rem;
      padding: 0.5rem;
    }
    :host(:hover) {
      cursor: pointer;
    }
    :host(.transparent){
      background-color: hsla(0,0%,100%,.24);
      color: #fff;
    }
    :host(.transparent:hover) {
      background-color: hsla(0,0%,100%,.32) !important;
    }
    .task-lane-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .task-lane-title {
      padding: 0.25rem;
      background-color: #ebecf0;
      border: 1px solid transparent;
      flex-grow: 1;
      font-weight: bold;
      color: #172b4d;
    }
    .task-lane-title:hover {
      cursor: pointer;
    }
    .task-lane-title:focus {
      background-color: #fff;
    }
    .task-lane-delete,
    .task-lane-header-create {
      margin-left: 0.5rem;
      font-weight: bold;
    }
    .task-lane-create {
      padding: 0.2rem;
    }
    .task-lane-header-create:focus {
      outline: none;
    }
    .task-lane-header-create:hover {
      cursor: pointer;
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
