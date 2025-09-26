import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

const EventsBarChart = ({ contacts }) => {
  const chartData = useMemo(() => {
    const eventCounts = {};

    contacts.forEach((contact) => {
      if (contact.event_name) {
        const events = contact.event_name.split(";").map((e) => e.trim());
        events.forEach((event) => {
          if (event) eventCounts[event] = (eventCounts[event] || 0) + 1;
        });
      }
    });

    const sortedEvents = Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: sortedEvents.map(([event]) =>
        event.length > 15 ? event.substring(0, 15) + "..." : event
      ),
      datasets: [
        {
          label: "Participants",
          data: sortedEvents.map(([, count]) => count),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [contacts]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          maxRotation: 45,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Top Events</h2>
      </div>
      <div className="h-84">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default EventsBarChart;
