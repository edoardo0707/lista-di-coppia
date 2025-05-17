const taskListDiv = document.getElementById('taskList');
const input = document.getElementById('newTask');

// Inizializza Firebase
const firebaseConfig = {
  apiKey: "TUO_API_KEY",
  authDomain: "tuo-progetto.firebaseapp.com",
  projectId: "tuo-progetto",
  storageBucket: "tuo-progetto.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const tasksCollection = db.collection("sharedTasks");

// Carica e mostra le attività da Firebase
function loadTasks() {
  tasksCollection.orderBy("text").get().then(snapshot => {
    taskListDiv.innerHTML = '';
    snapshot.forEach(doc => {
      const task = doc.data();
      const id = doc.id;

      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.onchange = () => toggleTask(id, task.done);

      const span = document.createElement('span');
      span.textContent = task.text;
      if (task.done) span.classList.add('done');

      label.appendChild(checkbox);
      label.appendChild(span);
      addDeleteButtonWithLongPress(label, id);
      taskListDiv.appendChild(label);
    });
  });
}

// Aggiunge una nuova attività
function addTask() {
  const text = input.value.trim();
  if (!text) return;

  tasksCollection.add({ text: text, done: false }).then(() => {
    input.value = '';
    loadTasks();
  });
}

// Cambia lo stato della task
function toggleTask(id, done) {
  tasksCollection.doc(id).update({ done: !done }).then(loadTasks);
}

// Rimuove una task
function removeTask(id) {
  tasksCollection.doc(id).delete().then(loadTasks);
}

// Bottone con pressione lunga per eliminare
function addDeleteButtonWithLongPress(label, taskId) {
  let pressTimer;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✖';
  deleteBtn.classList.add('delete-btn');

  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    removeTask(taskId);
  };

  label.appendChild(deleteBtn);

  label.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      deleteBtn.classList.add('show');
    }, 1000);
  });

  label.addEventListener('mouseup', () => clearTimeout(pressTimer));
  label.addEventListener('mouseleave', () => clearTimeout(pressTimer));

  document.addEventListener('click', (e) => {
    if (!label.contains(e.target)) {
      deleteBtn.classList.remove('show');
    }
  });
}

// Avvia caricamento
window.onload = loadTasks;

