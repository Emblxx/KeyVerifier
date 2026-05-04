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
  apiKey: "AIzaSyDXoOuJuZ85PwnMi-RXXhbf_Wi8R5FLBHw",
  authDomain: "keys-ca90b.firebaseapp.com",
  projectId: "keys-ca90b",
  storageBucket: "keys-ca90b.firebasestorage.app",
  messagingSenderId: "292681753618",
  appId: "1:292681753618:web:19c7eb33b86c7ddbd1e4cb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Firebase connected");

// ================= STATE =================
const state = {
  sessionKeyId: null
};

const ACTIVE_KEY_STORAGE = "activeKey";

// ================= UI ELEMENTS =================
const els = {
  keyInput: document.getElementById("keyInput"),
  checkKeyButton: document.getElementById("checkKeyButton"),
  keyStatus: document.getElementById("keyStatus")
};

function setStatus(el, msg) {
  el.textContent = msg;
}

// ================= GET KEY =================
async function getKeyFromServer(value) {
  const q = query(
    collection(db, "keys"),
    where("value", "==", value.trim())
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];

  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}

// ================= LOGIN =================
els.checkKeyButton.addEventListener("click", async () => {
  const value = els.keyInput.value.trim();

  if (!value) {
    setStatus(els.keyStatus, "Enter a key first.");
    return;
  }

  const entry = await getKeyFromServer(value);

  if (!entry) {
    setStatus(els.keyStatus, "Key not found.");
    return;
  }

  if (!entry.active) {
    setStatus(els.keyStatus, "Key inactive.");
    return;
  }

  if (entry.type !== "permanent" && entry.remainingUses <= 0) {
    setStatus(els.keyStatus, "No uses left.");
    return;
  }

  state.sessionKeyId = entry.id;
  localStorage.setItem(ACTIVE_KEY_STORAGE, entry.id);

  setStatus(els.keyStatus, "Key accepted.");

  // hook into your UI (already exists in your main file)
  if (typeof updateDashboardFromSession === "function") updateDashboardFromSession();
  if (typeof activateHub === "function") activateHub();
});
