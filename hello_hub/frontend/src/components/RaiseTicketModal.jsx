import React, { useState } from "react";
import api from "../api/axiosClient";

export default function RaiseTicketModal({ isOpen, onClose, onTicketCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    priority: "NORMAL",
    location: "",
    contact: "",
  });

  const [uploadedImageFiles, setUploadedImageFiles] = useState([]);
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const categoryOptions = [
    "GENERAL",
    "EQUIPMENT",
    "FACILITIES",
    "IT_SUPPORT",
    "ACADEMIC",
    "OTHER",
  ];

  const priorityOptions = ["LOW", "NORMAL", "HIGH", "URGENT"];

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    if (!formData.contact.trim()) {
      errors.contact = "Contact number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.contact)) {
      errors.contact = "Please enter a valid contact number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 3;

    if (uploadedImageFiles.length + files.length > maxImages) {
      setSubmitError(`Maximum ${maxImages} images allowed. You can upload ${maxImages - uploadedImageFiles.length} more.`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setSubmitError("Only image files are allowed");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("Image size must be less than 5MB");
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setUploadedImageFiles((prev) => [...prev, ...validFiles]);
    setUploadedImagePreviews((prev) => [...prev, ...newPreviews]);

    setSubmitError("");
    e.target.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(uploadedImagePreviews[index]);
    setUploadedImageFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let imageUrls = [];

      if (uploadedImageFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadedImageFiles.forEach((file) => {
          uploadFormData.append("files", file);
        });

        const uploadResponse = await api.post("/api/tickets/upload-images", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrls = uploadResponse?.data?.imageUrls || [];
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        location: formData.location.trim(),
        contact: formData.contact.trim(),
        imageUrls,
      };

      const response = await api.post("/api/tickets", payload);

      if (response.data) {
        setFormData({
          title: "",
          description: "",
          category: "GENERAL",
          priority: "NORMAL",
          location: "",
          contact: "",
        });

        uploadedImagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setUploadedImageFiles([]);
        setUploadedImagePreviews([]);
        setFormErrors({});

        if (onTicketCreated) {
          onTicketCreated(response.data);
        }

        onClose();
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to create ticket. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "GENERAL",
      priority: "NORMAL",
      location: "",
      contact: "",
    });

    uploadedImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setUploadedImageFiles([]);
    setUploadedImagePreviews([]);
    setFormErrors({});
    setSubmitError("");
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} role="presentation"></div>
      <div className="modal-container" role="dialog" aria-labelledby="modal-title" aria-modal="true">
        <div className="modal-header">
          <h2 id="modal-title">Raise a Support Ticket</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="raise-ticket-form">
          {submitError && (
            <div className="form-alert error" role="alert">
              {submitError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title of the issue"
              className={formErrors.title ? "input-error" : ""}
              disabled={submitting}
            />
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the issue"
              rows="4"
              className={formErrors.description ? "input-error" : ""}
              disabled={submitting}
            ></textarea>
            {formErrors.description && <span className="error-message">{formErrors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={submitting}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                Priority <span className="required">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={submitting}
              >
                {priorityOptions.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">
              Location <span className="required">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Where is the issue? e.g., Lab 5, Room 204"
              className={formErrors.location ? "input-error" : ""}
              disabled={submitting}
            />
            {formErrors.location && <span className="error-message">{formErrors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contact">
              Contact Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Your phone number"
              className={formErrors.contact ? "input-error" : ""}
              disabled={submitting}
            />
            {formErrors.contact && <span className="error-message">{formErrors.contact}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="images">
              Upload Images (Max 3)
            </label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={submitting || uploadedImageFiles.length >= 3}
                aria-label="Upload ticket images"
              />
              <span className="file-upload-hint">
                {uploadedImageFiles.length}/3 images uploaded
              </span>
            </div>

            {uploadedImagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {uploadedImagePreviews.map((previewUrl, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={previewUrl} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => removeImage(index)}
                      disabled={submitting}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
