import React, { useEffect, useMemo, useState } from "react";
import {
  FaQrcode,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
} from "react-icons/fa";
import QrScanner from "../../components/QrScanner";
import { getChildByChildNo, createSessionLog } from "../../services/qrService";

function ServiceQrPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionStartAt, setSessionStartAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [completedSessions, setCompletedSessions] = useState([]);

  const [lastAction, setLastAction] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [scannedChild, setScannedChild] = useState(null);

  const loggedInStaff = useMemo(
    () => ({
      id: "staff_123",
      name: "Dr. Anjali",
      service: "Speech Therapy",
    }),
    []
  );

  const handleScanSuccess = async (scannedId) => {
    setShowScanner(false);
    setIsLoading(true);
    setLastAction({ type: "", message: "" });
    setScannedChild(null);

    try {
      const response = await getChildByChildNo(scannedId);
      setScannedChild(response.data);
    } catch (error) {
      if (error?.response?.status === 404) {
        setLastAction({
          type: "error",
          message: "Child ID not found in the system.",
        });
      } else {
        setLastAction({
          type: "error",
          message: "An error occurred while fetching data.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSession = () => {
    if (!scannedChild) return;
    setActiveSession(scannedChild);
    setSessionStartAt(new Date());
    setElapsedSeconds(0);
    setNotes("");
    setScannedChild(null);
    setLastAction({
      type: "success",
      message: `Session started for ${scannedChild.name}.`,
    });
  };

  const handleCancelCheckIn = () => {
    setScannedChild(null);
    setLastAction({ type: "", message: "" });
  };

  useEffect(() => {
    if (!activeSession) return;
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [activeSession]);

  const formatHms = (total) => {
    const h = Math.floor(total / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((total % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(total % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleEndSession = async () => {
    if (!activeSession || !sessionStartAt) return;
    const endedAt = new Date();
    const payload = {
      childNo: activeSession.childNo,
      childName: activeSession.name,
      staffId: loggedInStaff.id,
      staffName: loggedInStaff.name,
      service: loggedInStaff.service,
      startedAt: sessionStartAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds: elapsedSeconds,
      notes: notes?.trim() || "",
    };

    try {
      const res = await createSessionLog(payload);
      const logId = res?.data?._id || crypto.randomUUID();
      setCompletedSessions((list) => [
        {
          id: logId,
          ...payload,
        },
        ...list,
      ]);
      setLastAction({
        type: "success",
        message: "Session ended and saved successfully!",
      });
      setActiveSession(null);
      setSessionStartAt(null);
      setElapsedSeconds(0);
      setNotes("");
    } catch (e) {
      setLastAction({
        type: "error",
        message: "Could not save the session. Please try again.",
      });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            ServiceQR Check-In
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Welcome,{" "}
            <span className="font-semibold text-blue-600">
              {loggedInStaff.name}
            </span>
          </p>
        </header>

        <main className="space-y-8">
          {isLoading ? (
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg border">
              <h2 className="text-xl font-semibold text-gray-600 animate-pulse">
                Looking up ID in database...
              </h2>
            </div>
          ) : scannedChild ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-500">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                Confirm Check-In
              </h2>
              <div className="grid gap-2 text-lg text-gray-600 mb-6">
                <p>
                  <span className="font-semibold">Child No:</span>{" "}
                  {scannedChild.childNo}
                </p>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {scannedChild.name}
                </p>
                <p>
                  <span className="font-semibold">Age:</span> {scannedChild.age}
                </p>
                <p>
                  <span className="font-semibold">Gender:</span>{" "}
                  {scannedChild.gender}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleConfirmSession}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                >
                  Confirm & Start Session
                </button>
                <button
                  onClick={handleCancelCheckIn}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : !activeSession ? (
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg border">
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Ready for the next session?
              </h2>
              <button
                onClick={() => setShowScanner(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-blue-700"
              >
                <FaQrcode />
                Start Session by Scanning
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-emerald-500">
              <div className="flex items-start justify-between flex-col md:flex-row gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Active Session
                  </h2>
                  <p className="text-gray-500">
                    Service:{" "}
                    <span className="font-medium">{loggedInStaff.service}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 text-2xl font-bold text-emerald-700">
                  <FaClock className="w-6 h-6" />
                  <span>{formatHms(elapsedSeconds)}</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6 text-gray-700">
                <div className="p-4 rounded-xl bg-slate-50 border">
                  <p className="text-sm text-gray-500">Child No</p>
                  <p className="text-lg font-semibold">
                    {activeSession.childNo}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-semibold">{activeSession.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border">
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="text-lg font-semibold">{activeSession.age}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-lg font-semibold">
                    {activeSession.gender}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border sm:col-span-2">
                  <p className="text-sm text-gray-500">Started At</p>
                  <p className="text-lg font-semibold">
                    {sessionStartAt?.toLocaleString() || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Session Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Observations, progress, exercises covered..."
                />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleEndSession}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                >
                  End Session & Save
                </button>
                <button
                  onClick={() => {
                    setActiveSession(null);
                    setSessionStartAt(null);
                    setElapsedSeconds(0);
                    setNotes("");
                    setLastAction({
                      type: "error",
                      message: "Session cancelled without saving.",
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel Without Saving
                </button>
              </div>
            </div>
          )}

          {lastAction.message && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                lastAction.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {lastAction.type === "success" ? (
                <FaCheckCircle className="w-5 h-5" />
              ) : (
                <FaExclamationCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{lastAction.message}</span>
            </div>
          )}
        </main>

        {showScanner && (
          <QrScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        )}

        <footer className="mt-16">
          <h3 className="text-2xl font-bold text-gray-700 mb-4">
            Today's Completed Sessions
          </h3>
          <div className="bg-white p-6 rounded-2xl shadow-md border space-y-4">
            {completedSessions.length === 0 ? (
              <p className="text-gray-500">
                Your session history will appear here.
              </p>
            ) : (
              completedSessions.map((s) => (
                <div
                  key={s.id}
                  className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                >
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {s.childName}{" "}
                      <span className="text-gray-500">({s.childNo})</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(s.startedAt).toLocaleTimeString()} -{" "}
                      {new Date(s.endedAt).toLocaleTimeString()} •{" "}
                      {Math.floor(s.durationSeconds / 60)}m{" "}
                      {s.durationSeconds % 60}s
                    </p>
                    {s.notes ? (
                      <p className="text-sm text-gray-600 mt-1">
                        Notes: {s.notes}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {s.service}
                  </span>
                </div>
              ))
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ServiceQrPage;
