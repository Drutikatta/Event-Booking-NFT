const ticketDetails = document.getElementById("ticketDetails");

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderTicketDetails() {
  const encoded = getQueryParam("data");

  if (!encoded) {
    ticketDetails.innerHTML = `
      <div class="text-center">
        <h2 class="text-2xl font-bold text-slate-800 mb-3">Invalid Ticket</h2>
        <p class="text-slate-600">No ticket data found in QR code.</p>
      </div>
    `;
    return;
  }

  try {
    const ticket = JSON.parse(decodeURIComponent(encoded));

    ticketDetails.innerHTML = `
      <div class="space-y-5">
        <div>
          <h3 class="text-sm text-slate-500">Ticket ID</h3>
          <p class="text-xl font-semibold text-slate-900">#${ticket.ticketId}</p>
        </div>

        <div>
          <h3 class="text-sm text-slate-500">Event Name</h3>
          <p class="text-xl font-semibold text-slate-900">${ticket.eventName}</p>
        </div>

        <div>
          <h3 class="text-sm text-slate-500">Event Location</h3>
          <p class="text-lg font-semibold text-slate-900">${ticket.eventLocation}</p>
        </div>

        <div>
          <h3 class="text-sm text-slate-500">Event Date</h3>
          <p class="text-lg font-semibold text-slate-900">${ticket.eventDate}</p>
        </div>

        <div>
          <h3 class="text-sm text-slate-500">Buyer Wallet</h3>
          <p class="text-lg font-semibold break-all text-slate-900">${ticket.buyer}</p>
        </div>

        <div>
          <h3 class="text-sm text-slate-500">Purchase Time</h3>
          <p class="text-lg font-semibold text-slate-900">${ticket.purchaseTime}</p>
        </div>

        <div>
          <h3 class="text-sm text-slate-500">Transaction Hash</h3>
          <p class="text-sm font-semibold break-all text-slate-900">${ticket.transactionHash}</p>
        </div>

        <div>
          <h3 class="text-sm text-slate-500">Amount Paid</h3>
          <p class="text-lg font-semibold text-green-600">${ticket.totalEth} ETH</p>
        </div>

        <div class="pt-4 border-t">
          <span class="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
            Valid Ticket
          </span>
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    ticketDetails.innerHTML = `
      <div class="text-center">
        <h2 class="text-2xl font-bold text-slate-800 mb-3">Invalid QR</h2>
        <p class="text-slate-600">Could not read ticket data.</p>
      </div>
    `;
  }
}

renderTicketDetails();