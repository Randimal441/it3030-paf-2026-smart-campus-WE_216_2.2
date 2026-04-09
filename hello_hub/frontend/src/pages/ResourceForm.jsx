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
  resourceDate: "",
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
          resourceDate: resource?.resourceDate ?? "",
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <h2>{isEditMode ? "Edit Resource" : "Add Resource"}</h2>

      {error && <p style={{ color: "#b00020" }}>{error}</p>}

      <div>
        <label htmlFor="name" style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }}
          required
        />
      </div>

      <div>
        <label htmlFor="type" style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>
          Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }}
          required
        >
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="capacity" style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>
          Capacity
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          value={formData.capacity}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }}
          required
        />
      </div>

      <div>
        <label htmlFor="location" style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }}
          required
        />
      </div>

      <div>
        <label htmlFor="resourceDate" style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>
          Date
        </label>
        <input
          id="resourceDate"
          name="resourceDate"
          type="date"
          value={formData.resourceDate}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }}
          required
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="availabilityStartTime"
            style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}
          >
            Availability Start Time
          </label>
          <input
            id="availabilityStartTime"
            name="availabilityStartTime"
            type="time"
            value={formData.availabilityStartTime}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }}
            required
          />
        </div>

        <div style={{ flex: 1 }}>
          <label
            htmlFor="availabilityEndTime"
            style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}
          >
            Availability End Time
          </label>
          <input
            id="availabilityEndTime"
            name="availabilityEndTime"
            type="time"
            value={formData.availabilityEndTime}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }}
          required
        >
          {RESOURCE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
        <button type="submit" className="cta-btn" style={{ flex: 1 }} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Create"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="cta-btn secondary"
            style={{ flex: 1 }}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
