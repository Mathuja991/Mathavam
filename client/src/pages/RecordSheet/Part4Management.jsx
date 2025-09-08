import React from 'react';

const Part4Management = ({ formData, handleChange, handleNestedChange, prevStep, handleSubmit, loading, error }) => {
    // Helper function to safely access nested properties and handle undefined
    const getNestedValue = (obj, path, defaultValue = '') => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto my-8">
            {/* Title */}
            <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">
                Patient History Form<br />
                <span className="text-lg font-medium text-blue-600">Part 4: Management</span>
            </h2>

            {/* Management Plan Section */}
            <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                <h3 className="text-2xl font-semibold text-blue-700 mb-6 pb-2 border-b border-blue-300">Management Plan</h3>
                <div className="flex flex-col">
                    <label htmlFor="managementPlan" className="block text-gray-700 text-sm font-medium mb-1">Management Plan:</label>
                    <textarea
                        id="managementPlan"
                        name="managementPlan"
                        value={formData.managementPlan || ''}
                        onChange={handleChange}
                        rows="3"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y transition duration-300"
                    ></textarea>
                </div>
            </div>

            {/* Home Training Recommendations Section */}
            <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                <h3 className="text-2xl font-semibold text-blue-700 mb-6 pb-2 border-b border-blue-300">Home Training Recommendations</h3>
                <div className="flex flex-col">
                    <label htmlFor="homeTrainingRecommendations" className="block text-gray-700 text-sm font-medium mb-1">Therapist's Observation on Assessment and Recommendations:</label>
                    <textarea
                        id="homeTrainingRecommendations"
                        name="homeTrainingRecommendations"
                        value={formData.homeTrainingRecommendations || ''}
                        onChange={handleChange}
                        rows="3"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y transition duration-300"
                    ></textarea>
                </div>
            </div>

            {/* Summary Section */}
            <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                <h3 className="text-2xl font-semibold text-blue-700 mb-6 pb-2 border-b border-blue-300">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="summary" className="block text-gray-700 text-sm font-medium mb-1">Overall Summary:</label>
                        <textarea
                            id="summary"
                            name="summary"
                            value={formData.summary || ''}
                            onChange={handleChange}
                            rows="3"
                            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y transition duration-300"
                        ></textarea>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="presentingComplaintsSummary" className="block text-gray-700 text-sm font-medium mb-1">Presenting Complaints Summary:</label>
                        <textarea
                            id="presentingComplaintsSummary"
                            name="presentingComplaintsSummary"
                            value={formData.presentingComplaintsSummary || ''}
                            onChange={handleChange}
                            rows="3"
                            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y transition duration-300"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Assessment Scores / Details Section */}
            <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                <h3 className="text-2xl font-semibold text-blue-700 mb-6 pb-2 border-b border-blue-300">Assessment Scores / Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="carsScore" className="block text-gray-700 text-sm font-medium mb-1">CARS Score:</label>
                        <input
                            type="number"
                            id="carsScore"
                            name="carsScore"
                            value={formData.carsScore || ''}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-300"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="vinelandSocialMaturityScale" className="block text-gray-700 text-sm font-medium mb-1">Vineland Social Maturity Scale:</label>
                        <input
                            type="text"
                            id="vinelandSocialMaturityScale"
                            name="vinelandSocialMaturityScale"
                            value={formData.vinelandSocialMaturityScale || ''}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Plan Section */}
            <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                <h3 className="text-2xl font-semibold text-blue-700 mb-6 pb-2 border-b border-blue-300">Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center text-gray-700">
                        <input
                            type="checkbox"
                            name="byConPsychiatrist"
                            checked={getNestedValue(formData, 'assessmentPlan.byConPsychiatrist', false)}
                            onChange={(e) => handleNestedChange('assessmentPlan', e)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        /> By Con Psychiatrist
                    </label>
                    <label className="flex items-center text-gray-700">
                        <input
                            type="checkbox"
                            name="byConPediatrician"
                            checked={getNestedValue(formData, 'assessmentPlan.byConPediatrician', false)}
                            onChange={(e) => handleNestedChange('assessmentPlan', e)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        /> By Con Pediatrician
                    </label>
                    <label className="flex items-center text-gray-700">
                        <input
                            type="checkbox"
                            name="bySpeechTherapist"
                            checked={getNestedValue(formData, 'assessmentPlan.bySpeechTherapist', false)}
                            onChange={(e) => handleNestedChange('assessmentPlan', e)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        /> By Speech Therapist
                    </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="flex flex-col">
                        <label htmlFor="dateForHomeVisit" className="block text-gray-700 text-sm font-medium mb-1">Date for Home Visit:</label>
                        <input
                            type="date"
                            id="dateForHomeVisit"
                            name="dateForHomeVisit"
                            value={getNestedValue(formData, 'assessmentPlan.dateForHomeVisit') ? new Date(getNestedValue(formData, 'assessmentPlan.dateForHomeVisit')).toISOString().substring(0, 10) : ''}
                            onChange={(e) => handleNestedChange('assessmentPlan', e)}
                            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-300"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="commencementOfTherapy" className="block text-gray-700 text-sm font-medium mb-1">Commencement of Therapy:</label>
                        <input
                            type="date"
                            id="commencementOfTherapy"
                            name="commencementOfTherapy"
                            value={getNestedValue(formData, 'assessmentPlan.commencementOfTherapy') ? new Date(getNestedValue(formData, 'assessmentPlan.commencementOfTherapy')).toISOString().substring(0, 10) : ''}
                            onChange={(e) => handleNestedChange('assessmentPlan', e)}
                            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Navigation and Submit Buttons */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-200"
                >
                    Previous
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit All Data'}
                </button>
            </div>
            {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        </div>
    );
};

export default Part4Management;
