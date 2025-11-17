import React from "react";
import { X } from "lucide-react";

const CancelConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-600" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Appointment?</h3>
          <p className="text-gray-600">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-bold transition-colors shadow-sm"
          >
            No, Keep It
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-bold transition-colors shadow-sm"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmation;