import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import api from "../lib/api";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const SuggestedUsers = () => {
  const { suggestedUsers, user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState({});
  const dispatch = useDispatch();

  const followOrUnfollowHandler = async (targetUserId) => {
    try {
      // Prevent following yourself
      if (user._id === targetUserId) {
        toast.error("You cannot follow yourself");
        return;
      }

      setLoading((prev) => ({ ...prev, [targetUserId]: true }));
      const res = await api.post(
        `/api/v1/user/followorunfollow/${targetUserId}`
      );

      if (res.data.success) {
        // Update the current user's following list
        const currentFollowing = user.following || [];
        const updatedUser = {
          ...user,
          following: currentFollowing.includes(targetUserId)
            ? currentFollowing.filter((id) => id !== targetUserId)
            : [...currentFollowing, targetUserId],
        };
        dispatch(setAuthUser(updatedUser));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log("Follow error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <div className="my-6 lg:my-10">
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600 text-xs lg:text-sm">
          Suggested for you
        </h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>
      {suggestedUsers.map((suggestedUser) => {
        return (
          <div
            key={suggestedUser._id}
            className="flex items-center justify-between my-5"
          >
            <div className="flex items-center gap-2">
              <Link to={`/profile/${suggestedUser?._id}`}>
                <Avatar>
                  <AvatarImage
                    src={suggestedUser?.profilePicture}
                    alt="post_image"
                  />
                  <AvatarFallback>W</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${suggestedUser?._id}`}>
                    {suggestedUser?.username}
                  </Link>
                </h1>
                <span className="text-gray-600 text-sm">
                  {suggestedUser?.bio || "Bio here..."}
                </span>
              </div>
            </div>
            <span
              onClick={() => followOrUnfollowHandler(suggestedUser._id)}
              className={`text-xs font-bold cursor-pointer hover:text-[#3495d6] ${
                loading[suggestedUser._id]
                  ? "opacity-50 cursor-not-allowed"
                  : "text-[#3BADF8]"
              }`}
            >
              {loading[suggestedUser._id]
                ? "Loading..."
                : (user.following || []).includes(suggestedUser._id)
                ? "Unfollow"
                : "Follow"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;
