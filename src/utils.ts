/**
 * Converts a given number of seconds into a formatted string.
 * 
 * @param seconds - The number of seconds to format.
 * @returns A string representing the formatted time.
 * 
 * The format is as follows:
 * - If the number of seconds is less than 60, it returns the seconds followed by 's.'.
 * - If the number of seconds is less than 3600 (1 hour), it returns the minutes followed by 'min.'.
 * - If the number of seconds is 3600 or more, it returns the hours followed by 'h.'.
 * - If there are remaining minutes after calculating hours, it includes the minutes in the format 'h min.'.
 */
export function formatSecondsToString(seconds:number){
    if(seconds<60){
        return `${seconds}s.`;
    }else if(seconds<3600){
        return `${Math.floor(seconds/60)}min.`;
    }else{
        if (Math.floor(seconds%3600/60)==0){
            return `${Math.floor(seconds/3600)}h.`;
        }
        return `${Math.floor(seconds/3600)}h ${Math.floor(seconds%3600/60)}min.`;
    }
}

// Get current date in YYYY-MM-DD format
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check if the same date
export function isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// return the date with offset, will return a new date object
export function getOffsetDate(date: Date, offset: number): Date {
    return new Date(new Date(date).setDate(date.getDate() + offset));
}