let provider;
let signer;
let contract;

const contractAddress = "0xa4dA1FeF39acE9310667C2d740F8aE06709B2c2A";

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    console.log("Connected network:", network);
    console.log("Chain ID:", network.chainId);

    if (network.chainId !== 11155111) {
      alert("Please switch MetaMask to Sepolia");
      return;
    }

    const response = await fetch("abi.json");
    const data = await response.json();
    const abi = data.abi;

    contract = new ethers.Contract(contractAddress, abi, signer);

    console.log("Functions:", Object.keys(contract.functions));
    console.log("Connected");

    await loadEvents();
  } catch (error) {
    console.error("connectWallet error:", error);
  }
}

async function loadEvents() {
  try {
    const count = await contract.eventCount();

    console.log("Event count:", count.toString());

    const container = document.getElementById("eventContainer");
    container.innerHTML = "";

    if (count.toNumber() === 0) {
      container.innerHTML = "<h3>No events available</h3>";
      return;
    }

    for (let i = 1; i <= count.toNumber(); i++) {
      const event = await contract.getEvent(i);

      const name = event[0];
      const location = event[1];
      const price = ethers.utils.formatEther(event[4]);
      const sold = event[5].toString();

      const card = document.createElement("div");
      card.className = "event-card";

      card.innerHTML = `
        <h3>${name}</h3>
        <p>Location: ${location}</p>
        <p>Price: ${price} ETH</p>
        <p>Sold: ${sold}</p>
        <button onclick="buyTicket(${i})">Buy Ticket</button>
      `;

      container.appendChild(card);
    }
  } catch (error) {
    console.error("Load events error:", error);
    alert("Error loading events");
  }
}

async function buyTicket(eventId) {
  try {
    const event = await contract.getEvent(eventId);
    const price = event[4];

    const tx = await contract.buyTicket(eventId, {
      value: price
    });

    await tx.wait();

    alert("Ticket Purchased Successfully");
    await loadEvents();
  } catch (error) {
    console.error("Buy ticket error:", error);
    alert("Transaction Failed");
  }
}

window.connectWallet = connectWallet;
window.buyTicket = buyTicket;