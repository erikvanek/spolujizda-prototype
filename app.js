const rides = [
  { id: 1, time: "13:30", arrive: "15:55", driver: "Boris", initials: "B", rating: "4,9", price: 25, car: "zelená Škoda Octavia", seats: 2, note: "Klidná jízda · 1 zastávka" },
  { id: 2, time: "15:10", arrive: "17:45", driver: "Klára", initials: "K", rating: "4,8", price: 28, car: "modrý Volkswagen Golf", seats: 3, note: "Hudba vítána · Nekuřácké auto" },
  { id: 3, time: "18:20", arrive: "20:55", driver: "Matěj", initials: "M", rating: "5,0", price: 22, car: "šedý Hyundai i30", seats: 1, note: "Přímá jízda · Jen menší zavazadla" }
];

const state = { search: { from: "Brno", to: "Vienna", when: "", extras: [] }, selectedRide: rides[0] };
const $ = (selector) => document.querySelector(selector);

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  $(`#${name}-screen`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatDate(value) {
  if (!value) return "Dnes";
  const date = new Date(value);
  return new Intl.DateTimeFormat("cs-CZ", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function renderResults() {
  $("#route-summary").textContent = `${state.search.from} → ${state.search.to} · ${formatDate(state.search.when)}`;
  $("#ride-list").innerHTML = rides.map((ride) => `
    <article class="ride-card">
      <div>
        <div class="ride-main">
          <div class="ride-time"><strong>${ride.time}</strong><small>příjezd ${ride.arrive}</small></div>
          <div class="ride-route"><strong>${state.search.from}</strong><small>${ride.note}</small><strong>${state.search.to}</strong></div>
        </div>
        <div class="ride-driver"><span class="avatar">${ride.initials}</span><span>${ride.driver} · ★ ${ride.rating}</span></div>
      </div>
      <div class="ride-actions">
        <div class="ride-price">€${ride.price} <small>/ místo</small></div>
        <div>
          <button class="button button-primary small-button order-ride" data-id="${ride.id}">Objednat <span>→</span></button>
          <button class="detail-button small-button details-ride" data-id="${ride.id}">Detail</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderDetail() {
  const ride = state.selectedRide;
  $("#detail-content").innerHTML = `
    <div class="detail-card">
      <div class="detail-route"><strong>${state.search.from}</strong><span class="detail-arrow">→</span><strong>${state.search.to}</strong></div>
      <div class="detail-map"><span class="map-line"></span><span class="map-pin pin-a">A</span><span class="map-pin pin-b">B</span></div>
      <div class="detail-meta">
        <div class="meta-item"><small>Odjezd</small><strong>${ride.time} · ${formatDate(state.search.when)}</strong></div>
        <div class="meta-item"><small>Příjezd</small><strong>${ride.arrive} · přibližně 2 h 25 min</strong></div>
      </div>
    </div>
    <aside class="info-card">
      <div class="driver-profile"><div class="big-avatar">${ride.initials}</div><div><strong>${ride.driver}</strong><small>★ ${ride.rating} · 48 jízd</small></div></div>
      <div class="info-list"><div><span>Auto</span><strong>${ride.car}</strong></div><div><span>Volná místa</span><strong>${ride.seats}</strong></div><div><span>Věci navíc</span><strong>${state.search.extras.length ? state.search.extras.join(", ") : "Nic navíc"}</strong></div></div>
      <button class="button button-primary full order-ride" data-id="${ride.id}">Objednat jízdu <span>→</span></button>
    </aside>
  `;
}

function prepareOrder(ride) {
  state.selectedRide = ride;
  $("#order-confirmation-title").textContent = `${state.search.from} → ${state.search.to}`;
  $("#order-total").textContent = `€${ride.price}`;
  showScreen("order");
}

$("#extras-trigger").addEventListener("click", () => {
  const panel = $("#extras-panel");
  panel.hidden = !panel.hidden;
});

document.querySelectorAll('input[name="extras"]').forEach((input) => {
  input.addEventListener("change", () => {
    state.search.extras = [...document.querySelectorAll('input[name="extras"]:checked')].map((item) => item.value);
    $("#extras-summary").textContent = state.search.extras.length ? state.search.extras.join(", ") : "Pes, těžké zavazadlo, kolo…";
  });
});

$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.search.from = $("#from").value.trim();
  state.search.to = $("#to").value.trim();
  state.search.when = $("#when").value;
  renderResults();
  showScreen("results");
});

document.addEventListener("click", (event) => {
  const screenButton = event.target.closest("[data-screen]");
  if (screenButton) showScreen(screenButton.dataset.screen);
  const detailButton = event.target.closest(".details-ride");
  if (detailButton) {
    state.selectedRide = rides.find((ride) => ride.id === Number(detailButton.dataset.id));
    renderDetail();
    showScreen("detail");
  }
  const orderButton = event.target.closest(".order-ride");
  if (orderButton) {
    const ride = rides.find((item) => item.id === Number(orderButton.dataset.id)) || state.selectedRide;
    prepareOrder(ride);
  }
});

$("#pay-button").addEventListener("click", () => {
  $("#toast").textContent = "Platební krok je připravený ✦";
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 2800);
});

const defaultWhen = new Date();
defaultWhen.setHours(defaultWhen.getHours() + 1);
defaultWhen.setMinutes(0, 0, 0);
$("#when").value = defaultWhen.toISOString().slice(0, 16);
