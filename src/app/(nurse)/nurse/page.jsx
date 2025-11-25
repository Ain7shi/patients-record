"use client";

import { useState, useEffect } from "react";
import client from "@/api/client";
import useAuth from "@/hooks/useAuth";

export default function NurseDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, recordId: null, comment: "" });

  // 🔵 NEW STATES FOR SEARCH + FILTERS
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState(""); // "Inpatient" | "Outpatient"
  const [filterRoom, setFilterRoom] = useState("");

  const { user } = useAuth();

  const fetchRecords = async () => {
    const { data: session } = await client.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) return;

    const res = await fetch("/api/patients", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setRecords(data);
    } else {
      console.log("Failed to fetch records");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddOrEdit = async () => {
    setLoading(true);
    const { data: session } = await client.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) return;

    const res = await fetch(`/api/patients/${modal.recordId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nurseComment: modal.comment }),
    });

    if (res.ok) {
      fetchRecords();
      setModal({ open: false, recordId: null, comment: "", isEdit: false });
    } else {
      console.error("Failed to save comment");
    }
    setLoading(false);
  };

  const deleteComment = async (recordId) => {
    const token = (await client.auth.getSession()).data.session?.access_token;

    const res = await fetch(`/api/patients/${recordId}/comment`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      fetchRecords();
    } else {
      console.error("Failed to delete comment");
    }
  };

  // 🔵 FILTERED DATA LOGIC
  const filteredRecords = records
    .filter((rec) =>
      rec.patientName?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((rec) => (filterType ? rec.patientType === filterType : true))
    .filter((rec) => (filterRoom ? rec.roomNumber == filterRoom : true));

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Patient Records</h1>
          <button
            onClick={() => client.auth.signOut()}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            Sign Out
          </button>
        </div>


        {/*SEARCH + FILTERS UI */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">

          {/* Search by Name */}
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          />

          {/* Inpatient / Outpatient dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          >
            <option value="">All Types</option>
            <option value="Inpatient">Inpatient</option>
            <option value="Outpatient">Outpatient</option>
          </select>

          {/* Room number dropdown */}
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          >
            <option value="">All Rooms</option>

            {[...new Set(records.map((r) => r.roomNumber))].map(
              (room) =>
                room && (
                  <option key={room} value={room}>
                    Room {room}
                  </option>
                )
            )}
          </select>
        </div>

        {/* Records list */}
        <ul className="space-y-3">
          {filteredRecords.map((rec) => (
            <li
              key={rec.id}
              className="flex justify-between items-start border-b pb-2"
            >
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Patient Name: {rec.patientName}</p>

                {/*NEW DISPLAY FIELDS */}
                <p className="text-sm text-gray-600">
                  Type: {rec.patientType || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Room Number: {rec.roomNumber || "None"}
                </p>

                <p className="text-sm text-gray-600">Patient Chart: {rec.patientChart}</p>
                <p className="text-sm text-gray-600">Patient Medication: {rec.patientMedication}</p>
                <p className="text-sm text-gray-600">Patient History: {rec.patientHistory}</p>

                <p className="text-sm text-gray-500 italic">
                  Nurse Comments: {rec.nurseComment || "No comment yet"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() =>
                    setModal({ open: true, recordId: rec.id, comment: "", isEdit: false })
                  }
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Add Comment
                </button>

                <button
                  onClick={() =>
                    setModal({
                      open: true,
                      recordId: rec.id,
                      comment: rec.nurseComment || "",
                      isEdit: true,
                    })
                  }
                  disabled={!rec.nurseComment}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 disabled:opacity-50"
                >
                  Edit Comment
                </button>

                <button
                  onClick={() => deleteComment(rec.id)}
                  disabled={!rec.nurseComment}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Delete Comment
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Modal */}
        {modal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h2 className="text-lg font-bold mb-4">{modal.isEdit ? "Edit" : "Add"} Comment</h2>
              <textarea
                className="border p-2 rounded w-full mb-4"
                rows={4}
                value={modal.comment}
                onChange={(e) => setModal({ ...modal, comment: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded"
                  onClick={() =>
                    setModal({ open: false, recordId: null, comment: "", isEdit: false })
                  }
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleAddOrEdit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
