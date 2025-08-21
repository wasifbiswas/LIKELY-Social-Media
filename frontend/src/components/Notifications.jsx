import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, UserPlus, MessageCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { removeNotification, clearNotifications } from "@/redux/rtnSlice";
import { toast } from "sonner";

const Notifications = () => {
  const { notifications } = useSelector((store) => store.realTimeNotification);
  const dispatch = useDispatch();

  // Ensure notifications is always an array
  const safeNotifications = notifications || [];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Heart className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification) => {
    const username = notification.userDetails?.username || "Someone";

    switch (notification.type) {
      case "like":
        return "liked your post";
      case "follow":
        return "started following you";
      case "comment":
        if (notification.message && notification.message.length > 0) {
          const commentText =
            notification.message.length > 50
              ? notification.message.substring(0, 50) + "..."
              : notification.message;
          return `commented: "${commentText}"`;
        }
        return "commented on your post";
      default:
        return notification.message || "interacted with your content";
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleRemoveNotification = (notificationId) => {
    dispatch(removeNotification(notificationId));
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
    toast.success("All notifications cleared");
  };

  return (
    <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8 pb-16 lg:pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h1 className="text-xl lg:text-2xl font-bold">Notifications</h1>
          {safeNotifications && safeNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs lg:text-sm"
            >
              Clear All
            </Button>
          )}
        </div>

        {safeNotifications && safeNotifications.length > 0 ? (
          <div className="space-y-2 lg:space-y-3">
            {safeNotifications.map((notification) => {
              const getNotificationLink = () => {
                if (notification.type === "follow") {
                  return `/profile/${notification.userId}`;
                } else if (notification.postId) {
                  return `/post/${notification.postId}`;
                }
                return `/profile/${notification.userId}`;
              };

              return (
                <div
                  key={notification.id || notification.userId}
                  className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors relative group"
                >
                  <Link
                    to={getNotificationLink()}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={notification.userDetails?.profilePicture}
                      />
                      <AvatarFallback>
                        {notification.userDetails?.username
                          ?.charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">
                        <span className="font-semibold text-blue-600 hover:text-blue-700">
                          {notification.userDetails?.username}
                        </span>{" "}
                        <span className="text-gray-800">
                          {getNotificationMessage(notification)}
                        </span>
                        {notification.type === "like" && (
                          <span className="text-gray-500">
                            {" "}
                            • Tap to view post
                          </span>
                        )}
                        {notification.type === "comment" && (
                          <span className="text-gray-500">
                            {" "}
                            • Tap to view post
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>

                    {notification.type === "like" && notification.postId && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded border">
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded"></div>
                        </div>
                      </div>
                    )}
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-auto"
                    onClick={() => handleRemoveNotification(notification.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-medium">
              No new notifications
            </p>
            <p className="text-sm text-gray-500 mt-2">
              When someone likes your posts, follows you, or comments on your
              posts, you'll see detailed notifications here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
