import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { Layers } from 'lucide-react';

const UserActivitySegmentation = ({ contacts }) => {
  const segmentData = useMemo(() => {
    const total = contacts.length;
    if (total === 0) {
      return {
        labels: [
          "Email Coverage",
          "Phone Coverage",
          "LinkedIn Presence",
          "Event Participation",
          "Skill Completeness",
          "Company Info",
        ],
        datasets: [
          {
            label: "Activity Score",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgba(59, 130, 246, 1)",
            pointBackgroundColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
          },
        ],
      };
    }

    const emailCoverage = Math.round(
      (contacts.filter((c) => c.email_address && c.email_address.trim() !== "")
        .length /
        total) *
        100
    );
    const phoneCoverage = Math.round(
      (contacts.filter((c) => c.phone_number && c.phone_number.trim() !== "")
        .length /
        total) *
        100
    );
    const linkedinPresence = Math.round(
      (contacts.filter((c) => c.linkedin_url && c.linkedin_url.trim() !== "")
        .length /
        total) *
        100
    );
    const eventParticipation = Math.round(
      (contacts.filter((c) => c.event_name && c.event_name.trim() !== "")
        .length /
        total) *
        100
    );
    const skillCompleteness = Math.round(
      (contacts.filter((c) => c.skills && c.skills.trim() !== "").length /
        total) *
        100
    );
    const companyInfo = Math.round(
      (contacts.filter((c) => c.company_name && c.company_name.trim() !== "")
        .length /
        total) *
        100
    );

    return {
      labels: [
        "Email Coverage",
        "Phone Coverage",
        "LinkedIn Presence",
        "Event Participation",
        "Skill Completeness",
        "Company Info",
      ],
      datasets: [
        {
          label: "Coverage %",
          data: [
            emailCoverage,
            phoneCoverage,
            linkedinPresence,
            eventParticipation,
            skillCompleteness,
            companyInfo,
          ],
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 1)",
          pointBackgroundColor: "rgba(59, 130, 246, 1)",
          borderWidth: 2,
          pointRadius: 4,
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
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          User Activity Segmentation
        </h2>
        <div className="ml-auto bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
          Coverage Analysis
        </div>
      </div>

      <div className="h-80">
        <Radar data={segmentData} options={options} />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Comprehensive view of data completeness across all contact fields
        </p>
      </div>
    </div>
  );
};

export default UserActivitySegmentation;
