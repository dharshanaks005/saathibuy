import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('supplierForm');
const profileSection = document.getElementById('profile');
const formSection = document.getElementById('onboarding-form');
const messageDiv = document.getElementById('message');

// Elements for profile display
const pName = document.getElementById('pName');
const pProducts = document.getElementById('pProducts');
const pLocation = document.getElementById('pLocation');
const pContact = document.getElementById('pContact');

// 🔐 Check authentication
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/login';
    return;
  }

  document.getElementById('greeting').innerText = `Welcome, ${user.email}`;
  const docRef = doc(db, 'suppliers', user.uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    showProfile(data);
  } else {
    formSection.style.display = 'block';
    profileSection.style.display = 'none';
  }
});

// ✅ Show profile
function showProfile(data) {
  pName.innerText = data.businessName;
  pProducts.innerText = data.products;
  pLocation.innerText = data.location;
  pContact.innerText = data.contact;
  formSection.style.display = 'none';
  profileSection.style.display = 'block';
}

// 📤 Handle onboarding form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert('Not authenticated');

  const data = {
    businessName: form.businessName.value.trim(),
    products: form.products.value.trim(),
    location: form.location.value.trim(),
    contact: form.contact.value.trim(),
    onboardedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'suppliers', user.uid), data);
    messageDiv.textContent = 'Onboarding completed!';
    messageDiv.style.color = 'green';
    showProfile(data);
  } catch (err) {
    console.error(err);
    messageDiv.textContent = 'Submission failed.';
    messageDiv.style.color = 'red';
  }
});

// 🚪 Logout
window.logout = async function () {
  await signOut(auth);
  window.location.href = '/login';
};
