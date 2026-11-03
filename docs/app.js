document.addEventListener("DOMContentLoaded", async () => {
    // 1. Charger la configuration et initialiser les index du calendrier
    const config = await loadConfig();
    if (config && config.availableDates) {
        generateCalendarMenu(config.availableDates);
        
        // Router initial : Charge la dernière date de la liste par défaut
        const defaultDate = config.availableDates[config.availableDates.length - 1];
        fetchAndRender(defaultDate);
    }
});

async function loadConfig() {
    try {
        const response = await fetch('./config.json');
        return await response.json();
    } catch (error) {
        console.error("Erreur d'initialisation de l'application :", error);
        document.getElementById("current-date-display").textContent = "Erreur de configuration";
    }
}

function generateCalendarMenu(dates) {
    const menuContainer = document.getElementById("calendar-navigation");
    menuContainer.innerHTML = "";
    
    dates.forEach(dateStr => {
        const link = document.createElement("a");
        link.href = `#${dateStr}`;
        link.className = "calendar-day-link";
        link.dataset.date = dateStr;
        
        const dateObj = new Date(dateStr);
        link.textContent = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        
        link.addEventListener("click", (e) => {
            e.preventDefault();
            fetchAndRender(dateStr);
        });
        
        menuContainer.appendChild(link);
    });
}

async function fetchAndRender(dateString) {
    // Gérer l'état actif visuel sur le menu
    document.querySelectorAll(".calendar-day-link").forEach(link => {
        link.classList.toggle("active", link.dataset.date === dateString);
    });

    try {
        const response = await fetch(`./data/${dateString}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Hydratation du DOM
        document.getElementById("current-date-display").textContent = data.formattedDate;
        document.getElementById("transit-content").textContent = data.transit;
        document.getElementById("love-content").textContent = data.love;
        document.getElementById("projects-content").textContent = data.projects;
        document.getElementById("activities-content").textContent = data.activities;
        document.getElementById("intimacy-content").textContent = data.intimacy;
        
        // Rendu de l'image
        const imgElement = document.getElementById("horoscope-image");
        if (data.imageUrl) {
            imgElement.src = data.imageUrl;
            imgElement.style.display = "block";
        } else {
            imgElement.style.display = "none";
        }
        
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        document.getElementById("current-date-display").textContent = "Données indisponibles";
    }
}
