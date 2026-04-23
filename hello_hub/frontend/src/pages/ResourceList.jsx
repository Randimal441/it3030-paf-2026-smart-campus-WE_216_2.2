import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteResource, getAllResources, searchResources } from "../api/resourceService";
import ResourceForm from "./ResourceForm";
import { useAuth } from "../context/AuthContext";

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

const resolveResourceDate = (resource) => {
  const dateValue = resource?.resourceDate;
  if (!dateValue) {
    return "";
  }

  if (Array.isArray(dateValue) && dateValue.length === 3) {
    const [year, month, day] = dateValue;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const stringValue = String(dateValue);
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  if (stringValue.length >= 10) {
    return stringValue.slice(0, 10);
  }

  return "";
};

const formatTime = (value) => {
  if (!value) {
    return "-";
  }

  return value.slice(0, 5);
};

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
  const navigate = useNavigate();
  const canManageResources = user?.role === "ADMIN";
  const favoritesStorageKey = `resource-catalogue-favorites:${user?.id || "guest"}`;
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showResourceDetails, setShowResourceDetails] = useState(false);
  const [favoriteResourceIds, setFavoriteResourceIds] = useState(new Set());
  const [showFavoritesList, setShowFavoritesList] = useState(false);
  const [favoritesListResources, setFavoritesListResources] = useState([]);
  const [favoritesListLoading, setFavoritesListLoading] = useState(false);
  const [favoritesListError, setFavoritesListError] = useState("");

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    if (canManageResources) {
      return;
    }

    try {
      const raw = localStorage.getItem(favoritesStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setFavoriteResourceIds(new Set(Array.isArray(parsed) ? parsed : []));
    } catch {
      setFavoriteResourceIds(new Set());
    }
  }, [favoritesStorageKey, canManageResources]);

  useEffect(() => {
    if (canManageResources) {
      return;
    }

    localStorage.setItem(favoritesStorageKey, JSON.stringify(Array.from(favoriteResourceIds)));
  }, [favoriteResourceIds, favoritesStorageKey, canManageResources]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getAllResources();
      const results = response.data || [];
      setResources(results);
      // Auto-select first resource if available
      if (results.length > 0) {
        setSelectedResource(results[0]);
      } else {
        setSelectedResource(null);
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to search resources.";
      setError(message);
      setSelectedResource(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToBooking = (resource = selectedResource) => {
    if (!resource) {
      alert("Please select a resource first");
      return;
    }

    // Navigate to user bookings page with selected resource and its availability details
    const role = user?.role?.toLowerCase() || "student";
    const path = role === "admin" ? "/admin/bookings" : `/${role}/bookings`;
    
    navigate(path, { 
      state: { 
        selectedResource: resource.id, 
        resourceName: resource.name,
        startTime: resource.availabilityStartTime?.slice(0, 5),
        endTime: resource.availabilityEndTime?.slice(0, 5),
        date: resolveResourceDate(resource),
        capacity: resource.capacity
      } 
    });
  };

  const handleStudentRowClick = (resource) => {
    setSelectedResource(resource);
    setShowResourceDetails(true);
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
    if (capacityFilter !== "") {
      params.capacity = Number(capacityFilter);
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await searchResources(params);
      const apiResults = response.data || [];
      const results = dateFilter
        ? apiResults.filter((resource) => resolveResourceDate(resource) === dateFilter)
        : apiResults;
      setResources(results);
      // Auto-select first resource if available
      if (results.length > 0) {
        setSelectedResource(results[0]);
      } else {
        setSelectedResource(null);
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to search resources.";
      setError(message);
      setSelectedResource(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setTypeFilter("");
    setCapacityFilter("");
    setDateFilter("");

    await loadResources();
  };

  const handleToggleFavorite = (resourceId, event) => {
    if (event) {
      event.stopPropagation();
    }

    setFavoriteResourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(resourceId)) {
        next.delete(resourceId);
      } else {
        next.add(resourceId);
      }
      return next;
    });
  };

  const handleOpenFavoritesList = async () => {
    setShowFavoritesList(true);
    setFavoritesListError("");
    setFavoritesListLoading(true);

    try {
      if (favoriteResourceIds.size === 0) {
        setFavoritesListResources([]);
        return;
      }

      const response = await getAllResources();
      const allResources = response.data || [];
      const favoriteResources = allResources.filter((resource) => favoriteResourceIds.has(resource.id));
      setFavoritesListResources(favoriteResources);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load favorite resources.";
      setFavoritesListError(message);
      setFavoritesListResources([]);
    } finally {
      setFavoritesListLoading(false);
    }
  };

  const handleFavoriteItemClick = (resource) => {
    setSelectedResource(resource);
    setShowFavoritesList(false);
    setShowResourceDetails(true);
  };

  return (
    <div className="tickets-page">
      <section className="tickets-hero">
        <div className="tickets-hero-overlay"></div>
        <div className="tickets-hero-content">
          <h1>Campus Resources</h1>
          <p>
            Explore available campus facilities, filter by your needs, and continue to the booking
            flow quickly.
          </p>
        </div>
      </section>

      <section className="tickets-content">
        <aside className="tickets-sidebar" aria-label="Resource filters">
          {canManageResources ? (
            <button type="button" className="raise-ticket-btn" onClick={handleAdd}>
              <span aria-hidden="true">+</span>
              Add Resource
            </button>
          ) : null}

          <div className="tickets-filter-list" role="group" aria-label="Filters">
            <select className="resource-filter-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              className="resource-filter-input"
              type="number"
              min="1"
              placeholder="Minimum Capacity"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            />

            <input
              className="resource-filter-input"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            <button type="button" className="ticket-filter-btn active" onClick={handleSearch}>
              <span>Search</span>
            </button>
            <button type="button" className="ticket-filter-btn" onClick={handleClearFilters}>
              <span>Clear</span>
            </button>
          </div>
        </aside>

        <div className="tickets-main">
          <header className="tickets-main-header resource-catalogue-header">
            <div className="resource-catalogue-header-left">
              <h2>Resource Catalogue</h2>
              <span>{isLoading ? "Loading..." : `${resources.length} shown`}</span>
            </div>
            {!canManageResources && (
              <button
                type="button"
                className="favorite-list-trigger"
                onClick={handleOpenFavoritesList}
                aria-label="View favorite resources"
                title="View favorite resources"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            )}
          </header>

          {isLoading && <div className="ticket-empty-state">Loading resources...</div>}

          {error && (
            <div className="ticket-empty-state" role="alert">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="ticket-card resources-table-card">
              <div className="resources-table-wrap">
                <table className="resources-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      {canManageResources && <th>Capacity</th>}
                      {canManageResources && <th>Location</th>}
                      <th>Status</th>
                      {canManageResources && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {resources.length === 0 ? (
                      <tr>
                        <td colSpan={canManageResources ? 6 : 3}>No resources available.</td>
                      </tr>
                    ) : (
                      resources.map((resource) => (
                        <tr
                          key={resource.id}
                          onClick={() => !canManageResources && handleStudentRowClick(resource)}
                          className={selectedResource?.id === resource.id ? "selected" : ""}
                        >
                          <td>{resource.name}</td>
                          <td>{resource.type}</td>
                          {canManageResources && <td>{resource.capacity}</td>}
                          {canManageResources && <td>{resource.location}</td>}
                          <td>
                            <span
                              className={
                                resource.status === "ACTIVE"
                                  ? "status-badge-active"
                                  : "status-badge-inactive"
                              }
                              style={{
                                ...getStatusStyles(resource.status),
                                padding: "6px 12px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: "700",
                                display: "inline-block",
                              }}
                            >
                              {resource.status}
                            </span>
                          </td>
                          {canManageResources && (
                            <td>
                              <div className="resource-actions">
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
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {!canManageResources && showResourceDetails && selectedResource && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowResourceDetails(false)}
            aria-hidden="true"
          ></div>
          <div className="modal-container resource-detail-modal" role="dialog" aria-modal="true" aria-label="Resource details">
            <div className="modal-header">
              <h2>{selectedResource.name}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowResourceDetails(false)}
                aria-label="Close resource details"
              >
                x
              </button>
            </div>

            <div className="resource-detail-modal-body">
              <p className="resource-detail-modal-subtitle">{selectedResource.type}</p>

              <div className="resource-detail-favorite-row">
                <button
                  type="button"
                  className={`favorite-toggle-btn ${favoriteResourceIds.has(selectedResource.id) ? "active" : ""}`}
                  onClick={(event) => handleToggleFavorite(selectedResource.id, event)}
                  aria-label={favoriteResourceIds.has(selectedResource.id) ? "Remove favorite" : "Add favorite"}
                  title={favoriteResourceIds.has(selectedResource.id) ? "Remove favorite" : "Add favorite"}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>

              <div className="resource-detail-grid">
                <div className="resource-detail-item">
                  <span>Location</span>
                  <strong>{selectedResource.location || "-"}</strong>
                </div>
                <div className="resource-detail-item">
                  <span>Capacity</span>
                  <strong>{selectedResource.capacity ?? "-"}</strong>
                </div>
                <div className="resource-detail-item">
                  <span>Availability</span>
                  <strong>
                    {formatTime(selectedResource.availabilityStartTime)} - {formatTime(selectedResource.availabilityEndTime)}
                  </strong>
                </div>
                <div className="resource-detail-item">
                  <span>Date</span>
                  <strong>{resolveResourceDate(selectedResource) || "-"}</strong>
                </div>
              </div>

              {selectedResource.status === "OUT_OF_SERVICE" ? (
                <button
                  type="button"
                  className="raise-ticket-btn resource-modal-booking-btn resource-modal-sorry-btn"
                  disabled
                >
                  sorry its not available
                </button>
              ) : (
                <button
                  type="button"
                  className="raise-ticket-btn resource-modal-booking-btn"
                  onClick={() => handleGoToBooking(selectedResource)}
                >
                  <span aria-hidden="true">&#8594;</span>
                  Go to Booking
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {!canManageResources && showFavoritesList && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowFavoritesList(false)}
            aria-hidden="true"
          ></div>
          <div className="modal-container resource-detail-modal" role="dialog" aria-modal="true" aria-label="Favorite resources">
            <div className="modal-header">
              <h2>Favorite Resources</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowFavoritesList(false)}
                aria-label="Close favorite resources"
              >
                x
              </button>
            </div>

            <div className="resource-detail-modal-body">
              {favoritesListLoading ? (
                <div className="ticket-empty-state">Loading favorites...</div>
              ) : favoritesListError ? (
                <div className="ticket-empty-state" role="alert">{favoritesListError}</div>
              ) : favoritesListResources.length === 0 ? (
                <div className="ticket-empty-state">No favorites added yet.</div>
              ) : (
                <ul className="favorite-resource-list">
                  {favoritesListResources.map((resource) => (
                    <li key={resource.id}>
                      <button
                        type="button"
                        className="favorite-resource-item"
                        onClick={() => handleFavoriteItemClick(resource)}
                      >
                        <span>{resource.name}</span>
                        <small>{resource.type}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

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