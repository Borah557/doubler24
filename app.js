// Telegram Web App init
const tg = window.Telegram.WebApp;
tg.expand();

// Elements
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const tabs = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.tab-content');
const userNameEl = document.getElementById('user-name');
const balanceEl = document.getElementById('balance');
const viewCountEl = document.getElementById('view-count');
const historyList = document.getElementById('history-list');
const adContainer = document.getElementById('ad-container');
const claimBtn = document.getElementById('claim-btn');

const REWARD = 10;
let userData = {};

// Theme handling
function loadTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => {
  const current = body.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
});

// Tab navigation
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-target');
    sections.forEach(sec => sec.id === target
      ? sec.classList.add('active')
      : sec.classList.remove('active'));
  });
});

// Load user
async function loadUser() {
  const saved = localStorage.getItem('tg_user');
  if (saved) {
    userData = JSON.parse(saved);
  } else {
    const res = await fetch('user.json');
    userData = await res.json();
    localStorage.setItem('tg_user', JSON.stringify(userData));
  }
  renderUI();
  loadAds();
}

// Render UI
function renderUI() {
  userNameEl.textContent = userData.username;
  balanceEl.textContent = userData.balance;
  viewCountEl.textContent = userData.viewedAds;
  historyList.innerHTML = userData.history
    ? userData.history.map(h =>
      `<li>${h.time} +${h.amount} coins</li>`).join('')
    : '';
}

// Simulate loading ads
function loadAds() {
  setTimeout(() => {
    adContainer.innerHTML = `
      <div class="card" id="ad-card">
        <img src="https://via.placeholder.com/60" alt="Ad">
        <div class="info">
          <h3>Sample Ad</h3>
          <p>Reward: ${REWARD} coins</p>
        </div>
      </div>`;
    observeAd();
  }, 1500);
}

// Ad visibility
function observeAd() {
  const card = document.getElementById('ad-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      claimBtn.disabled = !entry.isIntersecting;
    });
  }, { threshold: 0.75 });
  observer.observe(card);
}

// Claim reward
claimBtn.addEventListener('click', () => {
  userData.balance += REWARD;
  userData.viewedAds += 1;
  const timestamp = new Date().toLocaleTimeString();
  userData.history = userData.history || [];
  userData.history.push({ time: timestamp, amount: REWARD });
  localStorage.setItem('tg_user', JSON.stringify(userData));
  renderUI();
  animateCoin();
});

// Coin fly animation
function animateCoin() {
  const coin = document.createElement('div');
  coin.className = 'flying-coin';
  const rect = claimBtn.getBoundingClientRect();
  coin.style.left = rect.left + rect.width/2 + 'px';
  coin.style.top = rect.top + 'px';
  document.body.appendChild(coin);
  coin.addEventListener('animationend', () => coin.remove());
}

// Boot
loadTheme();
loadUser();
