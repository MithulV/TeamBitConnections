import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

const SkillsHorizontalBarChart = ({ contacts }) => {
  const barData = useMemo(() => {
    const skillsMap = {};

    contacts.forEach((contact) => {
      if (contact.skills) {
        const skills = contact.skills
          .split(",")
          .map((s) => s.trim().toLowerCase());
        skills.forEach((skill) => {
          if (skill && skill.length > 0) {
            skillsMap[skill] = (skillsMap[skill] || 0) + 1;
          }
        });
      }
    });

    const allSkills = Object.entries(skillsMap).sort(([, a], [, b]) => b - a);

    const labels = allSkills.map(
      ([skill]) => skill.charAt(0).toUpperCase() + skill.slice(1)
    );

    const skillCounts = allSkills.map(([, count]) => count);

    return {
      labels,
      datasets: [
        {
          label: "Number of People",
          data: skillCounts,
          backgroundColor: "rgba(139, 92, 246, 0.7)",
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(139, 92, 246, 0.9)",
          hoverBorderColor: "rgba(139, 92, 246, 1)",
        },
      ],
    };
  }, [contacts]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (context) => `${context[0].label}`,
          label: (context) =>
            `${context.parsed.x} ${
              context.parsed.x === 1 ? "person" : "people"
            }`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Number of People",
        },
      },
      y: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: "Skills",
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          All Skills Distribution
        </h2>
        <div className="ml-auto bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
          Horizontal View
        </div>
      </div>
      <div className="h-96 overflow-y-auto">
        <div style={{ height: Math.max(400, barData.labels.length * 25) }}>
          <Bar data={barData} options={options} />
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500 text-center">
        Showing all {barData.labels?.length || 0} unique skills with
        distribution counts
      </div>
    </div>
  );
};

export default SkillsHorizontalBarChart;
