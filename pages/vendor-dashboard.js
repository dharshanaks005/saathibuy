document.addEventListener('DOMContentLoaded', () => {
  // Handle tab switching
  const tabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      tab.classList.add('active');
      const selectedTab = tab.getAttribute('data-tab');
      const content = document.getElementById(selectedTab);
      if (content) content.classList.add('active');
    });
  });

  // Location logic
  const locationBtn = document.getElementById('enable-location-btn');
  const locationDisplay = document.getElementById('location-display');
  const locationPrompt = document.getElementById('location-prompt');

  function updateLocationDisplay(lat, lon) {
    if (locationDisplay) {
      locationDisplay.textContent = `📍 ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
    if (locationPrompt) {
      locationPrompt.classList.add('hidden');
    }
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        updateLocationDisplay(pos.coords.latitude, pos.coords.longitude);
      },
      err => {
        if (locationPrompt) locationPrompt.classList.remove('hidden');
      }
    );
  } else {
    if (locationPrompt) locationPrompt.classList.remove('hidden');
  }

  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          updateLocationDisplay(pos.coords.latitude, pos.coords.longitude);
        },
        err => {
          alert('⚠️ Location access denied or unavailable.');
        }
      );
    });
  }

  // Simulated user email (replace with Firebase auth if needed)
  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl) userEmailEl.textContent = 'vendor@example.com';

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Replace with actual Firebase logout if needed
      alert('Logging out...');
      window.location.href = '/login';
    });
  }

  // Placeholder: simulate dashboard load complete
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.classList.add('hidden');
});
