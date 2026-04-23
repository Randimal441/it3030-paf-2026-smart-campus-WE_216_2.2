import NotificationCenter from "../components/NotificationCenter";

export default function AdminNotification() {
  return (
    <NotificationCenter
      title="Admin Notifications"
      subtitle="Review campus alerts, new tickets, and booking workflow updates."
      emptyText="No admin notifications available at the moment."
      filters={["ALL", "UNREAD", "TICKET", "BOOKING", "COMMENT", "RESOURCE"]}
    />
  );
}
