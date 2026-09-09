// Beim Installieren der Extension ein Intervall (Alarm) festlegen
chrome.runtime.onInstalled.addListener(() => {
  // Prueft alle 1 Minute (Minimum fuer Chrome Alarms ist 1 Min.)
  chrome.alarms.create("checkLiveData", { periodInMinutes: 1 });
  fetchLiveData();
});

// Wenn der Alarm ausgeloest wird
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkLiveData") {
    fetchLiveData();
  }
});

// Funktion zum Abrufen der Live-Daten von deinem Server
async function fetchLiveData() {
  try {
    const response = await fetch("https://deine-website.com/api/data.json");
    const data = await response.json();

    // Beispiel: Zeige ein Badge (rote Zahl) am Extension-Icon an
    if (data.unreadCount > 0) {
      chrome.action.setBadgeText({ text: String(data.unreadCount) });
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }

    // Optional: Desktop-Benachrichtigung senden
    if (data.hasNewUpdate) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Neues Update!",
        message: data.message || "Es gibt neue Inhalte auf der Website."
      });
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Live-Daten:", error);
  }
}
