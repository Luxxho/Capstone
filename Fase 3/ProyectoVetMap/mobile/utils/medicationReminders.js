import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHANNEL_ID = "medication-reminders";
const STORAGE_PREFIX = "vetmap_medication_reminders_pet_";
const MAX_NATIVE_NOTIFICATIONS_PER_PET = 40;
const LOOKAHEAD_DAYS = 21;

let nativeConfigured = false;
const webTimersByPet = new Map();

function storageKey(petId) {
  return `${STORAGE_PREFIX}${petId}`;
}

function parseLocalDate(dateText) {
  if (!dateText) return null;

  const match = String(dateText).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) return null;

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    0,
    0,
    0,
    0
  );
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days));
  return next;
}

function parseReminderTimes(value, frequency = "") {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => /^\d{1,2}:\d{2}$/.test(item));
  }

  const explicit = String(value || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter((item) => /^\d{1,2}:\d{2}$/.test(item));

  if (explicit.length) {
    return explicit;
  }

  const normalized = String(frequency || "").toLowerCase();

  if (normalized.includes("cada 8")) {
    return ["08:00", "16:00", "00:00"];
  }

  if (
    normalized.includes("cada 12") ||
    normalized.includes("2 veces")
  ) {
    return ["08:00", "20:00"];
  }

  if (
    normalized.includes("cada 24") ||
    normalized.includes("1 vez")
  ) {
    return ["08:00"];
  }

  return [];
}

function medicationActiveOnDate(medication, date) {
  const start =
    parseLocalDate(medication.start_date) ||
    new Date(2000, 0, 1);

  const end =
    parseLocalDate(medication.end_date) ||
    new Date(2100, 0, 1);

  const key = dateKey(date);
  const startKey = dateKey(start);
  const endKey = dateKey(end);

  return key >= startKey && key <= endKey;
}

function buildReminderEvents(pet, medications) {
  const now = new Date();
  const startDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const events = [];

  for (let offset = 0; offset <= LOOKAHEAD_DAYS; offset += 1) {
    const day = addDays(startDay, offset);

    for (const medication of medications || []) {
      if (!medicationActiveOnDate(medication, day)) {
        continue;
      }

      const times = parseReminderTimes(
        medication.reminder_times,
        medication.frequency
      );

      for (const time of times) {
        const [hourRaw, minuteRaw] = time.split(":");
        const hour = Number(hourRaw);
        const minute = Number(minuteRaw);

        if (
          !Number.isFinite(hour) ||
          !Number.isFinite(minute) ||
          hour < 0 ||
          hour > 23 ||
          minute < 0 ||
          minute > 59
        ) {
          continue;
        }

        const triggerDate = new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          hour,
          minute,
          0,
          0
        );

        if (triggerDate.getTime() <= now.getTime() + 5000) {
          continue;
        }

        events.push({
          date: triggerDate,
          medicationId: medication.id,
          medicationName:
            medication.name || "Medicamento",
          dose: medication.dose || "",
          petName: pet?.name || "tu mascota",
        });
      }
    }
  }

  return events
    .sort((a, b) => a.date - b.date)
    .slice(0, MAX_NATIVE_NOTIFICATIONS_PER_PET);
}

async function getNotificationsModule() {
  if (Platform.OS === "web") {
    return null;
  }

  return import("expo-notifications");
}

async function configureNativeNotifications() {
  if (Platform.OS === "web") return null;

  const Notifications = await getNotificationsModule();

  if (!Notifications) return null;

  if (!nativeConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    nativeConfigured = true;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      CHANNEL_ID,
      {
        name: "Recordatorios de medicamentos",
        description:
          "Avisos de VetMap para recordar las dosis de tus mascotas.",
        importance:
          Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 150, 250],
      }
    );
  }

  return Notifications;
}

export async function getMedicationReminderPermissionStatus() {
  if (Platform.OS === "web") {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return "unsupported";
    }

    return window.Notification.permission;
  }

  try {
    const Notifications =
      await configureNativeNotifications();

    const result =
      await Notifications.getPermissionsAsync();

    return result.status;
  } catch {
    return "unsupported";
  }
}

export async function requestMedicationReminderPermission() {
  if (Platform.OS === "web") {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return {
        granted: false,
        status: "unsupported",
        message:
          "Este navegador no admite notificaciones de VetMap.",
      };
    }

    const permission =
      await window.Notification.requestPermission();

    return {
      granted: permission === "granted",
      status: permission,
      message:
        permission === "granted"
          ? "Alarmas activadas para esta pestaña."
          : "Debes permitir notificaciones para recibir las alarmas.",
    };
  }

  try {
    const Notifications =
      await configureNativeNotifications();

    let permissions =
      await Notifications.getPermissionsAsync();

    if (permissions.status !== "granted") {
      permissions =
        await Notifications.requestPermissionsAsync();
    }

    return {
      granted:
        permissions.status === "granted",
      status: permissions.status,
      message:
        permissions.status === "granted"
          ? "Alarmas de medicamentos activadas."
          : "Debes permitir notificaciones para recibir las alarmas.",
    };
  } catch {
    return {
      granted: false,
      status: "unsupported",
      message:
        "No se pudieron activar las alarmas en este dispositivo.",
    };
  }
}

function clearWebTimers(petId) {
  const current =
    webTimersByPet.get(String(petId)) || [];

  current.forEach((timer) =>
    clearTimeout(timer)
  );

  webTimersByPet.delete(String(petId));
}

function scheduleWebReminders(pet, medications) {
  clearWebTimers(pet.id);

  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    window.Notification.permission !== "granted"
  ) {
    return 0;
  }

  const now = Date.now();

  const events = buildReminderEvents(
    pet,
    medications
  ).filter(
    (event) =>
      event.date.getTime() - now <=
      7 * 24 * 60 * 60 * 1000
  );

  const timers = events.map((event) =>
    setTimeout(() => {
      try {
        new window.Notification(
          `💊 Medicamento para ${event.petName}`,
          {
            body: `Es hora de dar ${event.medicationName}${
              event.dose
                ? ` · Dosis: ${event.dose}`
                : ""
            }.`,
          }
        );
      } catch {
        // El recordatorio visual de la ficha sigue disponible.
      }
    }, Math.max(1000, event.date.getTime() - now))
  );

  webTimersByPet.set(
    String(pet.id),
    timers
  );

  return timers.length;
}

async function cancelNativeRemindersForPet(
  Notifications,
  petId
) {
  try {
    const raw =
      await AsyncStorage.getItem(
        storageKey(petId)
      );

    const ids = raw
      ? JSON.parse(raw)
      : [];

    for (const id of ids) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          id
        );
      } catch {}
    }
  } catch {}

  await AsyncStorage.removeItem(
    storageKey(petId)
  );
}

async function scheduleNativeReminders(
  pet,
  medications
) {
  const Notifications =
    await configureNativeNotifications();

  const permission =
    await Notifications.getPermissionsAsync();

  if (permission.status !== "granted") {
    return 0;
  }

  await cancelNativeRemindersForPet(
    Notifications,
    pet.id
  );

  const events =
    buildReminderEvents(
      pet,
      medications
    );

  const ids = [];

  for (const event of events) {
    const id =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Medicamento para ${event.petName}`,
          body: `Es hora de dar ${event.medicationName}${
            event.dose
              ? ` · Dosis: ${event.dose}`
              : ""
          }.`,
          sound: "default",
          data: {
            type: "medication_reminder",
            pet_id: pet.id,
            medication_id:
              event.medicationId,
          },
        },
        trigger: {
          type:
            Notifications
              .SchedulableTriggerInputTypes
              .DATE,
          date: event.date,
          channelId: CHANNEL_ID,
        },
      });

    ids.push(id);
  }

  await AsyncStorage.setItem(
    storageKey(pet.id),
    JSON.stringify(ids)
  );

  return ids.length;
}

export async function syncPetMedicationReminders(
  pet,
  medications
) {
  if (!pet?.id) return 0;

  if (Platform.OS === "web") {
    return scheduleWebReminders(
      pet,
      medications
    );
  }

  try {
    return await scheduleNativeReminders(
      pet,
      medications
    );
  } catch {
    return 0;
  }
}

export async function syncOwnerMedicationReminders(
  petsWithMedications
) {
  let total = 0;

  for (const item of petsWithMedications || []) {
    total +=
      await syncPetMedicationReminders(
        item.pet,
        item.medications || []
      );
  }

  return total;
}
