export type DateRangeKey = "all" | "today" | "7days" | "30days" | "this_month" | "last_month";

export function dateRangeToWindow(range: DateRangeKey): { start: Date | null; end: Date | null } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  todayEnd.setMilliseconds(todayEnd.getMilliseconds() - 1);

  switch (range) {
    case "today":
      return { start: todayStart, end: todayEnd };
    case "7days": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 6);
      return { start, end: todayEnd };
    }
    case "30days": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 29);
      return { start, end: todayEnd };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      end.setMilliseconds(end.getMilliseconds() - 1);
      return { start, end };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      end.setMilliseconds(end.getMilliseconds() - 1);
      return { start, end };
    }
    default:
      return { start: null, end: null };
  }
}

