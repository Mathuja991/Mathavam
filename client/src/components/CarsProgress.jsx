import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

const ChildProgress = () => {
  const [childNo, setChildNo] = useState("");
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("progress");
  const navigate = useNavigate();
  
  const fetchChildEntries = async () => {
    if (!childNo.trim()) {
      setError("Please enter a Child No");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/carsform/entries");
      const data = await res.json();
      const filtered = data.filter(entry => entry.childNo === childNo.trim());

      if (filtered.length === 0) {
        setError("No records found for this Child No.");
        setEntries([]);
        return;
      }

      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEntries(filtered);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalScore = (scores) =>
    Object.values(scores || {}).reduce((sum, val) => sum + val, 0);

  const getSeverityColor = (severity) => {
    switch (severity?.label) {
      case "Minimal to no symptoms of ASD": return "text-green-600 bg-green-100";
      case "Mild to Moderate symptoms of ASD": return "text-yellow-600 bg-yellow-100";
      case "Severe symptoms of ASD": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const chartData = entries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: entry.date,
    totalScore: getTotalScore(entry.scores),
    severity: entry.severity?.label,
    name: entry.name
  }));

  const latestEntry = entries[entries.length - 1];
  const firstEntry = entries[0];

  const calculateImprovement = () => {
    if (entries.length < 2) return null;
    const firstScore = getTotalScore(firstEntry.scores);
    const latestScore = getTotalScore(latestEntry.scores);
    return ((firstScore - latestScore) / firstScore * 100).toFixed(1);
  };
  const handleBack = () => {
    navigate(`/dashboard/forms`);

  };
  const improvement = calculateImprovement();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
           <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
       
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Child Progress Tracking
          </h1>
          <p className="text-lg text-gray-600">
            Monitor assessment progress and development over time
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
                  {getTotalScore(latestEntry?.scores).toFixed(1)}
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
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(latestEntry?.severity)}`}>
                  {latestEntry?.severity?.label || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-2">Current Status</div>
              </div>
            </div>

            {/* Child Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-medium text-gray-900">{latestEntry.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Child No</label>
                  <p className="font-medium text-gray-900">{latestEntry.childNo}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Assessment Period</label>
                  <p className="font-medium text-gray-900">
                    {firstEntry?.date} to {latestEntry?.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("progress")}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "progress"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Progress Chart
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "history"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Assessment History
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "details"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Score Details
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Progress Chart Tab */}
                {activeTab === "progress" && (
                  <div className="space-y-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <YAxis 
                            domain={[0, 60]} 
                            tick={{ fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="totalScore" 
                            stroke="#4f46e5" 
                            strokeWidth={3}
                            dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, fill: '#3730a3' }}
                            name="Total CARS Score"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    
                  </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Assessment Timeline</h4>
                    <div className="space-y-3">
                      {entries.map((entry, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">{entry.date}</span>
                              <span className="text-lg font-bold text-blue-600">
                                {getTotalScore(entry.scores).toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                                {entry.severity?.label}
                              </span>
                              <span className="text-sm text-gray-500">
                                {i + 1} of {entries.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900">Detailed Score Analysis</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Severity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Change
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {entries.map((entry, i) => {
                            const prevScore = i > 0 ? getTotalScore(entries[i-1].scores) : null;
                            const currentScore = getTotalScore(entry.scores);
                            const change = prevScore !== null ? currentScore - prevScore : null;
                            
                            return (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {entry.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {currentScore.toFixed(1)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                                    {entry.severity?.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {change !== null && (
                                    <span className={change < 0 ? "text-green-600 font-medium" : change > 0 ? "text-red-600 font-medium" : "text-gray-600"}>
                                      {change > 0 ? '+' : ''}{change.toFixed(1)}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChildProgress;