/ ✅ Firebase Config (replace with your project details)
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "xxxx",
  appId: "xxxx"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ Registration
const hostForm = document.getElementById("host-register-form");
if (hostForm) {
  hostForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const property = document.getElementById("property").value;
    const mediaFiles = document.getElementById("media").files;

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const mediaURLs = [];
    for (let file of mediaFiles) {
      const storageRef = firebase.storage().ref(`hosts/${email}/${file.name}`);
      await storageRef.put(file);
      const url = await storageRef.getDownloadURL();
      mediaURLs.push(url);
    }

    await db.collection("hosts").doc(email).set({
      name,
      email,
      phone,
      property,
      media: mediaURLs,
      subscriptionExpiry: expiryDate.toISOString(),
      status: "Active"
    });

    document.getElementById("register-message").innerText =
      "🎉 Registration successful! 1 month free trial activated.";
    hostForm.reset();
  });
}

// ✅ Login
const loginForm = document.getElementById("host-login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;

    const hostDoc = await db.collection("hosts").doc(email).get();
    if (hostDoc.exists) {
      localStorage.setItem("hostEmail", email);
      window.location.href = "host-dashboard.html";
    } else {
      document.getElementById("login-message").innerText = "❌ No account found.";
    }
  });
}

// ✅ Dashboard
if (window.location.pathname.includes("host-dashboard.html")) {
  const email = localStorage.getItem("hostEmail");
  if (!email) {
    window.location.href = "host-login.html";
  } else {
    const hostRef = db.collection("hosts").doc(email);

    hostRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        const expiry = new Date(data.subscriptionExpiry);
        const now = new Date();

        let status = "Active";
        if (now > expiry) {
          status = "Expired";
          hostRef.update({ status: "Expired" });
        }

        document.getElementById("host-properties").innerHTML = `
          <h4>${data.property}</h4>
          <p>Status: <strong>${status}</strong></p>
          <p>Subscription ends: ${expiry.toDateString()}</p>
          ${data.media.map(m => `<p><a href="${m}" target="_blank">View Media</a></p>`).join("")}
        `;
      }
    });

    // Upload new media
    const addMediaForm = document.getElementById("add-media-form");
    addMediaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newFiles = document.getElementById("new-media").files;
      const urls = [];

      for (let file of newFiles) {
        const storageRef = firebase.storage().ref(`hosts/${email}/${file.name}`);
        await storageRef.put(file);
        const url = await storageRef.getDownloadURL();
        urls.push(url);
      }

      const hostDoc = await hostRef.get();
      if (hostDoc.exists) {
        const oldMedia = hostDoc.data().media || [];
        await hostRef.update({ media: oldMedia.concat(urls) });
      }
    });
  }
}

// ✅ Logout
function logout() {
  localStorage.removeItem("hostEmail");
  window.location.href = "index.html";
      }
