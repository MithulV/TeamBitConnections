import React, { useMemo } from 'react';
import { Shield, CheckCircle, AlertCircle, XCircle, Mail, Phone, Briefcase, Building, Sparkles, Target } from 'lucide-react';

const ContactDataQualityMonitor = ({ contacts }) => {
  const qualityData = useMemo(() => {
    const total = contacts.length;
    if (total === 0)
      return {
        overallScore: 0,
        missingEmail: 0,
        missingPhone: 0,
        missingSkills: 0,
        missingCompany: 0,
        completionRate: 0,
        criticalIssues: 0,
        recommendations: [],
      };

    const missingEmail = contacts.filter(
      (c) => !c.email_address || c.email_address.trim() === ""
    ).length;
    const missingPhone = contacts.filter(
      (c) => !c.phone_number || c.phone_number.trim() === ""
    ).length;
    const missingSkills = contacts.filter(
      (c) => !c.skills || c.skills.trim() === ""
    ).length;
    const missingCompany = contacts.filter(
      (c) => !c.company_name || c.company_name.trim() === ""
    ).length;
    const missingLinkedIn = contacts.filter(
      (c) => !c.linkedin_url || c.linkedin_url.trim() === ""
    ).length;

    const criticalFields = missingEmail + missingPhone;
    const overallScore = Math.round(
      ((total * 5 -
        (missingEmail +
          missingPhone +
          missingSkills +
          missingCompany +
          missingLinkedIn)) /
        (total * 5)) *
        100
    );
    const completionRate = Math.round(((total - criticalFields) / total) * 100);

    const recommendations = [];
    if (missingCompany > missingSkills && missingCompany > total * 0.1) {
      recommendations.push(
        "High company data gaps detected. Prioritize filling company information."
      );
    } else if (missingSkills > total * 0.3) {
      recommendations.push("Skills data needs improvement.");
    }

    if (missingEmail > total * 0.1)
      recommendations.push("High email gaps detected.");
    if (missingPhone > total * 0.1)
      recommendations.push(
        "Phone number information missing for many contacts."
      );

    return {
      overallScore,
      missingEmail,
      missingPhone,
      missingSkills,
      missingCompany,
      completionRate,
      criticalIssues: criticalFields,
      recommendations,
    };
  }, [contacts]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Data Quality Monitor
        </h2>
        <div className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          Admin Grade
        </div>
      </div>

      <div className="space-y-4">
        <div
          className={`p-4 rounded-lg ${getScoreBg(
            qualityData.overallScore
          )} border-l-4 ${
            qualityData.overallScore >= 80
              ? "border-green-500"
              : qualityData.overallScore >= 60
              ? "border-yellow-500"
              : "border-red-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Overall Data Quality
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  qualityData.overallScore
                )}`}
              >
                {qualityData.overallScore}%
              </p>
            </div>
            <div
              className={`p-2 rounded-full ${
                qualityData.overallScore >= 80
                  ? "bg-green-500"
                  : qualityData.overallScore >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {qualityData.overallScore >= 80 ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : qualityData.overallScore >= 60 ? (
                <AlertCircle className="w-6 h-6 text-white" />
              ) : (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">
                Missing Email
              </span>
            </div>
            <p className="text-lg font-bold text-red-700">
              {qualityData.missingEmail}
            </p>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                Missing Phone
              </span>
            </div>
            <p className="text-lg font-bold text-orange-700">
              {qualityData.missingPhone}
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Missing Skills
              </span>
            </div>
            <p className="text-lg font-bold text-blue-700">
              {qualityData.missingSkills}
            </p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Missing Company
              </span>
            </div>
            <p className="text-lg font-bold text-purple-700">
              {qualityData.missingCompany}
            </p>
          </div>
        </div>

        {qualityData.recommendations.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">
                Admin Recommendations
              </span>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              {qualityData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-1">
                  <Target className="w-3 h-3 mt-0.5 text-yellow-600" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDataQualityMonitor;
