import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { Layers } from 'lucide-react';

const UserActivitySegmentation = ({ contacts }) => {
  const segmentData = useMemo(() => {
    const total = contacts.length;
    if (total === 0) {
      return {
        labels: [
          "LinkedIn Presence",
          "Skills Completeness",
          "Address Information",
          "Education Background",
          "Work Experience",
          "Personal Information",
        ],
        datasets: [
          {
            label: "Coverage %",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgba(59, 130, 246, 1)",
            pointBackgroundColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            pointRadius: 4,
          },
        ],
      };
    }

    // LinkedIn Presence - professional networking completeness
    const linkedinPresence = Math.round(
      (contacts.filter((c) => c.linkedin_url && c.linkedin_url.trim() !== "")
        .length /
        total) *
        100
    );

    // Skills Completeness - professional skills documentation
    const skillsCompleteness = Math.round(
      (contacts.filter((c) => c.skills && c.skills.trim() !== "").length /
        total) *
        100
    );

    // Address Information - location data completeness
    const addressInfo = Math.round(
      (contacts.filter((c) => 
        (c.street && c.street.trim() !== "") &&
        (c.city && c.city.trim() !== "") &&
        (c.state && c.state.trim() !== "") &&
        (c.country && c.country.trim() !== "")
      ).length /
        total) *
        100
    );

    // Education Background - educational qualification completeness
    const educationBackground = Math.round(
      (contacts.filter((c) => 
        ((c.pg_course_name && c.pg_course_name.trim() !== "") ||
         (c.ug_course_name && c.ug_course_name.trim() !== "")) &&
        ((c.pg_college_name && c.pg_college_name.trim() !== "") ||
         (c.ug_college_name && c.ug_college_name.trim() !== ""))
      ).length /
        total) *
        100
    );

    // Work Experience - professional employment history
    const workExperience = Math.round(
      (contacts.filter((c) => 
        (c.job_title && c.job_title.trim() !== "") &&
        (c.company_name && c.company_name.trim() !== "") &&
        (c.department_type && c.department_type.trim() !== "")
      ).length /
        total) *
        100
    );

    // Personal Information - personal details completeness (excluding name, email, phone)
    const personalInfo = Math.round(
      (contacts.filter((c) => 
        (c.dob && c.dob.trim() !== "") &&
        (c.gender && c.gender.trim() !== "") &&
        (c.nationality && c.nationality.trim() !== "") &&
        (c.marital_status && c.marital_status.trim() !== "")
      ).length /
        total) *
        100
    );

    return {
      labels: [
        "LinkedIn Presence",
        "Skills Completeness", 
        "Address Information",
        "Education Background",
        "Work Experience",
        "Personal Information",
      ],
      datasets: [
        {
          label: "Coverage %",
          data: [
            linkedinPresence,
            skillsCompleteness,
            addressInfo,
            educationBackground,
            workExperience,
            personalInfo,
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
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.r}%`;
          }
        }
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function(value) {
            return value + '%';
          }
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Professional Data Completeness
        </h2>
      </div>

      <div className="h-80">
        <Radar data={segmentData} options={options} />
      </div>
    </div>
  );
};

export default UserActivitySegmentation;
