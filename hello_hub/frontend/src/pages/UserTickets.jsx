import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient";
import RaiseTicketModal from "../components/RaiseTicketModal";

export default function UserTickets() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              <article key={ticket.id} className="ticket-card">
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
    </div>
  );
}
