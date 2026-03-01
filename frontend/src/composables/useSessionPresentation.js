import { mdiCheckCircle, mdiAlert, mdiCloseCircle } from "@mdi/js";

const MOVIE_DESCRIPTIONS = {
  Matrix: "A computer programmer discovers reality is a simulation.",
  Inception: "A thief enters people's dreams to steal secrets.",
  Interstellar: "A team of explorers travel through a wormhole in space.",
  "Avatar: The Way of Water":
    "Jake Sully and his family face new threats on Pandora.",
  "Top Gun: Maverick":
    "Maverick confronts his past while training new pilots.",
  "The Batman": "Batman ventures into Gotham City's underworld.",
  Dune: "A noble family becomes embroiled in a war for control over the most valuable asset.",
  "Spider-Man: No Way Home":
    "Spider-Man faces villains from across the multiverse.",
  "Black Panther: Wakanda Forever":
    "The people of Wakanda fight to protect their home.",
  "John Wick: Chapter 4":
    "John Wick uncovers a path to defeating the High Table.",
};

function getAvailabilityRatio(session) {
  if (!session?.totalSeats) return 0;
  return session.availableSeats / session.totalSeats;
}

export function formatSessionTime(startTime) {
  return new Date(startTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatSessionDate(startTime) {
  const sessionDate = new Date(startTime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (sessionDate.toDateString() === today.toDateString()) return "Today";
  if (sessionDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return sessionDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return "N/A";
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  if (Number.isNaN(durationMs) || durationMs < 0) return "N/A";

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function formatPrice(price) {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return "0.00";
  }
  return Number(price).toFixed(2);
}

export function getMovieDescription(movieTitle) {
  return (
    MOVIE_DESCRIPTIONS[movieTitle] || "An exciting movie experience awaits you."
  );
}

export function getOccupancyPercentage(session) {
  if (!session?.totalSeats) return 0;
  return (
    ((session.totalSeats - session.availableSeats) / session.totalSeats) * 100
  );
}

export function calculateOccupancy(session) {
  return Math.round(getOccupancyPercentage(session));
}

export function getAvailabilityColor(session) {
  const ratio = getAvailabilityRatio(session);
  if (ratio === 0) return "error";
  if (ratio < 0.2) return "warning";
  if (ratio < 0.5) return "info";
  return "success";
}

export function getAvailabilityIcon(session) {
  const ratio = getAvailabilityRatio(session);
  if (ratio === 0) return mdiCloseCircle;
  if (ratio < 0.2) return mdiAlert;
  return mdiCheckCircle;
}

export function getAvailabilityText(session) {
  const ratio = getAvailabilityRatio(session);
  if (ratio === 0) return "Sold Out";
  if (ratio < 0.2) return "Few Left";
  if (ratio < 0.5) return "Limited";
  return "Available";
}

export function getAvailabilityClass(session) {
  const ratio = getAvailabilityRatio(session);
  if (ratio < 0.2) return "low-availability";
  if (ratio < 0.5) return "medium-availability";
  return "high-availability";
}

export function getProgressColor(session) {
  const percentage = getOccupancyPercentage(session);
  if (percentage >= 100) return "error";
  if (percentage >= 80) return "warning";
  if (percentage >= 50) return "info";
  return "success";
}
