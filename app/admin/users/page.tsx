"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  LoadingSpinner,
  ErrorMessage,
  SuccessMessage,
} from "@/components/shared";

import { User } from "@/lib/types";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users on page load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      setEditingUser(null);
      setSuccess("User updated successfully");
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      setSuccess("User deleted successfully");
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = (user: User) => {
    setEditingUser({
      ...user,
      is_admin: !user.is_admin,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Administration</h1>

      {error && <ErrorMessage message={error} className="mb-4" />}
      {success && <SuccessMessage message={success} className="mb-4" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit User Form */}
        {editingUser && (
          <Card>
            <CardHeader title="Edit User" />
            <CardContent>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editingUser.username || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editingUser.full_name || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        full_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    className="w-full p-2 border rounded"
                    value={editingUser.website || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        website: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_admin"
                    checked={editingUser.is_admin}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        is_admin: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="is_admin">Administrator</label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? <LoadingSpinner text="" /> : "Update User"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingUser(null)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Users List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">User Accounts</h2>
        {loading && !users.length ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border text-left">Username</th>
                  <th className="py-2 px-4 border text-left">Full Name</th>
                  <th className="py-2 px-4 border text-left">Website</th>
                  <th className="py-2 px-4 border text-center">Admin</th>
                  <th className="py-2 px-4 border text-center">Last Updated</th>
                  <th className="py-2 px-4 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{user.username || "-"}</td>
                    <td className="py-2 px-4 border">
                      {user.full_name || "-"}
                    </td>
                    <td className="py-2 px-4 border">
                      {user.website ? (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.website}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      {user.is_admin ? "✅" : "❌"}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      {user.updated_at
                        ? new Date(user.updated_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          className="text-sm py-1 px-2"
                          onClick={() => setEditingUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          className={`text-sm py-1 px-2 ${
                            user.is_admin ? "bg-red-600 hover:bg-red-700" : ""
                          }`}
                          variant={user.is_admin ? "outline" : "secondary"}
                          onClick={() => toggleAdminStatus(user)}
                        >
                          {user.is_admin ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button
                          className="text-sm py-1 px-2 bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-4 px-4 border text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
