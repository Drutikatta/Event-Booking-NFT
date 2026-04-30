const EventTicket = artifacts.require("EventTicket");

module.exports = async function (deployer) {

  console.log("Deploying EventTicket contract...");

  // Deploy contract
  await deployer.deploy(EventTicket);

  const instance = await EventTicket.deployed();

  console.log("Creating events...");

  // Create multiple events

  await instance.createEvent(
    "Music Concert",
    "Mumbai",
    1735689600,
    100,
    web3.utils.toWei("0.01", "ether")
  );

  await instance.createEvent(
    "Tech Conference",
    "Pune",
    1735789600,
    200,
    web3.utils.toWei("0.02", "ether")
  );

  await instance.createEvent(
    "College Fest",
    "Nashik",
    1735889600,
    150,
    web3.utils.toWei("0.015", "ether")
  );

  console.log("Events created successfully!");
};