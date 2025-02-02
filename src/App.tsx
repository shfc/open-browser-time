import { useEffect, useState } from "react";
import icon from "./assets/icon.png";
import "./App.css";
import { FormatSecondsToString, formatDate, isSameDate } from "./utils";

function App() {
  const [data, setData] = useState({});
  // let [ analyseMode ] = useState<string>("daily");
  const today = new Date();
  console.log(today, formatDate(today));
  const [analysisDate, setAnalysisDate] = useState<Date>(today);

  useEffect(() => {
    loadDataByDateRange(analysisDate, analysisDate);
  }, [analysisDate]);

  const sortedData = Object.entries(data as Record<string, number>).sort(
    (a, b) => (a[1] > b[1] ? -1 : 1)
  );
  console.log(sortedData);

  const mockData = {
    [formatDate(today)]: {
      "open_browser_0.time": 60 * 60 * 1000, // 1 hour in milliseconds
      "open_browser_1.time": 200000,
      "open_browser_1.io": 1000,
      "open_browser_2.io": 2000,
      "open_browser_3.io": 3000,
      "open_browser_4.io": 4000,
      "open_browser_5.io": 5000,
      "open_browser_6.io": 6000,
      "open_browser_7.io": 7000,
      "open_browser_8.io": 8000,
      "open_browser_9.io": 9000,
      "open_browser_10.io": 10000,
    },
    [formatDate(new Date(new Date(today).setDate(today.getDate() - 1)))]: {
      ...Array.from({ length: 15 }, (_, i): [string, number] => {
        return [`open_browser_${i}.time`, 1000 * (i + 1)];
      }).reduce(
        (acc: Record<string, number>, [domain, time]: [string, number]) => {
          acc[domain] = time;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
    [formatDate(new Date(new Date(today).setDate(today.getDate() - 2)))]: {
      ...Array.from({ length: 17 }, (_, i): [string, number] => {
        return [`open_browser_${i}.time`, 2000 * (i + 1)];
      }).reduce(
        (acc: Record<string, number>, [domain, time]: [string, number]) => {
          acc[domain] = time;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
  };

  // Load data by date range
  const loadDataByDateRange = (start: Date, end: Date) => {
    const startStr = formatDate(start);
    const endStr = formatDate(end);

    // Helper function to process data by date range
    const processDataByDateRange = (
      data: Record<string, Record<string, number>>
    ) => {
      const newData = Object.entries(data).reduce((acc, [date, dailyData]) => {
        if (date >= startStr && date <= endStr) {
          Object.entries(dailyData as Record<string, number>).forEach(
            ([domain, time]) => {
              acc[domain] = (acc[domain] || 0) + time;
            }
          );
        }
        return acc;
      }, {} as Record<string, number>);

      console.log("loadDataByDateRange newData", newData);
      setData(newData);
    };

    if (import.meta.env.DEV) {
      // Use mock data in development mode
      processDataByDateRange(mockData);
    } else {
      // Load data from Chrome storage
      chrome.storage.local.get(null, (result) => {
        console.log("loadDataByDateRange", start, end, result);
        processDataByDateRange(result);
      });
    }
  };

  // display date range
  // if start date and end date are the same, only display one date
  // and if the one date is today, display 'Today, 1 February'
  // else if the one date is yesterday, display 'Yesterday, 1 February'
  // else display 'Saturday, 1 February'
  // if start date and end date are different, display '20 - 16 Jan'
  const displayDateRange = (dateStart: Date, dateEnd: Date) => {
    if (isSameDate(dateStart, dateEnd)) {
      if (isSameDate(dateStart, today)) {
        return `Today, ${dateStart.getDate()} ${dateStart.toLocaleString(
          "en-GB",
          { month: "long" }
        )}`;
      } else {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (isSameDate(dateStart, yesterday)) {
          return `Yesterday, ${dateStart.getDate()} ${dateStart.toLocaleString(
            "en-GB",
            { month: "long" }
          )}`;
        } else {
          return `${dateStart.toLocaleString("en-GB", {
            weekday: "long",
          })}, ${dateStart.getDate()} ${dateStart.toLocaleString("en-GB", {
            month: "long",
          })}`;
        }
      }
    } else {
      return `${dateStart.getDate()} - ${dateEnd.getDate()} ${dateStart.toLocaleString(
        "en-GB",
        { month: "short" }
      )}`;
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (import.meta.env.DEV) {
      // Use mock data in development mode
      const exportData = mockData;
      generateCSV(exportData);
    } else {
      // Load data from Chrome storage
      chrome.storage.local.get(null, (result) => {
        generateCSV(result);
      });
    }
  };

  const generateCSV = (exportData: Record<string, Record<string, number>>) => {
    const rows = [["Date", "Website", "Time Spent (seconds)"]];
    Object.entries(exportData)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateA).getTime() - new Date(dateB).getTime()
      )
      .forEach(([date, dailyData]) => {
        Object.entries(dailyData as Record<string, number>)
          .sort(([, timeA], [, timeB]) => timeB - timeA)
          .forEach(([domain, time]) => {
            rows.push([date, domain, time.toString()]);
          });
      });

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `browser_time_usage_export.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Reset data
  const resetData = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      chrome.storage.local.clear(() => {
        setData({});
        alert("All data has been reset.");
      });
    }
  };

  return (
    <>
      <div style={{ padding: "10px" }}>
        <div className="flex items-center mb-2 h-8 pb-1 border-b border-gray-300">
          <img src={icon} className="ml-1 size-4" alt="Browser Time Logo" />
          <p className="font-bold text-lg ml-4">Open Browser Time</p>
        </div>

        <div className="flex items-center justify-between h-6">
          <p className="text-base ml-1">Usage</p>

          <div className="flex items-center ml-2">
            <p className="text-base w-48 mx-2 text-center">
              {displayDateRange(analysisDate, analysisDate)}
            </p>

            <button
              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
              style={{ scale: "70%" }}
              onClick={() => {
                const date = new Date(analysisDate);
                date.setDate(date.getDate() - 1);
                setAnalysisDate(date);
              }}
            >
              <p className="font-bold">&lt;</p>
            </button>
            <button
              className={`p-1 rounded-full ${
                isSameDate(analysisDate, today)
                  ? "bg-gray-200 text-gray-400 disabled:pointer-events-none disabled:cursor-default"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              style={{ scale: "70%" }}
              disabled={isSameDate(analysisDate, today)}
              onClick={() => {
                const date = new Date(analysisDate);
                date.setDate(date.getDate() + 1);
                setAnalysisDate(date);
              }}
            >
              <p className="font-bold">&gt;</p>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between h-10">
          <p className="font-bold text-3xl pl-1">
            {FormatSecondsToString(
              Math.floor(sortedData.reduce((n, [, time]) => n + time, 0) / 1000)
            )}
          </p>
        </div>

        <table className="table-auto text-left text-base mt-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-64 pl-2">Websites</th>
              <th className="w-32 pl-2">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr key="All Websites">
              <td className="border border-gray-300 pl-2">All Websites</td>
              <td className="border border-gray-300 pl-2">
                {FormatSecondsToString(
                  Math.floor(
                    sortedData.reduce((n, [, time]) => n + time, 0) / 1000
                  )
                )}
              </td>
            </tr>

            {sortedData.slice(0, 10).map(([domain, time]) => (
              <tr key={domain}>
                <td className="border border-gray-300 pl-2">
                  <a href={`//${domain}`} target="_blank" rel="noreferrer">
                    {domain}
                  </a>
                </td>
                <td className="border border-gray-300 pl-2">
                  {FormatSecondsToString(Math.floor(time / 1000))}
                </td>
              </tr>
            ))}

            <tr key="other" hidden={sortedData.length <= 10}>
              <td className="border border-gray-300 pl-2">Other</td>
              <td className="border border-gray-300 pl-2">
                {FormatSecondsToString(
                  Math.floor(
                    sortedData.slice(10).reduce((n, [, time]) => n + time, 0) /
                      1000
                  )
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="grid h-24 grid-cols-2 place-items-center">
          <button className="text-base" onClick={exportToCSV}>
            Export to CSV
          </button>
          <button className="text-base" onClick={resetData}>
            Reset Data
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
