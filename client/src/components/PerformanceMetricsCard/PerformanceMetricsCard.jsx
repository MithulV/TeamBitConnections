import React, { useMemo } from 'react';
import { BarChart2, Users, CheckCircle, Globe, Calendar } from 'lucide-react';
import { parseISO, subDays } from 'date-fns';

const PerformanceMetricsCard = ({ contacts, stats }) => {
  const metrics = useMemo(() => {
    const total = contacts.length;
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);

    // Weekly activity
    const weeklyNewContacts = contacts.filter((c) => {
      if (!c.created_at) return false;
      const createdDate = parseISO(c.created_at);
      return createdDate >= sevenDaysAgo;
    }).length;

    // Active events (recent)
    const activeEvents = contacts.filter(
      (c) => c.event_name && c.event_name.trim() !== ""
    ).length;

    // Data completeness score
    const completeProfiles = contacts.filter(
      (c) => c.email_address && c.phone_number && c.skills && c.company_name
    ).length;

    const completenessScore =
      total > 0 ? Math.round((completeProfiles / total) * 100) : 0;

    // Professional network strength
    const linkedinContacts = contacts.filter(
      (c) => c.linkedin_url && c.linkedin_url.trim() !== ""
    ).length;
    const networkStrength =
      total > 0 ? Math.round((linkedinContacts / total) * 100) : 0;

    return {
      weeklyActivity: weeklyNewContacts,
      dataCompleteness: completenessScore,
      networkStrength,
      activeEvents: activeEvents,
      verificationRate:
        total > 0 ? Math.round((stats.verifiedContacts / total) * 100) : 0,
    };
  }, [contacts, stats]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Performance Metrics
        </h3>
        <div className="ml-auto bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
          Live Stats
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Row 1 */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">
                Weekly Activity
              </p>
              <p className="text-lg font-bold text-blue-800">
                {metrics.weeklyActivity}
              </p>
            </div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700">
                Data Complete
              </p>
              <p className="text-lg font-bold text-green-800">
                {metrics.dataCompleteness}%
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">
                Network Strength
              </p>
              <p className="text-lg font-bold text-purple-800">
                {metrics.networkStrength}%
              </p>
            </div>
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-700">
                Event Participants
              </p>
              <p className="text-lg font-bold text-orange-800">
                {metrics.activeEvents}
              </p>
            </div>
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Bottom summary */}
      <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Verification Rate:</span>
          <span className="font-bold text-gray-900">
            {metrics.verificationRate}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsCard;
