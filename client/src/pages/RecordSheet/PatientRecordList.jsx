import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { FaQrcode, FaDownload, FaTimes } from "react-icons/fa";

const PatientRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [selectedChild, setSelectedChild] = useState({ name: "", childNo: "" });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/patientRecords`
      );
      setRecords(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient records:", err);
      setError("Failed to fetch patient records. Please try again later.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this patient record?")
    ) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/patientRecords/${id}`);
        alert("Patient record deleted successfully!");
        fetchRecords(); // Refresh the list after deletion
      } catch (err) {
        console.error(`Error deleting record with ID ${id}:`, err);
        alert("Failed to delete patient record. Please try again.");
      }
    }
  };

  const handleGenerateQr = async (record) => {
    try {
      const qrData = await QRCode.toDataURL(record.childNo, { width: 300 });
      setQrCodeDataUrl(qrData);
      setSelectedChild({ name: record.name, childNo: record.childNo });
    } catch (err) {
      console.error("Failed to generate QR code", err);
      alert("Failed to generate QR code. Please try again.");
    }
  };

  const sanitizedFileName = selectedChild.name
    ? `qr-code_${selectedChild.name.toLowerCase().replace(/\s+/g, "_")}.png`
    : "qr-code.png";

  if (loading) {
    return (
      <div className="text-center text-xl font-semibold mt-10">
        Loading patient records...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 text-xl font-semibold mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-6xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-center text-blue-800 mb-8 hover:text-blue-600 transition-all duration-300">
        All Patient Records
      </h2>

      <div className="flex flex-wrap justify-end gap-3 mb-4">
        <Link
          to="../manage-children"
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
        >
          <FaQrcode />
          Generate QR
        </Link>
        <Link
          to="../../dashboard/record-sheet"
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
        >
          Add New Record
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No patient records found. Start by adding a new one!
        </p>
      ) : (
        <div className="overflow-x-auto shadow-lg ring-1 ring-gray-200 rounded-lg">
          <table className="min-w-full bg-white border-separate border-spacing-0">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">Child No</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">Contact No</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">Date of Assessment</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record) => (
                <tr
                  key={record._id}
                  className="hover:bg-gray-50 transition-all duration-300 ease-in-out"
                >
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{record.childNo}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{record.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{record.contactNo}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                    {record.dateOfInitialAssessment
                      ? new Date(record.dateOfInitialAssessment).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={`../patient-records/${record._id}`}
                        className="text-blue-600 hover:text-blue-900 transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        View
                      </Link>
                      <Link
                        to={`../patient-records/edit/${record._id}`}
                        className="text-indigo-600 hover:text-indigo-900 transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-900 transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleGenerateQr(record)}
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        <FaQrcode />
                        Generate QR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {qrCodeDataUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
            <h3 className="text-2xl font-bold mb-2">QR Code Ready</h3>
            <p className="text-gray-500 mb-4">
              Scan or download this QR code for caregivers.
            </p>
            <img
              src={qrCodeDataUrl}
              alt="QR code preview"
              className="mx-auto mb-6"
            />
            <div className="flex justify-center gap-4">
              <a
                href={qrCodeDataUrl}
                download={sanitizedFileName}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaDownload />
                Download
              </a>
              <button
                onClick={() => {
                  setQrCodeDataUrl("");
                  setSelectedChild({ name: "", childNo: "" });
                }}
                className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                <FaTimes />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecordList;
