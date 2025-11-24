import React, { useState, useEffect, useCallback } from 'react';

const InputGroup = React.memo(({ label, id, name, type, value, onChange, required = false, readOnly = false }) => (
    <div className="flex flex-col">
        <label htmlFor={id} className="block text-sm font-semibold text-blue-900 mb-2">{label}</label>
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            readOnly={readOnly}
            className={`w-full rounded-lg px-4 py-3 text-gray-800 bg-white/70 border-2 border-blue-200
                  focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-blue-400
                  transition-all duration-300 ease-in-out shadow-sm hover:border-blue-300
                  ${readOnly ? 'bg-gray-200 cursor-not-allowed' : ''}`}
        />
    </div>
));

const Section = ({ title, children, className = "" }) => (
    <div className={`bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border-l-4 border-blue-400
                    hover:shadow-2xl transition-all duration-300 ease-in-out ${className}`}>
        <h3 className="text-3xl font-bold text-blue-900 mb-6 border-b pb-2 border-blue-200">
            {title}
        </h3>
        {children}
    </div>
);

const Part1PatientInfoAuto = ({ formData, handleChange, nextStep }) => {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        if (!formData.dateOfInitialAssessment) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            handleChange({ target: { name: 'dateOfInitialAssessment', value: formattedDate } });
        }
    }, [formData.dateOfInitialAssessment, handleChange]);

    const handleLocalChange = useCallback((e) => {
        const { name, value } = e.target;

        if (name === 'dateOfBirth' && value) {
            const today = new Date();
            const dob = new Date(value);
            let age = today.getFullYear() - dob.getFullYear();
            const monthDifference = today.getMonth() - dob.getMonth();
            const dayDifference = today.getDate() - dob.getDate();

            if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
                age--;
            }

            handleChange({ target: { name: 'dateOfBirth', value: value } });
            handleChange({ target: { name: 'age', value: age.toString() } });
        } else {
            handleChange(e);
        }
    }, [handleChange]);

    const localNextStep = () => {
        if (nextStep) {
            nextStep();
        }
    };

    const closeSuccessMessage = () => {
        setShowSuccessMessage(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-sans">
            <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl my-10 font-sans text-gray-800 animate-fade-in-up">
                <style>
                    {`
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.5s ease-out;
            }
          `}
                </style>
                <h2 className="text-4xl font-extrabold text-center text-indigo-900 mb-8 tracking-tight leading-tight">
                    Patient Information Form (Auto ID)
                </h2>

                <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                    {/* Patient Information Section */}
                    <Section title="Patient Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                            <InputGroup
                                label="Child No (Auto-Generated):"
                                id="childNo"
                                name="childNo"
                                type="text"
                                value={formData.childNo || ''}
                                onChange={handleChange}
                                required
                                readOnly={true} // Set to readOnly
                            />
                            <InputGroup
                                label="Name:"
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name || ''}
                                onChange={handleChange}
                                required
                            />
                            <InputGroup
                                label="Contact No:"
                                id="contactNo"
                                name="contactNo"
                                type="text"
                                value={formData.contactNo || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col mb-4">
                            <InputGroup
                                label="Address:"
                                id="address"
                                name="address"
                                type="text"
                                value={formData.address || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputGroup
                                label="GN Division:"
                                id="gnDiv"
                                name="gnDiv"
                                type="text"
                                value={formData.gnDiv || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Referred By:"
                                id="referredBy"
                                name="referredBy"
                                type="text"
                                value={formData.referredBy || ''}
                                onChange={handleChange}
                            />
                            <div className="flex flex-col">
                                <label htmlFor="gender" className="block text-sm font-semibold text-blue-900 mb-2">Gender:</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg px-4 py-3 text-gray-800 bg-white/70 border-2 border-blue-200 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-blue-400 transition-all duration-300 ease-in-out shadow-sm hover:border-blue-300"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <InputGroup
                                label="Date of Initial Assessment:"
                                id="dateOfInitialAssessment"
                                name="dateOfInitialAssessment"
                                type="date"
                                value={formData.dateOfInitialAssessment || ''}
                                onChange={handleChange}
                                readOnly
                            />
                            <InputGroup
                                label="Date of Birth:"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth || ''}
                                onChange={handleLocalChange}
                            />
                            <InputGroup
                                label="Age:"
                                id="age"
                                name="age"
                                type="number"
                                value={formData.age || ''}
                                onChange={handleChange}
                                readOnly
                            />
                        </div>
                    </Section>

                    {/* Parent Information Section */}
                    <Section title="Parent Details">
                        {/* Mother's Details */}
                        <h4 className="text-xl font-medium text-blue-800 mb-4 mt-6 border-b pb-2 border-blue-200">Mother's Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <InputGroup
                                label="Name:"
                                id="motherName"
                                name="motherName"
                                type="text"
                                value={formData.motherName || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Age:"
                                id="motherAge"
                                name="motherAge"
                                type="number"
                                value={formData.motherAge || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Qualification:"
                                id="motherQualification"
                                name="motherQualification"
                                type="text"
                                value={formData.motherQualification || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Occupation:"
                                id="motherOccupation"
                                name="motherOccupation"
                                type="text"
                                value={formData.motherOccupation || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Telephone No:"
                                id="motherTelephoneNo"
                                name="motherTelephoneNo"
                                type="text"
                                value={formData.motherTelephoneNo || ''}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Father's Details */}
                        <h4 className="text-xl font-medium text-blue-800 mb-4 mt-6 border-b pb-2 border-blue-200">Father's Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputGroup
                                label="Name:"
                                id="fatherName"
                                name="fatherName"
                                type="text"
                                value={formData.fatherName || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Age:"
                                id="fatherAge"
                                name="fatherAge"
                                type="number"
                                value={formData.fatherAge || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Qualification:"
                                id="fatherQualification"
                                name="fatherQualification"
                                type="text"
                                value={formData.fatherQualification || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Occupation:"
                                id="fatherOccupation"
                                name="fatherOccupation"
                                type="text"
                                value={formData.fatherOccupation || ''}
                                onChange={handleChange}
                            />
                            <InputGroup
                                label="Telephone No:"
                                id="fatherTelephoneNo"
                                name="fatherTelephoneNo"
                                type="text"
                                value={formData.fatherTelephoneNo || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </Section>

                    {/* General Diagnosis Section */}
                    <Section title="Diagnosis">
                        <InputGroup
                            label="General Diagnosis:"
                            id="diagnosis"
                            name="diagnosis"
                            type="text"
                            value={formData.diagnosis || ''}
                            onChange={handleChange}
                        />
                        <div className="flex flex-col mt-6">
                            <label htmlFor="reasonForReferral" className="block text-sm font-semibold text-blue-900 mb-2">Reason for Referral:</label>
                            <textarea
                                id="reasonForReferral"
                                name="reasonForReferral"
                                value={formData.reasonForReferral || ''}
                                onChange={handleChange}
                                rows="4"
                                className="w-full rounded-lg px-4 py-3 text-gray-800 bg-white/70 border-2 border-blue-200
                            focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-blue-400
                            transition-all duration-300 ease-in-out shadow-sm hover:border-blue-300 resize-y"
                            ></textarea>
                        </div>
                    </Section>

                    <div className="flex justify-end mt-12">
                        <button
                            type="button"
                            onClick={localNextStep}
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-4 px-12 rounded-full shadow-2xl
                          hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 active:scale-95
                          transition-all duration-300 ease-in-out text-base tracking-wide
                          focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white"
                        >
                            Next →
                        </button>
                    </div>
                </form>
            </div>
            {showSuccessMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm w-full transform transition-all duration-300 scale-100">
                        <h3 className="text-2xl font-bold text-green-600 mb-4">
                            Form Submitted Successfully!
                        </h3>
                        <p className="text-gray-700 mb-6">
                            Your patient information has been successfully processed.
                        </p>
                        <button
                            onClick={closeSuccessMessage}
                            className="bg-green-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Part1PatientInfoAuto;
