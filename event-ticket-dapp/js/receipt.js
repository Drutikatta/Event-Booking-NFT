const receiptContainer = document.getElementById("receiptContainer");

function renderReceipt() {
  try {
    const data = localStorage.getItem("ticketReceipt");
    console.log("ticketReceipt:", data);

    if (!data) {
      receiptContainer.innerHTML = `
        <div class="text-center py-10">
          <h2 class="text-2xl font-bold text-slate-800 mb-3">No receipt found</h2>
          <p class="text-slate-600 mb-6">Please buy a ticket first.</p>
          <a href="tickets.html" class="bg-[#BD114A] text-white px-6 py-3 rounded-xl inline-block">
            Go to Tickets
          </a>
        </div>
      `;
      return;
    }

    const receipt = JSON.parse(data);

    const qrPayload = {
      ticketId: receipt.ticketId,
      eventId: receipt.eventId,
      eventName: receipt.eventName,
      eventLocation: receipt.eventLocation,
      eventDate: receipt.eventDate,
      buyer: receipt.buyer,
      transactionHash: receipt.transactionHash,
      purchaseTime: receipt.purchaseTime,
      totalEth: receipt.totalEth
    };

    const encodedData = encodeURIComponent(JSON.stringify(qrPayload));
    const qrUrl = `${window.location.origin}${window.location.pathname.replace("receipt.html", "ticket-view.html")}?data=${encodedData}`;

    receiptContainer.innerHTML = `
      <div class="grid md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div>
            <h3 class="text-sm text-slate-500">Event Name</h3>
            <p class="text-lg font-semibold text-slate-900">${receipt.eventName}</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Location</h3>
            <p class="text-lg font-semibold text-slate-900">${receipt.eventLocation}</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Event Date</h3>
            <p class="text-lg font-semibold text-slate-900">${receipt.eventDate}</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Buyer Wallet</h3>
            <p class="text-lg font-semibold break-all text-slate-900">${receipt.buyer}</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Purchase Time</h3>
            <p class="text-lg font-semibold text-slate-900">${receipt.purchaseTime}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <h3 class="text-sm text-slate-500">Ticket ID</h3>
            <p class="text-lg font-semibold text-slate-900">#${receipt.ticketId}</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Total</h3>
            <p class="text-lg font-semibold text-green-600">${receipt.totalEth} ETH</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Transaction Hash</h3>
            <p class="text-lg font-semibold break-all text-slate-900">${receipt.transactionHash}</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Block Number</h3>
            <p class="text-lg font-semibold text-slate-900">${receipt.blockNumber}</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Contract Address</h3>
            <p class="text-lg font-semibold break-all text-slate-900">${receipt.contractAddress}</p>
          </div>

          <div>
            <h3 class="text-sm text-slate-500">Network</h3>
            <p class="text-lg font-semibold text-slate-900">${receipt.network}</p>
          </div>
        </div>
      </div>

      <div class="mt-10 flex flex-wrap gap-4">
        <button onclick="window.print()" class="bg-[#D75656] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#BD114A] transition">
          Print Receipt
        </button>

        <a href="tickets.html" class="bg-[#BD114A] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition">
          Back to Tickets
        </a>

        <button id="showQrBtn" class="border-2 border-[#BD114A] text-[#BD114A] px-6 py-3 rounded-xl font-semibold hover:bg-[#BD114A] hover:text-white transition">
          Show QR
        </button>
      </div>

      <div id="qrSection" class="hidden mt-10 border-t pt-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Your Ticket QR</h2>
        <p class="text-slate-600 mb-5">
          Scan this QR to view ticket and event details.
        </p>

        <div class="flex flex-col items-center">
          <div id="qrcode" class="bg-white p-4 rounded-2xl shadow"></div>
          <p class="mt-4 text-sm text-slate-500 text-center break-all max-w-xl">
            This QR is unique for this purchase
          </p>
        </div>
      </div>
    `;

    const showQrBtn = document.getElementById("showQrBtn");
    const qrSection = document.getElementById("qrSection");
    let qrCreated = false;

    showQrBtn.addEventListener("click", () => {
      qrSection.classList.toggle("hidden");

      if (!qrCreated) {
        new QRCode(document.getElementById("qrcode"), {
          text: qrUrl,
          width: 220,
          height: 220
        });
        qrCreated = true;
      }

      showQrBtn.textContent = qrSection.classList.contains("hidden")
        ? "Show QR"
        : "Hide QR";
    });
  } catch (error) {
    console.error("Receipt render error:", error);
    receiptContainer.innerHTML = `
      <div class="text-center py-10">
        <h2 class="text-2xl font-bold text-red-600 mb-3">Error loading receipt</h2>
        <p class="text-slate-600">Check console for details.</p>
      </div>
    `;
  }
}

renderReceipt();