import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
  Video,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { notifications } = useSelector((store) => store.realTimeNotification);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await api.get("/api/v1/user/logout");
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    } else if (textType === "Search") {
      // Navigate to search page
      navigate("/search");
    } else if (textType === "Explore") {
      // Navigate to explore page
      navigate("/explore");
    } else if (textType === "Notifications") {
      // Navigate to notifications page
      navigate("/notifications");
    } else if (textType === "Reels") {
      // Navigate to reels page
      navigate("/reels");
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <Video />, text: "Reels" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>W</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];
  return (
    <div className="fixed top-0 z-10 left-0 px-2 lg:px-4 border-r border-gray-300 w-full lg:w-[16%] h-16 lg:h-screen bg-white bottom-0 lg:bottom-auto">
      <div className="flex lg:flex-col justify-around lg:justify-start items-center lg:items-start h-full">
        <h1 className="hidden lg:block my-8 pl-3 font-bold text-xl">LIKELY</h1>
        <div className="flex lg:flex-col justify-around lg:justify-start w-full lg:w-auto">
          {sidebarItems.map((item, index) => {
            return (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={index}
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-2 lg:p-3 my-1 lg:my-3"
              >
                {item.icon}
                <span className="text-xs lg:text-base hidden sm:block lg:block">
                  {item.text}
                </span>
                {item.text === "Notifications" &&
                  notifications &&
                  notifications.length > 0 && (
                    <>
                      {/* Red notification dot */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            size="icon"
                            className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent onClick from firing
                            }}
                          >
                            {notifications.length > 9
                              ? "9+"
                              : notifications.length}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div>
                            {notifications.length === 0 ? (
                              <p>No new notification</p>
                            ) : (
                              notifications.slice(0, 3).map((notification) => {
                                const getNotificationMessage = (
                                  notification
                                ) => {
                                  switch (notification.type) {
                                    case "like":
                                      return "liked your post";
                                    case "follow":
                                      return "started following you";
                                    case "comment":
                                      return "commented on your post";
                                    case "message":
                                      return `sent you a message: "${notification.messageText}"`;
                                    default:
                                      return (
                                        notification.message ||
                                        "sent you a notification"
                                      );
                                  }
                                };

                                return (
                                  <div
                                    key={notification.id || notification.userId}
                                    className="flex items-center gap-2 my-2"
                                  >
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage
                                        src={
                                          notification.userDetails
                                            ?.profilePicture
                                        }
                                      />
                                      <AvatarFallback>
                                        {notification.userDetails?.username
                                          ?.charAt(0)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="text-sm">
                                        <span className="font-bold">
                                          {notification.userDetails?.username}
                                        </span>{" "}
                                        {getNotificationMessage(notification)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            {notifications.length > 3 && (
                              <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t">
                                +{notifications.length - 3} more notifications
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
