export function complexCal(num:number){
    return num*2;
};

export function complexCal2(num:number){
    chrome.storage.local.get(null,(data)=>{
        console.log(data);
    })
    return num*3;
};

// format the seconds to string
// 3600 -> 1h.
// 60 -> 1min.
// 1 -> 1s.
// 3661 -> 1h 1min.
export function FormatSecondsToString(seconds:number){
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