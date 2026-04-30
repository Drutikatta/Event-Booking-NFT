document.addEventListener("DOMContentLoaded", function () {
  const landingEvents = [
    {
      id: 1,
      title: "Wonder Girls 2026 Music Festival",
      category: "music",
      place: "Jakarta",
      date: "2026-04-14",
      image: "./images/event1.png",
      description: "A grand live music festival featuring popular artists."
    },
    {
      id: 2,
      title: "Kpop Super Live Night",
      category: "kpop",
      place: "Seoul",
      date: "2026-05-20",
      image: "./images/event2.png",
      description: "Experience electrifying Kpop performances live on stage."
    },
    {
      id: 3,
      title: "Tech Innovators Summit",
      category: "tech",
      place: "Bangalore",
      date: "2026-06-12",
      image: "./images/event3.png",
      description: "Meet creators, startups, and future technology leaders."
    },
    {
      id: 4,
      title: "Rock and Beats Concert",
      category: "music",
      place: "Mumbai",
      date: "2026-04-28",
      image: "./images/event5.png",
      description: "Feel the energy of live rock and pop performances."
    },
    {
      id: 5,
      title: "Summer DJ Night",
      category: "music",
      place: "Goa",
      date: "2026-07-10",
      image: "./images/event6.png",
      description: "An unforgettable summer party with live DJ sets."
    },
    {
      id: 6,
      title: "Blockchain & Web3 Expo",
      category: "tech",
      place: "Hyderabad",
      date: "2026-08-18",
      image: "./images/event4.png",
      description: "Discover the future of blockchain, crypto, and Web3."
    },
    {
      id: 7,
      title: "Kpop Fan Meet & Show",
      category: "kpop",
      place: "Indonesia",
      date: "2026-05-18",
      image: "./images/event2.png",
      description: "Fan interaction, dance, music, and stage performances."
    },
    {
      id: 8,
      title: "Acoustic Evening Sessions",
      category: "music",
      place: "Pune",
      date: "2026-06-01",
      image: "./images/event1.png",
      description: "Relax with acoustic live music under a cozy ambiance."
    },
    {
      id: 9,
      title: "Creative Design Workshop",
      category: "workshop",
      place: "Delhi",
      date: "2026-06-25",
      image: "./images/event3.png",
      description: "Interactive workshop for design and digital creativity."
    }
  ];

  const landingEventGrid = document.getElementById("landingEventGrid");
  const landingSearch = document.getElementById("landingSearch");
  const landingSearchBtn = document.getElementById("landingSearchBtn");
  const filterBtns = document.querySelectorAll(".filter-btn");

  function formatPrettyDate(dateString) {
    return new Date(dateString).toDateString();
  }

  function createLandingEventCard(event) {
    return `
      <div class="bg-white rounded-3xl shadow-lg overflow-hidden hover:-translate-y-2 transition duration-300">
        <img 
          src="${event.image}" 
          alt="${event.title}" 
          class="w-full h-52 object-cover"
          onerror="this.src='./images/event1.png'"
        />

        <div class="p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-secondary uppercase">${event.category}</span>
            <span class="text-sm text-slate-500">${formatPrettyDate(event.date)}</span>
          </div>

          <h4 class="text-xl font-bold text-slate-900 mb-2">${event.title}</h4>
          <p class="text-slate-600 text-sm mb-3">${event.description}</p>
          <p class="text-slate-500 text-sm mb-4">📍 ${event.place}</p>

          <a href="tickets.html" class="inline-block bg-primary hover:bg-secondary text-white px-5 py-2 rounded-full text-sm font-semibold transition">
            Book Now
          </a>
        </div>
      </div>
    `;
  }

  function renderLandingEvents(events) {
    if (!landingEventGrid) {
      console.error("landingEventGrid not found in HTML");
      return;
    }

    if (!events.length) {
      landingEventGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <h3 class="text-2xl font-bold text-slate-800 mb-2">No events found</h3>
          <p class="text-slate-500">Try searching music, kpop, tech, workshop, or concert.</p>
        </div>
      `;
      return;
    }

    landingEventGrid.innerHTML = events.map(createLandingEventCard).join("");
  }

  function searchLandingEvents() {
    if (!landingSearch) return;

    const searchValue = landingSearch.value.trim().toLowerCase();

    if (!searchValue) {
      renderLandingEvents(landingEvents);
      return;
    }

    const filtered = landingEvents.filter(event =>
      event.title.toLowerCase().includes(searchValue) ||
      event.category.toLowerCase().includes(searchValue) ||
      event.place.toLowerCase().includes(searchValue) ||
      event.description.toLowerCase().includes(searchValue)
    );

    renderLandingEvents(filtered);
  }

  if (landingSearchBtn) {
    landingSearchBtn.addEventListener("click", searchLandingEvents);
  }

  if (landingSearch) {
    landingSearch.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchLandingEvents();
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;

      if (category === "all") {
        renderLandingEvents(landingEvents);
      } else {
        const filtered = landingEvents.filter(event => event.category === category);
        renderLandingEvents(filtered);
      }
    });
  });

  renderLandingEvents(landingEvents);
});