console.log("bills.js loaded");

function createTicketQRUrl(ticketData) {
  return `${window.location.origin}/ticket-view.html?data=${encodeURIComponent(
    JSON.stringify(ticketData)
  )}`;
}

function toggleQR(index, encodedTicketData) {
  const qrWrapper = document.getElementById(`qr-wrapper-${index}`);
  const qrBox = document.getElementById(`qr-${index}`);
  const btn = document.getElementById(`qr-btn-${index}`);

  if (!qrWrapper || !qrBox || !btn) return;

  if (!qrWrapper.classList.contains("hidden")) {
    qrWrapper.classList.add("hidden");
    qrBox.innerHTML = "";
    btn.innerText = "Show QR";
    return;
  }

  qrWrapper.classList.remove("hidden");
  qrBox.innerHTML = "";
  btn.innerText = "Hide QR";

  const ticketData = JSON.parse(decodeURIComponent(encodedTicketData));
  const qrUrl = createTicketQRUrl(ticketData);

  new QRCode(qrBox, {
    text: qrUrl,
    width: 120,
    height: 120,
  });
}

function getStoredReceiptsForWallet(wallet) {
  const allReceipts = JSON.parse(localStorage.getItem("allTicketReceipts")) || [];

  return allReceipts.filter(
    (item) =>
      item.buyer &&
      wallet &&
      item.buyer.toLowerCase() === wallet.toLowerCase()
  );
}

function mergeBills(blockchainBills, storedReceipts) {
  const receiptMap = {};

  storedReceipts.forEach((receipt) => {
    const key = `${receipt.ticketId}_${receipt.eventId}_${receipt.buyer?.toLowerCase()}`;
    receiptMap[key] = receipt;
  });

  const merged = blockchainBills.map((bill) => {
    const key = `${bill.ticketId}_${bill.eventId}_${bill.owner?.toLowerCase()}`;
    const matchedReceipt = receiptMap[key];

    return {
      ticketId: bill.ticketId || "N/A",
      eventId: bill.eventId || "N/A",
      owner: bill.owner || "N/A",
      eventName: bill.eventName || "Unknown Event",
      location: bill.location || "N/A",
      eventDate: bill.eventDate || "N/A",
      price: bill.price || "0",
      status: bill.status || "Confirmed",
      purchaseTime: matchedReceipt?.purchaseTime || "N/A",
      transactionHash: matchedReceipt?.transactionHash || "N/A",
    };
  });

  // Add receipts that may exist in localStorage but not in blockchainBills array
  storedReceipts.forEach((receipt) => {
    const alreadyExists = merged.some(
      (item) =>
        String(item.ticketId) === String(receipt.ticketId) &&
        String(item.eventId) === String(receipt.eventId) &&
        item.owner?.toLowerCase() === receipt.buyer?.toLowerCase()
    );

    if (!alreadyExists) {
      merged.push({
        ticketId: receipt.ticketId || "N/A",
        eventId: receipt.eventId || "N/A",
        owner: receipt.buyer || "N/A",
        eventName: receipt.eventName || "Unknown Event",
        location: receipt.eventLocation || "N/A",
        eventDate: receipt.eventDate || "N/A",
        price: receipt.priceEth || "0",
        status: "Confirmed",
        purchaseTime: receipt.purchaseTime || "N/A",
        transactionHash: receipt.transactionHash || "N/A",
      });
    }
  });

  return merged.reverse();
}

function createBillCard(bill, index) {
  const ticketData = {
    ticketId: bill.ticketId,
    eventId: bill.eventId,
    eventName: bill.eventName,
    eventLocation: bill.location,
    eventDate: bill.eventDate,
    buyer: bill.owner,
    transactionHash: bill.transactionHash,
    purchaseTime: bill.purchaseTime,
    totalEth: bill.price,
    status: bill.status,
  };

  const encodedTicketData = encodeURIComponent(JSON.stringify(ticketData));

  return `
    <div class="bg-white rounded-3xl shadow-lg overflow-hidden hover:-translate-y-1 transition duration-300">
      <div class="text-white p-5" style="background: linear-gradient(to right, #D75656, #BD114A);">
        <h3 class="text-2xl font-bold">${bill.eventName}</h3>
        <p class="text-white/90 text-sm mt-1">Ticket #${bill.ticketId}</p>
      </div>

      <div class="p-6 space-y-4">
        <p><span class="font-semibold text-slate-700">Event ID:</span> ${bill.eventId}</p>
        <p><span class="font-semibold text-slate-700">Location:</span> ${bill.location}</p>
        <p><span class="font-semibold text-slate-700">Event Date:</span> ${bill.eventDate}</p>
        <p><span class="font-semibold text-slate-700">Wallet:</span> <span class="break-all">${bill.owner}</span></p>
        <p><span class="font-semibold text-slate-700">Price:</span> <span style="color:#BD114A;font-weight:700;">${bill.price} ETH</span></p>
        <p><span class="font-semibold text-slate-700">Purchased At:</span> ${bill.purchaseTime}</p>
        <p><span class="font-semibold text-slate-700">Tx Hash:</span> <span class="break-all text-sm">${bill.transactionHash}</span></p>

        <div class="border-t pt-4 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>
              <span class="font-semibold text-slate-700">Status:</span>
              <span class="text-green-600 font-semibold">${bill.status}</span>
            </p>

            <button
              id="qr-btn-${index}"
              onclick="toggleQR(${index}, '${encodedTicketData}')"
              class="text-white px-4 py-2 rounded-xl font-semibold transition"
              style="background: linear-gradient(to right, #D75656, #BD114A);"
            >
              Show QR
            </button>
          </div>

          <div id="qr-wrapper-${index}" class="hidden text-center">
            <div id="qr-${index}" class="bg-white p-3 rounded-xl border inline-block"></div>
            <p class="text-sm text-slate-500 mt-2">Scan to view ticket details</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadMyBills() {
  const walletStatus = document.getElementById("walletStatus");
  const loadingText = document.getElementById("loadingText");
  const billsGrid = document.getElementById("billsGrid");
  const connectBtn = document.getElementById("connectBtn");

  try {
    if (!window.ethereum) {
      loadingText.innerText = "MetaMask not detected";
      alert("MetaMask is not installed.");
      return;
    }

    if (!window.getWalletAddress) {
      loadingText.innerText = "Wallet function not found";
      alert("getWalletAddress is missing in blockchain.js");
      return;
    }

    loadingText.style.display = "block";
    loadingText.innerText = "Connecting wallet...";
    billsGrid.innerHTML = "";

    const wallet = await window.getWalletAddress();

    if (!wallet) {
      loadingText.innerText = "Wallet connection failed";
      return;
    }

    walletStatus.innerText = `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    connectBtn.innerText = "Wallet Connected";

    loadingText.innerText = "Loading your bills...";

    let blockchainBills = [];
    if (window.getMyOwnedTickets) {
      blockchainBills = await window.getMyOwnedTickets();
    }

    const storedReceipts = getStoredReceiptsForWallet(wallet);

    console.log("blockchainBills:", blockchainBills);
    console.log("storedReceipts:", storedReceipts);

    const myBills = mergeBills(blockchainBills, storedReceipts);

    loadingText.style.display = "none";

    if (!myBills.length) {
      billsGrid.innerHTML = `
        <div class="col-span-full bg-white rounded-3xl shadow-lg p-10 text-center">
          <h2 class="text-2xl font-bold text-slate-800 mb-3">No bills found</h2>
          <p class="text-slate-600 mb-6">This wallet has not purchased any tickets yet.</p>
          <a
            href="tickets.html"
            class="inline-block text-white px-6 py-3 rounded-xl font-semibold"
            style="background: linear-gradient(to right, #D75656, #BD114A);"
          >
            Buy Ticket
          </a>
        </div>
      `;
      return;
    }

    billsGrid.innerHTML = myBills.map((bill, index) => createBillCard(bill, index)).join("");
  } catch (error) {
    console.error("Load my bills error:", error);
    loadingText.style.display = "block";
    loadingText.innerText = "Failed to load bills";
    alert("Something went wrong. Open console with F12.");
  }
}

window.loadMyBills = loadMyBills;
window.toggleQR = toggleQR;