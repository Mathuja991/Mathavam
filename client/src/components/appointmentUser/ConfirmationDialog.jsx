import React from "react";

const ConfirmationDialog = ({ handleNoConfirm, handleYesConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Booking?</h3>
          <p className="text-gray-600">
            Are you sure you want to book this appointment? This action cannot be undone.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleNoConfirm}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-bold transition-colors shadow-sm"
          >
            No, Cancel
          </button>
          <button
            onClick={handleYesConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-bold transition-colors shadow-sm"
          >
            Yes, Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;