import React from "react";

const ChildInfoInputs = ({ formData, handleChildNoChange }) => {
  return (
   <div className="bg-blue-50 p-6 rounded-xl">
  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
    <div className="flex items-center space-x-4">
      <label className="font-semibold text-gray-700 whitespace-nowrap w-24" htmlFor="childNo">
        Child No:
      </label>
      <input
        type="text"
        id="childNo"
        name="childNo"
        placeholder="Child No."
        value={formData.childNo}
        onChange={handleChildNoChange}
        className="border p-2 rounded w-48"
      />
    </div>

    <div className="flex items-center space-x-4">
      <label className="font-semibold text-gray-700 whitespace-nowrap w-24" htmlFor="name">
        Name:
      </label>
      <input
        type="text"
        id="name"
        name="name"
        placeholder="Name"
        value={formData.name}
        readOnly
        className="border p-2 rounded bg-gray-100 w-48"
      />
    </div>

    <div className="flex items-center space-x-4">
      <label className="font-semibold text-gray-700 whitespace-nowrap w-24" htmlFor="age">
        Age:
      </label>
      <input
        type="text"
        id="age"
        name="age"
        placeholder="Age"
        value={formData.age}
        readOnly
        className="border p-2 rounded bg-gray-100 w-48"
      />
    </div>

    <div className="flex items-center space-x-4">
      <label className="font-semibold text-gray-700 whitespace-nowrap w-24" htmlFor="gender">
        Gender:
      </label>
      <input
        type="text"
        id="gender"
        name="gender"
        placeholder="Gender"
        value={formData.gender}
        readOnly
        className="border p-2 rounded bg-gray-100 w-48"
      />
    </div>

    {/* Date Field - added inside grid */}
    <div className="flex items-center space-x-4">
      <label className="font-semibold text-gray-700 whitespace-nowrap w-24" htmlFor="date">
        Date:
      </label>
      <input
        type="text"
        id="date"
        name="date"
        placeholder="Date of Test"
        value={formData.date}
        readOnly
        className="border p-2 rounded w-48"
      />
    </div>
  </div>
</div>

  );
};

export default ChildInfoInputs;
