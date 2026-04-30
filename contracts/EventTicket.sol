// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventTicket {

    uint256 public eventCount;
    uint256 public ticketId;

    struct Event {
        uint256 id;
        string name;
        string location;
        uint256 date;
        uint256 totalTickets;
        uint256 price;
        uint256 ticketsSold;
    }

    struct Ticket {
        uint256 id;
        uint256 eventId;
        address owner;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;

    function createEvent(
        string memory _name,
        string memory _location,
        uint256 _date,
        uint256 _totalTickets,
        uint256 _price
    ) public {

        eventCount++;

        events[eventCount] = Event(
            eventCount,
            _name,
            _location,
            _date,
            _totalTickets,
            _price,
            0
        );
    }

    function buyTicket(uint256 _eventId) public payable {

        Event storage _event = events[_eventId];

        require(_event.date != 0, "Event does not exist");
        require(msg.value == _event.price, "Incorrect price");
        require(_event.ticketsSold < _event.totalTickets, "Sold out");

        ticketId++;

        tickets[ticketId] = Ticket(
            ticketId,
            _eventId,
            msg.sender
        );

        _event.ticketsSold++;
    }

    function ownerOf(uint256 _ticketId) public view returns(address) {
        return tickets[_ticketId].owner;
    }

    function getEvent(uint256 _eventId)
    public
    view
    returns(
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        uint256
    ){
        Event memory e = events[_eventId];

        return (
            e.name,
            e.location,
            e.date,
            e.totalTickets,
            e.price,
            e.ticketsSold
        );
    }
}