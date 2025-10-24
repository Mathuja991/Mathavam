import React, { useEffect, useState } from "react";
import {
  listSessions,
  summaryStats,
  exportCsvUrl,
} from "../../services/adminQrService";

export default function AdminQrAttendance() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const [filters, setFilters] = useState({
    from: thirtyDaysAgo.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
    service: "",
    staffId: "",
    q: "",
    status: "",
  });
  const [kpi, setKpi] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchAll = async () => {
    const [listRes, kpiRes] = await Promise.all([
      listSessions({ ...filters, page, pageSize, sort: "-startedAt" }),
      summaryStats(filters),
    ]);
    setRows(listRes.data.items);
    setTotal(listRes.data.total);
    setKpi(kpiRes.data);
  };

  useEffect(() => {
    fetchAll(); /* eslint-disable-next-line */
  }, [page]);
  useEffect(() => {
    setPage(1);
    fetchAll(); /* eslint-disable-next-line */
  }, [
    filters.from,
    filters.to,
    filters.service,
    filters.staffId,
    filters.q,
    filters.status,
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border grid grid-cols-2 md:grid-cols-6 gap-3">
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          className="border rounded p-2"
        />
        <input
          placeholder="Service"
          value={filters.service}
          onChange={(e) =>
            setFilters((f) => ({ ...f, service: e.target.value }))
          }
          className="border rounded p-2"
        />
        <input
          placeholder="Staff ID"
          value={filters.staffId}
          onChange={(e) =>
            setFilters((f) => ({ ...f, staffId: e.target.value }))
          }
          className="border rounded p-2"
        />
        <input
          placeholder="Search child/staff"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          className="border rounded p-2 col-span-2 md:col-span-1"
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
          className="border rounded p-2"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="text-2xl font-bold">{kpi?.total ?? 0}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Avg Duration</p>
          <p className="text-2xl font-bold">
            {Math.round((kpi?.avgDurationSeconds ?? 0) / 60)} min
          </p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Unique Children</p>
          <p className="text-2xl font-bold">{kpi?.uniqueChildrenCount ?? 0}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-2xl font-bold">
            {filters.from === filters.to
              ? filters.from
              : `${filters.from} → ${filters.to}`}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">End</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Child</th>
              <th className="p-3 text-left">Staff</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">
                  {new Date(r.startedAt).toLocaleString()}
                </td>
                <td className="p-3">{new Date(r.endedAt).toLocaleString()}</td>
                <td className="p-3">
                  {Math.floor(r.durationSeconds / 60)}m {r.durationSeconds % 60}
                  s
                </td>
                <td className="p-3">
                  {r.childName}{" "}
                  <span className="text-gray-500">({r.childNo})</span>
                </td>
                <td className="p-3">
                  {r.staffName}{" "}
                  <span className="text-gray-500">({r.staffId})</span>
                </td>
                <td className="p-3">{r.service}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      r.status === "active"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : r.status === "completed"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {r.status || "completed"}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No sessions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + Export */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          <button
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
          <a
            href={exportCsvUrl({
              from: filters.from,
              to: filters.to,
              service: filters.service,
              staffId: filters.staffId,
              q: filters.q,
              status: filters.status,
            })}
            className="px-3 py-1 border rounded"
          >
            Export CSV
          </a>
        </div>
      </div>
    </div>
  );
}
