import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationService";

const DEFAULT_FILTERS = ["ALL", "UNREAD", "TICKET", "BOOKING"];

const formatTimeLabel = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  const value = new Date(timestamp);
  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleString();
};

const inferGroup = (type = "") => {
  if (type.startsWith("TICKET")) {
    return "TICKET";
  }
  if (type.startsWith("BOOKING")) {
    return "BOOKING";
  }
  if (type.startsWith("COMMENT")) {
    return "COMMENT";
  }
  if (type.startsWith("RESOURCE")) {
    return "RESOURCE";
  }
  return "OTHER";
};

export default function NotificationCenter({
  title,
  subtitle,
  emptyText,
  filters = DEFAULT_FILTERS,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyNotifications();
      setNotifications(Array.isArray(response?.data) ? response.data : []);
    } catch (requestError) {
      setError("Failed to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "ALL") {
      return notifications;
    }
    if (activeFilter === "UNREAD") {
      return notifications.filter((item) => !item.isRead);
    }
    return notifications.filter((item) => inferGroup(item.type) === activeFilter);
  }, [activeFilter, notifications]);

  const onMarkAsRead = async (item) => {
    if (item.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(item.id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === item.id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (requestError) {
      setError("Failed to update notification state.");
    }
  };

  const onMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (requestError) {
      setError("Failed to mark all notifications as read.");
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (requestError) {
      setError("Failed to delete notification.");
    }
  };

  const onOpenAction = async (item) => {
    await onMarkAsRead(item);
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="tickets-page mesh-bg">
      <section className="tickets-hero">
        <div className="tickets-hero-overlay"></div>
        <div className="tickets-hero-content">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>

      <section className="tickets-content">
        <aside className="tickets-sidebar">
          <div className="tickets-filter-list" role="group" aria-label="Notification filters">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`ticket-filter-btn ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                <span>{filter}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="tickets-main">
          <header className="tickets-main-header">
            <div>
              <h2>Inbox</h2>
              <span>
                {loading
                  ? "Loading..."
                  : `${filteredNotifications.length} shown • ${unreadCount} unread`}
              </span>
            </div>
            <button
              type="button"
              className="cta-btn secondary"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </header>

          {error ? <div className="ticket-empty-state">{error}</div> : null}

          {loading ? (
            <div className="ticket-empty-state">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="ticket-empty-state">{emptyText}</div>
          ) : (
            <div className="notification-list">
              {filteredNotifications.map((item) => (
                <article
                  key={item.id}
                  className={`notification-card${item.isRead ? "" : " unread"}`}
                >
                  <div className="notification-card-body">
                    <div className="notification-card-title-row">
                      <h3>{item.title}</h3>
                      <div className="notification-pill-group">
                        <span className="notification-type-pill">
                          {item.type?.replaceAll("_", " ") || "UPDATE"}
                        </span>
                        {item.isRead ? (
                          <span className="notification-status-pill">Read</span>
                        ) : null}
                      </div>
                    </div>

                    <p>{item.message}</p>
                    <div className="notification-card-meta">{formatTimeLabel(item.createdAt)}</div>
                  </div>

                  <div className="notification-card-actions">
                    <button
                      type="button"
                      className="user-nav-link"
                      onClick={() => onMarkAsRead(item)}
                      disabled={item.isRead}
                    >
                      {item.isRead ? "Read" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      className="user-nav-link"
                      onClick={() => onOpenAction(item)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="user-nav-link"
                      style={{ color: "#d93025" }}
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
