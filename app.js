// ===============================
// CLEAN FIREBASE KEY SYSTEM CORE
// (Drop-in replacement / cleaned version)
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ===============================
// FIREBASE SETUP
// ===============================
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

// ===============================
// STATE
// ===============================
const state = {
  sessionKeyId: null
};

const ACTIVE_KEY_STORAGE = "activeKey";

// ===============================
// FIRESTORE KEY LOOKUP
// ===============================
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

// ===============================
// CONSUME KEY (LIMITED ONLY)
// ===============================
async function consumeKey(entry) {
  if (entry.type === "permanent") return;

  const ref = doc(db, "keys", entry.id);

  await updateDoc(ref, {
    remainingUses: increment(-1)
  });
}

// ===============================
// LOGIN SYSTEM
// ===============================
const els = {
  keyInput: document.getElementById("keyInput"),
  checkKeyButton: document.getElementById("checkKeyButton"),
  keyStatus: document.getElementById("keyStatus")
};

function setStatus(el, msg) {
  el.textContent = msg;
}

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

  // SESSION
  state.sessionKeyId = entry.id;
  localStorage.setItem(ACTIVE_KEY_STORAGE, entry.id);

  // CONSUME USAGE
  await consumeKey(entry);

  setStatus(els.keyStatus, "Key accepted.");

  // TODO: hook into your existing UI functions
  // updateDashboardFromSession();
  // activateHub();
});

// ===============================
// NOTES
// ===============================
// 1. All your UI functions (dashboard, games, chat, etc.)
//    stay exactly the same — NOT included here.
//
// 2. This file ONLY fixes Firebase key logic cleanly.
//
// 3. If you want FULL integration, I can merge this into your
//    exact original 1000+ line file safely.
