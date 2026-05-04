import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
const state = {
  sessionKeyId: null
};

// ================= ELEMENTS =================
const els = {
  keyInput: document.getElementById("keyInput"),
  checkKeyButton: document.getElementById("checkKeyButton"),
  keyStatus: document.getElementById("keyStatus"),
  dashboard: document.getElementById("userDashboard"),
  dashboardKeyId: document.getElementById("dashboardKeyId"),
  dashboardStatus: document.getElementById("dashboardStatus")
};

function setStatus(msg) {
  els.keyStatus.textContent = msg;
}

// ================= FIRESTORE KEY FETCH =================
async function getKey(value) {
  const q = query(
    collection(db, "keys"),
    where("value", "==", value.trim())
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data()
  };
}

// ================= LOGIN =================
els.checkKeyButton.addEventListener("click", async () => {
  const value = els.keyInput.value.trim();

  if (!value) {
    setStatus("Enter a key first.");
    return;
  }

  const key = await getKey(value);

  if (!key) {
    setStatus("Key not found.");
    return;
  }

  if (!key.active) {
    setStatus("Key inactive.");
    return;
  }

  if (key.type !== "permanent" && key.remainingUses <= 0) {
    setStatus("No uses left.");
    return;
  }

  // SAVE SESSION
  state.sessionKeyId = key.id;
  localStorage.setItem("activeKey", key.id);

  // UI UPDATE
  setStatus("Key accepted.");

  els.dashboard.style.display = "block";
  els.dashboardKeyId.textContent = key.id;
  els.dashboardStatus.textContent = key.type;
});
