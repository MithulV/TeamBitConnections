import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import { format, parseISO, subDays, subMonths, isAfter, startOfDay, endOfDay } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

// Utility functions
const getDedupedUpdatesPerDay = (contacts) => {
  const updatedDatesMap = new Map(); // contactId -> Set of unique days

  contacts.forEach((contact) => {
    const contactId = contact.contact_id;

    if (!updatedDatesMap.has(contactId)) {
      updatedDatesMap.set(contactId, new Set());
    }

    const dateSet = updatedDatesMap.get(contactId);

    // Collect all update dates from all related tables
    const updateCandidates = [];

    if (contact.updated_at) updateCandidates.push(contact.updated_at);
    if (contact.address_updated_at)
      updateCandidates.push(contact.address_updated_at);

    // Handle multiple dates from education
    if (contact.education_updated_at) {
      const eduUpdates = contact.education_updated_at
        .split("; ")
        .filter(Boolean);
      updateCandidates.push(...eduUpdates);
    }

    // Handle multiple dates from experience
    if (contact.experience_updated_at) {
      const expUpdates = contact.experience_updated_at
        .split("; ")
        .filter(Boolean);
      updateCandidates.push(...expUpdates);
    }

    // Handle multiple dates from events
    if (contact.event_details_updated_at) {
      const eventUpdates = contact.event_details_updated_at
        .split("; ")
        .filter(Boolean);
      updateCandidates.push(...eventUpdates);
    }

    // Deduplicate per contact per day
    updateCandidates.forEach((dateStr) => {
      if (!dateStr) return;
      try {
        const dateObj = parseISO(dateStr);
        if (!isNaN(dateObj)) {
          const dayKey = format(dateObj, "yyyy-MM-dd");
          dateSet.add(dayKey); // Set automatically deduplicates
        }
      } catch (error) {
        console.warn("Invalid date:", dateStr);
      }
    });
  });

  // Aggregate counts across all contacts per day
  const aggregateCounts = {};

  for (const dateSet of updatedDatesMap.values()) {
    dateSet.forEach((day) => {
      aggregateCounts[day] = (aggregateCounts[day] || 0) + 1;
    });
  }

  return aggregateCounts;
};

const getAllCreatedDates = (contacts) => {
  return contacts.map((contact) => contact.created_at).filter(Boolean);
};

const ContactsChart = ({
  contacts,
  startDate,
  endDate,
  dateRangeType,
  setStartDate,
  setEndDate,
  setDateRangeType,
}) => {
  const handlePredefinedRange = (range) => {
    const today = new Date();
    let newStartDate;

    switch (range) {
      case "last7days":
        newStartDate = subDays(today, 7);
        break;
      case "last30days":
        newStartDate = subDays(today, 30);
        break;
      case "lastMonth":
        newStartDate = subMonths(today, 1);
        break;
      case "last3Months":
        newStartDate = subMonths(today, 3);
        break;
      case "last6Months":
        newStartDate = subMonths(today, 6);
        break;
      case "lastYear":
        newStartDate = subMonths(today, 12);
        break;
      default:
        return;
    }

    setStartDate(startOfDay(newStartDate));
    setEndDate(endOfDay(today));
    setDateRangeType(range);
  };

  const processChartData = useMemo(() => {
    const contactsArray = Array.isArray(contacts) ? contacts : [];
    
    // Get created dates (only from contacts table)
    const allCreatedDates = getAllCreatedDates(contactsArray);

    // Get deduplicated updated dates per contact per day
    const allUpdatesPerDay = getDedupedUpdatesPerDay(contactsArray);
    const createdDates = {};
    const updatedDates = {};
    
    // Process created dates within date range
    allCreatedDates.forEach((dateStr) => {
      if (!dateStr) return;
      try {
        const date = parseISO(dateStr);
        if (isAfter(date, startOfDay(startDate)) && date <= endOfDay(endDate)) {
          const dayKey = format(date, "yyyy-MM-dd");
          createdDates[dayKey] = (createdDates[dayKey] || 0) + 1;
        }
      } catch (error) {
        console.warn("Invalid created date:", dateStr);
      }
    });

    // Process updated dates within date range (already deduplicated)
    Object.entries(allUpdatesPerDay).forEach(([dayKey, count]) => {
      try {
        const date = parseISO(dayKey);
        if (isAfter(date, startOfDay(startDate)) && date <= endOfDay(endDate)) {
          updatedDates[dayKey] = count;
        }
      } catch (error) {
        console.warn("Invalid updated date:", dayKey);
      }
    });

    const allDates = Array.from(
      new Set([...Object.keys(createdDates), ...Object.keys(updatedDates)])
    ).sort();

    return {
      labels: allDates,
      datasets: [
        {
          label: "Contacts Created",
          data: allDates.map((date) => createdDates[date] || 0),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Records Updated",
          data: allDates.map((date) => updatedDates[date] || 0),
          borderColor: "rgb(139, 69, 19)",
          backgroundColor: "rgba(139, 69, 19, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [contacts, startDate, endDate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
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
        },
      },
      x: {
        ticks: {
          maxTicksLimit: 15,
        },
      },
    },
    interaction: {
      intersect: false,
    },
  };

  const predefinedRanges = [
    { key: "last7days", label: "Last 7 Days" },
    { key: "last30days", label: "Last 30 Days" },
    { key: "lastMonth", label: "Last Month" },
    { key: "last3Months", label: "Last 3 Months" },
    { key: "last6Months", label: "Last 6 Months" },
    { key: "lastYear", label: "Last Year" },
  ];

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {predefinedRanges.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePredefinedRange(key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                dateRangeType === key
                  ? "bg-blue-600 text-white"
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
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Custom Range
          </button>
        </div>

        {dateRangeType === "custom" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="MMM dd, yyyy"
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-64">
        <Line data={processChartData} options={chartOptions} />
      </div>

      <div className="mt-3 text-xs text-gray-500 flex justify-between">
        <span>
          Range: {format(startDate, "MMM dd, yyyy")} -{" "}
          {format(endDate, "MMM dd, yyyy")}
        </span>
        <span>
          Total in range:{" "}
          {processChartData.datasets[0].data.reduce((a, b) => a + b, 0)}{" "}
          created,{" "}
          {processChartData.datasets[1].data.reduce((a, b) => a + b, 0)} updated
        </span>
      </div>
    </div>
  );
};

export default ContactsChart;
