const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;
let coupleId = null;

// === AUTENTICAZIONE ANONIMA ===
async function initAuthAndCouple() {
  await auth.signInAnonymously();
  currentUser = auth.currentUser;

  const urlParams = new URLSearchParams(window.location.search);
  const linkCoupleId = urlParams.get("couple");

  // Verifica se utente ha una coppia salvata nel localStorage
  coupleId = localStorage.getItem("coupleId");

  if (!coupleId && linkCoupleId) {
    try {
      const coupleDoc = await db.collection("couples").doc(linkCoupleId).get();
      if (coupleDoc.exists) {
        const data = coupleDoc.data();
        if (!data.user2 && data.user1 !== currentUser.uid) {
          await coupleDoc.ref.update({ user2: currentUser.uid });
          coupleId = linkCoupleId;
          localStorage.setItem("coupleId", coupleId);
          location.href = location.origin + location.pathname; // Rimuove ?couple=...
          return;
        }
      }
    } catch (error) {
      console.error("Errore nel collegamento alla coppia:", error);
    }
  }

  if (!coupleId) {
    // Crea nuova coppia
    coupleId = generateId(6);
    await db.collection("couples").doc(coupleId).set({
      user1: currentUser.uid,
      user2: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    localStorage.setItem("coupleId", coupleId);
    showInviteLink(coupleId);
    return;
  }

  // === DEFINISCI currentDate in modo sicuro ===
  const currentDate = new Date();

  // Procedi a caricare i dati
  renderTaskList();
  renderHorizontalTaskCards();
  loadCitiesFromFirestore();
  renderMonthWithData(currentDate);
}

function generateId(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function showInviteLink(id) {
  document.body.innerHTML = `
    <div style="padding:2rem;text-align:center;color:white">
      <h2>Invita il tuo partner 💌</h2>
      <p>Copia questo link e invialo:</p>
      <input style="width:90%;padding:0.5rem;" value="${location.origin + location.pathname}?couple=${id}" readonly onclick="this.select()"/>
    </div>
  `;
}

// === USA COLLEZIONE PERSONALIZZATA PER COPPIA ===
function tasksRef() {
  if (!coupleId) throw new Error("coupleId non definito");
  return db.collection("couples").doc(coupleId).collection("tasks");
}
function citiesRef() {
  if (!coupleId) throw new Error("coupleId non definito");
  return db.collection("couples").doc(coupleId).collection("cities");
}
function calendarRef() {
  if (!coupleId) throw new Error("coupleId non definito");
  return db.collection("couples").doc(coupleId).collection("calendarDays");
}

// === AVVIO ===
window.addEventListener("DOMContentLoaded", async () => {
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

  try {
    await initAuthAndCouple();
  } catch (err) {
    console.error("Errore durante l'inizializzazione:", err);
  }
});
