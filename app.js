// app.js
import { db, storage } from "./firebase-config.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Form for posting BnB
const bnbForm = document.getElementById("bnbForm");
const bnbListings = document.getElementById("bnbListings");

// Handle new BnB post
if (bnbForm) {
  bnbForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const price = document.getElementById("price").value;
    const imageFile = document.getElementById("image").files[0];

    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `bnb-images/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // Save to Firestore
      await addDoc(collection(db, "bnb-listings"), {
        title,
        location,
        price,
        imageUrl,
        createdAt: new Date()
      });

      alert("BnB Posted Successfully!");
      bnbForm.reset();
      loadBnBs();

    } catch (error) {
      console.error("Error adding BnB: ", error);
      alert("Failed to post BnB. Try again.");
    }
  });
}

// Load BnB listings
async function loadBnBs() {
  if (!bnbListings) return;

  bnbListings.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "bnb-listings"));
  querySnapshot.forEach((doc) => {
    const bnb = doc.data();
    bnbListings.innerHTML += `
      <div class="bnb-card">
        <img src="${bnb.imageUrl}" alt="${bnb.title}">
        <h3>${bnb.title}</h3>
        <p>📍 ${bnb.location}</p>
        <p>💰 ${bnb.price}</p>
        <a href="https://wa.me/254112226127?text=Hello,%20I'm%20interested%20in%20${bnb.title}" target="_blank">WhatsApp Host</a>
        <a href="tel:0112226127">Call Host</a>
      </div>
    `;
  });
}

loadBnBs();
