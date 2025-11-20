import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { 
    FaQrcode, 
    FaDownload, 
    FaTimes, 
    FaEye,
    FaEdit,
    FaTrash,
    FaPlusSquare
} from "react-icons/fa"; 

const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Auth token not found in localStorage');
        return { headers: {} };
    }
    return {
        headers: {
            'x-auth-token': token,
        },
    };
};

const getLoggedInUser = () => {
    const userString = localStorage.getItem('user');
    if (!userString) {
        console.error('Logged in user object not found in localStorage');
        return null;
    }
    try {
        return JSON.parse(userString);
    } catch (e) {
        console.error('Error parsing user from localStorage', e);
        return null;
    }
};

const PatientRecordList = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
    const [selectedChild, setSelectedChild] = useState({ name: "", childNo: "" });

    const [canCRUD, setCanCRUD] = useState(false);

    useEffect(() => {
        const loggedInUser = getLoggedInUser();

        if (loggedInUser && loggedInUser.userType === 'Super Admin') { 
            setCanCRUD(true); 
        }

        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const config = getAuthConfig(); 
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/patientRecords`,
                config 
            );
            
            const loggedInUser = getLoggedInUser();
            if (loggedInUser && loggedInUser.userType === 'Parent' && loggedInUser.childRegNo) {
                const filteredRecords = response.data.filter(
                    record => record.childNo === loggedInUser.childRegNo
                );
                setRecords(filteredRecords);
            } else {
                setRecords(response.data);
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Error fetching patient records:", err);
            if (err.response && err.response.status === 401) {
                setError("Your session has expired. Please log in again.");
            } else {
                setError("Failed to fetch patient records. Please try again later.");
            }
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) {
            return;
        }

        try {
            const config = getAuthConfig();
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/patientRecords/${id}`,
                config
            );
            setRecords(records.filter(record => record._id !== id));
        } catch (err) {
            console.error("Error deleting patient record:", err);
            alert("Failed to delete patient record. Check your permissions and try again.");
        }
    };

    const handleGenerateQr = async (record) => {
        try {
            // Include a public link to the view page
            const viewUrl = `${window.location.origin}/patient-records/${record._id}`;
            const qrData = await QRCode.toDataURL(viewUrl, { width: 300 });
            setQrCodeDataUrl(qrData);
            setSelectedChild({ name: record.name, childNo: record.childNo });
        } catch (err) {
            console.error("Failed to generate QR code", err);
            alert("Failed to generate QR code. Please try again.");
        }
    };

    const sanitizedFileName = selectedChild.name ? `qr-code_${selectedChild.name.toLowerCase().replace(/\s+/g, "_")}.png` : "qr-code.png";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-2xl max-w-7xl mx-auto my-8 min-h-[500px]">
                <svg className="animate-spin h-10 w-10 text-indigo-600 mb-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl font-medium text-gray-700">Loading patient records...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-10 bg-red-50 border-l-4 border-red-500 text-red-700 max-w-3xl mx-auto my-8 rounded-lg shadow-lg">
                <p className="font-semibold text-lg">Error:</p>
                <p>{error}</p>
                <button 
                    onClick={fetchRecords} 
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-4 md:p-8 min-h-screen">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 max-w-7xl mx-auto my-8">
                {/* Header and Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-4xl font-extrabold text-indigo-800 border-b-4 border-indigo-100 pb-2">
                        Patient Records List
                    </h1>
                    {canCRUD && (
                        <Link
                            to="../patient-records/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-300"
                        >
                            <FaPlusSquare className="text-xl" />
                            Add New Record
                        </Link>
                    )}
                </div>

                {/* Records Table */}
                <div className="overflow-x-auto shadow-xl rounded-2xl border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-sm font-bold text-indigo-700 uppercase tracking-wider"
                                >
                                    Child No
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-sm font-bold text-indigo-700 uppercase tracking-wider"
                                >
                                    Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-sm font-bold text-indigo-700 uppercase tracking-wider hidden md:table-cell"
                                >
                                    Age
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-sm font-bold text-indigo-700 uppercase tracking-wider hidden lg:table-cell"
                                >
                                    Date of Assessment
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-center text-sm font-bold text-indigo-700 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {records.length > 0 ? (
                                records.map((record, index) => (
                                    <tr 
                                        key={record._id} 
                                        className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {record.childNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {record.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">
                                            {record.age}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">
                                            {record.dateOfInitialAssessment ? new Date(
                                                record.dateOfInitialAssessment
                                            ).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center space-x-3">
                                            {/* View Button */}
                                            <Link
                                                to={`../patient-records/${record._id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors shadow-sm font-medium"
                                                title="View Record"
                                            >
                                                <FaEye />
                                                <span className="hidden sm:inline">View</span>
                                            </Link>
                                            
                                            {/* Edit Button (Conditional) */}
                                            {canCRUD && (
                                                <>
                                                    <Link
                                                        to={`../patient-records/edit/${record._id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors shadow-sm font-medium"
                                                        title="Edit Record"
                                                    >
                                                        <FaEdit />
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </Link>

                                                    {/* Delete Button (Conditional) */}
                                                    <button
                                                        onClick={() => handleDelete(record._id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors shadow-sm font-medium"
                                                        title="Delete Record"
                                                    >
                                                        <FaTrash />
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </>
                                            )}

                                            {/* QR Code Button */}
                                            <button
                                                onClick={() => handleGenerateQr(record)}
                                                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors shadow-sm font-medium"
                                                title="Generate QR Code"
                                            >
                                                <FaQrcode />
                                                <span className="hidden sm:inline">QR</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-lg text-gray-500">
                                        No patient records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QR Code Modal */}
            {qrCodeDataUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-3xl shadow-3xl p-8 max-w-md w-full transform transition-transform duration-300 scale-100">
                        <h3 className="text-2xl font-bold text-indigo-700 mb-4 border-b pb-2">
                            QR Code for {selectedChild.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Child No: <span className="font-mono font-semibold text-gray-700">{selectedChild.childNo}</span>
                        </p>
                        <img
                            src={qrCodeDataUrl}
                            alt="QR code preview"
                            className="mx-auto mb-6 border-4 border-gray-100 rounded-lg"
                        />
                        <div className="flex justify-center gap-4">
                            <a
                                href={qrCodeDataUrl}
                                download={sanitizedFileName}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition-colors transform hover:scale-[1.03]"
                            >
                                <FaDownload />
                                Download QR
                            </a>
                            <button
                                onClick={() => {
                                    setQrCodeDataUrl("");
                                    setSelectedChild({ name: "", childNo: "" });
                                }}
                                className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-gray-300 transition-colors"
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