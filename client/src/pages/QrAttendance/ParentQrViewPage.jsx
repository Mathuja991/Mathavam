import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";
import { getChildByChildNo } from "../../services/qrService";
import { FaDownload, FaSpinner, FaExclamationCircle } from "react-icons/fa";

function ParentQrViewPage() {
  const { childNo } = useParams();

  const [child, setChild] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childNo) return;

    const fetchDataAndGenerateQr = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getChildByChildNo(childNo);
        const childData = response.data;
        setChild(childData);

        const qrData = await QRCode.toDataURL(childData.childNo, {
          width: 300,
          margin: 2,
        });
        setQrCodeDataUrl(qrData);
      } catch (err) {
        console.error("Failed to fetch child data or generate QR", err);
        setError(
          `Could not find data for Child ID: ${childNo}. Please check the ID.`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataAndGenerateQr();
  }, [childNo]);

  const sanitizedFileName = child
    ? `qr-code_${child.name.toLowerCase().replace(/\s+/g, "_")}.png`
    : "qr-code.png";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <p className="mt-4 text-lg text-gray-600">Loading Child's QR Code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-red-600">
        <FaExclamationCircle className="text-5xl" />
        <p className="mt-4 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Your Child's QR ID
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Present this code to the staff member for quick and easy check-in.
      </p>

      <div className="bg-white p-8 rounded-2xl shadow-2xl inline-block">
        <p className="text-gray-500 mb-6">
          Scan this secure QR code at check-in. 
        </p>
        {qrCodeDataUrl && (
          <img
            src={qrCodeDataUrl}
            alt="Child QR Code"
            className="mx-auto"
          />
        )}

        <a
          href={qrCodeDataUrl}
          download={sanitizedFileName}
          className="mt-8 inline-flex items-center gap-3 bg-blue-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          <FaDownload />
          Download QR Code
        </a>
      </div>
    </div>
  );
}

export default ParentQrViewPage;
