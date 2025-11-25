"use client";

import { useState, useEffect } from "react";
import client from "@/api/client";
import useAuth from "@/hooks/useAuth";

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    patientName: "",
    patientChart: "",
    patientMedication: "",
    patientHistory:"",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Your existing functions - unchanged
  const fetchRecords = async () => {
    const { data: session } = await client.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      console.log("No access token found — user may not be logged in.");
      return;
    }

    const res = await fetch("/api/patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

  const { user } = useAuth(); 

  const createRecord = async () => {
    setLoading(true);
    const payload = {
      ...newRecord,
      doctor_id: user.id, 
    };

    const token = (await client.auth.getSession()).data.session?.access_token;

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchRecords();
      setNewRecord({
        patientName: "",
        patientChart: "",
        patientMedication: "",
        patientHistory: "",
      });
    } else {
      console.log("Failed to create record");
    }

    setLoading(false);
  };

  const updateRecord = async (id) => {
  setLoading(true);
  try {
    // Get the auth token
    const { data: session } = await client.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      console.error("No authentication token found");
      setLoading(false);
      return;
    }
    
    const res = await fetch(`/api/patients/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newRecord),
    });
    
    if (res.ok) {
      setEditingId(null);
      setNewRecord({ patientName: "", patientChart: "", patientMedication: "", patientHistory: "" });
      fetchRecords();
    } else {
      console.error("Failed to update");
    }
  } catch (error) {
    console.error("Error updating record:", error);
  } finally {
    setLoading(false);
  }
};

  const deleteRecord = async (id) => {
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (res.ok) fetchRecords();
  };

  // Filter records based on search term
  const filteredRecords = records.filter(rec =>
    rec.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.patientChart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.patientMedication?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Patient Records
              </h1>
              <p className="text-gray-600">
                 Welcome, Doctor {user?.user_metadata?.name || user?.email}
              </p>
              &nsbp
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Doctor
                </span>
            </div>
            <button
              onClick={() => client.auth.signOut()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium mt-4 md:mt-0"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingId ? "Edit Patient Record" : "Add New Patient"}
              </h2>

              {/* Input fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black placeholder-gray-400"
                    type="text"
                    placeholder="Enter patient name"
                    value={newRecord.patientName}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, patientName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Chart
                  </label>
                  <textarea
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black placeholder-gray-400 resize-none"
                    rows="3"
                    placeholder="Enter patient chart details"
                    value={newRecord.patientChart}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, patientChart: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medication
                  </label>
                  <input
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black placeholder-gray-400"
                    type="text"
                    placeholder="Enter current medication"
                    value={newRecord.patientMedication}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, patientMedication: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History
                  </label>
                  <textarea
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black placeholder-gray-400 resize-none"
                    rows="3"
                    placeholder="Enter medical history"
                    value={newRecord.patientHistory}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, patientHistory: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  {editingId ? (
                    <>
                      <button
                        onClick={() => updateRecord(editingId)}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {loading ? "Updating..." : "Update Record"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setNewRecord({
                            patientName: "",
                            patientChart: "",
                            patientMedication: "",
                            patientHistory: "",
                          });
                        }}
                        disabled={loading}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={createRecord}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md"
                    >
                      {loading ? "Saving..." : "Add Record"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Records List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
                  Patient Records ({filteredRecords.length})
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Records list */}
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by creating a new patient record"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {rec.patientName}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                              Active
                            </span>
                          </div>
                          
                          {rec.patientChart && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                <span className="font-medium">Chart:</span> {rec.patientChart}
                              </p>
                            </div>
                          )}
                          
                          {rec.patientMedication && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Medication:</span> {rec.patientMedication}
                              </p>
                            </div>
                          )}
                          
                          {rec.patientHistory && (
                            <div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                <span className="font-medium">History:</span> {rec.patientHistory}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3 sm:mt-0 sm:ml-4">
                          <button
                            onClick={() => {
                              setEditingId(rec.id);
                              setNewRecord({
                                patientName: rec.patientName,
                                patientChart: rec.patientChart,
                                patientMedication: rec.patientMedication,
                                patientHistory: rec.patientHistory,
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteRecord(rec.id)}
                            className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}