import React from "react";
import { Filter, Search } from "lucide-react";

const FilterSection = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Appointments</h3>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search patients..."
              value={filters.patientName}
              onChange={(e) => onFilterChange("patientName", e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-64"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={filters.doctorName}
              onChange={(e) => onFilterChange("doctorName", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Doctor name"
            />
            
            <input
              type="text"
              value={filters.patientId}
              onChange={(e) => onFilterChange("patientId", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Patient ID"
            />
            
            <input
              type="date"
              value={filters.date}
              onChange={(e) => onFilterChange("date", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            
            <input
              type="text"
              value={filters.time}
              onChange={(e) => onFilterChange("time", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Time"
            />
            
            <select
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;