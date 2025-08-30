// host-dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");

// Handle login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMessage.textContent = "Login successful!";
  } catch (err) {
    loginMessage.textContent = "Error: " + err.message;
  }
});

// Handle logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    loadBookings();
  } else {
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
});

// Load bookings
async function loadBookings() {
  const tableBody = document.querySelector("#bookingsTable tbody");
  tableBody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";

  try {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    tableBody.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const booking = docSnap.data();
      const row = `
        <tr>
          <td>${booking.name || "N/A"}</td>
          <td>${booking.email || "N/A"}</td>
          <td>${booking.phone || "N/A"}</td>
          <td>${booking.checkin || "-"}</td>
          <td>${booking.checkout || "-"}</td>
          <td>${booking.property || "-"}</td>
          <td id="status-${docSnap.id}">${booking.status || "Pending"}</td>
          <td>
            <button class="approve-btn" data-id="${docSnap.id}">Approve</button>
            <button class="reject-btn" data-id="${docSnap.id}">Reject</button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });

    if (querySnapshot.empty) {
      tableBody.innerHTML = "<tr><td colspan='8'>No bookings found.</td></tr>";
    }

    // Event listeners for Approve/Reject
    document.querySelectorAll(".approve-btn").forEach(btn =>
      btn.addEventListener("click", () => updateStatus(btn.dataset.id, "Approved"))
    );
    document.querySelectorAll(".reject-btn").forEach(btn =>
      btn.addEventListener("click", () => updateStatus(btn.dataset.id, "Rejected"))
    );

  } catch (e) {
    console.error("Error loading bookings:", e);
    tableBody.innerHTML = "<tr><td colspan='8'>Error loading bookings.</td></tr>";
  }
}

// Update booking status
async function updateStatus(bookingId, newStatus) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, { status: newStatus });
    document.getElementById(`status-${bookingId}`).textContent = newStatus;
    alert(`Booking updated to "${newStatus}"`);
  } catch (e) {
    console.error("Error updating status:", e);
    alert("Failed to update booking status.");
  }
  }
