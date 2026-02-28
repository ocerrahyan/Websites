// Appointment storage — uses PHP API on GoDaddy, localStorage as cache
const APPT_CACHE_KEY = "alis-appointments-cache";
const PHP_API = "/api/appointments.php";

export interface PHPAppointment {
  id: string;
  serviceId: string | null;
  serviceName: string;
  date: string;
  startTime: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

/** Fetch all appointments from PHP API, fall back to localStorage cache */
export async function fetchAllAppointments(): Promise<PHPAppointment[]> {
  try {
    const res = await fetch(PHP_API);
    if (res.ok) {
      const ct = res.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        const data = await res.json();
        localStorage.setItem(APPT_CACHE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // API unavailable
  }
  return getCachedAppointments();
}

/** Get appointments from localStorage cache */
export function getCachedAppointments(): PHPAppointment[] {
  try {
    return JSON.parse(localStorage.getItem(APPT_CACHE_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Book a new appointment via PHP API */
export async function bookAppointment(data: {
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}): Promise<PHPAppointment | null> {
  try {
    const res = await fetch(PHP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const ct = res.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        const appt = await res.json();
        // Update cache
        const all = getCachedAppointments();
        all.unshift(appt);
        localStorage.setItem(APPT_CACHE_KEY, JSON.stringify(all));
        return appt;
      }
    }
  } catch {
    // PHP API unavailable
  }

  // Fallback: save to localStorage only
  const appt: PHPAppointment = {
    id: "appt-" + Date.now(),
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    date: data.date,
    startTime: data.startTime,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || null,
    notes: data.notes || null,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const all = getCachedAppointments();
  all.unshift(appt);
  localStorage.setItem(APPT_CACHE_KEY, JSON.stringify(all));
  return appt;
}

/** Update appointment status via PHP API */
export async function updateAppointmentStatus(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(PHP_API, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      // Update cache
      const all = getCachedAppointments();
      const idx = all.findIndex((a) => a.id === id);
      if (idx >= 0) {
        all[idx].status = status;
        localStorage.setItem(APPT_CACHE_KEY, JSON.stringify(all));
      }
      return true;
    }
  } catch {
    // ignore
  }

  // Update cache only
  const all = getCachedAppointments();
  const idx = all.findIndex((a) => a.id === id);
  if (idx >= 0) {
    all[idx].status = status;
    localStorage.setItem(APPT_CACHE_KEY, JSON.stringify(all));
    return true;
  }
  return false;
}

/** Get count of pending appointments */
export function getPendingAppointmentCount(): number {
  return getCachedAppointments().filter((a) => a.status === "pending").length;
}
