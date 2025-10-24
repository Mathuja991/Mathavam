import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChildInfoInputs from "../forms/ChildInfoInputs";

const sections = {
  Assessment: [
    "Doctor Assessment",
    "Speech Therapist",
    "Occupational Therapist",
    "Physiotherapist",
    "Feeding Assessment",
    "IQ Assessment",
  ],
  "Parental Training": ["Parental Training"],
  Consultants: ["Consultant Psychiatrist", "Consultant Pediatrician"],
  Interventions: [
    "Level 1 Intervention",
    "Level 2 Intervention",
    "Level 3 Intervention",
  ],
  Discussions: ["Case Discussion", "Family Discussion", "Group"],
};

const EditMathavamFlowchart = () => {
  const { childNo } = useParams();

  const defaultFormData = () => {
    const initial = {
      name: "",
      childNo: "",
      age: "",
      date: new Date().toISOString().split("T")[0],
      gender: "",
    };
    Object.values(sections).flat().forEach((item) => {
      initial[item] = [];
    });
    return initial;
  };

  const [formData, setFormData] = useState(defaultFormData());
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get sections with data
  const getPopulatedItems = () => {
    const populated = {};
    Object.entries(sections).forEach(([section, items]) => {
      const filteredItems = items.filter(
        (item) => formData[item] && formData[item].length > 0
      );
      if (filteredItems.length > 0) populated[section] = filteredItems;
    });
    return populated;
  };

  // Fetch existing entries for the given child
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/mflow?childNo=${childNo}`);
        if (!res.ok) throw new Error("Failed to fetch entries");

        const data = await res.json();
        if (!data || data.length === 0) {
          setError("No entries found for this Child No.");
          setLoading(false);
          return;
        }

        const mergedFormData = defaultFormData();

        data.forEach((entry) => {
          mergedFormData.name = entry.name;
          mergedFormData.childNo = entry.childNo;
          mergedFormData.age = entry.age;
          mergedFormData.gender = entry.gender;

          if (entry.sections && Array.isArray(entry.sections)) {
            entry.sections.forEach((sectionItem) => {
              const existingDates = mergedFormData[sectionItem.name] || [];
              const newDates = (sectionItem.dates || []).map((date) => ({
                date,
                originalDate: date,
                entryId: entry._id,
              }));
              mergedFormData[sectionItem.name] = [...existingDates, ...newDates];
            });
          }
        });

        setFormData(mergedFormData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading entries:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEntries();
  }, [childNo]);

  const toggleItem = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleDateChange = (item, index, value) => {
    const updated = [...(formData[item] || [])];
    updated[index].date = value;
    setFormData((prev) => ({ ...prev, [item]: updated }));
  };

  const handleSubmitDate = async (item, index) => {
    const { date: newDate, originalDate, entryId } = formData[item][index];

    if (!newDate) {
      alert("Date cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/mflow/entries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionName: item,
          oldDate: originalDate,
          newDate: newDate,
        }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`Update failed: ${errMsg}`);
      }

      const updatedEntry = await res.json();
      alert(`${item} date updated successfully!`);

      // Update local state to reflect success
      const updated = [...(formData[item] || [])];
      updated[index].originalDate = newDate;
      setFormData((prev) => ({ ...prev, [item]: updated }));
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update date: " + error.message);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>;

  const populatedSections = getPopulatedItems();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        Edit Mathavam Flowchart - Child No: {childNo}
      </h2>

      <div className="bg-blue-50 p-5 rounded-xl shadow-sm mb-6">
        <ChildInfoInputs formData={formData} readOnlyFields={true} />
      </div>
<div  className="mt-5 ml-5 grid grid-cols-1 md:grid-cols-2 gap-4">
{Object.keys(populatedSections).length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          No assessment or intervention data to edit.
        </div>
      ) : (
        Object.entries(populatedSections).map(([section, items]) => (
          <div key={section} className="border rounded-xl shadow p-6 bg-gray-100 mb-4 max-w-sm">
            <h3 className="text-xl font-semibold mb-4">{section}</h3>
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item} className="border rounded-xl shadow p-5 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleItem(item)}
                    className="w-full text-left font-medium text-blue-700 flex justify-between items-center"
                  >
                    {item}
                    <span>{expandedItems[item] ? "▲" : "▼"}</span>
                  </button>

                  {expandedItems[item] && (
                    <div className="mt-4 space-y-4">
                      {(formData[item] || []).map((dateObj, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="date"
                            value={dateObj.date}
                            onChange={(e) => handleDateChange(item, index, e.target.value)}
                            className="p-2 border rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleSubmitDate(item, index)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Update
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
</div>
      
    </div>
  );
};

export default EditMathavamFlowchart;
