import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import { format, parseISO, subDays, subMonths, isAfter, startOfDay, endOfDay, isValid, eachDayOfInterval, addDays, startOfMonth, endOfMonth } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

// Utility function to generate all dates in range
const generateDateRange = (startDate, endDate) => {
  return eachDayOfInterval({
    start: startOfDay(startDate),
    end: endOfDay(endDate)
  }).map(date => format(date, "yyyy-MM-dd"));
};

// Utility functions for processing modification history
const processModificationHistory = (modificationHistory, startDate, endDate) => {
  const createdDates = {};
  const updatedDates = {};
  
  console.log("🔍 Processing modification history sample:", modificationHistory.slice(0, 3));
  
  // Filter and process modification history within date range
  modificationHistory.forEach((modification, index) => {
    // Try different possible timestamp field names
    let timestampValue = modification.timestamp || 
                        modification.created_at || 
                        modification.modified_at ||
                        modification.date ||
                        modification.updated_at;
    
    if (!timestampValue) {
      if (index < 3) {
        console.warn("⚠️ No timestamp found in modification record:", modification);
      }
      return;
    }
    
    try {
      let date;
      
      // Handle different date formats
      if (typeof timestampValue === 'string') {
        date = parseISO(timestampValue);
      } else if (timestampValue instanceof Date) {
        date = timestampValue;
      } else {
        if (index < 3) {
          console.warn("⚠️ Invalid timestamp format:", timestampValue);
        }
        return;
      }
      
      // Validate the parsed date
      if (!isValid(date)) {
        if (index < 3) {
          console.warn("⚠️ Invalid parsed date:", date, "from:", timestampValue);
        }
        return;
      }
      
      // Check if date is within range
      if (isAfter(date, startOfDay(startDate)) && date <= endOfDay(endDate)) {
        const dayKey = format(date, "yyyy-MM-dd");
        const modificationType = modification.modification_type;
        
        if (index < 3) {
          console.log("✅ Processing record:", {
            type: modificationType,
            date: dayKey,
            originalTimestamp: timestampValue
          });
        }
        
        // Count CREATE operations
        if (modificationType === 'CREATE') {
          createdDates[dayKey] = (createdDates[dayKey] || 0) + 1;
        }
        
        // Count UPDATE operations (including various update types)
        else if (
          modificationType === 'UPDATE' || 
          modificationType === 'UPDATE USER EVENT' || 
          modificationType === 'USER VERIFY' ||
          modificationType === 'ASSIGN' ||
          modificationType.includes('UPDATE')
        ) {
          updatedDates[dayKey] = (updatedDates[dayKey] || 0) + 1;
        }
      }
    } catch (error) {
      if (index < 3) {
        console.error("❌ Error processing modification record:", error, modification);
      }
    }
  });

  console.log("📊 Processed dates:", {
    createdDates: Object.keys(createdDates).length,
    updatedDates: Object.keys(updatedDates).length,
    createdSample: Object.entries(createdDates).slice(0, 3),
    updatedSample: Object.entries(updatedDates).slice(0, 3)
  });

  return { createdDates, updatedDates };
};

const ContactsChart = ({
  modificationHistory = [],
  startDate,
  endDate,
  dateRangeType,
  setStartDate,
  setEndDate,
  setDateRangeType,
}) => {
  const handlePredefinedRange = (range) => {
    const today = new Date();
    let newStartDate, newEndDate;

    switch (range) {
      case "last7days":
        newStartDate = subDays(today, 7);
        newEndDate = today;
        break;
      case "last30days":
        newStartDate = subDays(today, 30);
        newEndDate = today;
        break;
      case "lastMonth":
        // Get first day of last month to last day of last month
        const lastMonth = subMonths(today, 1);
        newStartDate = startOfMonth(lastMonth);
        newEndDate = endOfMonth(lastMonth);
        break;
      case "last3Months":
        // Get first day of 3 months ago to last day of last month
        const threeMonthsAgo = subMonths(today, 3);
        newStartDate = startOfMonth(threeMonthsAgo);
        newEndDate = endOfMonth(subMonths(today, 1));
        break;
      case "last6Months":
        // Get first day of 6 months ago to last day of last month
        const sixMonthsAgo = subMonths(today, 6);
        newStartDate = startOfMonth(sixMonthsAgo);
        newEndDate = endOfMonth(subMonths(today, 1));
        break;
      case "lastYear":
        // Get first day of 12 months ago to last day of last month
        const twelveMonthsAgo = subMonths(today, 12);
        newStartDate = startOfMonth(twelveMonthsAgo);
        newEndDate = endOfMonth(subMonths(today, 1));
        break;
      default:
        return;
    }

    setStartDate(startOfDay(newStartDate));
    setEndDate(endOfDay(newEndDate));
    setDateRangeType(range);
  };

  const processChartData = useMemo(() => {
    // Ensure we have a valid array
    const historyArray = Array.isArray(modificationHistory) ? modificationHistory : [];
    
    console.log("🔍 Processing modification history:", {
      totalRecords: historyArray.length,
      dateRange: `${format(startDate, "yyyy-MM-dd")} to ${format(endDate, "yyyy-MM-dd")}`,
      sampleRecord: historyArray[0],
      allFieldsInFirstRecord: historyArray[0] ? Object.keys(historyArray[0]) : []
    });
    
    // Generate all dates in the selected range
    const allDatesInRange = generateDateRange(startDate, endDate);
    
    // Process the modification history data
    const { createdDates, updatedDates } = processModificationHistory(
      historyArray, 
      startDate, 
      endDate
    );

    console.log("📊 Chart data processed:", {
      totalDaysInRange: allDatesInRange.length,
      daysWithCreatedData: Object.keys(createdDates).length,
      daysWithUpdatedData: Object.keys(updatedDates).length,
      createOperations: Object.values(createdDates).reduce((sum, count) => sum + count, 0),
      updateOperations: Object.values(updatedDates).reduce((sum, count) => sum + count, 0),
      dateRange: allDatesInRange.length > 0 ? `${allDatesInRange[0]} to ${allDatesInRange[allDatesInRange.length - 1]}` : 'No data',
      sampleDates: allDatesInRange.slice(0, 5) // Show first 5 dates
    });

    return {
      labels: allDatesInRange,
      datasets: [
        {
          label: "Contacts Created",
          data: allDatesInRange.map((date) => createdDates[date] || 0),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(59, 130, 246)",
        },
        {
          label: "Records Updated",
          data: allDatesInRange.map((date) => updatedDates[date] || 0),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgb(34, 197, 94)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(34, 197, 94)",
        },
      ],
    };
  }, [modificationHistory, startDate, endDate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
      filler: {
        propagate: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          maxTicksLimit: 15,
          callback: function(value, index, values) {
            const date = this.getLabelForValue(value);
            try {
              return format(parseISO(date), 'MMM dd');
            } catch {
              return date;
            }
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const predefinedRanges = [
    { key: "last7days", label: "Last 7 Days" },
    { key: "last30days", label: "Last 30 Days" },
    { key: "lastMonth", label: "Last Month" },
    { key: "last3Months", label: "Last 3 Months" },
    { key: "last6Months", label: "Last 6 Months" },
    { key: "lastYear", label: "Last 12 Months" },
  ];

  // Calculate summary statistics
  const totalCreated = processChartData.datasets[0].data.reduce((a, b) => a + b, 0);
  const totalUpdated = processChartData.datasets[1].data.reduce((a, b) => a + b, 0);
  const totalOperations = totalCreated + totalUpdated;

  return (
    <div>
      {/* Date Range Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {predefinedRanges.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePredefinedRange(key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                dateRangeType === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setDateRangeType("custom")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              dateRangeType === "custom"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Custom Range
          </button>
        </div>

        {dateRangeType === "custom" && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="MMM dd, yyyy"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="MMM dd, yyyy"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80 bg-white rounded-lg border border-gray-200 p-4">
        {processChartData.labels.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium">No Data Available</div>
              <div className="text-sm">No modification history found for the selected date range</div>
            </div>
          </div>
        ) : (
          <Line data={processChartData} options={chartOptions} />
        )}
      </div>

      {/* Footer Information */}
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-500">
        <span>
          📅 Range: {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
        </span>
        <div className="flex gap-4">
          <span>📊 {modificationHistory.length} total history records</span>
          <span>📈 {processChartData.labels.length} days displayed</span>
        </div>
      </div>
    </div>
  );
};

export default ContactsChart;
