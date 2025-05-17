const taskListDiv = document.getElementById('taskList');
const input = document.getElementById('newTask');

const db = window.db || firebase.firestore();
window.db = db;
const tasksRef = db.collection("tasks");

// Mostra attività in tempo reale
tasksRef.orderBy("text").onSnapshot(snapshot => {
  taskListDiv.innerHTML = '';
  snapshot.forEach(doc => {
    const task = doc.data();
    const label = document.createElement('label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.onchange = () => toggleTask(doc.id, task.done);

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.done) span.classList.add('done');

    label.appendChild(checkbox);
    label.appendChild(span);
    taskListDiv.appendChild(label);
  });
});

// Aggiungi una nuova attività
function addTask() {
  const text = input.value.trim();
  if (!text) return;

  tasksRef.add({
    text: text,
    done: false,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    input.value = '';
  }).catch(e => console.error("Errore aggiungendo task:", e));
}

// Cambia stato attività
function toggleTask(id, currentDoneStatus) {
  tasksRef.doc(id).update({
    done: !currentDoneStatus
  }).catch(e => console.error("Errore aggiornando task:", e));
}

