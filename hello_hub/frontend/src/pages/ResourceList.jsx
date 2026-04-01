import { useEffect, useState } from "react";
import { deleteResource, getAllResources, searchResources } from "../api/resourceService";
import ResourceForm from "./ResourceForm";
import { useAuth } from "../context/AuthContext";

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

const getStatusStyles = (status) => {
  if (status === "ACTIVE") {
    return {
      backgroundColor: "#e6f4ea",
      color: "#1e7e34",
    };
  }

  return {
    backgroundColor: "#fce8e6",
    color: "#d93025",
  };
};

export default function ResourceList() {
  const { user } = useAuth();
  const canManageResources = user?.role === "ADMIN";
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getAllResources();
      setResources(response.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load resources.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingResourceId(resource.id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingResourceId(null);
    setShowForm(true);
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingResourceId(null);
    await loadResources();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingResourceId(null);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((resource) => resource.id !== id));
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete resource.";
      setError(message);
    }
  };

  const handleSearch = async () => {
    const params = {};

    if (typeFilter) {
      params.type = typeFilter;
    }
    if (locationFilter.trim()) {
      params.location = locationFilter.trim();
    }
    if (capacityFilter !== "") {
      params.capacity = Number(capacityFilter);
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await searchResources(params);
      setResources(response.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to search resources.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page mesh-bg">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <h1>Campus Resources</h1>
            <p>View, filter, and manage resources across the campus.</p>
          </div>
          {canManageResources && (
            <button type="button" className="cta-btn" onClick={handleAdd}>
              + Add Resource
            </button>
          )}
        </div>

        <div className="glass-card" style={{ width: "100%", marginTop: "20px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
            <select
              className="role-chip"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Minimum Capacity"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              style={{
                minWidth: "180px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid var(--outline)",
                background: "#f8fbff",
              }}
            />

            <input
              type="text"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{
                minWidth: "180px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid var(--outline)",
                background: "#f8fbff",
              }}
            />

            <button type="button" className="cta-btn" onClick={handleSearch}>
              Search
            </button>

            <button type="button" className="cta-btn secondary" onClick={loadResources}>
              Clear
            </button>
          </div>

          {isLoading && <p>Loading resources...</p>}

          {error && (
            <p role="alert" style={{ color: "#b91c1c" }}>
              {error}
            </p>
          )}

          {!isLoading && !error && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--outline)" }}>
                    <th style={{ padding: "12px" }}>Name</th>
                    <th style={{ padding: "12px" }}>Type</th>
                    <th style={{ padding: "12px" }}>Capacity</th>
                    <th style={{ padding: "12px" }}>Location</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    {canManageResources && <th style={{ padding: "12px" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr>
                      <td
                        style={{ padding: "12px" }}
                        colSpan={canManageResources ? 6 : 5}
                      >
                        No resources available.
                      </td>
                    </tr>
                  ) : (
                    resources.map((resource) => (
                      <tr key={resource.id} style={{ borderBottom: "1px solid var(--outline)" }}>
                        <td style={{ padding: "12px" }}>{resource.name}</td>
                        <td style={{ padding: "12px" }}>{resource.type}</td>
                        <td style={{ padding: "12px" }}>{resource.capacity}</td>
                        <td style={{ padding: "12px" }}>{resource.location}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              ...getStatusStyles(resource.status),
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            {resource.status}
                          </span>
                        </td>
                        {canManageResources && (
                          <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                            {canManageResources && (
                              <>
                                <button type="button" className="user-nav-link" onClick={() => handleEdit(resource)}>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="user-nav-link"
                                  style={{ color: "#d93025" }}
                                  onClick={() => handleDelete(resource.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {canManageResources && showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
            padding: "16px",
          }}
        >
          <div className="glass-card" style={{ width: "min(700px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <ResourceForm
              resourceId={editingResourceId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

    </div>
  );
}