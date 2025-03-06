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
import { AIModel } from "@/lib/types"

export default function ModelsAdminPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [newModel, setNewModel] = useState<Partial<AIModel>>({
    display_name: "",
    api_string: "",
    description: "",
    supports_vision: false,
    supports_thinking: false,
  });

  // Fetch models on page load
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/models");
      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }
      const data = await response.json();
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newModel),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create model");
      }

      // Reset form and refresh models
      setNewModel({
        display_name: "",
        api_string: "",
        description: "",
        supports_vision: false,
        supports_thinking: false,
      });
      setSuccess("Model created successfully");
      fetchModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/models", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingModel),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update model");
      }

      setEditingModel(null);
      setSuccess("Model updated successfully");
      fetchModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/models?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete model");
      }

      setSuccess("Model deleted successfully");
      fetchModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">AI Models Management</h1>

      {error && <ErrorMessage message={error} className="mb-4" />}
      {success && <SuccessMessage message={success} className="mb-4" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Model Form */}
        <Card>
          <CardHeader title="Add New Model" />
          <CardContent>
            <form onSubmit={handleCreateModel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newModel.display_name}
                  onChange={(e) =>
                    setNewModel({ ...newModel, display_name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  API String
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newModel.api_string}
                  onChange={(e) =>
                    setNewModel({ ...newModel, api_string: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={newModel.description}
                  onChange={(e) =>
                    setNewModel({ ...newModel, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="supports_vision"
                    checked={newModel.supports_vision}
                    onChange={(e) =>
                      setNewModel({
                        ...newModel,
                        supports_vision: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="supports_vision">Supports Vision</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="supports_thinking"
                    checked={newModel.supports_thinking}
                    onChange={(e) =>
                      setNewModel({
                        ...newModel,
                        supports_thinking: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="supports_thinking">Supports Thinking</label>
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? <LoadingSpinner text="" /> : "Add Model"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Edit Model Form */}
        {editingModel && (
          <Card>
            <CardHeader title="Edit Model" />
            <CardContent>
              <form onSubmit={handleUpdateModel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editingModel.display_name}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        display_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    API String
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editingModel.api_string}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        api_string: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full p-2 border rounded"
                    value={editingModel.description}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit_supports_vision"
                      checked={editingModel.supports_vision}
                      onChange={(e) =>
                        setEditingModel({
                          ...editingModel,
                          supports_vision: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label htmlFor="edit_supports_vision">
                      Supports Vision
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit_supports_thinking"
                      checked={editingModel.supports_thinking}
                      onChange={(e) =>
                        setEditingModel({
                          ...editingModel,
                          supports_thinking: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label htmlFor="edit_supports_thinking">
                      Supports Thinking
                    </label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? <LoadingSpinner text="" /> : "Update Model"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingModel(null)}
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

      {/* Models List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Available Models</h2>
        {loading && !models.length ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border text-left">Display Name</th>
                  <th className="py-2 px-4 border text-left">API String</th>
                  <th className="py-2 px-4 border text-left">Description</th>
                  <th className="py-2 px-4 border text-center">Vision</th>
                  <th className="py-2 px-4 border text-center">Thinking</th>
                  <th className="py-2 px-4 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{model.display_name}</td>
                    <td className="py-2 px-4 border">{model.api_string}</td>
                    <td className="py-2 px-4 border">{model.description}</td>
                    <td className="py-2 px-4 border text-center">
                      {model.supports_vision ? "✅" : "❌"}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      {model.supports_thinking ? "✅" : "❌"}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          className="text-sm py-1 px-2"
                          onClick={() => setEditingModel(model)}
                        >
                          Edit
                        </Button>
                        <Button
                          className="text-sm py-1 px-2 bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteModel(model.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {models.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 px-4 border text-center text-gray-500"
                    >
                      No models found
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
