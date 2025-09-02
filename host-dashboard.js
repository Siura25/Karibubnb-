// host-dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// UI elements
const hostNameEl = document.getElementById("hostName");
const bookingsBody = document.getElementById("bookingsBody");
const logoutBtn = document.getElementById("logoutBtn");

// Monitor auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "host-register.html"; // if not logged in → send to register/login
    return;
  }

  // Get host info
  const hostDoc = await getDoc(doc(db, "hosts", user.uid));
  if (hostDoc.exists()) {
    hostNameEl.textContent = hostDoc.data().name;
  } else {
    hostNameEl.textContent = user.email;
  }

  // Load host's bookings
  loadBookings(user.uid);
});

// Load bookings for this host
async function loadBookings(hostUid) {
  try {
    const q = query(collection(db, "bookings"), where("hostUid", "==", hostUid));
    const snapshot = await getDocs(q);

    bookingsBody.innerHTML = "";

    if (snapshot.empty) {
      bookingsBody.innerHTML = `<tr><td colspan="5">No bookings yet.</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const booking = docSnap.data();
      const row = `
        <tr>
          <td>${booking.guestName}</td>
          <td>${booking.guestEmail}</td>
          <td>${booking.listingTitle}</td>
          <td>${booking.date}</td>
          <td>${booking.status}</td>
        </tr>
      `;
      bookingsBody.innerHTML += row;
    });
  } catch (err) {
    console.error("Error loading bookings:", err);
    bookingsBody.innerHTML = `<tr><td colspan="5">Error loading bookings.</td></tr>`;
  }
}

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
