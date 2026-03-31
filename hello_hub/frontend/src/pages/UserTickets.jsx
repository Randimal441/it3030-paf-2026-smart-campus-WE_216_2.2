import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient";
import RaiseTicketModal from "../components/RaiseTicketModal";

export default function UserTickets() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const filterLabels = ["All", "Open", "In Progress", "Resolved", "Closed", "Reject"];

  const toTitleCase = (value = "") =>
    value
      .toLowerCase()
      .split(" ")
      .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : ""))
      .join(" ");

  const normalizeStatus = (status = "") => {
    const normalized = status.replace(/_/g, " ").trim().toLowerCase();

    if (!normalized) {
      return "Open";
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
    if (statusLabel === "Open") {
      return "open";
    }
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
    return "open";
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
    const statusLabel = normalizeStatus(ticket?.status || "OPEN");

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
      contact: ticket?.contact || "Not provided",
      assignedTechnicianName: ticket?.assignedTechnicianName || "",
      assignedTechnicianEmail: ticket?.assignedTechnicianEmail || "",
      rejectionReason: ticket?.rejectionReason || "",
      resolutionNote: ticket?.resolutionNote || "",
      imageUrls: Array.isArray(ticket?.imageUrls) ? ticket.imageUrls : [],
    };
  };

  const fetchMyTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/tickets/my-tickets");
      const incomingTickets = Array.isArray(response.data) ? response.data : [];
      setTickets(incomingTickets.map(mapTicket));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load your tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const filterCounts = useMemo(() => {
    const counts = { All: tickets.length };

    filterLabels.forEach((label) => {
      if (label === "All") {
        return;
      }
      counts[label] = tickets.filter((ticket) => ticket.status === label).length;
    });

    return counts;
  }, [filterLabels, tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const byFilter = activeFilter === "All" || ticket.status === activeFilter;

      return byFilter;
    });
  }, [activeFilter, tickets]);

  const handleTicketCreated = useCallback(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const openDetailsModal = useCallback((ticket) => {
    setSelectedTicketForDetails(ticket);
    setIsDetailsModalOpen(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedTicketForDetails(null);
    setPreviewImageUrl("");
  }, []);

  return (
    <div className="tickets-page">
      <section className="tickets-hero">
        <div className="tickets-hero-overlay"></div>
        <div className="tickets-hero-content">
          <h1>Incident Support Center</h1>
          <p>
            Report campus issues, track your tickets in real-time, and get quick resolutions from
            our support team.
          </p>
        </div>
      </section>

      <section className="tickets-content">
        <aside className="tickets-sidebar" aria-label="Ticket filters">
          <button type="button" className="raise-ticket-btn" onClick={() => setIsModalOpen(true)}>
            <span aria-hidden="true">+</span>
            Raise Ticket
          </button>

          <div className="tickets-filter-list" role="list">
            {filterLabels.map((label) => (
              <button
                key={label}
                type="button"
                className={`ticket-filter-btn${activeFilter === label ? " active" : ""}`}
                role="listitem"
                onClick={() => setActiveFilter(label)}
              >
                <span>{label}</span>
                <span>{filterCounts[label]}</span>
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

            {loading && !error && (
              <div className="ticket-empty-state" role="status">
                Loading your tickets...
              </div>
            )}

            {!loading && !error && filteredTickets.map((ticket) => (
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
                </div>
              </article>
            ))}

            {!loading && !error && filteredTickets.length === 0 && (
              <div className="ticket-empty-state" role="status">
                {activeFilter === "All"
                  ? "No tickets available."
                  : "No tickets available in this status."}
              </div>
            )}
          </div>
        </div>
      </section>

      <RaiseTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {isDetailsModalOpen && selectedTicketForDetails && (
        <>
          <div className="modal-overlay" onClick={closeDetailsModal} role="presentation"></div>
          <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="user-ticket-details-modal-title">
            <div className="modal-header">
              <h2 id="user-ticket-details-modal-title">Ticket Details</h2>
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
