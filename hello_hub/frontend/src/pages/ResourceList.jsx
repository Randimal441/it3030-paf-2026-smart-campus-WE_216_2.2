import { useEffect, useState } from "react";
import { deleteResource, getAllResources, searchResources } from "../api/resourceService";

export default function ResourceList() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

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
    // Placeholder for edit navigation/modal behavior.
    console.log("Edit resource", resource);
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
    <div>
      <h2>Campus Resources</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="LECTURE_HALL">LECTURE_HALL</option>
          <option value="LAB">LAB</option>
          <option value="MEETING_ROOM">MEETING_ROOM</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
        </select>

        <input
          type="number"
          min="1"
          placeholder="Minimum Capacity"
          value={capacityFilter}
          onChange={(e) => setCapacityFilter(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />

        <button type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {isLoading && <p>Loading resources...</p>}

      {error && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Type</th>
              <th align="left">Capacity</th>
              <th align="left">Location</th>
              <th align="left">Status</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan={6}>No resources available.</td>
              </tr>
            ) : (
              resources.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.name}</td>
                  <td>{resource.type}</td>
                  <td>{resource.capacity}</td>
                  <td>{resource.location}</td>
                  <td>{resource.status}</td>
                  <td>
                    <button type="button" onClick={() => handleEdit(resource)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(resource.id)} style={{ marginLeft: "8px" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}