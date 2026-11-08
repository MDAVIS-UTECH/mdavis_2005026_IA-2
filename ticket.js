/* Ticket rendering and route guard. */
"use strict";

const attendeeData = localStorage.getItem("codingConfAttendee");

/* A ticket must not render without a successful registration state. */
if (!attendeeData) {
  window.location.replace("index.html");
} else {
  try {
    const attendee = JSON.parse(attendeeData);
    if (!attendee.fullName || !attendee.email || !attendee.github || !attendee.avatar) {
      throw new Error("Incomplete ticket data");
    }

    const firstName = attendee.fullName.trim().split(/\s+/)[0];
    document.getElementById("attendee-first-name").textContent = firstName;
    document.getElementById("ticket-name").textContent = attendee.fullName;
    document.getElementById("ticket-avatar").src = attendee.avatar;
    document.getElementById("ticket-avatar").alt = "Profile picture for " + attendee.fullName;
    document.getElementById("ticket-github").textContent = attendee.github;
    const githubHandle = attendee.github.slice(1);
    document.getElementById("ticket-github").href = "https://github.com/" + encodeURIComponent(githubHandle);
    document.getElementById("ticket-serial").textContent = attendee.serial || "#01609";

    document.getElementById("print-ticket").addEventListener("click", function () {
      window.print();
    });
  } catch (error) {
    localStorage.removeItem("codingConfAttendee");
    window.location.replace("index.html");
  }
}