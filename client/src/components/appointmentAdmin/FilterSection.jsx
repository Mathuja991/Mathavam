import React from "react";
import { Filter, Search, X } from "lucide-react";

const FilterSection = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Patient Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Patient name..."
            value={filters.patientName}
            onChange={(e) => onFilterChange("patientName", e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        
        {/* Doctor Filter */}
        <div>
          <input
            type="text"
            value={filters.doctorName}
            onChange={(e) => onFilterChange("doctorName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Doctor name..."
          />
        </div>
        
        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onFilterChange("date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        
        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;