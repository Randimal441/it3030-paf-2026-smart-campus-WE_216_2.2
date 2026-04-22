import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationService";

const PREVIEW_LIMIT = 5;

const formatTimeAgo = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  const value = new Date(timestamp);
  const diffMs = Date.now() - value.getTime();

  if (Number.isNaN(diffMs)) {
    return "";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "just now";
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)}m ago`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)}h ago`;
  }

  return `${Math.floor(diffMs / day)}d ago`;
};

export default function NotificationBell({ active = false, notificationsPath }) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const hasUnread = unreadCount > 0;

  const previewItems = useMemo(
    () => notifications.slice(0, PREVIEW_LIMIT),
    [notifications]
  );

  const fetchSummary = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        getUnreadNotificationCount(),
        getMyNotifications(),
      ]);

      const nextCount = Number(countRes?.data?.unreadCount || 0);
      const nextList = Array.isArray(listRes?.data) ? listRes.data : [];
      const unreadList = nextList.filter((item) => !item.isRead);

      setUnreadCount(nextCount);
      setNotifications(unreadList);
    } catch (error) {
      setUnreadCount(0);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchSummary();

    const intervalId = setInterval(() => {
      fetchSummary();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const onToggleDropdown = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      setLoading(true);
      await fetchSummary();
      setLoading(false);
    }
  };

  const onNotificationClick = async (item) => {
    if (!item) {
      return;
    }

    const wasUnread = !item.isRead;
    let didMarkRead = false;
    if (!item.isRead) {
      try {
        await markNotificationAsRead(item.id);
        didMarkRead = true;
      } catch (error) {
        // Keep navigation behavior even if read update fails.
      }
    }

    setNotifications((prev) => prev.filter((notification) => notification.id !== item.id));
    if (wasUnread && didMarkRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    navigate(notificationsPath);
  };

  const onMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications([]);
    } catch (error) {
      // Best effort action for dropdown quick controls.
    }
  };

  const onViewAll = () => {
    setIsOpen(false);
    navigate(notificationsPath);
  };

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`icon-btn${active ? " active" : ""}`}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={onToggleDropdown}
      >
        <svg viewBox="0 0 24 24" role="img">
          <path d="M12 3a5 5 0 00-5 5v2.18c0 .74-.2 1.46-.57 2.1L5 15v1h14v-1l-1.43-2.72a4.5 4.5 0 01-.57-2.1V8a5 5 0 00-5-5zm0 19a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22z" />
        </svg>
        {hasUnread ? (
          <span className="notification-badge-count" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="notification-dropdown" role="dialog" aria-label="Notifications preview">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
            <button type="button" onClick={onMarkAllRead} disabled={!hasUnread}>
              Mark all read
            </button>
          </div>

          <div className="notification-dropdown-list">
            {loading ? (
              <div className="notification-empty">Loading...</div>
            ) : previewItems.length === 0 ? (
              <div className="notification-empty">No notifications yet.</div>
            ) : (
              previewItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`notification-item${item.isRead ? "" : " unread"}`}
                  onClick={() => onNotificationClick(item)}
                >
                  <div className="notification-item-title">{item.title}</div>
                  <div className="notification-item-message">{item.message}</div>
                  <div className="notification-item-meta">
                    <span>{item.type?.replaceAll("_", " ") || "UPDATE"}</span>
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <button type="button" className="notification-view-all" onClick={onViewAll}>
            View all notifications
          </button>
        </div>
      ) : null}
    </div>
  );
}
