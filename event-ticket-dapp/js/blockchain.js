let provider = null;
let signer = null;
let contract = null;

async function getContract() {
  try {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install MetaMask.");
      return null;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: window.APP_CONFIG.chainIdHex }],
      });
    } catch (switchError) {
      console.error("Network switch error:", switchError);

      if (switchError.code === 4902) {
        alert("Sepolia network is not added in MetaMask. Please add Sepolia manually.");
      } else if (switchError.code === 4001) {
        alert("You rejected the network switch request.");
      } else {
        alert("Could not switch network. Please switch MetaMask to Sepolia manually.");
      }
      return null;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      await provider.send("eth_requestAccounts", []);
    } catch (accountError) {
      console.error("Account access error:", accountError);
      alert("Wallet connection request was rejected.");
      return null;
    }

    signer = provider.getSigner();

    const network = await provider.getNetwork();
    console.log("Connected network:", network);

    if (network.chainId !== window.APP_CONFIG.chainIdDecimal) {
      alert("Please switch MetaMask to Sepolia network.");
      return null;
    }

    const response = await fetch("abi.json");
    const data = await response.json();

    contract = new ethers.Contract(
      window.APP_CONFIG.contractAddress,
      data.abi,
      signer
    );

    console.log("Contract connected successfully");
    return contract;
  } catch (error) {
    console.error("Blockchain connection error:", error);
    alert("Failed to connect wallet");
    return null;
  }
}

async function getWalletAddress() {
  try {
    if (!signer) {
      const currentContract = await getContract();
      if (!currentContract) return null;
    }

    const address = await signer.getAddress();
    console.log("Wallet address:", address);
    return address;
  } catch (error) {
    console.error("Wallet address error:", error);
    return null;
  }
}

async function getAllEvents() {
  try {
    const currentContract = await getContract();
    if (!currentContract) return [];

    const countBN = await currentContract.eventCount();
    const count = countBN.toNumber();

    const events = [];

    for (let i = 1; i <= count; i++) {
      const event = await currentContract.getEvent(i);

      events.push({
        id: i,
        name: event[0],
        location: event[1],
        date: event[2].toString(),
        totalTickets: event[3].toString(),
        price: event[4],
        ticketsSold: event[5].toString(),
      });
    }

    console.log("All events:", events);
    return events;
  } catch (error) {
    console.error("Get all events error:", error);
    return [];
  }
}

async function buyTicketAndGetReceipt(eventId) {
  try {
    const currentContract = await getContract();
    if (!currentContract) return null;

    const walletAddress = await getWalletAddress();
    if (!walletAddress) return null;

    const event = await currentContract.getEvent(eventId);
    const price = event[4];

    const tx = await currentContract.buyTicket(eventId, {
      value: price,
    });

    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    const block = await provider.getBlock(receipt.blockNumber);
    const latestTicketId = await currentContract.ticketId();

    const receiptData = {
      eventId: eventId,
      eventName: event[0],
      eventLocation: event[1],
      eventDate: new Date(Number(event[2]) * 1000).toLocaleString(),
      priceEth: ethers.utils.formatEther(price),
      totalEth: ethers.utils.formatEther(price),
      buyer: walletAddress,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      purchaseTime: new Date(block.timestamp * 1000).toLocaleString(),
      ticketId: latestTicketId.toString(),
      contractAddress: window.APP_CONFIG.contractAddress,
      network: "Sepolia",
    };

    console.log("Receipt data:", receiptData);

    localStorage.setItem("ticketReceipt", JSON.stringify(receiptData));

    const allBills = JSON.parse(localStorage.getItem("allTicketReceipts")) || [];

    const alreadyExists = allBills.some(
      (item) =>
        String(item.ticketId) === String(receiptData.ticketId) &&
        String(item.eventId) === String(receiptData.eventId) &&
        item.buyer?.toLowerCase() === receiptData.buyer?.toLowerCase()
    );

    if (!alreadyExists) {
      allBills.push(receiptData);
      localStorage.setItem("allTicketReceipts", JSON.stringify(allBills));
    }

    return receiptData;
  } catch (error) {
    console.error("Buy ticket error:", error);
    alert("Transaction failed");
    return null;
  }
}

async function getMyOwnedTickets() {
  try {
    const currentContract = await getContract();
    if (!currentContract) return [];

    const walletAddress = await getWalletAddress();
    if (!walletAddress) return [];

    const latestTicketIdBN = await currentContract.ticketId();
    const latestTicketId = latestTicketIdBN.toNumber();

    const myBills = [];

    for (let i = 1; i <= latestTicketId; i++) {
      try {
        const ticket = await currentContract.tickets(i);
        console.log("Ticket", i, ticket);

        const ticketId = ticket.id ? ticket.id.toString() : ticket[0]?.toString();
        const eventId = ticket.eventId ? Number(ticket.eventId) : Number(ticket[1]);
        const owner = ticket.owner ? ticket.owner : ticket[2];

        if (owner && owner.toLowerCase() === walletAddress.toLowerCase()) {
          const eventData = await currentContract.getEvent(eventId);

          myBills.push({
            ticketId: ticketId,
            eventId: eventId,
            owner: owner,
            eventName: eventData[0],
            location: eventData[1],
            eventDate: new Date(Number(eventData[2]) * 1000).toLocaleString(),
            price: ethers.utils.formatEther(eventData[4]),
            status: "Confirmed",
          });
        }
      } catch (ticketError) {
        console.error("Error reading ticket", i, ticketError);
      }
    }

    console.log("Owned tickets from blockchain:", myBills);
    return myBills;
  } catch (error) {
    console.error("Get my owned tickets error:", error);
    return [];
  }
}

window.getContract = getContract;
window.getWalletAddress = getWalletAddress;
window.getAllEvents = getAllEvents;
window.buyTicketAndGetReceipt = buyTicketAndGetReceipt;
window.getMyOwnedTickets = getMyOwnedTickets;