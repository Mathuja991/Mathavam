import React, { useState } from "react";
import { toast } from 'react-toastify';

const Studentinfo = ({ isTranslated, studentInfo, setStudentInfo, isEditing, id }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const fields = [
    { label: "Child ID", ta: "மாணவர் அடையாள அட்டை", type: "text", key: "id", placeholder: "Enter Child ID" },
    { label: "Child's Name", ta: "பிள்ளையின் பெயர்", type: "text", key: "name", placeholder: "Enter name" },
    { label: "Age", ta: "வயது", type: "number", key: "age", placeholder: "Enter age" },
    {
      label: "Gender",
      ta: "பால்",
      type: "select",
      key: "gender",
      options: [
        { en: "Male", ta: "ஆண்" },  
        { en: "Female", ta: "பெண்" }
      ]
    },
  ];

  // Function to fetch child details
  const fetchChildDetails = async (childId) => {
    if (!childId || childId.length < 1) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/child/${childId}`);
      
      if (response.ok) {
        const childData = await response.json();
        console.log("Fetched child data:", childData); // Debug log
        
        setStudentInfo(prev => ({
          ...prev,
          name: childData.name || "",
          age: childData.age || "",
          gender: childData.gender || "",
        }));
        
      } else {
        console.log("Child not found or error:", response.status);
        // Don't show error for 404 - it's expected if child doesn't exist
        if (response.status !== 404) {
          toast.error(isTranslated ? "Failed to fetch child details." : "குழந்தை விவரங்களைப் பெறுவதில் பிழை.");
        }
      }
    } catch (error) {
      console.error("Error fetching child details:", error);
      toast.error(isTranslated ? "Error connecting to server." : "சேவையகத்துடன் இணைப்பதில் பிழை.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle child ID change with debounce
  const handleChildIdChange = (e) => {
    const childId = e.target.value;
    setStudentInfo(prev => ({ ...prev, id: childId }));
    
    // Fetch child details when ID is entered (with slight delay)
    if (childId && childId.length >= 1) {
      setTimeout(() => {
        fetchChildDetails(childId);
      }, 500);
    }
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100">
      <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-3 border-b border-blue-100">
        {isTranslated ? "Child Information" : "மாணவர் தகவல்கள்"}
      </h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, idx) => (
            <div key={idx} className="space-y-2">
              <label className="block text-gray-700 font-semibold mb-1">
                {isTranslated ? field.label : field.ta}
                {field.key === "id" && isLoading && (
                  <span className="ml-2 text-blue-500 text-sm">({isTranslated ? "Loading..." : "ஏற்றுகிறது..."})</span>
                )}
              </label>
              {field.type === "select" ? (
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
                  value={studentInfo[field.key] || ""}
                  onChange={(e) =>
                    setStudentInfo({ ...studentInfo, [field.key]: e.target.value })
                  }
                  disabled={!isEditing && !!id}
                >
                  <option value="" disabled>
                    {isTranslated ? "Select Gender" : "பாலினத்தைத் தேர்ந்தெடுக்கவும்"}
                  </option>
                  {field.options.map((option) => (
                    <option key={option.en} value={option.en}>
                      {isTranslated ? option.en : option.ta}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
                  value={studentInfo[field.key] || ""}
                  onChange={field.key === "id" ? handleChildIdChange : (e) =>
                    setStudentInfo({ ...studentInfo, [field.key]: e.target.value })
                  }
                  disabled={(!isEditing && !!id) || (field.key !== "id" && isLoading)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Studentinfo;