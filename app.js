const rides = [
  { id: 1, time: "13:30", arrive: "15:55", driver: "Boris", initials: "B", rating: "4.9", price: 25, car: "Green Škoda Octavia", seats: 2, note: "Quiet ride · 1 stop" },
  { id: 2, time: "15:10", arrive: "17:45", driver: "Klára", initials: "K", rating: "4.8", price: 28, car: "Blue Volkswagen Golf", seats: 3, note: "Music welcome · No smoking" },
  { id: 3, time: "18:20", arrive: "20:55", driver: "Matej", initials: "M", rating: "5.0", price: 22, car: "Grey Hyundai i30", seats: 1, note: "Direct ride · Small bags only" }
];

const state = { search: { from: "Brno", to: "Vienna", when: "", extras: [] }, selectedRide: rides[0] };
const $ = (selector) => document.querySelector(selector);

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  $(`#${name}-screen`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatDate(value) {
  if (!value) return "Today";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function renderResults() {
  $("#route-summary").textContent = `${state.search.from} → ${state.search.to} · ${formatDate(state.search.when)}`;
  $("#ride-list").innerHTML = rides.map((ride) => `
    <article class="ride-card">
      <div>
        <div class="ride-main">
          <div class="ride-time"><strong>${ride.time}</strong><small>arrives ${ride.arrive}</small></div>
          <div class="ride-route"><strong>${state.search.from}</strong><small>${ride.note}</small><strong>${state.search.to}</strong></div>
        </div>
        <div class="ride-driver"><span class="avatar">${ride.initials}</span><span>${ride.driver} · ★ ${ride.rating}</span></div>
      </div>
      <div class="ride-actions">
        <div class="ride-price">€${ride.price} <small>/ seat</small></div>
        <div>
          <button class="button button-primary small-button order-ride" data-id="${ride.id}">Order <span>→</span></button>
          <button class="detail-button small-button details-ride" data-id="${ride.id}">Details</button>
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
        <div class="meta-item"><small>Departure</small><strong>${ride.time} · ${formatDate(state.search.when)}</strong></div>
        <div class="meta-item"><small>Arrival</small><strong>${ride.arrive} · approx. 2h 25m</strong></div>
      </div>
    </div>
    <aside class="info-card">
      <div class="driver-profile"><div class="big-avatar">${ride.initials}</div><div><strong>${ride.driver}</strong><small>★ ${ride.rating} · 48 rides</small></div></div>
      <div class="info-list"><div><span>Car</span><strong>${ride.car}</strong></div><div><span>Seats left</span><strong>${ride.seats}</strong></div><div><span>Extras</span><strong>${state.search.extras.length ? state.search.extras.join(", ") : "No extras selected"}</strong></div></div>
      <button class="button button-primary full order-ride" data-id="${ride.id}">Order this ride <span>→</span></button>
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
    $("#extras-summary").textContent = state.search.extras.length ? state.search.extras.join(", ") : "Dogs, heavy bags, bikes...";
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
  $("#toast").textContent = "Payment flow ready for the next step ✦";
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 2800);
});

const defaultWhen = new Date();
defaultWhen.setHours(defaultWhen.getHours() + 1);
defaultWhen.setMinutes(0, 0, 0);
$("#when").value = defaultWhen.toISOString().slice(0, 16);
