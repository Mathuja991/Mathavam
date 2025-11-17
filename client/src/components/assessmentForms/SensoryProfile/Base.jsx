import { useState, useEffect } from "react";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  "http://localhost:5000/api";

function formatIsoToDisplay(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
}

function parseDisplayToIso(displayDate) {
  if (!displayDate) return "";
  const parts = displayDate.includes("/")
    ? displayDate.split("/")
    : displayDate.split("-");
  if (parts.length !== 3) return "";
  let [day, month, year] = parts.map((p) => p.trim());
  if (!day || !month || !year) return "";
  if (year.length === 2) {
    year = Number(year) > 50 ? `19${year}` : `20${year}`;
  }
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;
}

const getLocalDateIso = (value) => {
  const dateObj =
    value instanceof Date ? value : value ? new Date(value) : new Date();
  if (Number.isNaN(dateObj.getTime())) return "";
  const timezoneOffset = dateObj.getTimezoneOffset() * 60000;
  const adjusted = new Date(dateObj.getTime() - timezoneOffset);
  return adjusted.toISOString().split("T")[0];
};

function Base({ onDataChange, initialData }) {
  const today = getLocalDateIso(); // Format: YYYY-MM-DD
  const defaultTestIso = initialData?.testDate
    ? getLocalDateIso(new Date(initialData.testDate))
    : today;
  const defaultDobIso = initialData?.dateOfBirth
    ? getLocalDateIso(new Date(initialData.dateOfBirth))
    : "";

  const [patientData, setPatientData] = useState(() => {
    if (initialData) {
      return {
        patientId: initialData.patientId,
        testDate: defaultTestIso,
        dateOfBirth: defaultDobIso,
        examinerId: initialData.examinerId,
        //examinerName: initialData.examinerName,
        //examinerProfession: initialData.examinerProfession,
        //caregiverName: initialData.caregiverName,
        //caregiverRelation: initialData.caregiverRelation,
        //level: initialData.level,
        //morethan3: initialData.morethan3,
        //check the need for this in the form???
      };
    }

    return {
      patientId: "",
      testDate: today, // Initialize with today's date
      dateOfBirth: "",
      examinerId: "",
      examinerName: "",
      examinerProfession: "",
      caregiverName: "",
      caregiverRelation: "",
      level: "",
      morethan3: "",
    };
  });

  const [displayDates, setDisplayDates] = useState(() => ({
    testDate: formatIsoToDisplay(
      initialData ? defaultTestIso : today
    ),
    dateOfBirth: formatIsoToDisplay(
      initialData ? defaultDobIso : ""
    ),
  }));

  const [ageData, setAgeData] = useState({
    years: "",
    months: "",
    totalMonths: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "testDate") {
      setDisplayDates((prev) => ({ ...prev, testDate: value }));
      const isoValue = parseDisplayToIso(value);
      const limitedIso = isoValue && isoValue > today ? today : isoValue;
      setPatientData((prev) => {
        const shouldResetDob =
          prev.dateOfBirth && limitedIso && prev.dateOfBirth > limitedIso;
        return {
          ...prev,
          [name]: limitedIso,
          dateOfBirth: shouldResetDob ? "" : prev.dateOfBirth,
        };
      });
      return;
    }

    if (name === "dateOfBirth") {
      setDisplayDates((prev) => ({ ...prev, dateOfBirth: value }));
      const isoValue = parseDisplayToIso(value);
      const limitedIso =
        isoValue &&
        patientData.testDate &&
        isoValue > patientData.testDate
          ? patientData.testDate
          : isoValue;
      setPatientData((prev) => ({
        ...prev,
        [name]: limitedIso,
      }));
      return;
    }

    setPatientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  useEffect(() => {
    let calculatedMonths = null;

    if (patientData.testDate && patientData.dateOfBirth) {
      const testDate = new Date(patientData.testDate);
      const birthDate = new Date(patientData.dateOfBirth);

      if (!isNaN(testDate) && !isNaN(birthDate) && birthDate <= testDate) {
        let years = testDate.getFullYear() - birthDate.getFullYear();
        let months = testDate.getMonth() - birthDate.getMonth();

        if (months < 0) {
          years--;
          months += 12;
        }
        if (testDate.getDate() < birthDate.getDate()) {
          months--;
          if (months < 0) {
            years--;
            months += 12;
          }
        }

        const totalMonths = years * 12 + months;
        calculatedMonths = totalMonths; // Store the calculated age

        setAgeData({ years, months, totalMonths });
      } else {
        setAgeData({ years: "", months: "", totalMonths: null });
      }
    }

    onDataChange(
      calculatedMonths,
      patientData.patientId,
      patientData.examinerId,
      patientData.testDate
    );
  }, [
    patientData.testDate,
    patientData.dateOfBirth,
    patientData.patientId,
    patientData.examinerId,
    onDataChange,
  ]);

  useEffect(() => {
    setDisplayDates((prev) => {
      const formatted = formatIsoToDisplay(patientData.testDate);
      if (prev.testDate === formatted) return prev;
      return { ...prev, testDate: formatted };
    });
  }, [patientData.testDate]);

  useEffect(() => {
    setDisplayDates((prev) => {
      const formatted = formatIsoToDisplay(patientData.dateOfBirth);
      if (prev.dateOfBirth === formatted) return prev;
      return { ...prev, dateOfBirth: formatted };
    });
  }, [patientData.dateOfBirth]);

  useEffect(() => {
    const childNo = patientData.patientId?.trim();
    if (!childNo) return;

    let isActive = true;

    const fetchDob = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/patientRecords/child/${encodeURIComponent(childNo)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const dobIso = data?.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().split("T")[0]
          : "";
        if (dobIso && isActive) {
          setPatientData((prev) => {
            if (prev.dateOfBirth === dobIso) return prev;
            return {
              ...prev,
              dateOfBirth: dobIso,
            };
          });
        }
      } catch (err) {
        if (isActive) {
          console.error("DOB lookup failed", err);
        }
      }
    };

    fetchDob();

    return () => {
      isActive = false;
    };
  }, [patientData.patientId]);

  // Determine which form title to show based on age
  const getFormTitle = () => {
    const { totalMonths } = ageData;

    if (totalMonths === null) {
      return {
        title: "Sensory Profile Assessment",
        subtitle:
          "Please enter test date and date of birth to get the correct form",
        ageRange: "Valid ranges: 7-35 months or 3:0-14:11 years",
      };
    } else if (totalMonths >= 36 && totalMonths <= 179) {
      return {
        title: "Child Sensory Profile-2",
        subtitle: "Caregiver Questionnaire",
        ageRange: "Ages 3:0 to 14:11 years",
      };
    } else if (totalMonths >= 7 && totalMonths <= 35) {
      return {
        title: "Toddler Sensory Profile",
        subtitle: "Caregiver Questionnaire",
        ageRange: "Ages 7 to 35 months",
      };
    } else {
      return {
        title: "Sensory Profile Assessment",
        subtitle: "Age outside supported range",
        ageRange: "Valid ranges: 7-35 months or 3:0-14:11 years",
      };
    }
  };

  const formInfo = getFormTitle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-pink-100 p-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          {formInfo.title}
        </h1>
        <h2 className="text-xl text-center text-gray-700 mb-1">
          {formInfo.subtitle}
        </h2>
        <h3 className="text-md text-center text-gray-500 mb-6">
          {formInfo.ageRange}
        </h3>

        <div className="space-y-4">
          {/* Patient ID */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="patientID"
              className="w-64 text-sm font-medium text-gray-700 text-left"
            >
              Child ID
            </label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={patientData.patientId}
              onChange={handleChange}
              required
              className="flex-1 p-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          {/* Test Date */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="testDate"
              className="w-64 text-sm font-medium text-gray-700 text-left"
            >
              Assessment Date
            </label>
            <input
              type="text"
              id="testDate"
              name="testDate"
              value={displayDates.testDate}
              onChange={handleChange}
              required
              placeholder="dd-mm-yyyy"
              className="flex-1 p-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          {/* Date of Birth */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="dateOfBirth"
              className="w-64 text-sm font-medium text-gray-700 text-left"
            >
              Date of Birth
            </label>
            <input
              type="text"
              id="dateOfBirth"
              name="dateOfBirth"
              value={displayDates.dateOfBirth}
              onChange={handleChange}
              required
              placeholder="dd-mm-yyyy"
              className="flex-1 p-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          {/* Remaining fields */}
          {[
            {
              id: "examinerId",
              label: "Therapist ID",
              type: "text",
            },
            ,
            {
              id: "examinerName",
              label: "Therapist Name",
              type: "text",
            },
            {
              id: "examinerProfession",
              label: "Therapist's Speciality",
              type: "text",
            },
            { id: "caregiverName", label: "Caregiver's Name", type: "text" },
            {
              id: "caregiverRelation",
              label: "Relationship to Child",
              type: "text",
            },
            { id: "level", label: "Level", type: "number" },
          ].map((field) => (
            <div className="flex items-center gap-4" key={field.id}>
              <label
                htmlFor={field.id}
                className="w-64 text-sm font-medium text-gray-700 text-left"
              >
                {field.label}
              </label>
              <input
                type={field.type}
                id={field.id}
                name={field.id}
                value={patientData[field.id]}
                onChange={handleChange}
                required
                className="flex-1 p-2 border border-gray-300 rounded-md text-black"
              />
            </div>
          ))}

          {/* Calculated Age Display */}
          {ageData.totalMonths !== null && (
            <div className="flex items-center gap-4">
              <div className="w-64 text-sm font-medium text-gray-700 text-left">
                Child's Age (Calculated)
              </div>
              <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                <span className="font-medium text-blue-600">
                  {ageData.years} years, {ageData.months} months
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({ageData.totalMonths} total months)
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have there been more than three children between the ages of birth
              through 18 years in your household in the past 12 months?
            </label>
            <div className="flex gap-6 ml-64">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  id="yes"
                  name="morethan3"
                  value="yes"
                  checked={patientData.morethan3 === "yes"}
                  onChange={handleChange}
                  required
                  className="text-blue-600"
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  id="no"
                  name="morethan3"
                  value="no"
                  checked={patientData.morethan3 === "no"}
                  onChange={handleChange}
                  required
                  className="text-blue-600"
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Base;
