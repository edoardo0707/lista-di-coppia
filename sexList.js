
const taskListDiv = document.getElementById('taskList');
const input = document.getElementById('newTask');
const tasksRef = db.collection("tasks");

tasksRef.orderBy("text").onSnapshot(snapshot => {
  taskListDiv.innerHTML = '';

  snapshot.forEach(doc => {
    const task = doc.data();

    const taskWrapper = document.createElement('div');
    taskWrapper.className = 'task-wrapper';

    const label = document.createElement('label');
    label.setAttribute('data-docid', doc.id);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.onchange = () => toggleTask(doc.id, task.done);

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.done) span.classList.add('done');

    label.appendChild(checkbox);
    label.appendChild(span);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Elimina';
    deleteBtn.className = 'delete-btn';
    deleteBtn.style.display = 'none';

    deleteBtn.onclick = () => {
      tasksRef.doc(doc.id).delete();
    };

    taskWrapper.appendChild(label);
    taskWrapper.appendChild(deleteBtn);
    taskListDiv.appendChild(taskWrapper);

    // Variables to track swipe/drag
    let startX = 0;
    let currentX = 0;
    let swiping = false;

    function showDelete(show) {
      if (show) {
        label.style.transition = 'transform 0.3s ease';
        label.style.transform = 'translateX(-80px)';
        deleteBtn.style.display = 'block';
      } else {
        label.style.transition = 'transform 0.3s ease';
        label.style.transform = 'translateX(0)';
        deleteBtn.style.display = 'none';
      }
    }

    // TOUCH EVENTS
    label.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      swiping = true;
      label.style.transition = '';
    });

    label.addEventListener('touchmove', e => {
      if (!swiping) return;
      currentX = e.touches[0].clientX;
      let deltaX = currentX - startX;
      if (deltaX < 0) {
        deltaX = Math.max(deltaX, -80);
        label.style.transform = `translateX(${deltaX}px)`;
      }
    });

    label.addEventListener('touchend', e => {
      if (!swiping) return;
      swiping = false;
      let deltaX = currentX - startX;
      if (deltaX < -40) {
        showDelete(true);
      } else {
        showDelete(false);
      }
    });

    // MOUSE EVENTS (per PC)
    label.addEventListener('mousedown', e => {
      startX = e.clientX;
      swiping = true;
      label.style.transition = '';
      // Previeni selezione testo durante drag
      e.preventDefault();
    });

    label.addEventListener('mousemove', e => {
      if (!swiping) return;
      currentX = e.clientX;
      let deltaX = currentX - startX;
      if (deltaX < 0) {
        deltaX = Math.max(deltaX, -80);
        label.style.transform = `translateX(${deltaX}px)`;
      }
    });

    label.addEventListener('mouseup', e => {
      if (!swiping) return;
      swiping = false;
      let deltaX = currentX - startX;
      if (deltaX < -40) {
        showDelete(true);
      } else {
        showDelete(false);
      }
    });

    label.addEventListener('mouseleave', e => {
      if (!swiping) return;
      swiping = false;
      let deltaX = currentX - startX;
      if (deltaX < -40) {
        showDelete(true);
      } else {
        showDelete(false);
      }
    });

    // Clic fuori chiude menu elimina
    document.body.addEventListener('click', e => {
      if (!taskWrapper.contains(e.target)) {
        showDelete(false);
      }
    });
  });
});

function addTask() {
  const text = input.value.trim();
  if (!text) return;

  tasksRef.add({
    text: text,
    done: false,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    input.value = '';
  });
}

function toggleTask(id, currentDoneStatus) {
  tasksRef.doc(id).update({
    done: !currentDoneStatus
  });
}
  function toggleMenu() {
    const menu = document.getElementById('slideMenu');
    menu.classList.toggle('show');
  }
  window.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("loaderVideo");
    video.playbackRate = 2.0; // Velocità: 2x

    // Nasconde il loader dopo 4 secondi
    setTimeout(() => {
      const loader = document.getElementById("loader");
      loader.style.transition = "opacity 0.5s ease";
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.remove();
      }, 500);
    }, 4000);
  });
