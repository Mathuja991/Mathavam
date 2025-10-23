import { useEffect, useState } from "react";
import ChildInfoInputs from "./ChildInfoInputs";
import { useLocation } from "react-router-dom";

const MathavamFlowchart = () => {
  const location = useLocation();
  const editingEntry = location.state?.entry;

  // ✅ Sections configuration
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

  // ✅ Generate a default form structure dynamically
  const defaultFormData = () => {
    const initial = {
      name: "",
      childNo: "",
      age: "",
      date: new Date().toISOString().split("T")[0],
      gender: "",
      address: "",
      contactNo: "",
      dateOfBirth: "",
    };
    Object.values(sections).flat().forEach((item) => {
      initial[item] = [];
    });
    return initial;
  };

  // ✅ State variables
  const [formData, setFormData] = useState(defaultFormData());
  const [readOnlyFields, setReadOnlyFields] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Toggle section (collapse/expand)
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ✅ Toggle individual item
  const toggleItem = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  // ✅ Sanitize DB data to fit formData structure
  const sanitizeData = (dataFromDb) => {
    const clean = { ...defaultFormData() };
    Object.entries(clean).forEach(([key]) => {
      clean[key] = Array.isArray(dataFromDb[key])
        ? dataFromDb[key]
        : dataFromDb[key] || (Array.isArray(clean[key]) ? [] : "");
    });
    return { ...clean, ...dataFromDb };
  };

  // ✅ Fetch patient info when childNo changes
  const handleChildNoChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, childNo: value }));
    setErrorMessage("");

    if (!value) {
      setErrorMessage("Please enter a Child No.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/patientRecords`);
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();

      // Find the record with matching childNo
      const matchedRecord = data.find((record) => record.childNo === value);

      if (matchedRecord) {
        setFormData((prev) => ({
          ...prev,
          name: matchedRecord.name || "",
          age: matchedRecord.age || "",
          gender: matchedRecord.gender || "",
          address: matchedRecord.address || "",
          contactNo: matchedRecord.contactNo || "",
          dateOfBirth: matchedRecord.dateOfBirth
            ? new Date(matchedRecord.dateOfBirth).toISOString().split("T")[0]
            : "",
        }));
        setErrorMessage("");
      } else {
        setFormData((prev) => ({
          ...prev,
          name: "",
          age: "",
          gender: "",
          address: "",
          contactNo: "",
          dateOfBirth: "",
        }));
        setErrorMessage("Child record not found");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to fetch patient records");
      setFormData((prev) => ({
        ...prev,
        name: "",
        age: "",
        gender: "",
        address: "",
        contactNo: "",
        dateOfBirth: "",
      }));
    }
  };

  // ✅ Handle add/remove/change for flowchart dates
  const handleAddDate = (item) => {
    setFormData((prev) => ({
      ...prev,
      [item]: [...(prev[item] || []), ""],
    }));
  };

  const handleDateChange = (item, index, value) => {
    const updated = [...(formData[item] || [])];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [item]: updated }));
  };

  const handleRemoveDate = (item, index) => {
    const updated = [...(formData[item] || [])];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [item]: updated }));
  };

  // ✅ Handle submission per item
  const handleSubmitItem = async (item) => {
    if (!formData.childNo) {
      alert("Please enter a valid Child No before submitting.");
      return;
    }

    try {
      const itemData = {
        childNo: formData.childNo,
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        date: formData.date,
        [item]: formData[item],
      };

      const res = await fetch(
        `http://localhost:5000/api/mflow/${isEditMode ? "update" : "submit"}`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        }
      );

      if (!res.ok) throw new Error("Submission failed");
      await res.json();
      alert(`${item} submitted successfully!`);
    } catch (error) {
      console.error("Submission error:", error.message);
      alert("Submission failed: " + error.message);
    }
  };

  // ✅ Load existing entry in edit mode
  useEffect(() => {
    if (editingEntry) {
      setFormData(sanitizeData(editingEntry));
      setIsEditMode(true);
      setReadOnlyFields(true);
    }
  }, [editingEntry]);

  // ✅ UI Rendering
  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold text-center mb-4">Mathavam Flowchart</h2>

      <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
        <ChildInfoInputs
          formData={formData}
          handleChildNoChange={handleChildNoChange}
          readOnlyFields={readOnlyFields}
        />
        {errorMessage && (
          <p className="text-red-500 mt-2 font-medium">{errorMessage}</p>
        )}
      </div>

      <div className="mt-5 ml-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(sections).map(([section, items]) => (
          <div
            key={section}
            className="border rounded-xl shadow p-7 bg-gray-100 mb-4 max-w-sm"
          >
            <button
              type="button"
              onClick={() => toggleSection(section)}
              className="w-full text-left font-semibold text-xl flex justify-between items-center"
            >
              {section}
              <span>{expandedSections[section] ? "▲" : "▼"}</span>
            </button>

            {expandedSections[section] && (
              <div className="mt-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item}
                    className="border rounded-xl shadow p-4 bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item)}
                      className="w-full text-left font-medium text-blue-700 flex justify-between items-center"
                    >
                      {item}
                      <span>{expandedItems[item] ? "▲" : "▼"}</span>
                    </button>

                    {expandedItems[item] && (
                      <div className="mt-4 space-y-3">
                        {(formData[item] || []).map((date, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="date"
                              value={date}
                              onChange={(e) =>
                                handleDateChange(item, index, e.target.value)
                              }
                              className="p-2 border rounded-md w-full"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveDate(item, index)}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddDate(item)}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md"
                          >
                            Add Date
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitItem(item)}
                            className="mt-2 bg-green-500 text-white px-3 py-1 rounded-md"
                          >
                            Submit {item}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MathavamFlowchart;
