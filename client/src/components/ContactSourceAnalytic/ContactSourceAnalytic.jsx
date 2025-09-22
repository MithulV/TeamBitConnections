import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { format, parseISO, subDays, subMonths, isAfter, startOfMonth, isWithinInterval, startOfDay, endOfDay, startOfWeek } from 'date-fns';

// Utility functions
const calculateTrendPercentage = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getTodayFormatted = () => {
  return format(new Date(), "yyyy-MM-dd");
};

const getYesterdayFormatted = () => {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
};

const ContactSourceAnalytics = ({ contacts }) => {
  const sourceData = useMemo(() => {
    const now = new Date();
    const today = getTodayFormatted();
    const yesterday = getYesterdayFormatted();

    // Enhanced date range calculations using date-fns [web:292][web:405]
    const startOfToday = startOfDay(now);
    const startOfYesterday = startOfDay(subDays(now, 1));
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
    const startOfLastWeek = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
    const startOfThisMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calculate days passed in current month
    const daysPassed = Math.max(
      1,
      Math.floor((now - startOfThisMonth) / (1000 * 60 * 60 * 24)) + 1
    );

    // Filter contacts with valid creation dates
    const contactsWithValidDates = contacts.filter(c => c.created_at);

    // Count new contacts added today vs yesterday using contact's created_at
    const todayNewContacts = contactsWithValidDates.filter((c) => {
      const createdAt = parseISO(c.created_at);
      return isWithinInterval(createdAt, {
        start: startOfToday,
        end: endOfDay(now)
      });
    }).length;

    const yesterdayNewContacts = contactsWithValidDates.filter((c) => {
      const createdAt = parseISO(c.created_at);
      return isWithinInterval(createdAt, {
        start: startOfYesterday,
        end: endOfDay(subDays(now, 1))
      });
    }).length;

    // Weekly growth calculations using contact's created_at
    const thisWeekContacts = contactsWithValidDates.filter((c) => {
      const createdAt = parseISO(c.created_at);
      return isWithinInterval(createdAt, {
        start: startOfThisWeek,
        end: endOfDay(now)  // FIXED: Include full day
      });
    }).length;

    const lastWeekContacts = contactsWithValidDates.filter((c) => {
      const createdAt = parseISO(c.created_at);
      return isWithinInterval(createdAt, {
        start: startOfLastWeek,
        end: endOfDay(subDays(startOfThisWeek, 1))  // FIXED: End of last week
      });
    }).length;

    // FIXED: Count contacts this month using contact's created_at with proper end time [web:396][web:405]
    const thisMonthContacts = contactsWithValidDates.filter((c) => {
      const createdAt = parseISO(c.created_at);
      return isWithinInterval(createdAt, {
        start: startOfThisMonth,
        end: endOfDay(now)  // FIXED: Include full current day
      });
    }).length;

    // Count contacts last month using contact's created_at
    const lastMonthContacts = contactsWithValidDates.filter((c) => {
      const createdAt = parseISO(c.created_at);
      return isWithinInterval(createdAt, {
        start: startOfLastMonth,
        end: endOfLastMonth
      });
    }).length;

    // Calculate dynamic daily average for this month
    const dailyAverage = Math.round((thisMonthContacts / daysPassed) * 10) / 10;

    // TOP UNIQUE CONTRIBUTORS analysis using contact's created_at
    const contributorAnalysis = new Map();

    contactsWithValidDates.forEach((contact) => {
      const contributor = contact.added_by || "Direct Entry";

      if (!contributorAnalysis.has(contributor)) {
        contributorAnalysis.set(contributor, {
          totalContacts: 0,
          firstContribution: parseISO(contact.created_at),
          latestContribution: parseISO(contact.created_at)
        });
      }

      const contributorData = contributorAnalysis.get(contributor);
      contributorData.totalContacts++;

      const createdAt = parseISO(contact.created_at);
      if (createdAt < contributorData.firstContribution) {
        contributorData.firstContribution = createdAt;
      }
      if (createdAt > contributorData.latestContribution) {
        contributorData.latestContribution = createdAt;
      }
    });

    // Get top unique contributors sorted by total contacts
    const topSources = Array.from(contributorAnalysis.entries())
      .map(([contributor, data]) => [contributor, data.totalContacts])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // FIXED: Count categories for this month using contact's created_at with proper end time
    const monthlyCategories = { A: 0, B: 0, C: 0 };
    contactsWithValidDates.forEach((contact) => {
      const createdAt = parseISO(contact.created_at);
      if (isWithinInterval(createdAt, { start: startOfThisMonth, end: endOfDay(now) })) {  // FIXED
        if (contact.category && monthlyCategories.hasOwnProperty(contact.category)) {
          monthlyCategories[contact.category]++;
        }
      }
    });

    // Count total categories (all time)
    const totalCategories = { A: 0, B: 0, C: 0 };
    contacts.forEach((contact) => {
      if (contact.category && totalCategories.hasOwnProperty(contact.category)) {
        totalCategories[contact.category]++;
      }
    });

    // Calculate trends
    const dailyNewContactsTrend = calculateTrendPercentage(
      todayNewContacts,
      yesterdayNewContacts
    );
    const weeklyGrowthRate = calculateTrendPercentage(
      thisWeekContacts,
      lastWeekContacts
    );
    const monthlyGrowthRate = calculateTrendPercentage(
      thisMonthContacts,
      lastMonthContacts
    );

    return {
      dailyTrend: dailyNewContactsTrend,
      todayNewContacts,
      yesterdayNewContacts,
      weeklyGrowth: weeklyGrowthRate,
      monthlyGrowth: monthlyGrowthRate,
      thisWeekCount: thisWeekContacts,
      lastWeekCount: lastWeekContacts,
      thisMonthCount: thisMonthContacts,
      lastMonthCount: lastMonthContacts,
      dailyAverage,
      daysPassed,
      topSources,
      monthlyCategories,
      totalCategories,
      avgDaily: Math.round(thisWeekContacts / 7),
    };
  }, [contacts]);

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Growth & Sources
        </h2>
        <div className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Live Data
        </div>
      </div>

      <div className="space-y-4">
        {/* Daily new contacts trend with improved spacing */}
        <div
          className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200"
          style={{ minHeight: "140px" }}
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-sm font-medium text-indigo-700">
                Daily New Contacts
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`text-2xl font-bold ${getGrowthColor(
                    sourceData.dailyTrend
                  )}`}
                >
                  {sourceData.dailyTrend > 0 ? "+" : ""}
                  {sourceData.dailyTrend}%
                </span>
                {getGrowthIcon(sourceData.dailyTrend)}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-indigo-800">
                <strong>{sourceData.todayNewContacts}</strong> today vs{" "}
                <strong>{sourceData.yesterdayNewContacts}</strong> yesterday
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Weekly Growth with counts display and improved spacing */}
          <div
            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200"
            style={{ minHeight: "140px" }}
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Weekly Growth
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={`text-2xl font-bold ${getGrowthColor(
                      sourceData.weeklyGrowth
                    )}`}
                  >
                    {sourceData.weeklyGrowth > 0 ? "+" : ""}
                    {sourceData.weeklyGrowth}%
                  </span>
                  {getGrowthIcon(sourceData.weeklyGrowth)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-blue-800">
                  <strong>{sourceData.thisWeekCount}</strong> this week vs{" "}
                  <strong>{sourceData.lastWeekCount}</strong> last week
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Growth with improved spacing */}
          <div
            className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200"
            style={{ minHeight: "140px" }}
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-sm font-medium text-green-700">
                  This Month vs Last
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={`text-xl font-bold ${getGrowthColor(
                      sourceData.monthlyGrowth
                    )}`}
                  >
                    {sourceData.monthlyGrowth > 0 ? "+" : ""}
                    {sourceData.monthlyGrowth}%
                  </span>
                  {getGrowthIcon(sourceData.monthlyGrowth)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-green-800">
                  {sourceData.thisMonthCount} vs {sourceData.lastMonthCount}
                </p>
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Daily Average ({sourceData.daysPassed} days passed)
            </span>
            <span className="text-lg font-bold text-gray-900">
              {sourceData.dailyAverage} contacts/day
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Top Unique Contact Contributors
          </h3>
          <div className="space-y-2">
            {sourceData.topSources.map(([source, count], index) => (
              <div
                key={source}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${index === 0
                        ? "bg-blue-500"
                        : index === 1
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {source.length > 15
                      ? source.substring(0, 15) + "..."
                      : source}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            This Month by Category
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-2 bg-red-50 rounded text-center border border-red-200">
              <p className="text-sm font-medium text-red-700">Category A</p>
              <p className="text-lg font-bold text-red-800">
                {sourceData.monthlyCategories.A}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded text-center border border-yellow-200">
              <p className="text-sm font-medium text-yellow-700">Category B</p>
              <p className="text-lg font-bold text-yellow-800">
                {sourceData.monthlyCategories.B}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded text-center border border-green-200">
              <p className="text-sm font-medium text-green-700">Category C</p>
              <p className="text-lg font-bold text-green-800">
                {sourceData.monthlyCategories.C}
              </p>
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Total Categories (All Time)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-red-100 rounded text-center border border-red-300">
              <p className="text-xs font-medium text-red-700">
                Total Category A
              </p>
              <p className="text-xl font-bold text-red-900">
                {sourceData.totalCategories.A}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded text-center border border-yellow-300">
              <p className="text-xs font-medium text-yellow-700">
                Total Category B
              </p>
              <p className="text-xl font-bold text-yellow-900">
                {sourceData.totalCategories.B}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded text-center border border-green-300">
              <p className="text-xs font-medium text-green-700">
                Total Category C
              </p>
              <p className="text-xl font-bold text-green-900">
                {sourceData.totalCategories.C}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSourceAnalytics;
