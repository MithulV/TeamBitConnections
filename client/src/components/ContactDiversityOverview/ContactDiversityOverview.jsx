import React, { useMemo } from 'react';
import { MapPinIcon } from 'lucide-react';

// TextWithTooltip Component
const TextWithTooltip = ({ text, className = "", maxWidth = "150px" }) => {
  return (
    <span
      className={`${className}`}
      title={text}
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "block",
        maxWidth: maxWidth,
        cursor: "help",
      }}
    >
      {text}
    </span>
  );
};

const ContactDiversityOverview = ({ contacts }) => {
  const diversityData = useMemo(() => {
    const departments = {};
    const city = {};
    const jobTitles = {};
    const companies = {};

    contacts.forEach((contact) => {
      if (contact.department_type) {
        departments[contact.department_type] =
          (departments[contact.department_type] || 0) + 1;
      }

      if (contact.city) {
        city[contact.city] = (city[contact.city] || 0) + 1;
      }

      if (contact.job_title) {
        jobTitles[contact.job_title] = (jobTitles[contact.job_title] || 0) + 1;
      }

      if (contact.company_name) {
        companies[contact.company_name] =
          (companies[contact.company_name] || 0) + 1;
      }
    });

    const topDepartment = Object.entries(departments).sort(
      ([, a], [, b]) => b - a
    )[0];
    const topCity = Object.entries(city).sort(([, a], [, b]) => b - a)[0];
    const topJobTitle = Object.entries(jobTitles).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      topDepartment: topDepartment
        ? { name: topDepartment[0], count: topDepartment[1] }
        : null,
      topCity: topCity ? { name: topCity[0], count: topCity[1] } : null,
      topJobTitle: topJobTitle
        ? { name: topJobTitle[0], count: topJobTitle[1] }
        : null,
      totalDepartments: Object.keys(departments).length,
      totalCity: Object.keys(city).length,
      totalJobTitles: Object.keys(jobTitles).length,
      totalCompanies: Object.keys(companies).length,
    };
  }, [contacts]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <MapPinIcon className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Contact Diversity Overview
        </h2>
        <div className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Diversity Insights
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Top Department</p>
            <TextWithTooltip
              text={
                diversityData.topDepartment
                  ? diversityData.topDepartment.name
                  : "N/A"
              }
              className="text-lg font-semibold text-blue-700"
              maxWidth="200px"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">
              {diversityData.topDepartment
                ? `${diversityData.topDepartment.count} people`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-900">
              Most Common City
            </p>
            <TextWithTooltip
              text={diversityData.topCity ? diversityData.topCity.name : "N/A"}
              className="text-lg font-semibold text-purple-700"
              maxWidth="200px"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-600">
              {diversityData.topCity
                ? `${diversityData.topCity.count} contacts`
                : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-bold text-gray-900">
              {diversityData.totalDepartments}
            </p>
            <p className="text-xs text-gray-600">Departments</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-bold text-gray-900">
              {diversityData.totalCity}
            </p>
            <p className="text-xs text-gray-600">Districts</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-bold text-gray-900">
              {diversityData.totalJobTitles}
            </p>
            <p className="text-xs text-gray-600">Job Roles</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-bold text-gray-900">
              {diversityData.totalCompanies}
            </p>
            <p className="text-xs text-gray-600">Companies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDiversityOverview;
