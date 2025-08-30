import { updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Function to load and render bookings
async function loadBookings() {
  const querySnapshot = await getDocs(collection(db, "bookings"));
  let rows = "";
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    rows += `
      <tr>
        <td>${data.guestName}</td>
        <td>${data.guestEmail}</td>
        <td>${data.stayDate}</td>
        <td>${data.status}</td>
        <td>
          <button onclick="updateStatus('${docSnap.id}','Approved')">Approve</button>
          <button onclick="updateStatus('${docSnap.id}','Declined')">Decline</button>
        </td>
      </tr>
    `;
  });
  document.getElementById("bookingsTable").innerHTML = rows;
}

// Function to update booking status
window.updateStatus = async function (bookingId, status) {
  try {
    await updateDoc(doc(db, "bookings", bookingId), { status });
    alert("✅ Booking " + status);
    loadBookings();
  } catch (err) {
    alert("❌ " + err.message);
  }
};
