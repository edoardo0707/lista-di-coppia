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

    // Swipe/drag variables
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

    // MOUSE EVENTS (PC)
    label.addEventListener('mousedown', e => {
      startX = e.clientX;
      swiping = true;
      label.style.transition = '';
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

    // Click fuori chiude menu elimina
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
  video.playbackRate = 2.0;

  setTimeout(() => {
    const loader = document.getElementById("loader");
    loader.style.transition = "opacity 0.5s ease";
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.remove();
    }, 500);
  }, 4000);
});

function toggleContainer(id) {
  const element = document.getElementById(id);
  if (!element) return;

  const allSections = document.querySelectorAll('.section');
  const isVisible = !element.classList.contains('hidden');

  allSections.forEach(el => el.classList.add('hidden'));

  if (!isVisible) {
    element.classList.remove('hidden');
  }

  const menu = document.querySelector('.slide-menu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
}

const cities = [];

// Carica città con listener onSnapshot e salva docId
function loadCitiesFromFirestore() {
  db.collection('cities').onSnapshot(snapshot => {
    cities.length = 0; // svuota array
    snapshot.forEach(doc => {
      const city = doc.data();
      city.docId = doc.id;  // salva id Firestore dentro city
      cities.push(city);
    });
    globe.pointsData(cities);
    updateCityList();
  });
}

const globe = Globe()
  .globeImageUrl('world.topo.bathy.200412.3x5400x2700.jpg')
  .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
  .pointsData(cities)
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(() => 'red')
  .pointAltitude(0.02)
  .pointRadius(0.4)
  .pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000)  // centrato più vicino
  .onPointClick(point => {
    globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.7 }, 1000);
  });

globe(document.getElementById('globeViz'));

const cityListDiv = document.getElementById('cityList');
function updateCityList() {
  cityListDiv.innerHTML = '';
  cities.forEach((city) => {
    const span = document.createElement('span');
    span.textContent = city.name;
    span.title = `Clicca per zoomare su ${city.name}`;

    span.onclick = () => {
      globe.pointOfView({ lat: city.lat, lng: city.lng, altitude: 0.7 }, 1000);
    };

    // Pulsante di rimozione
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.style.marginLeft = '8px';
    removeBtn.style.background = 'transparent';
    removeBtn.style.border = 'none';
    removeBtn.style.color = 'white';
    removeBtn.style.cursor = 'pointer';
    removeBtn.title = 'Rimuovi';

    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeCity(city.docId);  // usa docId per rimuovere
    };

    span.appendChild(removeBtn);
    cityListDiv.appendChild(span);
  });
}

function removeCity(docId) {
  const index = cities.findIndex(c => c.docId === docId);
  if (index !== -1) {
    cities.splice(index, 1);
    globe.pointsData(cities);
    updateCityList();

    db.collection('cities').doc(docId).delete()
      .then(() => {
        console.log(`Città ${docId} rimossa da Firestore.`);
      })
      .catch(error => {
        console.error('Errore durante la rimozione da Firestore:', error);
      });
  }
}

// Salva città su Firestore (usa come docId il nome formattato)
function saveCityToFirestore(city) {
  const cityId = city.name.toLowerCase().replace(/\s+/g, '_');
  db.collection('cities').doc(cityId).set(city)
    .then(() => {
      console.log('Città salvata:', city.name);
    })
    .catch(error => {
      console.error('Errore salvataggio città:', error);
    });
}

// Geocoding
async function geocodeCity(cityName) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Errore nella richiesta di geocoding');
  const results = await response.json();
  if (results.length === 0) return null;
  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    name: cityName
  };
}

// Aggiunta città da input
const input2 = document.getElementById('cityInput');
input2.addEventListener('keydown', async e => {
  if (e.key === 'Enter' && input2.value.trim() !== '') {
    const cityName = input2.value.trim();
    input2.disabled = true;
    const city = await geocodeCity(cityName);
    input2.disabled = false;

    if (city) {
      if (!cities.some(c => c.name.toLowerCase() === city.name.toLowerCase())) {
        cities.push(city);
        globe.pointsData(cities);
        updateCityList();
        globe.pointOfView({ lat: city.lat, lng: city.lng, altitude: 0.7 }, 1000);
        saveCityToFirestore(city);
      } else {
        alert('Questa città è già stata aggiunta.');
      }
      input2.value = '';
    } else {
      alert('Città non trovata');
    }
  }
});

// Avvia caricamento città da Firestore
loadCitiesFromFirestore();
