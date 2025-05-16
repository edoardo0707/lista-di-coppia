const taskListDiv = document.getElementById('taskList');
const input = document.getElementById('newTask');

// Carica e mostra le attività
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Ordina alfabeticamente (case-insensitive)
  tasks.sort((a, b) => a.text.localeCompare(b.text, 'it', { sensitivity: 'base' }));

  localStorage.setItem('tasks', JSON.stringify(tasks));

  taskListDiv.innerHTML = '';

  tasks.forEach((task, index) => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.onchange = () => toggleTask(index);

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.done) span.classList.add('done');

    label.appendChild(checkbox);
    label.appendChild(span);

    // Aggiungo il pulsante elimina con long press
    addDeleteButtonWithLongPress(label, index);

    taskListDiv.appendChild(label);
  });
}

// Aggiungi una nuova attività
function addTask() {
  const text = input.value.trim();
  if (!text) return;

  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push({ text, done: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  input.value = '';
  loadTasks(); // verrà riordinata automaticamente
}

// Cambia lo stato della checkbox
function toggleTask(index) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks[index].done = !tasks[index].done;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

// Funzione che aggiunge il bottone elimina con long press + animazioni
function addDeleteButtonWithLongPress(label, taskIndex) {
  let pressTimer;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✖';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.style.marginLeft = 'auto';

  // Rimuovi task al clic del bottone
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    removeTask(taskIndex);
  };

  label.appendChild(deleteBtn);

  // Mostra il bottone dopo 1 secondo di pressione
  label.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      deleteBtn.classList.add('show');
    }, 1000);
  });

  label.addEventListener('mouseup', () => clearTimeout(pressTimer));
  label.addEventListener('mouseleave', () => clearTimeout(pressTimer));

  // Nascondi il bottone se clicchi fuori
  document.addEventListener('click', (e) => {
    if (!label.contains(e.target)) {
      deleteBtn.classList.remove('show');
    }
  });
}

// Rimuove la task e aggiorna storage + lista
function removeTask(index) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

// Caricamento iniziale
window.onload = loadTasks;
