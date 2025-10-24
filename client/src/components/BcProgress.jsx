import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ResponsiveContainer
} from "recharts";

const ChildProgressBC = () => {
  const [childNo, setChildNo] = useState("");
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChart, setActiveChart] = useState("line");
const navigate = useNavigate();
  // Format time from createdAt or use default
  const formatTime = (entry) => {
    try {
      if (entry.createdAt) {
        return new Date(entry.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      // If no createdAt, generate a time based on array position to differentiate entries
      return "Unknown Time";
    } catch (err) {
      return "N/A";
    }
  };

  // Format date with time for display
  const formatDateTime = (entry, index) => {
    try {
      return {
        date: entry.date,
        time: formatTime(entry),
        fullDateTime: `${entry.date} ${formatTime(entry)}`,
        displayDate: `${entry.date} (${formatTime(entry)})`
      };
    } catch (err) {
      return {
        date: "N/A",
        time: "N/A",
        fullDateTime: "N/A",
        displayDate: "N/A"
      };
    }
  };

  const fetchChildEntries = async () => {
    if (!childNo.trim()) {
      setError("Please enter a Child No.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/bc");
      const data = await res.json();
      const filtered = data.filter(entry => entry.childNo === childNo.trim());

      if (filtered.length === 0) {
        setError("No records found for this Child No.");
        setEntries([]);
        return;
      }

      // Sort by date and time (using createdAt if available)
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.date);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.date);
        return dateA - dateB;
      });
      
      setEntries(filtered);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate section scores
  const calculateSectionScore = (entry, sectionKey) => {
    if (!entry || !entry[sectionKey]) return 0;
    return entry[sectionKey].reduce((sum, score) => {
      if (score !== 'NA' && score !== '') {
        return sum + parseInt(score);
      }
      return sum;
    }, 0);
  };

  const getTotalScore = (entry) => {
    if (!entry) return 0;
    const sections = ['social', 'restrictive', 'mood', 'selfRegulation', 'challenging', 'selfInjury'];
    return sections.reduce((total, section) => total + calculateSectionScore(entry, section), 0);
  };

  // Update chart data to include time information
  const chartData = entries.map((entry, index) => {
    const dateTime = formatDateTime(entry, index);
    return {
      date: dateTime.displayDate,
      fullDate: entry.date,
      time: dateTime.time,
      totalScore: getTotalScore(entry),
      social: calculateSectionScore(entry, 'social'),
      restrictive: calculateSectionScore(entry, 'restrictive'),
      mood: calculateSectionScore(entry, 'mood'),
      selfRegulation: calculateSectionScore(entry, 'selfRegulation'),
      challenging: calculateSectionScore(entry, 'challenging'),
      selfInjury: calculateSectionScore(entry, 'selfInjury'),
    };
  });

  const latestEntry = entries[entries.length - 1];
  const firstEntry = entries[0];

  const calculateImprovement = () => {
    if (entries.length < 2) return null;
    const firstScore = getTotalScore(firstEntry);
    const latestScore = getTotalScore(latestEntry);
    return ((firstScore - latestScore) / firstScore * 100).toFixed(1);
  };

  const improvement = calculateImprovement();
 const handleBack = () => {
    navigate(`/dashboard/forms`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
           <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Behavior Checklist Progress Tracking
          </h1>
          <p className="text-lg text-gray-600">
            Monitor behavioral assessment progress and development over time
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Child Number
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., 001"
                  value={childNo}
                  onChange={(e) => setChildNo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchChildEntries()}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={fetchChildEntries}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      View Progress
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{entries.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Assessments</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {getTotalScore(latestEntry)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Latest Score</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {improvement ? `${improvement}%` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 font-medium">Improvement</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {entries.filter(entry => entry.date === latestEntry.date).length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Today's Entries</div>
              </div>
            </div>

            {/* Chart Type Selector */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              

              {/* Charts */}
              <div className="space-y-7">
                {/* Main Progress Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Score Progress</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {activeChart === "line" && (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                          />
                          <YAxis domain={[0, 180]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="totalScore" 
                            stroke="#4f46e5" 
                            strokeWidth={3}
                            dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, fill: '#3730a3' }}
                            name="Total BC Score"
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Section Breakdown */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Assessment - Section Score Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {['social', 'restrictive', 'mood', 'selfRegulation', 'challenging', 'selfInjury'].map((section, index) => {
                      const sectionNames = {
                        social: "Social",
                        restrictive: "Restrictive",
                        mood: "Mood",
                        selfRegulation: "Self-Reg",
                        challenging: "Challenging",
                        selfInjury: "Self-Injury"
                      };
                      const colors = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];
                      
                      return (
                        <div key={section} className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-lg font-bold" style={{ color: colors[index] }}>
                            {calculateSectionScore(latestEntry, section)}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {sectionNames[section]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment History</h3>
              <div className="space-y-4">
                {entries.map((entry, index) => {
                  const dateTime = formatDateTime(entry, index);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          
                          {entry.createdAt && (
                            <div className="font-medium text-gray-900">
                              Submitted: {new Date(entry.createdAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{getTotalScore(entry)}</div>
                        <p className="text-sm text-gray-600">Total Score</p>
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multiple Entries Warning */}
            {entries.length > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Multiple Entries Found</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This child has {entries.length} assessment entries. Each entry is shown with its submission time.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChildProgressBC;