import { useEffect, useState } from "react";
import {
  createResource,
  getResourceById,
  updateResource,
} from "../api/resourceService";

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

const initialForm = {
  name: "",
  type: "LECTURE_HALL",
  capacity: "",
  location: "",
  availabilityStartTime: "",
  availabilityEndTime: "",
  status: "ACTIVE",
};

export default function ResourceForm({ resourceId = null, onSuccess, onCancel }) {
  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = Boolean(resourceId);

  useEffect(() => {
    if (!isEditMode) {
      setFormData(initialForm);
      return;
    }

    const loadResource = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getResourceById(resourceId);
        const resource = response.data;

        setFormData({
          name: resource?.name ?? "",
          type: resource?.type ?? "LECTURE_HALL",
          capacity: resource?.capacity ?? "",
          location: resource?.location ?? "",
          availabilityStartTime: resource?.availabilityStartTime ?? "",
          availabilityEndTime: resource?.availabilityEndTime ?? "",
          status: resource?.status ?? "ACTIVE",
        });
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to load resource.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResource();
  }, [isEditMode, resourceId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      const response = isEditMode
        ? await updateResource(resourceId, payload)
        : await createResource(payload);

      if (onSuccess) {
        onSuccess(response.data);
      }

      if (!isEditMode) {
        setFormData(initialForm);
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to save resource.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Loading resource details...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditMode ? "Edit Resource" : "Add Resource"}</h2>

      {error && <p style={{ color: "#b00020" }}>{error}</p>}

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="type">Type</label>
        <select id="type" name="type" value={formData.type} onChange={handleChange} required>
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="capacity">Capacity</label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          value={formData.capacity}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="availabilityStartTime">Availability Start Time</label>
        <input
          id="availabilityStartTime"
          name="availabilityStartTime"
          type="time"
          value={formData.availabilityStartTime}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="availabilityEndTime">Availability End Time</label>
        <input
          id="availabilityEndTime"
          name="availabilityEndTime"
          type="time"
          value={formData.availabilityEndTime}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          {RESOURCE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Create"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
