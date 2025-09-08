import React from 'react';

const Part3Diagnosis = ({ formData, handleChange, handleNestedChange, nextStep, prevStep }) => {
    // Helper function to safely access nested properties and handle undefined
    const getNestedValue = (obj, path, defaultValue = '') => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex items-center justify-center font-sans">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-10 max-w-5xl w-full my-8 border-t-8 border-blue-600 transform transition-transform duration-300 hover:scale-105">
                {/* Main Title */}
                <h2 className="text-4xl font-extrabold text-center text-blue-800 mb-2 leading-tight">
                    Patient History Form<br />
                    <span className="text-lg font-medium text-blue-600">Part 3: Diagnosis</span>
                </h2>

                {/* Schooling Section */}
                <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                    <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-300">Schooling</h3>
                    <div className="flex flex-col">
                        <label htmlFor="schooling" className="block text-gray-700 text-sm font-medium mb-1">Schooling Details:</label>
                        <textarea
                            id="schooling"
                            name="schooling"
                            value={formData.schooling || ''}
                            onChange={handleChange}
                            rows="3"
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y transition duration-300"
                        ></textarea>
                    </div>
                </div>

                {/* Autism Diagnosis Section */}
                <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                    <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-300">Autism Diagnosis</h3>
                    <div className="flex flex-col mb-4">
                        <label className="flex items-center text-gray-700">
                            <input
                                type="checkbox"
                                name="diagnosedBefore"
                                checked={getNestedValue(formData, 'autismDiagnosis.diagnosedBefore', false)}
                                onChange={(e) => handleNestedChange('autismDiagnosis', e)}
                                className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md transition duration-150 ease-in-out"
                            /> Diagnosed Before?
                        </label>
                    </div>
                    {getNestedValue(formData, 'autismDiagnosis.diagnosedBefore', false) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="flex flex-col">
                                <label htmlFor="ifYesByWhomAndWhere" className="block text-gray-700 text-sm font-medium mb-1">If Yes, By Whom & Where:</label>
                                <input
                                    type="text"
                                    id="ifYesByWhomAndWhere"
                                    name="ifYesByWhomAndWhere"
                                    value={getNestedValue(formData, 'autismDiagnosis.ifYesByWhomAndWhere')}
                                    onChange={(e) => handleNestedChange('autismDiagnosis', e)}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-300"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="anyMedicationsGiven" className="block text-gray-700 text-sm font-medium mb-1">Any Medications Given:</label>
                                <input
                                    type="text"
                                    id="anyMedicationsGiven"
                                    name="anyMedicationsGiven"
                                    value={getNestedValue(formData, 'autismDiagnosis.anyMedicationsGiven')}
                                    onChange={(e) => handleNestedChange('autismDiagnosis', e)}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-300"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Chief Complaints Section */}
                <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                    <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-300">Chief Complaints</h3>
                    <div className="flex flex-col">
                        <label htmlFor="chiefComplaints" className="block text-gray-700 text-sm font-medium mb-1">Chief Complaints (repetitive behaviors/odd behaviors/any other behavioral problems):</label>
                        <textarea
                            id="chiefComplaints"
                            name="chiefComplaints"
                            value={formData.chiefComplaints || ''}
                            onChange={handleChange}
                            rows="3"
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y transition duration-300"
                        ></textarea>
                    </div>
                </div>

                {/* Parent's Expectation Section */}
                <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                    <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-300">Parent's Expectation</h3>
                    <div className="flex flex-col">
                        <label htmlFor="parentsExpectation" className="block text-gray-700 text-sm font-medium mb-1">Parent's Expectation:</label>
                        <textarea
                            id="parentsExpectation"
                            name="parentsExpectation"
                            value={formData.parentsExpectation || ''}
                            onChange={handleChange}
                            rows="3"
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y transition duration-300"
                        ></textarea>
                    </div>
                </div>

                {/* Clinical Diagnosis Section */}
                <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                    <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-300">Clinical Diagnosis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <label htmlFor="dsmIv" className="block text-gray-700 text-sm font-medium mb-1">DSM IV:</label>
                            <input
                                type="text"
                                id="dsmIv"
                                name="dsmIv"
                                value={getNestedValue(formData, 'clinicalDiagnosis.dsmIv')}
                                onChange={(e) => handleNestedChange('clinicalDiagnosis', e)}
                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-300"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="cars" className="block text-gray-700 text-sm font-medium mb-1">CARS:</label>
                            <input
                                type="text"
                                id="cars"
                                name="cars"
                                value={getNestedValue(formData, 'clinicalDiagnosis.cars')}
                                onChange={(e) => handleNestedChange('clinicalDiagnosis', e)}
                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Associated Conditions Section */}
                <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                    <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-300">Associated Conditions</h3>
                    <div className="flex flex-col">
                        <label htmlFor="associatedConditions" className="block text-gray-700 text-sm font-medium mb-1">Associated Conditions (ADHD, Epilepsy etc.):</label>
                        <textarea
                            id="associatedConditions"
                            name="associatedConditions"
                            value={formData.associatedConditions || ''}
                            onChange={handleChange}
                            rows="3"
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y transition duration-300"
                        ></textarea>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={prevStep}
                        className="px-8 py-4 bg-gray-300 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-300 transform hover:-translate-y-1"
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextStep}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:-translate-y-1"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Part3Diagnosis;
