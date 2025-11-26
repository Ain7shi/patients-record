"use client";

import { useState, useEffect } from "react";
import client from "@/api/client";
import useAuth from "@/hooks/useAuth";

export default function NurseDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [modal, setModal] = useState({ 
    open: false, 
    recordId: null, 
    comment: "", 
    isEdit: false 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const fetchRecords = async () => {
    try {
      const { data: session } = await client.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        console.log("No access token found");
        return;
      }

      const res = await fetch("/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        console.log("Failed to fetch records");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddOrEditComment = async () => {
    if (!modal.comment.trim()) return;
    
    setLoading(true);
    try {
      const { data: session } = await client.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) return;

      // For comments, we'll use a PATCH request to update the nurseComment field
      const res = await fetch(`/api/patients/${modal.recordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          nurseComment: modal.comment,
          updated_by: user.id 
        }),
      });

      if (res.ok) {
        await fetchRecords();
        setModal({ open: false, recordId: null, comment: "", isEdit: false });
      } else {
        console.error("Failed to save comment");
        alert("Failed to save comment. Please try again.");
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("An error occurred while saving the comment.");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (recordId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const { data: session } = await client.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return;

      const res = await fetch(`/api/patients/${recordId}/comment`, {
        method: "PATCH", // or "DELETE" if your backend supports it
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nurseComment: "" }),
      });

      if (res.ok) {
        await fetchRecords();
      } else {
        const errorData = await res.json();
        console.error("Failed to delete comment:", errorData);
        alert("Failed to delete comment. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("An error occurred while deleting the comment.");
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await client.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        alert("Failed to sign out. Please try again.");
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      alert("An error occurred during sign out.");
    } finally {
      setSigningOut(false);
    }
  };

  // Filter records based on search term
  const filteredRecords = records.filter(rec =>
    rec.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.patientChart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.patientMedication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.nurseComment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Patient Records - Nurse Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, Nurse {user?.user_metadata?.name || user?.email}
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Nurse
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                You can view patient records and add comments
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mt-4 md:mt-0"
            >
              {signingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
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
        </div>

        {/* Records List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Try adjusting your search terms" : "No patient records available"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {rec.patientName}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {rec.patientChart && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Chart:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {rec.patientChart}
                            </p>
                          </div>
                        )}
                        
                        {rec.patientMedication && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Medication:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {rec.patientMedication}
                            </p>
                          </div>
                        )}
                      </div>

                      {rec.patientHistory && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Medical History:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {rec.patientHistory}
                          </p>
                        </div>
                      )}

                      {/* Nurse Comments Section */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700">Nurse Comments</h4>
                        </div>
                        
                        {rec.nurseComment ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm text-green-800">Your Comment:</span>
                              <span className="text-xs text-green-600">
                                {rec.updated_at ? new Date(rec.updated_at).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                            <p className="text-sm text-green-700">{rec.nurseComment}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500">No comments added yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:ml-6 lg:w-48">
                      <button
                        onClick={() =>
                          setModal({ 
                            open: true, 
                            recordId: rec.id, 
                            comment: "", 
                            isEdit: false 
                          })
                        }
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                      >
                        Add Comment
                      </button>
                      <button
                        onClick={() =>
                          setModal({ 
                            open: true, 
                            recordId: rec.id, 
                            comment: rec.nurseComment || "", 
                            isEdit: true 
                          })
                        }
                        disabled={!rec.nurseComment}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                      >
                        Edit Comment
                      </button>
                      <button
                        onClick={() => deleteComment(rec.id)}
                        disabled={!rec.nurseComment}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                      >
                        Delete Comment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {modal.isEdit ? "Edit Comment" : "Add Comment"}
            </h2>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 resize-none"
              rows="4"
              placeholder="Enter your comment..."
              value={modal.comment}
              onChange={(e) => setModal({ ...modal, comment: e.target.value })}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setModal({ open: false, recordId: null, comment: "", isEdit: false })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                onClick={handleAddOrEditComment}
                disabled={loading || !modal.comment.trim()}
              >
                {loading ? "Saving..." : "Save Comment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}