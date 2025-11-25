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

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
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
  }, [user, loading]);

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
    fetchUsers();
  }, []);

  // Create User (SECURE API ROUTE)
  const createUser = async () => {
    const { name, email, type, birthdate, employeeId, password } = newUser;

    if (!name || !email || !type || !birthdate || !employeeId || !password) {
      alert("All fields are required.");
      return;
    }

    // Add status
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
    console.log(userPayload.status);
    fetchUsers();
  };

  // Toggle active status (SECURE API ROUTE)
  const toggleUserStatus = async (u) => {
  console.log("Button clicked for user:", u);

  // Determine new status
  const newStatus = u.user_metadata.status === "Active" ? "Inactive" : "Active";
    console.log("New status:", newStatus);

    try {
      const res = await fetch("/api/admin/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, status: newStatus }),
      });

      const data = await res.json();
      console.log("Toggle response:", data);

      if (!res.ok) {
        console.error("Failed to toggle user status");
        alert("Toggle failed");
        return;
      }

      // Refresh users to update UI
      fetchUsers();
    } catch (err) {
      console.error("Unexpected error during toggle:", err);
      alert("An error occurred");
    }
  };

  // Delete user (SECURE API ROUTE)
  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

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
    <div className="min-h-screen bg-gray-100 text-black p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <h2>Welcome, {user.user_metadata?.name}!</h2>
        <p className="text-gray-600 mb-6">Manage doctors, nurses, and system users.</p>

        <button
          onClick={() => setModalOpen(true)}
          className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Add User
        </button>

        <table className="w-full border text-left text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2 border">{u.user_metadata?.name || "N/A"}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.user_metadata?.type || "unknown"}</td>
                <td className="p-2 border">{new Date(u.created_at).toLocaleDateString()}</td>

                <td className="p-2 border text-center">
                  {/* <button
                    onClick={() => toggleUserStatus(u)}
                    className={`px-3 py-1 rounded text-white ${
                      u.user_metadata.status === "Inactive" ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {u.user_metadata.status === "Inactive" ? "Inactive" : "Active"}
                  </button> */}
                  <button
                    onClick={() => setConfirmModal({ open: true, action: "toggle", user: u })}
                    className={`px-3 py-1 rounded text-white ${
                      u.user_metadata.status === "Inactive" ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {u.user_metadata.status === "Inactive" ? "Inactive" : "Active"}
                  </button>
                </td>

                <td className="p-2 border text-center">
                  {/* <button
                    onClick={() => deleteUser(u.id)}
                    className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-black"
                  >
                    Delete
                  </button> */}
                  <button
                    onClick={() => setConfirmModal({ open: true, action: "delete", user: u })}
                    className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-black"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h2 className="text-lg font-bold mb-4">Register New User</h2>

              <div className="flex flex-col gap-3">
                <input
                  className="border p-2 rounded"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />

                <input
                  className="border p-2 rounded"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />

                <select
                  className="border p-2 rounded"
                  value={newUser.type}
                  onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
                >
                  <option value="">Select role</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="admin">Admin</option>
                </select>

                <input
                  type="date"
                  className="border p-2 rounded"
                  value={newUser.birthdate}
                  onChange={(e) => setNewUser({ ...newUser, birthdate: e.target.value })}
                />

                <input
                  className="border p-2 rounded"
                  placeholder="Employee ID"
                  value={newUser.employeeId}
                  onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                />

                <input
                  type="password"
                  className="border p-2 rounded"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 border rounded" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={createUser}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h2 className="text-lg font-bold mb-4">
                {confirmModal.action === "delete" ? "Delete User" : "Toggle User Status"}
              </h2>
              <p className="mb-4">
                Please enter your admin password to confirm this action for user{" "}
                <strong>{confirmModal.user.user_metadata?.name}</strong>.
              </p>

              <input
                type="password"
                className="border p-2 rounded w-full mb-4"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded"
                  onClick={() => {
                    setConfirmModal({ open: false, action: null, user: null });
                    setAdminPassword("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={async () => {
                    // Here we verify password (can call your backend API)
                    const { error } = await client.auth.signInWithPassword({
                      email: user.user_metadata?.email,
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
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          className="mt-6 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          onClick={() => client.auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
