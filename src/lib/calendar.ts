export interface CalendarEventDetails {
  title: string;
  company: string;
  startDate: string | Date; // ISO string or Date
  durationMinutes?: number;
  location?: string;
  description?: string;
  url?: string;
}

/**
 * Format a Date to iCal UTC format: YYYYMMDDTHHmmssZ
 */
function formatToICalUTC(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Generates an Add to Google Calendar web URL
 */
export function generateGoogleCalendarUrl(details: CalendarEventDetails): string {
  const start = new Date(details.startDate);
  const duration = details.durationMinutes || 45;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const eventTitle = `${details.title} — Interview with ${details.company}`;
  const detailsText = [
    `Interview for ${details.title} at ${details.company}`,
    details.url ? `Posting: ${details.url}` : "",
    details.description ? `\nDetails:\n${details.description}` : "",
    `\nTracked via JobClippy Command Center`,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle,
    dates: `${formatToICalUTC(start)}/${formatToICalUTC(end)}`,
    details: detailsText,
    location: details.location || "Remote / Video Call",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an RFC 5545 standard .ics file content string
 */
export function generateICalContent(details: CalendarEventDetails): string {
  const start = new Date(details.startDate);
  const duration = details.durationMinutes || 45;
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const uid = `interview-${Date.now()}@jobclippy.app`;
  const eventTitle = `${details.title} — Interview with ${details.company}`;
  const now = new Date();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JobClippy//Job Search Command Center//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatToICalUTC(now)}`,
    `DTSTART:${formatToICalUTC(start)}`,
    `DTEND:${formatToICalUTC(end)}`,
    `SUMMARY:${eventTitle}`,
    `DESCRIPTION:Interview for ${details.title} at ${details.company}. Managed via JobClippy.`,
    `LOCATION:${details.location || "Remote / Video Call"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Triggers a browser download of an .ics calendar file
 */
export function downloadICalFile(details: CalendarEventDetails): void {
  if (typeof window === "undefined") return;
  const icsContent = generateICalContent(details);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const safeFilename = `${details.company.toLowerCase().replace(/[^a-z0-9]/g, "-")}-interview.ics`;
  anchor.setAttribute("download", safeFilename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
