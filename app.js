// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------------- REGISTER HOST ----------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const host = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      property: {
        title: document.getElementById("title").value,
        location: document.getElementById("location").value,
        description: document.getElementById("description").value,
        media: document.getElementById("mediaUrls").value.split(",").map(x => x.trim())
      },
      subscription: {
        status: "active",
        startDate: Date.now(),
        endDate: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days trial
      }
    };

    await db.collection("hosts").add(host);
    alert("Property registered successfully! Trial is 30 days free.");
    window.location.href = "host-dashboard.html";
  });
}

// ---------------- HOST DASHBOARD ----------------
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    if (!email) {
      alert("Please enter your email");
      return;
    }

    const snapshot = await db.collection("hosts").where("email", "==", email).get();

    if (snapshot.empty) {
      alert("No host found with this email. Please register first.");
      return;
    }

    const hostData = snapshot.docs[0].data();
    const hostId = snapshot.docs[0].id;

    // Automatic expiry check
    const now = Date.now();
    if (hostData.subscription.endDate < now) {
      hostData.subscription.status = "expired";
      await db.collection("hosts").doc(hostId).update({
        "subscription.status": "expired"
      });
    }

    // Fill dashboard
    document.getElementById("hostName").innerText = hostData.name;
    document.getElementById("hostEmail").innerText = hostData.email;
    document.getElementById("hostPhone").innerText = hostData.phone;
    document.getElementById("propertyTitle").innerText = hostData.property.title;
    document.getElementById("propertyLocation").innerText = hostData.property.location;
    document.getElementById("propertyDescription").innerText = hostData.property.description;

    const gallery = document.getElementById("mediaGallery");
    gallery.innerHTML = "";
    hostData.property.media.forEach((url) => {
      if (url.endsWith(".mp4")) {
        gallery.innerHTML += `<video src="${url}" controls width="200"></video>`;
      } else {
        gallery.innerHTML += `<img src="${url}" width="200">`;
      }
    });

    document.getElementById("subStatus").innerText = hostData.subscription.status;
    document.getElementById("subEnd").innerText = new Date(hostData.subscription.endDate).toDateString();

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    document.getElementById("renewBtn").onclick = async () => {
      alert("Payment coming soon. Renewing trial for now.");
      await db.collection("hosts").doc(hostId).update({
        "subscription.status": "active",
        "subscription.endDate": Date.now() + 30 * 24 * 60 * 60 * 1000
      });
      location.reload();
    };
  });
}

// ---------------- SHOW PROPERTIES ON HOMEPAGE ----------------
const propertyList = document.getElementById("propertyList");
if (propertyList) {
  db.collection("hosts").where("subscription.status", "==", "active").get().then(snapshot => {
    snapshot.forEach(doc => {
      const host = doc.data();
      const div = document.createElement("div");
      div.classList.add("property");

      div.innerHTML = `
        <h3>${host.property.title}</h3>
        <p><b>Location:</b> ${host.property.location}</p>
        <p>${host.property.description}</p>
        <div>
          ${host.property.media.map(url => 
            url.endsWith(".mp4") 
              ? `<video src="${url}" controls width="200"></video>` 
              : `<img src="${url}" width="200">`
          ).join("")}
        </div>
      `;

      propertyList.appendChild(div);
    });
  });
}
