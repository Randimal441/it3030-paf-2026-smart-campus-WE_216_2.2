import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient";

const FILTER_LABELS = ["All", "In Progress", "Resolved", "Closed"];

const toTitleCase = (value = "") =>
  value
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : ""))
    .join(" ");

const normalizeStatus = (status = "") => {
  const normalized = status.replace(/_/g, " ").trim().toLowerCase();

  if (!normalized) {
    return "In Progress";
  }

  if (normalized === "assigned" || normalized === "in progress") {
    return "In Progress";
  }

  if (normalized === "resolved") {
    return "Resolved";
  }

  if (normalized === "rejected" || normalized === "reject") {
    return "Reject";
  }

  if (normalized === "closed") {
    return "Closed";
  }

  return toTitleCase(normalized);
};

const getStatusClass = (statusLabel = "") => {
  if (statusLabel === "In Progress") {
    return "progress";
  }
  if (statusLabel === "Resolved") {
    return "resolved";
  }
  if (statusLabel === "Closed") {
    return "closed";
  }
  if (statusLabel === "Reject") {
    return "rejected";
  }
  return "progress";
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Not available";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const mapTicket = (ticket) => {
  const statusLabel = normalizeStatus(ticket?.status || "IN_PROGRESS");

  return {
    id: ticket?.id || "N/A",
    title: ticket?.title || "Untitled incident",
    description: ticket?.description || "No description provided.",
    status: statusLabel,
    statusClass: getStatusClass(statusLabel),
    date: formatDate(ticket?.createdAt),
    category: ticket?.category || "General",
    location: ticket?.location || "Not specified",
    priority: toTitleCase((ticket?.priority || "Normal").replace(/_/g, " ")),
    createdByName: ticket?.createdByName || "Unknown requester",
    createdByEmail: ticket?.createdByEmail || "No email",
    contact: ticket?.contact || "Not provided",
    role: ticket?.role || "Unknown",
    assignedTechnicianName: ticket?.assignedTechnicianName || "",
    assignedTechnicianEmail: ticket?.assignedTechnicianEmail || "",
    rejectionReason: ticket?.rejectionReason || "",
    resolutionNote: ticket?.resolutionNote || "",
    imageUrls: Array.isArray(ticket?.imageUrls) ? ticket.imageUrls : [],
  };
};

export default function TechnianTickets() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [resolvingTicketId, setResolvingTicketId] = useState("");
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedTicketForResolve, setSelectedTicketForResolve] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolveError, setResolveError] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const fetchTechnicianTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/tickets/technician/tickets");
      const incomingTickets = Array.isArray(response.data) ? response.data : [];
      setTickets(incomingTickets.map(mapTicket));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load technician tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechnicianTickets();
  }, [fetchTechnicianTickets]);

  const filterCounts = useMemo(() => {
    const counts = { All: tickets.length };

    FILTER_LABELS.forEach((label) => {
      if (label === "All") {
        return;
      }
      counts[label] = tickets.filter((ticket) => ticket.status === label).length;
    });

    return counts;
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => activeFilter === "All" || ticket.status === activeFilter);
  }, [activeFilter, tickets]);

  const openResolveModal = useCallback((ticket) => {
    setSelectedTicketForResolve(ticket);
    setResolutionNote("");
    setResolveError("");
    setIsResolveModalOpen(true);
  }, []);

  const closeResolveModal = useCallback(() => {
    if (resolvingTicketId) {
      return;
    }
    setIsResolveModalOpen(false);
    setSelectedTicketForResolve(null);
    setResolutionNote("");
    setResolveError("");
  }, [resolvingTicketId]);

  const submitResolveTicket = useCallback(
    async (event) => {
      event.preventDefault();

      const note = resolutionNote.trim();
      if (!note) {
        setResolveError("Resolution note is required.");
        return;
      }

      if (!selectedTicketForResolve?.id) {
        setResolveError("Ticket is not selected.");
        return;
      }

      setResolveError("");
      setActionMessage("");
      setResolvingTicketId(selectedTicketForResolve.id);

      try {
        await api.post(`/api/tickets/resolve/${selectedTicketForResolve.id}`, {
          resolutionNote: note,
        });
        setActionMessage("Ticket resolved successfully.");
        setIsResolveModalOpen(false);
        setSelectedTicketForResolve(null);
        setResolutionNote("");
        await fetchTechnicianTickets();
      } catch (requestError) {
        setResolveError(
          requestError?.response?.data?.message || "Failed to resolve ticket. Please try again."
        );
      } finally {
        setResolvingTicketId("");
      }
    },
    [fetchTechnicianTickets, resolutionNote, selectedTicketForResolve]
  );

  const openDetailsModal = useCallback((ticket) => {
    setSelectedTicketForDetails(ticket);
    setIsDetailsModalOpen(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedTicketForDetails(null);
    setPreviewImageUrl("");
  }, []);

  const canResolveTicket = (status) => status === "In Progress";

  return (
    <div className="tickets-page">
      <section className="tickets-hero">
        <div className="tickets-hero-overlay"></div>
        <div className="tickets-hero-content">
          <h1>Technician Ticket Desk</h1>
          <p>
            Track assigned incidents, inspect details, and submit clear resolution notes to complete
            support workflows.
          </p>
        </div>
      </section>

      <section className="tickets-content">
        <aside className="tickets-sidebar" aria-label="Ticket filters">
          <button type="button" className="raise-ticket-btn" onClick={fetchTechnicianTickets}>
            <span aria-hidden="true">&#8635;</span>
            Refresh Tickets
          </button>

          <div className="tickets-filter-list" role="list">
            {FILTER_LABELS.map((label) => (
              <button
                key={label}
                type="button"
                className={`ticket-filter-btn${activeFilter === label ? " active" : ""}`}
                role="listitem"
                onClick={() => setActiveFilter(label)}
              >
                <span>{label}</span>
                <span>{filterCounts[label] || 0}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="tickets-main">
          <header className="tickets-main-header">
            <div>
              <h2>{activeFilter} Tickets</h2>
              <span>{loading ? "Loading..." : `${filteredTickets.length} shown`}</span>
            </div>
          </header>

          <div className="tickets-card-list">
            {error && (
              <div className="ticket-empty-state" role="alert">
                {error}
              </div>
            )}

            {actionMessage && !error && (
              <div className="ticket-empty-state" role="status">
                {actionMessage}
              </div>
            )}

            {loading && !error && (
              <div className="ticket-empty-state" role="status">
                Loading assigned tickets...
              </div>
            )}

            {!loading && !error &&
              filteredTickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="ticket-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetailsModal(ticket)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openDetailsModal(ticket);
                    }
                  }}
                >
                  <div className="ticket-top-row">
                    <span className="ticket-id">#{ticket.id}</span>
                    <span className={`ticket-status ${ticket.statusClass}`}>{ticket.status}</span>
                  </div>

                  <h3>{ticket.title}</h3>
                  <p>{ticket.description}</p>

                  <div className="ticket-meta-row">
                    <span className="ticket-meta-item">
                      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 15H5V10h14v9zm0-11H5V6h14v2z" />
                      </svg>
                      {ticket.date}
                    </span>

                    <span className="ticket-tag">{ticket.category}</span>
                    <span className="ticket-tag">{ticket.location}</span>
                    <span className="ticket-tag">Priority: {ticket.priority}</span>
                    <span className="ticket-tag">By: {ticket.createdByName}</span>
                    <span className="ticket-tag">{ticket.createdByEmail}</span>
                  </div>

                  <div className="ticket-actions-row">
                    <div className="ticket-assignee">
                      Assigned: {ticket.assignedTechnicianName || "You"}
                    </div>

                    <div className="ticket-assign-controls" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="btn btn-primary assign-tech-btn"
                        disabled={!canResolveTicket(ticket.status) || resolvingTicketId === ticket.id}
                        onClick={() => openResolveModal(ticket)}
                      >
                        {resolvingTicketId === ticket.id ? "Submitting..." : "Resolve Ticket"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}

            {!loading && !error && filteredTickets.length === 0 && (
              <div className="ticket-empty-state" role="status">
                {activeFilter === "All"
                  ? "No assigned tickets are available right now."
                  : "No tickets available in this status."}
              </div>
            )}
          </div>
        </div>
      </section>

      {isResolveModalOpen && (
        <>
          <div className="modal-overlay" onClick={closeResolveModal} role="presentation"></div>
          <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="resolve-modal-title">
            <div className="modal-header">
              <h2 id="resolve-modal-title">Resolve Ticket</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeResolveModal}
                aria-label="Close resolve modal"
                disabled={Boolean(resolvingTicketId)}
              >
                x
              </button>
            </div>

            <form onSubmit={submitResolveTicket} className="raise-ticket-form">
              <div className="form-group">
                <label htmlFor="resolve-ticket-id">Ticket ID</label>
                <input id="resolve-ticket-id" value={selectedTicketForResolve?.id || ""} disabled />
              </div>

              <div className="form-group">
                <label htmlFor="resolution-note">
                  Resolution Note <span className="required">*</span>
                </label>
                <textarea
                  id="resolution-note"
                  name="resolutionNote"
                  rows="4"
                  placeholder="Describe what was fixed and how it was resolved"
                  value={resolutionNote}
                  onChange={(event) => {
                    setResolutionNote(event.target.value);
                    if (resolveError) {
                      setResolveError("");
                    }
                  }}
                  className={resolveError ? "input-error" : ""}
                  disabled={Boolean(resolvingTicketId)}
                ></textarea>
                {resolveError && <span className="error-message">{resolveError}</span>}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeResolveModal}
                  disabled={Boolean(resolvingTicketId)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={Boolean(resolvingTicketId)}>
                  {resolvingTicketId ? "Submitting..." : "Submit Resolution"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {isDetailsModalOpen && selectedTicketForDetails && (
        <>
          <div className="modal-overlay" onClick={closeDetailsModal} role="presentation"></div>
          <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="tech-details-modal-title">
            <div className="modal-header">
              <h2 id="tech-details-modal-title">Ticket Details</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeDetailsModal}
                aria-label="Close ticket details modal"
              >
                x
              </button>
            </div>

            <div className="raise-ticket-form">
              <div className="form-group">
                <label>Ticket ID</label>
                <input value={selectedTicketForDetails.id} disabled />
              </div>

              <div className="form-group">
                <label>Title</label>
                <input value={selectedTicketForDetails.title} disabled />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={selectedTicketForDetails.description} rows="4" disabled />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <input value={selectedTicketForDetails.status} disabled />
                </div>
                <div className="form-group">
                  <label>Created Date</label>
                  <input value={selectedTicketForDetails.date} disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input value={selectedTicketForDetails.category} disabled />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <input value={selectedTicketForDetails.priority} disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input value={selectedTicketForDetails.location} disabled />
                </div>
                <div className="form-group">
                  <label>Contact</label>
                  <input value={selectedTicketForDetails.contact} disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Requested By</label>
                  <input value={selectedTicketForDetails.createdByName} disabled />
                </div>
                <div className="form-group">
                  <label>Requester Email</label>
                  <input value={selectedTicketForDetails.createdByEmail} disabled />
                </div>
              </div>

              <div className="form-group">
                <label>Assigned Technician</label>
                <input
                  value={
                    selectedTicketForDetails.assignedTechnicianName
                      ? `${selectedTicketForDetails.assignedTechnicianName} (${selectedTicketForDetails.assignedTechnicianEmail})`
                      : "Unassigned"
                  }
                  disabled
                />
              </div>

              {selectedTicketForDetails.rejectionReason && (
                <div className="form-group">
                  <label>Rejection Reason</label>
                  <textarea value={selectedTicketForDetails.rejectionReason} rows="3" disabled />
                </div>
              )}

              {selectedTicketForDetails.resolutionNote && (
                <div className="form-group">
                  <label>Resolution Note</label>
                  <textarea value={selectedTicketForDetails.resolutionNote} rows="3" disabled />
                </div>
              )}

              {selectedTicketForDetails.imageUrls.length > 0 && (
                <div className="form-group">
                  <label>Attached Images</label>
                  <div className="image-preview-grid">
                    {selectedTicketForDetails.imageUrls.map((imageUrl, index) => (
                      <div key={`${selectedTicketForDetails.id}-img-${index}`} className="image-preview-item">
                        <img
                          src={imageUrl}
                          alt={`Ticket attachment ${index + 1}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setPreviewImageUrl(imageUrl)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setPreviewImageUrl(imageUrl);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDetailsModal}>
                  Close
                </button>
              </div>
            </div>

            {previewImageUrl && (
              <div
                className="ticket-image-lightbox-overlay"
                role="presentation"
                onClick={() => setPreviewImageUrl("")}
              >
                <div
                  className="ticket-image-lightbox"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Ticket image preview"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="ticket-image-lightbox-close"
                    onClick={() => setPreviewImageUrl("")}
                    aria-label="Close image preview"
                  >
                    x
                  </button>
                  <img src={previewImageUrl} alt="Ticket attachment full preview" />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
