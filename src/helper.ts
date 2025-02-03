import { getOffsetDate, isSameDate } from "./utils";

/**
   * Formats a date range into a readable string.
   * 
   * - If the start and end dates are the same:
   *   - Returns "Today, {day} {month}" if the date is today.
   *   - Returns "Yesterday, {day} {month}" if the date is yesterday.
   *   - Otherwise, returns "{weekday}, {day} {month}".
   * - If the start and end dates are in the same month and year, returns "{startDay} - {endDay} {month}".
   * - If the start and end dates are in different months but the same year, returns "{startDay} {startMonth} - {endDay} {endMonth}".
   * - If the start and end dates are in different years, returns "{startDay} {startMonth} {startYear} - {endDay} {endMonth} {endYear}".
   * 
   * @param start - The start date of the range.
   * @param end - The end date of the range.
   * @returns A formatted string representing the date range.
   */
export const displayDateRange = (start: Date, end: Date, currentDate?:Date): string => {
    const today = currentDate?currentDate:new Date();
    const options = { month: "long" } as const;
    if (isSameDate(start, end)) {
      if (isSameDate(start, today)) {
        return `Today, ${start.getDate()} ${start.toLocaleString("en-GB", options)}`;
      }
      const yesterday = getOffsetDate(today, -1);
      if (isSameDate(start, yesterday)) {
        return `Yesterday, ${start.getDate()} ${start.toLocaleString("en-GB", options)}`;
      }
      return `${start.toLocaleString("en-GB", { weekday: "long" })}, ${start.getDate()} ${start.toLocaleString("en-GB", options)}`;
    }

    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleString("en-GB", { month: "short" })}`;
    }

    if (start.getFullYear() === end.getFullYear()) {
      return `${start.getDate()} ${start.toLocaleString("en-GB", { month: "short" })} - ${end.getDate()} ${end.toLocaleString("en-GB", { month: "short" })}`;
    }

    return `${start.getDate()} ${start.toLocaleString("en-GB", { month: "short" })} ${start.getFullYear()} - ` +
           `${end.getDate()} ${end.toLocaleString("en-GB", { month: "short" })} ${end.getFullYear()}`;
  };