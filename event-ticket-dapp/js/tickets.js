const connectBtn = document.getElementById("connectBtn");
const walletStatus = document.getElementById("walletStatus");
const eventsGrid = document.getElementById("eventsGrid");
const loadingText = document.getElementById("loadingText");

const eventImages = [
  "./images/event1.png",
  "images/event4.png",
  "images/event6.png",
  
];

// manually added dates for 3 events
const manualDates = [
  "10 May 2026",
  "18 May 2026",
  "28 May 2026"
];

function createEventCard(event, index) {
  const sold = Number(event.ticketsSold);
  const total = Number(event.totalTickets);
  const available = total - sold;
  const image = eventImages[index % eventImages.length];
  const displayDate = manualDates[index] || "May 2026";

  return `
    <div class="bg-white rounded-3xl shadow-lg overflow-hidden hover:-translate-y-2 transition duration-300">
      <img src="${image}" alt="${event.name}" class="w-full h-52 object-cover" />

      <div class="p-6">
        <h3 class="text-2xl font-bold text-slate-900 mb-2">${event.name}</h3>
        <p class="text-slate-600 mb-2">📅 ${displayDate}</p>
        <p class="text-slate-600 mb-2">📍 ${event.location}</p>
        <p class="text-slate-600 mb-2">🎟️ Sold: ${sold} / ${total}</p>
        <p class="text-secondary font-bold text-lg mb-4">💰 ${ethers.utils.formatEther(event.price)} ETH</p>

        <button
          onclick="handleBuyTicket(${event.id})"
          class="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          ${available <= 0 ? "disabled" : ""}
        >
          ${available <= 0 ? "Sold Out" : "Buy Ticket"}
        </button>
      </div>
    </div>
  `;
}

async function connectAndLoad() {
  loadingText.innerText = "Connecting wallet and loading events...";

  const contract = await getContract();
  if (!contract) {
    loadingText.innerText = "Wallet connection failed";
    return;
  }

  const wallet = await getWalletAddress();
  walletStatus.innerText = `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  const events = await getAllEvents();

  if (!events.length) {
    loadingText.innerText = "No blockchain events available";
    return;
  }

  loadingText.style.display = "none";
  eventsGrid.innerHTML = events.map((event, index) => createEventCard(event, index)).join("");
}

async function handleBuyTicket(eventId) {
  const result = await buyTicketAndGetReceipt(eventId);

  if (result) {
    alert("Ticket purchased successfully");
    window.location.href = "receipt.html";
  }
}

connectBtn.addEventListener("click", connectAndLoad);
window.handleBuyTicket = handleBuyTicket;