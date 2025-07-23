async function getResponse() {
  const userInput = document.getElementById("userInput").value.trim().toLowerCase();
  const responseBox = document.getElementById("response");

  if (!userInput) {
    responseBox.innerHTML = "Please enter a query.";
    return;
  }

  // Load all data in parallel
  const [timetable, lunch, teachers, map, notices] = await Promise.all([
    fetch("data/timetable.json").then(res => res.json()),
    fetch("data/lunch.json").then(res => res.json()),
    fetch("data/teachers.json").then(res => res.json()),
    fetch("data/map.json").then(res => res.json()),
    fetch("data/notices.json").then(res => res.json())
  ]);

  // Match and respond
  if (userInput.includes("lunch")) {
    let day = getDayFromInput(userInput);
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    day = day || today;

    const menu = lunch[day];
    responseBox.innerHTML = menu
      ? `<strong>${day}'s Lunch:</strong><br>${menu.join(", ")}`
      : "Sorry, lunch menu not found.";
  } else if (userInput.includes("timetable")) {
    const dept = await ask("Please enter department (e.g., CSE, AIML)");
    const year = await ask("Please enter year (e.g., FE, SE)");

    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const schedule = timetable[dept]?.[year]?.[day];

    responseBox.innerHTML = schedule
      ? `<strong>${dept} ${year} Timetable (${day}):</strong><br>${schedule.join("<br>")}`
      : "Timetable not found.";
  } else if (userInput.includes("teacher") || userInput.includes("class teacher")) {
    const dept = await ask("Enter department:");
    const year = await ask("Enter year:");
    const info = teachers[dept]?.[year];

    responseBox.innerHTML = info
      ? `<strong>Class Teacher:</strong> ${info.name} (${info.email})`
      : "Teacher info not found.";
  } else if (userInput.includes("where") || userInput.includes("location") || userInput.includes("classroom")) {
    const location = Object.keys(map).find(key => userInput.includes(key.toLowerCase()));
    responseBox.innerHTML = location
      ? `<strong>${location}:</strong> ${map[location]}`
      : "Location not found.";
  } else if (userInput.includes("notice")) {
    responseBox.innerHTML = `<strong>Notices:</strong><ul>${notices.map(n => `<li>${n}</li>`).join("")}</ul>`;
  } else {
    responseBox.innerHTML = "Sorry, I didn’t understand that. Try asking about lunch, timetable, class teacher, or location.";
  }
}

// Utility: Ask user input as a prompt
function ask(message) {
  return new Promise((resolve) => {
    const value = prompt(message);
    resolve(value ? value.trim().toUpperCase() : "");
  });
}

// Utility: Get day name from query
function getDayFromInput(input) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (input.includes("today")) {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  } else if (input.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-US", { weekday: "long" });
  }
  return days.find(day => input.includes(day.toLowerCase()));
}
