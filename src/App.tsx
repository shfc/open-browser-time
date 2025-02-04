import { useEffect, useMemo, useState } from "react";
import icon from "./assets/icon.png";
import "./App.css";
import { formatSecondsToString as formatSecondsToString, formatDate, isSameDate, getOffsetDate } from "./utils";
import { displayDateRange } from "./helper";
import storage from "./storage/Storage";

type DataMap = Record<string, number>;
const today = new Date();

function App() {
  const [data, setData] = useState<DataMap>({});
  const [analysisDate, setAnalysisDate] = useState<Date>(today);

  useEffect(() => {
    // Load data by date range
    const loadDataByDateRange = (start: Date, end: Date) => {
      const startStr = formatDate(start);
      const endStr = formatDate(end);
      const processDataByDateRange = (dataSource: Record<string, DataMap>) => {
        const newData = Object.entries(dataSource)
          .filter(([date]) => date >= startStr && date <= endStr)
          .reduce((acc, [, dailyData]) => {
            Object.entries(dailyData).forEach(([domain, time]) => {
              acc[domain] = (acc[domain] || 0) + time;
            });
            return acc;
          }, {} as DataMap);
        setData(newData);
      };

      storage.get(null).then((result) => {
        processDataByDateRange(result as Record<string, DataMap>);
      });
    };

    loadDataByDateRange(analysisDate, analysisDate);
  }, [analysisDate]);

  const sortedData = useMemo(
    () => Object.entries(data).sort((a, b) => b[1] - a[1]),
    [data]
  );

  console.debug(sortedData);

  const changeDate = (offset: number) => {
    setAnalysisDate(getOffsetDate(analysisDate,offset));
  };

  // Export data to CSV
  const exportToCSV = () => {
      // Load data from storage
      (async () => {
        const result = await storage.get(null);
        generateCSV(result as Record<string, Record<string, number>>);
      })();
  };

  // Validate data from CSV
  const validateData = (content: string) => {
    const rows = content.split("\n");
    if (rows.length === 0) {
      alert("No data found in the CSV file.");
      return;
    }

    const headers = rows[0].split(",");
    if (headers.length !== 3) {
      alert("Invalid CSV format. Expected 3 columns: Date, Website, Time Spent (seconds)");
      return;
    }

    const invalidRow = rows.slice(1).find((row) => {
      const [date, domain, time] = row.split(",");
      if (!date || !domain || !time || isNaN(parseInt(time, 10))) {
        return true;
      }
      return false;
    });

    if (invalidRow) {
      alert("Invalid data found in the CSV file. Please check the format.");
      return;
    }

    return true;
  };
  
  // Import data from CSV
  const ImportFromCSV = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (validateData(content)) {
            const rows = content.split("\n");
            const importedData: Record<string, Record<string, number>> = {};
            rows.slice(1).forEach((row) => {
              const [date, domain, time] = row.split(",");
              if (!importedData[date]) {
                importedData[date] = {};
              }
              importedData[date][domain] = parseInt(time, 10) * 1000;
            });

            storage.set(importedData).then(() => {
              alert("Data has been imported successfully.");
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
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
          .forEach(([domain, timeInMilliseconds]) => {
            const timeInSeconds = Math.floor(timeInMilliseconds / 1000).toString();
            rows.push([date, domain, timeInSeconds]);
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
      storage.clear().then(() => {
        setData({});
        alert("All data has been reset.");
      });
    }
  };

  return (
    <div className="p-4">
      <header className="flex items-center mb-3 border-b border-gray-300 pb-2">
        <img src={icon} className="size-4" alt="Browser Time Logo" />
        <p className="font-bold text-lg ml-3">Open Browser Time</p>
      </header>

      <section className="flex items-center justify-between pl-1">
        <span className="text-base">Usage</span>
        <div className="flex items-center gap-2">
          <span className="text-base w-48 text-center">{displayDateRange(analysisDate, analysisDate)}</span>
          <button className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-lg" onClick={() => changeDate(-1)}>
            &lt;
          </button>
          <button
            className={`p-1 rounded-full text-lg ${isSameDate(analysisDate, today) ? "bg-gray-200 text-gray-400 disabled:pointer-events-none disabled:cursor-default" : "bg-gray-200 hover:bg-gray-300"}`}
            disabled={isSameDate(analysisDate, today)}
            onClick={() => changeDate(1)}
          >
            &gt;
          </button>
        </div>
      </section>

      <section className="mt-0 pl-1">
        <div className="flex items-center justify-between h-10">
          <p className="font-bold text-3xl">
            {formatSecondsToString(Math.floor(sortedData.reduce((n, [, time]) => n + time, 0) / 1000))}
          </p>
        </div>
      </section>

      <table className="table-auto text-left text-base mt-6 w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Websites</th>
            <th className="p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.slice(0, 10).map(([domain, time]) => (
            <tr key={domain} className="border-t border-gray-300">
              <td className="p-2">
                <a href={`//${domain}`} target="_blank" rel="noreferrer">{domain}</a>
              </td>
              <td className="p-2">{formatSecondsToString(Math.floor(time / 1000))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="grid grid-cols-2 gap-4 mt-6">
        <button className="py-2 rounded hover:bg-blue-600" onClick={ImportFromCSV}>Import from CSV</button>
        <button className="py-2 rounded hover:bg-blue-600" onClick={exportToCSV}>Export to CSV</button>
        <button className="py-2 rounded hover:bg-red-600" onClick={resetData}>Reset Data</button>
      </footer>
    </div>
  )
}

export default App;
