"use client";

import { useEffect, useState } from "react";
import client from "@/api/client";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    user: null,
  });
  const [adminPassword, setAdminPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    type: "",
    birthdate: "",
    employeeId: "",
    password: "",
  });

  // Protect the page so only admin can enter
  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      if (user?.user_metadata?.type !== "admin") router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Get list of users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
      } else {
        console.error("Admin fetch error:", data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (user && user.user_metadata?.type === "admin") {
      fetchUsers();
    }
  }, [user]);

  const filteredUsers = users.filter(u => 
    u.user_metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.user_metadata?.status === "Active").length,
    doctors: users.filter(u => u.user_metadata?.type === "doctor").length,
    nurses: users.filter(u => u.user_metadata?.type === "nurse").length
  };

  // Create User (SECURE API ROUTE)
  const createUser = async () => {
    const { name, email, type, birthdate, employeeId, password } = newUser;

    if (!name || !email || !type || !birthdate || !employeeId || !password) {
      alert("All fields are required.");
      return;
    }

    const userPayload = { ...newUser, status: "Active" };

    const res = await fetch("/api/admin/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });

    if (!res.ok) {
      console.error("Failed to create user");
      alert("Failed to create user");
      return;
    }

    setModalOpen(false);
    setNewUser({
      name: "",
      email: "",
      type: "",
      birthdate: "",
      employeeId: "",
      password: "",
    });
    fetchUsers();
  };

  // Toggle active status (SECURE API ROUTE)
  const toggleUserStatus = async (u) => {
    const newStatus = u.user_metadata.status === "Active" ? "Inactive" : "Active";

    try {
      const res = await fetch("/api/admin/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, status: newStatus }),
      });

      if (!res.ok) {
        console.error("Failed to toggle user status");
        alert("Toggle failed");
        return;
      }

      fetchUsers();
    } catch (err) {
      console.error("Unexpected error during toggle:", err);
      alert("An error occurred");
    }
  };

  // Delete user (SECURE API ROUTE)
  const deleteUser = async (id) => {
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      console.error("Failed to delete user");
      alert("Delete failed");
      return;
    }

    fetchUsers();
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Healthcare Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.user_metadata?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={() => client.auth.signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.name?.split(" ")[1] || user.user_metadata?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your team today. You can manage user accounts, monitor activity, and keep everything running smoothly.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500 mt-1">Total Users</p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-gray-500 mt-1">Active</p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.doctors}</p>
                <p className="text-sm text-gray-500 mt-1">Doctors</p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600">{stats.nurses}</p>
                <p className="text-sm text-gray-500 mt-1">Nurses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your healthcare team and their access</p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Add New User</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-4 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {u.user_metadata?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.user_metadata?.name || "N/A"}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        u.user_metadata?.type === "doctor" 
                          ? "bg-purple-100 text-purple-700"
                          : u.user_metadata?.type === "nurse"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {u.user_metadata?.type?.charAt(0).toUpperCase() + u.user_metadata?.type?.slice(1) || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(u.created_at).toLocaleDateString("en-US", { 
                        month: "short", 
                        day: "numeric", 
                        year: "numeric" 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmModal({ open: true, action: "toggle", user: u })}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          u.user_metadata?.status === "Active"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          u.user_metadata?.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}></span>
                        {u.user_metadata?.status || "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setConfirmModal({ open: true, action: "delete", user: u })}
                        className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-500">No users found matching your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Team Member</h2>
              <p className="text-sm text-gray-500 mt-1">Create a new account for a healthcare professional</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
                  placeholder="e.g., John Smith"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
                  placeholder="john.smith@hospital.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  value={newUser.type}
                  onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
                >
                  <option value="">Select a role</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                    value={newUser.birthdate}
                    onChange={(e) => setNewUser({ ...newUser, birthdate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
                    placeholder="EMP001"
                    value={newUser.employeeId}
                    onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
                  placeholder="Create a secure password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                onClick={createUser}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {confirmModal.action === "delete" ? "Delete User Account" : "Change User Status"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">This action requires admin verification</p>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                You're about to {confirmModal.action === "delete" ? "permanently delete" : "change the status of"}{" "}
                <strong>{confirmModal.user?.user_metadata?.name}</strong>. Please enter your admin password to confirm.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                onClick={() => {
                  setConfirmModal({ open: false, action: null, user: null });
                  setAdminPassword("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                onClick={async () => {
                  if (!adminPassword) {
                    alert("Please enter your admin password");
                    return;
                  }

                  // Verify admin password
                  const { error } = await client.auth.signInWithPassword({
                    email: user.email,
                    password: adminPassword,
                  });

                  if (error) {
                    alert("Incorrect admin password");
                    return;
                  }

                  if (confirmModal.action === "delete") {
                    await deleteUser(confirmModal.user.id);
                  } else if (confirmModal.action === "toggle") {
                    await toggleUserStatus(confirmModal.user);
                  }

                  setConfirmModal({ open: false, action: null, user: null });
                  setAdminPassword("");
                }}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}