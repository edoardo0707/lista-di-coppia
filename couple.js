// Esempio per tasks
function tasksRef() {
  return db.collection("couples").doc(coupleId).collection("tasks");
}
// Esempio per cities
function citiesRef() {
  return db.collection("couples").doc(coupleId).collection("cities");
}
// Esempio per calendario
function calendarRef() {
  return db.collection("couples").doc(coupleId).collection("calendarDays");
}

// ...tutto il resto del tuo codice invariato...

const daysContainer = document.getElementById('days');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const detailBox = document.getElementById('dayDetail');

// === TASK LIST LOGIC ===
const taskListDiv = document.getElementById('taskList');
const inputTask = document.getElementById('newTask');
let dayContents = {};

function renderTaskList() {
  tasksRef().orderBy("text").onSnapshot(snapshot => {
    taskListDiv.innerHTML = '';

    snapshot.forEach(doc => {
      const task = doc.data();
      const taskId = doc.id;

      const taskWrapper = document.createElement('div');
      taskWrapper.className = 'task-wrapper';

      // Label with checkbox and text
      const label = document.createElement('label');
      label.setAttribute('data-docid', taskId);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.onchange = () => toggleTask(taskId, task.done);

      const span = document.createElement('span');
      span.textContent = task.text;
      if (task.done) span.classList.add('done');

      label.appendChild(checkbox);
      label.appendChild(span);

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Elimina';
      deleteBtn.className = 'delete-btn';
      deleteBtn.style.display = 'none';
      deleteBtn.onclick = () => tasksRef().doc(taskId).delete();

      taskWrapper.appendChild(label);
      taskWrapper.appendChild(deleteBtn);
      taskListDiv.appendChild(taskWrapper);

      // --- Swipe to show delete (touch & mouse) ---
      addSwipeToDelete(label, deleteBtn, taskWrapper);
    });
  });
}

function addSwipeToDelete(label, deleteBtn, taskWrapper) {
  let startX = 0, currentX = 0, swiping = false;

  const showDelete = (show) => {
    label.style.transition = 'transform 0.3s ease';
    label.style.transform = show ? 'translateX(-80px)' : 'translateX(0)';
    deleteBtn.style.display = show ? 'block' : 'none';
  };

  // Touch
  label.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    swiping = true;
    label.style.transition = '';
  });
  label.addEventListener('touchmove', e => {
    if (!swiping) return;
    currentX = e.touches[0].clientX;
    let deltaX = Math.max(currentX - startX, -80);
    if (deltaX < 0) label.style.transform = `translateX(${deltaX}px)`;
  });
  label.addEventListener('touchend', () => {
    if (!swiping) return;
    swiping = false;
    showDelete(currentX - startX < -40);
  });

  // Mouse
  label.addEventListener('mousedown', e => {
    startX = e.clientX;
    swiping = true;
    label.style.transition = '';
    e.preventDefault();
  });
  label.addEventListener('mousemove', e => {
    if (!swiping) return;
    currentX = e.clientX;
    let deltaX = Math.max(currentX - startX, -80);
    if (deltaX < 0) label.style.transform = `translateX(${deltaX}px)`;
  });
  const endMouseSwipe = () => {
    if (!swiping) return;
    swiping = false;
    showDelete(currentX - startX < -40);
  };
  label.addEventListener('mouseup', endMouseSwipe);
  label.addEventListener('mouseleave', endMouseSwipe);

  // Hide delete on outside click
  document.body.addEventListener('click', e => {
    if (!taskWrapper.contains(e.target)) showDelete(false);
  });
}

function addTask() {
  const text = inputTask.value.trim();
  if (!text) return;
  tasksRef().add({
    text,
    done: false,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => inputTask.value = '');
}

function toggleTask(id, done) {
  tasksRef().doc(id).update({ done: !done });
}

function renderHorizontalTaskCards() {
  const container = document.getElementById("taskCardContainer");
  if (!container) return;
  tasksRef().where("done", "==", false).orderBy("text").onSnapshot(snapshot => {
    container.innerHTML = '';
    snapshot.forEach(doc => {
      const task = doc.data();
      const card = document.createElement("div");
      card.className = "card";
      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = task.text;
      card.appendChild(title);
      container.appendChild(card);
    });
  });
}

// === MENU AND UI LOGIC ===
function toggleMenu() {
  const menu = document.getElementById('slideMenu');
  menu.classList.toggle('show');
}

window.addEventListener("DOMContentLoaded", () => {
  // Loader video
  const video = document.getElementById("loaderVideo");
  if (video) video.playbackRate = 2.0;
  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.transition = "opacity 0.5s ease";
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 500);
    }
  }, 4000);
});

// Section navigation
function toggleContainer(id) {
  const container3 = document.getElementById('container3');
  const target = document.getElementById(id);
  const allSections = document.querySelectorAll('.section');
  if (!container3 || !target) return;

  const isTargetVisible = !target.classList.contains('hidden');
  allSections.forEach(section => section.classList.add('hidden'));
  if (!isTargetVisible) {
    target.classList.remove('hidden');
    container3.style.display = 'none';
  } else {
    container3.style.display = 'flex';
  }
  // Hide container3 if any other section is visible
  const visible = Array.from(allSections).some(section => section.id !== 'container3' && !section.classList.contains('hidden'));
  container3.style.display = visible ? 'none' : 'flex';

  const menu = document.querySelector('.slide-menu');
  if (menu?.classList.contains('show')) menu.classList.remove('show');
}

// === GLOBE + CITIES LOGIC ===
const cities = [];
const cityListDiv = document.getElementById('cityList');
const cityInput = document.getElementById('cityInput');
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
  .pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000)
  .onPointClick(point => {
    globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.7 }, 1000);
  });

globe(document.getElementById('globeViz'));

function loadCitiesFromFirestore() {
  citiesRef().onSnapshot(snapshot => {
    cities.length = 0;
    snapshot.forEach(doc => {
      const city = doc.data();
      city.docId = doc.id;
      cities.push(city);
    });
    globe.pointsData(cities);
    updateCityList();
  });
}

function updateCityList() {
  cityListDiv.innerHTML = '';
  cities.forEach(city => {
    const span = document.createElement('span');
    span.textContent = city.name;
    span.title = `Clicca per zoomare su ${city.name}`;
    span.onclick = () => {
      globe.pointOfView({ lat: city.lat, lng: city.lng, altitude: 0.7 }, 1000);
      document.getElementById('mapFrame').src = `https://maps.google.com/maps?q=${city.lat},${city.lng}&z=14&output=embed`;
    };
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.style.background = 'transparent';
    removeBtn.style.border = 'none';
    removeBtn.style.color = 'white';
    removeBtn.style.cursor = 'pointer';
    removeBtn.title = 'Rimuovi';
    removeBtn.className = 'city-remove-btn';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeCity(city.docId);
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
    citiesRef().doc(docId).delete().catch(console.error);
  }
}

function saveCityToFirestore(city) {
  const cityId = city.name.toLowerCase().replace(/\s+/g, '_');
  citiesRef().doc(cityId).set(city).catch(console.error);
}

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

cityInput.addEventListener('keydown', async e => {
  if (e.key === 'Enter' && cityInput.value.trim()) {
    const cityName = cityInput.value.trim();
    cityInput.disabled = true;
    try {
      const city = await geocodeCity(cityName);
      if (city && !cities.some(c => c.name.toLowerCase() === city.name.toLowerCase())) {
        cities.push(city);
        globe.pointsData(cities);
        updateCityList();
        globe.pointOfView({ lat: city.lat, lng: city.lng, altitude: 0.7 }, 1000);
        saveCityToFirestore(city);
      } else if (city) {
        alert('Questa città è già stata aggiunta.');
      } else {
        alert('Città non trovata');
      }
    } finally {
      cityInput.disabled = false;
      cityInput.value = '';
    }
  }
});


// === CALENDAR LOGIC ===

let currentDate = new Date();
const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

function formatDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

async function saveDayContent(key, content) {
  await calendarRef().doc(key).set(content);
  dayContents[key] = content;
}

async function loadDayContent(key) {
  const doc = await calendarRef().doc(key).get();
  if (doc.exists) {
    dayContents[key] = doc.data();
    return doc.data();
  }
  return {};
}

async function loadMonthContents(year, month) {
  dayContents = {};
  const lastDate = new Date(year, month + 1, 0).getDate();
  const promises = [];
  for(let day = 1; day <= lastDate; day++) {
    promises.push(loadDayContent(formatDateKey(new Date(year, month, day))));
  }
  await Promise.all(promises);
}

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  monthYear.textContent = `${monthNames[month]} ${year}`;
  daysContainer.innerHTML = '';
  detailBox.classList.add('hidden');

  // Empty slots
  for(let i=0; i < firstDay; i++) {
    daysContainer.appendChild(document.createElement('div')).classList.add('empty');
  }
  for(let i = 1; i <= lastDate; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = i;
    dayDiv.className = 'day';
    if(i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayDiv.classList.add('today');
    }
    const key = formatDateKey(new Date(year, month, i));
    const contentObj = dayContents[key] || {};
    if(contentObj.bgImage) {
      dayDiv.style.backgroundImage = `url(${contentObj.bgImage})`;
      dayDiv.style.backgroundSize = 'cover';
      dayDiv.style.backgroundPosition = 'center';
      dayDiv.style.color = 'white';
      dayDiv.style.textShadow = '0 0 5px rgba(0,0,0,0.7)';
    }
    if(contentObj.icons?.[0]) {
      const emojiSpan = document.createElement('span');
      emojiSpan.textContent = '🔥';
      emojiSpan.className = 'icon-emoji';
      dayDiv.appendChild(emojiSpan);
    }
    dayDiv.onclick = () => openDayDetail(year, month, i);
    daysContainer.appendChild(dayDiv);
  }
}

async function openDayDetail(year, month, day) {
  const key = formatDateKey(new Date(year, month, day));
  const contentObj = await loadDayContent(key);

  detailBox.innerHTML = `
    <button id="closeDetail">✖</button>
    <div class="image-upload">
      <div class="image-circle" id="imageCircle"></div>
      <input type="file" id="imageInput" accept="image/*" style="display:none"/>
    </div>
    <div class="input-group">
      <label>Descrizione</label>
      <textarea id="descInput" placeholder="Aggiungi descrizione..." style="color: #000;">${contentObj.description || ''}</textarea>
    </div>
    <div class="input-group">
      <label>Promemoria</label>
      <textarea id="reminderInput" placeholder="Aggiungi promemoria..." style="color:#000;">${contentObj.reminder || ''}</textarea>
    </div>
    <div class="icon-checkboxes" style="color:#fff;">
      <label><input type="checkbox" id="icon0" ${contentObj.icons?.[0] ? 'checked' : ''}>sex</label>
      <label><input type="checkbox" id="icon1" ${contentObj.icons?.[1] ? 'checked' : ''}>bocchino</label>
      <label><input type="checkbox" id="icon2" ${contentObj.icons?.[2] ? 'checked' : ''}>ditalino</label>
      <label><input type="checkbox" id="icon3" ${contentObj.icons?.[3] ? 'checked' : ''}>sega</label>
      <label><input type="checkbox" id="icon4" ${contentObj.icons?.[4] ? 'checked' : ''}>leccata</label>
      <label><input type="checkbox" id="icon5" ${contentObj.icons?.[5] ? 'checked' : ''}>anale</label>
    </div>
  `;
  detailBox.classList.remove('hidden');
  if(contentObj.bgImage) {
    updateCircleBackground(contentObj.bgImage);
    updateDayDetailBackground(contentObj.bgImage);
  } else {
    detailBox.style.backgroundImage = '';
    const circle = detailBox.querySelector('.image-circle');
    if(circle) circle.style.backgroundImage = '';
  }
  document.getElementById('closeDetail').onclick = () => detailBox.classList.add('hidden');

  // Image upload
  const imageCircle = detailBox.querySelector('.image-circle');
  const imageInput = detailBox.querySelector('#imageInput');
  imageCircle.onclick = () => imageInput.click();
  imageInput.onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imgSrc = ev.target.result;
      setBackgroundForDay(year, month, day, imgSrc);
      updateDayContent(key, { bgImage: imgSrc });
    };
    reader.readAsDataURL(file);
  };

  // Save on input/checkbox change
  const descInput = detailBox.querySelector('#descInput');
  const reminderInput = detailBox.querySelector('#reminderInput');
  const iconCheckboxes = Array.from({length: 6}, (_, i) => detailBox.querySelector(`#icon${i}`));
  [...iconCheckboxes, descInput, reminderInput].forEach(el => el && el.addEventListener('input', saveInputs));
  function saveInputs() {
    const newContent = {
      description: descInput.value,
      reminder: reminderInput.value,
      icons: iconCheckboxes.map(cb => cb.checked),
      bgImage: dayContents[key]?.bgImage || null
    };
    updateDayContent(key, newContent);
  }
}

function updateDayContent(key, newContent) {
  dayContents[key] = { ...(dayContents[key] || {}), ...newContent };
  saveDayContent(key, dayContents[key]);
}

function setBackgroundForDay(year, month, day, imgSrc) {
  const key = formatDateKey(new Date(year, month, day));
  if(!dayContents[key]) dayContents[key] = {};
  dayContents[key].bgImage = imgSrc;
  const allDays = daysContainer.querySelectorAll('div.day');
  allDays.forEach(div => {
    if(+div.textContent === day && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
      div.style.backgroundImage = `url(${imgSrc})`;
      div.style.backgroundSize = 'cover';
      div.style.backgroundPosition = 'center';
      div.style.color = 'white';
      div.style.textShadow = '0 0 5px rgba(0,0,0,0.7)';
    }
  });
  updateDayDetailBackground(imgSrc);
}

function updateDayDetailBackground(imgSrc) {
  detailBox.style.backgroundImage = `
    linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgb(0, 0, 0) 90%),
    url(${imgSrc})
  `;
  detailBox.style.backgroundSize = 'cover';
  detailBox.style.backgroundPosition = 'center';
}

function updateCircleBackground(imgSrc) {
  const circle = detailBox.querySelector('.image-circle');
  if(circle) {
    circle.style.backgroundImage = `url(${imgSrc})`;
    circle.style.backgroundSize = 'cover';
    circle.style.backgroundPosition = 'center';
    circle.style.border = '2px solid #ccc';
  }
}

async function renderMonthWithData(date) {
  await loadMonthContents(date.getFullYear(), date.getMonth());
  renderCalendar(date);
}

// Calendar navigation
prevBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderMonthWithData(currentDate);
};
nextBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderMonthWithData(currentDate);
};



// Expose addTask for button
window.addTask = addTask;
