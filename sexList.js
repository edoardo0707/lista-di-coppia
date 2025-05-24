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
  const container3 = document.getElementById('container3');
  const target = document.getElementById(id);
  const allSections = document.querySelectorAll('.section');

  if (!container3 || !target) return;

  const isTargetVisible = !target.classList.contains('hidden');

  // Nascondi tutte le sezioni
  allSections.forEach(section => section.classList.add('hidden'));

  if (!isTargetVisible) {
    // Mostra la sezione richiesta
    target.classList.remove('hidden');
    container3.style.display = 'none'; // Nascondi completamente container3
  } else {
    // Nessuna sezione è visibile
    container3.style.display = 'flex'; // Mostra container3
  }

  // Verifica se almeno una sezione (diversa da container3) è visibile
  const visibleSections = Array.from(allSections).filter(section => {
    return section.id !== 'container3' && !section.classList.contains('hidden');
  });

  // Se almeno una è visibile, nascondi container3
  if (visibleSections.length > 0) {
    container3.style.display = 'none';
  } else {
    container3.style.display = 'flex';
  }

  // Chiudi il menu se aperto
  const menu = document.querySelector('.slide-menu');
  if (menu?.classList.contains('show')) {
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
  const mapUrl = `https://maps.google.com/maps?q=${city.lat},${city.lng}&z=14&output=embed`;
  document.getElementById('mapFrame').src = mapUrl;
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

function renderHorizontalTaskCards() {
  const container = document.getElementById("taskCardContainer");
  if (!container) return;

  tasksRef.where("done", "==", false).orderBy("text").onSnapshot(snapshot => {
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
renderHorizontalTaskCards();

const daysContainer = document.getElementById('days');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const detailBox = document.getElementById('dayDetail');

// -- VARIABILI --
let currentDate = new Date();
const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

// Cache locale per contenuti caricati
let dayContents = {}; // Cambiato a let per resettare

function formatDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// -- FUNZIONI FIRESTORE --
async function saveDayContent(key, content) {
  try {
    await db.collection("calendarDays").doc(key).set(content);
    dayContents[key] = content;
    console.log("Salvato:", key, content);
  } catch (e) {
    console.error("Errore salvataggio Firestore:", e);
  }
}

async function loadDayContent(key) {
  try {
    const doc = await db.collection("calendarDays").doc(key).get();
    if (doc.exists) {
      dayContents[key] = doc.data();
      return doc.data();
    }
    return {};
  } catch (e) {
    console.error("Errore caricamento Firestore:", e);
    return {};
  }
}

// -- CARICA CONTENUTI DI TUTTI I GIORNI DEL MESE --
async function loadMonthContents(year, month) {
  dayContents = {}; // reset cache locale
  const lastDate = new Date(year, month + 1, 0).getDate();

  const promises = [];
  for(let day = 1; day <= lastDate; day++) {
    const key = formatDateKey(new Date(year, month, day));
    promises.push(loadDayContent(key));
  }

  await Promise.all(promises);
}

// -- RENDER CALENDARIO --
function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  monthYear.textContent = `${monthNames[month]} ${year}`;
  daysContainer.innerHTML = '';
  detailBox.classList.add('hidden');

  // Spazi vuoti per allineare i giorni
  for(let i=0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.classList.add('empty');
    daysContainer.appendChild(empty);
  }

  for(let i = 1; i <= lastDate; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = i;
    dayDiv.classList.add('day'); // Assicurati che .day abbia posizione relative

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
      emojiSpan.classList.add('icon-emoji');
      dayDiv.appendChild(emojiSpan);
    }

    dayDiv.onclick = () => openDayDetail(year, month, i);

    daysContainer.appendChild(dayDiv);
  }
}

// -- APRI DETTAGLIO GIORNO --
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
      <textarea id="descInput" placeholder="Aggiungi descrizione..." style="color: #000000;">${contentObj.description || ''}</textarea>
    </div>
    <div class="input-group">
      <label>Promemoria</label>
      <textarea id="reminderInput" placeholder="Aggiungi promemoria..." style="color:rgb(0, 0, 0);">${contentObj.reminder || ''}</textarea>
    </div>
    <div class="icon-checkboxes" style="color:rgb(255, 255, 255);">
      <label><input type="checkbox" id="icon0" ${contentObj.icons?.[0] ? 'checked' : ''}>sex</label>
      <label><input type="checkbox" id="icon1" ${contentObj.icons?.[1] ? 'checked' : ''}>bocchino</label>
      <label><input type="checkbox" id="icon2" ${contentObj.icons?.[2] ? 'checked' : ''}>ditalino</label>
      <label><input type="checkbox" id="icon3" ${contentObj.icons?.[3] ? 'checked' : ''}>sega</label>
      <label><input type="checkbox" id="icon4" ${contentObj.icons?.[4] ? 'checked' : ''}>leccata</label>
      <label><input type="checkbox" id="icon5" ${contentObj.icons?.[5] ? 'checked' : ''}>anale</label>
    </div>
  `;

  detailBox.classList.remove('hidden');

  // Aggiorna immagini di sfondo
  if(contentObj.bgImage) {
    updateCircleBackground(contentObj.bgImage);
    updateDayDetailBackground(contentObj.bgImage);
  } else {
    detailBox.style.backgroundImage = '';
    const circle = detailBox.querySelector('.image-circle');
    if(circle) circle.style.backgroundImage = '';
  }

  // Chiudi dettaglio
  document.getElementById('closeDetail').onclick = () => detailBox.classList.add('hidden');

  // Selezione file immagine
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
      // Salva l'immagine in Firestore
      updateDayContent(key, { bgImage: imgSrc });
    };
    reader.readAsDataURL(file);
  };

  // Salvataggio live su textarea e checkbox
  const descInput = detailBox.querySelector('#descInput');
  const reminderInput = detailBox.querySelector('#reminderInput');
  const iconCheckboxes = [];
  for(let i=0; i<6; i++) {
    iconCheckboxes[i] = detailBox.querySelector(`#icon${i}`);
    iconCheckboxes[i].addEventListener('change', saveInputs);
  }
  descInput.addEventListener('input', saveInputs);
  reminderInput.addEventListener('input', saveInputs);

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

// -- AGGIORNA CONTENUTO GIORNO E SALVA --
function updateDayContent(key, newContent) {
  dayContents[key] = { ...(dayContents[key] || {}), ...newContent };
  saveDayContent(key, dayContents[key]);
}

// -- AGGIORNA SFONDO DEL GIORNO NEL CALENDARIO --
function setBackgroundForDay(year, month, day, imgSrc) {
  const key = formatDateKey(new Date(year, month, day));
  if(!dayContents[key]) dayContents[key] = {};
  dayContents[key].bgImage = imgSrc;

  // Aggiorna sfondo giorno calendario
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

  // Aggiorna sfondo dettaglio giorno
  updateDayDetailBackground(imgSrc);
}

// -- AGGIORNA SFONDO DEL BOX DETTAGLIO CON OVERLAY --
function updateDayDetailBackground(imgSrc) {
  detailBox.style.backgroundImage = `
    linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgb(0, 0, 0) 90%),
    url(${imgSrc})
  `;
  detailBox.style.backgroundSize = 'cover';
  detailBox.style.backgroundPosition = 'center';
}

// -- AGGIORNA IL CERCHIO IMMAGINE --
function updateCircleBackground(imgSrc) {
  const circle = detailBox.querySelector('.image-circle');
  if(circle) {
    circle.style.backgroundImage = `url(${imgSrc})`;
    circle.style.backgroundSize = 'cover';
    circle.style.backgroundPosition = 'center';
    circle.style.border = '2px solid #ccc';
  }
}

// -- RENDER + CARICA MESE INSIEME --
async function renderMonthWithData(date) {
  await loadMonthContents(date.getFullYear(), date.getMonth());
  renderCalendar(date);
}

// -- NAVIGAZIONE MESE --
prevBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderMonthWithData(currentDate);
};

nextBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderMonthWithData(currentDate);
};

// -- RENDER INIZIALE --
renderMonthWithData(currentDate);
