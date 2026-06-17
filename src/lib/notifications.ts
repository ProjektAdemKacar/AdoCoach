export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function scheduleReminder(title: string, body: string, delayMs: number) {
  if (Notification.permission !== "granted") return;
  setTimeout(() => {
    new Notification(title, {
      body,
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      tag: title,
    });
  }, delayMs);
}

export function scheduleWaterReminders(intervalMinutes: number = 90) {
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const endHour = 22;
  let nextReminder = new Date(now.getTime() + intervalMinutes * 60 * 1000);

  const reminders: NodeJS.Timeout[] = [];

  while (nextReminder.getHours() < endHour) {
    const delay = nextReminder.getTime() - now.getTime();
    const timer = setTimeout(() => {
      new Notification("💧 Wasser trinken!", {
        body: "Zeit für ein Glas Wasser. Bleib hydriert!",
        icon: "/icons/icon.svg",
        tag: "water-reminder",
      });
    }, delay);
    reminders.push(timer);
    nextReminder = new Date(nextReminder.getTime() + intervalMinutes * 60 * 1000);
  }

  return () => reminders.forEach(clearTimeout);
}

export function scheduleMealReminder(mealName: string, time: string) {
  if (Notification.permission !== "granted") return;

  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const mealTime = new Date();
  mealTime.setHours(hours, minutes, 0, 0);

  const reminderTime = mealTime.getTime() - 15 * 60 * 1000;
  const delay = reminderTime - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      new Notification(`🍽️ ${mealName} in 15 Minuten`, {
        body: "Bereite deine Mahlzeit vor!",
        icon: "/icons/icon.svg",
        tag: `meal-${mealName}`,
      });
    }, delay);
  }
}
