import React, { useState, useEffect } from "react";
import { FaQrcode, FaTimes, FaDownload } from "react-icons/fa";
import QRCode from "qrcode";
import { getAllChildren } from "../../services/qrService";

function ChildManagementPage() {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [selectedChildName, setSelectedChildName] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await getAllChildren();
        setChildren(response.data);
      } catch (err) {
        setError("Failed to fetch children from the server.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleGenerateQr = async (child) => {
    try {
      const qrData = await QRCode.toDataURL(child.childNo, { width: 300 });
      setQrCodeDataUrl(qrData);
      setSelectedChildName(child.name);
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  };

  const sanitizedFileName = `qr-code_${selectedChildName
    .toLowerCase()
    .replace(/\s+/g, "_")}.png`;

  if (isLoading) return <p className="text-center p-8">Loading children...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Child Management & QR Codes
      </h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Child No
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Age
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.childNo}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {child.childNo}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {child.name}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {child.age}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <button
                    onClick={() => handleGenerateQr(child)}
                    className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    <FaQrcode />
                    Generate QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {qrCodeDataUrl && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-2">QR Code Ready</h2>
            <p className="text-gray-500 mb-6">
              Scan or download this QR code for parents to use.
            </p>
            <img
              src={qrCodeDataUrl}
              alt="QR Code preview"
              className="mx-auto"
            />
            <div className="mt-8 flex justify-center gap-4">
              <a
                href={qrCodeDataUrl}
                download={sanitizedFileName}
                className="inline-flex items-center gap-2 bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                <FaDownload />
                Download
              </a>

              <button
                onClick={() => setQrCodeDataUrl("")}
                className="inline-flex items-center gap-2 bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
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
}

export default ChildManagementPage;
