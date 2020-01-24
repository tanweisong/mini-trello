function getLanes() {
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

function getTasks() {
  return new Promise((resolve, reject) => {
    const Http = new XMLHttpRequest();
    const url = "http://localhost:3000/tasks";
    Http.open("GET", url);

    Http.onload = e => {
      const tasks = JSON.parse(Http.response);

      resolve(tasks);
    };

    Http.onerror = e => {
      reject(Http.status);
    };

    Http.send();
  });
}

function getTasksById(laneId, tasks) {
  let filteredTasks = [];

  if (tasks != null) {
    for (let index = 0; index < tasks.length; index++) {
      const task = tasks[index];
      const parentId = task["laneId"];

      if (parentId === laneId) {
        filteredTasks.push(task);
      }
    }
  }

  return filteredTasks;
}

function handleMainClicked(e) {
  const target = e.target.localName;

  if (target === "main") {
    const lanes = document.getElementsByTagName("task-lane");
    const cards = document.getElementsByTagName("task-card");

    for (let index = 0; index < lanes.length; index++) {
      const lane = lanes[index];

      lane.close();
    }

    for (let index = 0; index < cards.length; index++) {
      const card = cards[index];

      card.close();
    }
  }
}

async function populateView() {
  const lanes = await getLanes();
  const tasks = await getTasks();

  if (lanes != null) {
    for (let laneInd = 0; laneInd < lanes.length; laneInd++) {
      const laneObj = lanes[laneInd];
      const laneTitle = laneObj["title"];
      const laneId = laneObj["id"];
      let lane = document.createElement("task-lane");
      const laneTasks = getTasksById(laneId, tasks);

      const laneTitleAttribute = document.createAttribute("title");
      laneTitleAttribute.value = laneTitle;
      lane.setAttributeNode(laneTitleAttribute);

      const laneIdAttribute = document.createAttribute("_id");
      laneIdAttribute.value = laneId;
      lane.setAttributeNode(laneIdAttribute);

      if (laneTasks != null) {
        for (let taskInd = 0; taskInd < laneTasks.length; taskInd++) {
          const task = laneTasks[taskInd];
          let card = document.createElement("task-card");

          const title = document.createAttribute("title");
          title.value = task["title"];

          const description = document.createAttribute("description");
          description.value = task["description"];

          const _id = document.createAttribute("_id");
          _id.value = task["id"];

          const taskLaneId = document.createAttribute("laneId");
          taskLaneId.value = laneId;

          card.setAttributeNode(title);
          card.setAttributeNode(description);
          card.setAttributeNode(_id);
          card.setAttributeNode(taskLaneId);

          lane.appendChild(card);
        }
      }

      let card = document.createElement("task-card");
      let creator = document.createAttribute("creator");

      creator.value = true;
      card.setAttributeNode(creator);

      const taskLaneId = document.createAttribute("laneId");
      taskLaneId.value = laneId;

      card.setAttributeNode(taskLaneId);

      lane.appendChild(card);

      document.querySelector("main").appendChild(lane);
    }
  }

  let lane = document.createElement("task-lane");
  let creator = document.createAttribute("creator");

  creator.value = true;
  lane.setAttributeNode(creator);

  document.querySelector("main").appendChild(lane);

  document
    .querySelector("main")
    .addEventListener("click", this.handleMainClicked);
}

populateView();
