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

const getPriorityClass = (priorityLabel = "") => {
  const normalized = priorityLabel.trim().toLowerCase();

  if (normalized === "low") {
    return "priority-low";
  }
  if (normalized === "medium") {
    return "priority-medium";
  }
  if (normalized === "high") {
    return "priority-high";
  }
  if (normalized === "urgent") {
    return "priority-urgent";
  }

  return "priority-normal";
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

const formatCommentTimestamp = (dateValue) => {
  if (!dateValue) {
    return "Just now";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  return parsedDate.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapComment = (comment) => ({
  id: comment?.id || `${comment?.commenterEmail || "user"}-${comment?.createdAt || "now"}`,
  commenterName: comment?.commenterName || "Unknown",
  commenterEmail: comment?.commenterEmail || "No email",
  commenterRole: comment?.commenterRole || "USER",
  message: comment?.message || "",
  createdAt: formatCommentTimestamp(comment?.createdAt),
});

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
      priorityClass: getPriorityClass(ticket?.priority || "Normal"),
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
  const [commentCountsByTicket, setCommentCountsByTicket] = useState({});
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedTicketForComments, setSelectedTicketForComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);

  const currentUser = (() => {
    try {
      const rawUser = localStorage.getItem("user");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  })();
  const currentUserEmail = currentUser?.email || "";

  const fetchCommentCounts = useCallback(async (ticketList) => {
    if (!Array.isArray(ticketList) || ticketList.length === 0) {
      setCommentCountsByTicket({});
      return;
    }

    const results = await Promise.allSettled(
      ticketList.map((ticket) => api.get(`/api/comments/${ticket.id}`))
    );

    const counts = {};
    ticketList.forEach((ticket, index) => {
      const result = results[index];
      counts[ticket.id] =
        result?.status === "fulfilled" && Array.isArray(result.value?.data)
          ? result.value.data.length
          : 0;
    });

    setCommentCountsByTicket(counts);
  }, []);

  const fetchCommentsByTicket = useCallback(async (ticketId) => {
    if (!ticketId) {
      setComments([]);
      setCommentsError("Ticket is not selected.");
      return;
    }

    setCommentsLoading(true);
    setCommentsError("");

    try {
      const response = await api.get(`/api/comments/${ticketId}`);
      const mappedComments = Array.isArray(response.data) ? response.data.map(mapComment) : [];
      setComments(mappedComments);
      setCommentCountsByTicket((previous) => ({
        ...previous,
        [ticketId]: mappedComments.length,
      }));
    } catch (requestError) {
      setComments([]);
      setCommentsError(
        requestError?.response?.data?.message || "Failed to load ticket comments."
      );
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const fetchTechnicianTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/tickets/technician/tickets");
      const incomingTickets = Array.isArray(response.data) ? response.data : [];
      const mappedTickets = incomingTickets.map(mapTicket);
      setTickets(mappedTickets);
      fetchCommentCounts(mappedTickets);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load technician tickets.");
    } finally {
      setLoading(false);
    }
  }, [fetchCommentCounts]);

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

  const openCommentsModal = useCallback(
    async (ticket, event) => {
      if (event) {
        event.stopPropagation();
      }

      setSelectedTicketForComments(ticket);
      setIsCommentsModalOpen(true);
      setNewComment("");
      setEditingCommentId("");
      await fetchCommentsByTicket(ticket?.id);
    },
    [fetchCommentsByTicket]
  );

  const closeCommentsModal = useCallback(() => {
    if (isSubmittingComment) {
      return;
    }

    setIsCommentsModalOpen(false);
    setSelectedTicketForComments(null);
    setComments([]);
    setCommentsError("");
    setNewComment("");
    setEditingCommentId("");
    setCommentToDelete(null);
  }, [isSubmittingComment]);

  const startEditComment = useCallback((comment) => {
    setEditingCommentId(comment.id);
    setNewComment(comment.message);
    setCommentsError("");
  }, []);

  const cancelEditComment = useCallback(() => {
    setEditingCommentId("");
    setNewComment("");
    setCommentsError("");
  }, []);

  const requestDeleteComment = useCallback((comment) => {
    if (!comment?.id) {
      return;
    }
    setCommentToDelete(comment);
  }, []);

  const closeDeleteCommentModal = useCallback(() => {
    if (isSubmittingComment) {
      return;
    }
    setCommentToDelete(null);
  }, [isSubmittingComment]);

  const confirmDeleteComment = useCallback(
    async () => {
      if (!selectedTicketForComments?.id || !commentToDelete?.id) {
        setCommentsError("Comment is not selected.");
        return;
      }

      setCommentsError("");
      setIsSubmittingComment(true);

      try {
        await api.delete(`/api/comments/${commentToDelete.id}`);
        if (editingCommentId === commentToDelete.id) {
          cancelEditComment();
        }
        setCommentToDelete(null);
        await fetchCommentsByTicket(selectedTicketForComments.id);
      } catch (requestError) {
        setCommentsError(
          requestError?.response?.data?.message || "Failed to delete comment. Please try again."
        );
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [cancelEditComment, commentToDelete, editingCommentId, fetchCommentsByTicket, selectedTicketForComments]
  );

  const submitComment = useCallback(
    async (event) => {
      event.preventDefault();

      const message = newComment.trim();
      if (!message) {
        setCommentsError("Please enter a comment before submitting.");
        return;
      }

      if (!selectedTicketForComments?.id) {
        setCommentsError("Ticket is not selected.");
        return;
      }

      setCommentsError("");
      setIsSubmittingComment(true);

      try {
        const payload = {
          ticketId: selectedTicketForComments.id,
          message,
        };

        if (editingCommentId) {
          await api.put(`/api/comments/${editingCommentId}`, payload);
        } else {
          await api.post("/api/comments", payload);
        }

        cancelEditComment();
        await fetchCommentsByTicket(selectedTicketForComments.id);
      } catch (requestError) {
        setCommentsError(
          requestError?.response?.data?.message || "Failed to save comment. Please try again."
        );
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [cancelEditComment, editingCommentId, fetchCommentsByTicket, newComment, selectedTicketForComments]
  );

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
                    <span className={`ticket-priority ${ticket.priorityClass}`}>
                      {ticket.priority}
                    </span>
                    <button
                      type="button"
                      className="ticket-comment-chip"
                      aria-label={`Open comments for ticket ${ticket.id}`}
                      onClick={(event) => openCommentsModal(ticket, event)}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                        <path d="M4 5h16a2 2 0 012 2v9a2 2 0 01-2 2H8l-5 4v-4H4a2 2 0 01-2-2V7a2 2 0 012-2zm0 2v9h1v1.17L7.21 16H20V7H4z" />
                      </svg>
                      <span>{commentCountsByTicket[ticket.id] || 0}</span>
                    </button>
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

      {isCommentsModalOpen && selectedTicketForComments && (
        <>
          <div className="modal-overlay" onClick={closeCommentsModal} role="presentation"></div>
          <div
            className="modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comments-modal-title"
          >
            <div className="modal-header">
              <h2 id="comments-modal-title">Ticket Comments #{selectedTicketForComments.id}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeCommentsModal}
                aria-label="Close comments modal"
                disabled={isSubmittingComment}
              >
                x
              </button>
            </div>

            <div className="ticket-comments-modal-body">
              <div className="ticket-comments-list" role="list" aria-label="Ticket comments list">
                {commentsLoading && (
                  <div className="ticket-empty-state" role="status">
                    Loading comments...
                  </div>
                )}

                {!commentsLoading && comments.length === 0 && !commentsError && (
                  <div className="ticket-empty-state" role="status">
                    No comments yet. Be the first to comment.
                  </div>
                )}

                {!commentsLoading &&
                  comments.map((comment) => (
                    <article key={comment.id} className="ticket-comment-item" role="listitem">
                      <div className="ticket-comment-item-header">
                        <div>
                          <h4>{comment.commenterName}</h4>
                          <span>{comment.commenterEmail}</span>
                        </div>
                        <div className="ticket-comment-item-meta">
                          <span>{comment.commenterRole}</span>
                          <span>{comment.createdAt}</span>
                        </div>
                      </div>
                      <p>{comment.message}</p>
                      {comment.commenterEmail === currentUserEmail && (
                        <div className="ticket-comment-actions">
                          <button
                            type="button"
                            className="btn btn-secondary ticket-comment-action-btn"
                            onClick={() => startEditComment(comment)}
                            disabled={isSubmittingComment}
                            aria-label="Edit comment"
                            title="Edit comment"
                          >
                            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92-9.06 9.06zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.84 1.84 3.75 3.75 1.84-1.84z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary ticket-comment-action-btn"
                            onClick={() => requestDeleteComment(comment)}
                            disabled={isSubmittingComment}
                            aria-label="Delete comment"
                            title="Delete comment"
                          >
                            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                              <path d="M9 3.75A1.75 1.75 0 0110.75 2h2.5A1.75 1.75 0 0115 3.75V5h4a1 1 0 010 2h-1.05l-.7 11.2A2.25 2.25 0 0114 20H10a2.25 2.25 0 01-2.25-1.8L7.05 7H6a1 1 0 110-2h4V3.75zM10.75 5h2.5v-.95h-2.5V5zM9.05 7l.7 11.1c.02.27.24.48.51.48h3.48c.27 0 .49-.21.51-.48L15.95 7h-6.9zm2.2 2.25a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V10a.75.75 0 01.75-.75zm3 0a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V10a.75.75 0 01.75-.75z" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
              </div>

              <form className="ticket-comment-form" onSubmit={submitComment}>
                <label htmlFor="new-ticket-comment">
                  {editingCommentId ? "Update Comment" : "Add Comment"} <span className="required">*</span>
                </label>
                <textarea
                  id="new-ticket-comment"
                  rows="3"
                  placeholder="Write your comment"
                  value={newComment}
                  onChange={(event) => {
                    setNewComment(event.target.value);
                    if (commentsError) {
                      setCommentsError("");
                    }
                  }}
                  disabled={isSubmittingComment}
                ></textarea>
                {commentsError && <span className="error-message">{commentsError}</span>}

                <div className="modal-footer ticket-comment-footer">
                  {editingCommentId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cancelEditComment}
                      disabled={isSubmittingComment}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeCommentsModal}
                    disabled={isSubmittingComment}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmittingComment}>
                    {isSubmittingComment
                      ? editingCommentId
                        ? "Updating..."
                        : "Posting..."
                      : editingCommentId
                        ? "Update Comment"
                        : "Post Comment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {isCommentsModalOpen && commentToDelete && (
        <>
          <div className="ticket-confirm-overlay" onClick={closeDeleteCommentModal} role="presentation"></div>
          <div
            className="ticket-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-comment-title"
          >
            <h3 id="delete-comment-title">Delete Comment?</h3>
            <p>This action cannot be undone.</p>
            <div className="ticket-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDeleteCommentModal}
                disabled={isSubmittingComment}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmDeleteComment}
                disabled={isSubmittingComment}
              >
                {isSubmittingComment ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
