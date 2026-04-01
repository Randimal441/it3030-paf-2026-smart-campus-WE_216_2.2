import { useEffect, useState } from "react";
import { deleteResource, getAllResources } from "../api/resourceService";

export default function ResourceList() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div>
      <h2>Campus Resources</h2>

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