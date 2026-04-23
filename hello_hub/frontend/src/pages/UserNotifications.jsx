import NotificationCenter from "../components/NotificationCenter";

export default function UserNotifications() {
  return (
    <NotificationCenter
      title="My Notifications"
      subtitle="Track ticket updates, booking decisions, and discussion activity."
      emptyText="No notifications to show right now."
      filters={["ALL", "UNREAD", "TICKET", "BOOKING"]}
    />
  );
}
