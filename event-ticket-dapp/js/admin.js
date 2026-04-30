console.log("admin.js loaded");

function formatWallet(address) {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTxHash(hash) {
  if (!hash || hash === "N/A") return "N/A";
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function formatDate(timestampOrDate) {
  try {
    if (!timestampOrDate) return "N/A";

    // if already date text
    if (isNaN(timestampOrDate)) {
      return timestampOrDate;
    }

    // if unix timestamp in seconds
    return new Date(Number(timestampOrDate) * 1000).toLocaleString();
  } catch (error) {
    console.error("Date format error:", error);
    return "N/A";
  }
}

function getAllStoredReceipts() {
  return JSON.parse(localStorage.getItem("allTicketReceipts")) || [];
}

function calculateDashboardStats(events, receipts) {
  let totalEvents = events.length;
  let totalTicketsSold = 0;
  let totalRemainingTickets = 0;
  let totalRevenueEth = 0;

  events.forEach((event) => {
    const totalTickets = Number(event.totalTickets || 0);
    const ticketsSold = Number(event.ticketsSold || 0);
    const remaining = totalTickets - ticketsSold;
    const ticketPriceEth = Number(ethers.utils.formatEther(event.price || "0"));

    totalTicketsSold += ticketsSold;
    totalRemainingTickets += remaining > 0 ? remaining : 0;
    totalRevenueEth += ticketsSold * ticketPriceEth;
  });

  const successfulPayments = receipts.length;
  const failedPayments = 0; // no failed tx storage currently in your code

  return {
    totalEvents,
    totalTicketsSold,
    totalRemainingTickets,
    totalRevenueEth,
    successfulPayments,
    failedPayments
  };
}

function createStatCard(title, value, subtitle) {
  return `
    <div class="bg-white rounded-3xl shadow-lg p-6 hover:-translate-y-1 transition duration-300">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-slate-500 text-sm font-medium">${title}</p>
          <h3 class="text-3xl font-bold text-slate-900 mt-2">${value}</h3>
          <p class="text-slate-500 text-sm mt-2">${subtitle}</p>
        </div>
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
             style="background: linear-gradient(to right, #D75656, #BD114A);">
          ★
        </div>
      </div>
    </div>
  `;
}

function renderStats(stats) {
  const statsGrid = document.getElementById("statsGrid");

  statsGrid.innerHTML = `
    ${createStatCard("Total Events", stats.totalEvents, "Events available on platform")}
    ${createStatCard("Total Tickets Sold", stats.totalTicketsSold, "Confirmed sold tickets")}
    ${createStatCard("Remaining Tickets", stats.totalRemainingTickets, "Tickets still available")}
    ${createStatCard("Total Revenue", `${stats.totalRevenueEth.toFixed(4)} ETH`, "Overall revenue from sales")}
    ${createStatCard("Successful Payments", stats.successfulPayments, "Completed purchases")}
    ${createStatCard("Failed Payments", stats.failedPayments, "Currently not tracked")}
  `;
}

function renderTicketsChart(events) {
  const ticketsChart = document.getElementById("ticketsChart");

  if (!events.length) {
    ticketsChart.innerHTML = `<p class="text-slate-500">No event data available.</p>`;
    return;
  }

  const maxSold = Math.max(...events.map((e) => Number(e.ticketsSold || 0)), 1);

  ticketsChart.innerHTML = events
    .map((event) => {
      const sold = Number(event.ticketsSold || 0);
      const widthPercent = (sold / maxSold) * 100;

      return `
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-slate-700">${event.name}</span>
            <span class="text-slate-500">${sold} sold</span>
          </div>
          <div class="w-full bg-rose-100 rounded-full h-3 overflow-hidden">
            <div class="h-3 rounded-full" style="width:${widthPercent}%; background: linear-gradient(to right, #D75656, #BD114A);"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRevenueChart(events) {
  const revenueChart = document.getElementById("revenueChart");

  if (!events.length) {
    revenueChart.innerHTML = `<p class="text-slate-500">No revenue data available.</p>`;
    return;
  }

  const eventRevenues = events.map((event) => {
    const sold = Number(event.ticketsSold || 0);
    const priceEth = Number(ethers.utils.formatEther(event.price || "0"));
    return {
      name: event.name,
      revenue: sold * priceEth
    };
  });

  const maxRevenue = Math.max(...eventRevenues.map((e) => e.revenue), 1);

  revenueChart.innerHTML = eventRevenues
    .map((item) => {
      const widthPercent = (item.revenue / maxRevenue) * 100;

      return `
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-slate-700">${item.name}</span>
            <span class="text-slate-500">${item.revenue.toFixed(4)} ETH</span>
          </div>
          <div class="w-full bg-rose-100 rounded-full h-3 overflow-hidden">
            <div class="h-3 rounded-full" style="width:${widthPercent}%; background: linear-gradient(to right, #BD114A, #D75656);"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderEventTable(events) {
  const eventTableBody = document.getElementById("eventTableBody");

  if (!events.length) {
    eventTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="py-6 text-center text-slate-500">No events found</td>
      </tr>
    `;
    return;
  }

  eventTableBody.innerHTML = events
    .map((event) => {
      const totalTickets = Number(event.totalTickets || 0);
      const sold = Number(event.ticketsSold || 0);
      const remaining = totalTickets - sold;
      const priceEth = Number(ethers.utils.formatEther(event.price || "0"));
      const revenue = sold * priceEth;
      const eventDate = formatDate(event.date);
      const status = remaining > 0 ? "Active" : "Sold Out";

      return `
        <tr class="border-b border-slate-100 hover:bg-rose-50/40 transition">
          <td class="py-4 pr-4 font-semibold text-slate-800">${event.name}</td>
          <td class="py-4 pr-4 text-slate-600">${event.location}</td>
          <td class="py-4 pr-4 text-slate-600">${eventDate}</td>
          <td class="py-4 pr-4 text-slate-600">${totalTickets}</td>
          <td class="py-4 pr-4 text-slate-600">${sold}</td>
          <td class="py-4 pr-4 text-slate-600">${remaining}</td>
          <td class="py-4 pr-4 text-slate-600">${priceEth.toFixed(4)} ETH</td>
          <td class="py-4 pr-4 font-semibold text-[#BD114A]">${revenue.toFixed(4)} ETH</td>
          <td class="py-4 pr-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${
              status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }">
              ${status}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderTransactions(receipts) {
  const transactionsTableBody = document.getElementById("transactionsTableBody");

  if (!receipts.length) {
    transactionsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-6 text-center text-slate-500">No transactions found</td>
      </tr>
    `;
    return;
  }

  const sortedReceipts = [...receipts].reverse();

  transactionsTableBody.innerHTML = sortedReceipts
    .map((receipt) => {
      return `
        <tr class="border-b border-slate-100 hover:bg-rose-50/40 transition">
          <td class="py-4 pr-4 font-semibold text-slate-800">${receipt.ticketId || "N/A"}</td>
          <td class="py-4 pr-4 text-slate-600">${receipt.eventName || "Unknown Event"}</td>
          <td class="py-4 pr-4 text-slate-600 break-all">${formatWallet(receipt.buyer || "N/A")}</td>
          <td class="py-4 pr-4 font-semibold text-[#BD114A]">${receipt.totalEth || receipt.priceEth || "0"} ETH</td>
          <td class="py-4 pr-4 text-slate-600">${receipt.purchaseTime || "N/A"}</td>
          <td class="py-4 pr-4 text-slate-600 break-all">${formatTxHash(receipt.transactionHash || "N/A")}</td>
          <td class="py-4 pr-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Success
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadAdminDashboard() {
  const walletStatus = document.getElementById("walletStatus");
  const loadingText = document.getElementById("loadingText");
  const dashboardContent = document.getElementById("dashboardContent");
  const connectBtn = document.getElementById("connectBtn");

  try {
    if (!window.ethereum) {
      loadingText.innerText = "MetaMask not detected";
      alert("MetaMask is not installed.");
      return;
    }

    if (!window.getWalletAddress || !window.getAllEvents) {
      loadingText.innerText = "Required blockchain functions not found";
      alert("blockchain.js functions are missing.");
      return;
    }

    loadingText.classList.remove("hidden");
    loadingText.style.display = "block";
    loadingText.innerText = "Connecting wallet...";
    dashboardContent.classList.add("hidden");

    const wallet = await window.getWalletAddress();

    if (!wallet) {
      loadingText.innerText = "Wallet connection failed";
      return;
    }

    walletStatus.innerText = `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    connectBtn.innerText = "Wallet Connected";

    loadingText.innerText = "Loading events...";

    const events = await window.getAllEvents();
    const receipts = getAllStoredReceipts();

    console.log("Admin events:", events);
    console.log("Admin receipts:", receipts);

    const stats = calculateDashboardStats(events, receipts);

    renderStats(stats);
    renderTicketsChart(events);
    renderRevenueChart(events);
    renderEventTable(events);
    renderTransactions(receipts);

    loadingText.style.display = "none";
    dashboardContent.classList.remove("hidden");
  } catch (error) {
    console.error("Admin dashboard load error:", error);
    loadingText.style.display = "block";
    loadingText.innerText = "Failed to load admin dashboard";
    alert("Something went wrong. Open console with F12.");
  }
}

window.loadAdminDashboard = loadAdminDashboard;