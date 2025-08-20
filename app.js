// app.js
document.addEventListener('DOMContentLoaded', () => {
  // ===== HOST POST FORM =====
  const form = document.getElementById('hostPostForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('postMsg');
      const paid = document.getElementById('mockPaid');

      if (!paid || !paid.checked) {
        msg.textContent = "Please confirm you've paid (tick the box).";
        msg.style.color = "#b00020";
        return;
      }
      if (!window.db) {
        msg.textContent = "Backend not ready yet. Add Firebase config.";
        msg.style.color = "#b00020";
        return;
      }

      const hostName = document.getElementById('hostName').value.trim();
      const hostPhone = document.getElementById('hostPhone').value.trim();
      const bnbName  = document.getElementById('bnbName').value.trim();
      const bnbLocation = document.getElementById('bnbLocation').value.trim();
      const bnbDesc = document.getElementById('bnbDesc').value.trim();
      const bnbPrice = Number(document.getElementById('bnbPrice').value);
      const imageUrlsRaw = document.getElementById('imageUrls').value.trim();
      const imageUrls = imageUrlsRaw ? imageUrlsRaw.split(',').map(s => s.trim()) : [];

      try {
        await window.db.collection('listings').add({
          hostName, hostPhone, bnbName, bnbLocation, bnbDesc, bnbPrice,
          imageUrls, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        msg.textContent = "Listing posted! Check it on the Listings page.";
        msg.style.color = "#1e7e34";
        form.reset();
        if (paid) paid.checked = false;
      } catch (err) {
        console.error(err);
        msg.textContent = "Error posting. Try again.";
        msg.style.color = "#b00020";
      }
    });
  }

  // ===== LISTINGS RENDER =====
  const listingsContainer = document.getElementById('listingsContainer');
  if (listingsContainer) {
    if (!window.db) {
      const m = document.getElementById('listingsMsg');
      if (m) m.textContent = "Backend not ready yet. Add Firebase config.";
      return;
    }
    window.db.collection('listings').orderBy('createdAt','desc').onSnapshot((snap)=>{
      listingsContainer.innerHTML = '';
      if (snap.empty) {
        const m = document.getElementById('listingsMsg');
        if (m) m.textContent = "No listings yet.";
        return;
      }
      snap.forEach(doc => {
        const d = doc.data();
        const phoneRaw = d.hostPhone || "254112226127";
        const phone = phoneRaw.startsWith('+') ? phoneRaw.slice(1) : phoneRaw;
        const wa = `https://wa.me/${phone}`;
        const call = `tel:+${phone}`;
        const img = (d.imageUrls && d.imageUrls[0]) ? d.imageUrls[0] : 'https://via.placeholder.com/800x500?text=KaribuBnB';

        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
          <img src="${img}" alt="${d.bnbName || 'BnB'}"/>
          <h3>${d.bnbName || 'BnB Listing'}</h3>
          <p><strong>Location:</strong> ${d.bnbLocation || '-'}</p>
          <p>${d.bnbDesc || ''}</p>
          <p><strong>KES</strong> ${d.bnbPrice ? Number(d.bnbPrice).toLocaleString() : '-'}</p>
          <div style="margin-top:8px">
            <a class="btn btn-success" href="${wa}" target="_blank">WhatsApp Host</a>
            <a class="btn btn-primary" href="${call}">Call Host</a>
          </div>
        `;
        listingsContainer.appendChild(card);
      });
    }, (err)=>{
      console.error(err);
      const m = document.getElementById('listingsMsg');
      if (m) m.textContent = "Error loading listings.";
    });
  }
});
