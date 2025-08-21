import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { AtSign, Heart, MessageCircle, Play, X } from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";
import { setAuthUser, setSelectedUser } from "@/redux/authSlice";
import Post from "./Post";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userProfile, user } = useSelector((store) => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = user?.following?.includes(userProfile?._id);

  const followOrUnfollowHandler = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post(
        `/api/v1/user/followorunfollow/${userProfile?._id}`
      );
      if (res.data.success) {
        // Update the current user's following array in redux
        const updatedUser = {
          ...user,
          following: isFollowing
            ? user.following.filter((id) => id !== userProfile._id)
            : [...user.following, userProfile._id],
        };
        dispatch(setAuthUser(updatedUser));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async () => {
    // Set the selected user for chat and navigate to chat page
    if (userProfile) {
      console.log("Setting selected user:", userProfile.username);
      dispatch(setSelectedUser(userProfile));
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate("/chat");
      }, 100);
    } else {
      toast.error("User profile not loaded");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPost(null);
  };

  const displayedPost =
    activeTab === "posts"
      ? userProfile?.posts?.filter((post) => !post.isReel)
      : activeTab === "reels"
      ? userProfile?.posts?.filter((post) => post.isReel)
      : userProfile?.bookmarks;

  return (
    <div className="flex max-w-5xl justify-center mx-auto px-4 pt-16 lg:pt-0 pb-16 lg:pb-0 lg:pl-10">
      <div className="flex flex-col gap-10 lg:gap-20 p-4 lg:p-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="flex items-center justify-center md:justify-center">
            <Avatar className="h-20 w-20 md:h-24 lg:h-32 md:w-24 lg:w-32">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilephoto"
              />
              <AvatarFallback>W</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-3 lg:gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-lg lg:text-xl font-semibold">
                  {userProfile?.username}
                </span>
                <div className="flex flex-wrap gap-2">
                  {isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit">
                        <Button
                          variant="secondary"
                          className="hover:bg-gray-200 h-8 text-xs lg:text-sm"
                        >
                          Edit profile
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8 text-xs lg:text-sm"
                      >
                        View archive
                      </Button>
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8 text-xs lg:text-sm"
                      >
                        Ad tools
                      </Button>
                    </>
                  ) : isFollowing ? (
                    <>
                      <Button
                        variant="secondary"
                        className="h-8 text-xs lg:text-sm"
                        onClick={followOrUnfollowHandler}
                        disabled={loading}
                      >
                        {loading ? "Loading..." : "Unfollow"}
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-8 text-xs lg:text-sm"
                        onClick={handleMessageClick}
                      >
                        Message
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="bg-[#0095F6] hover:bg-[#3192d2] h-8 text-xs lg:text-sm"
                      onClick={followOrUnfollowHandler}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Follow"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 lg:gap-6 text-sm lg:text-base">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts?.filter((post) => !post.isReel)
                      .length || 0}{" "}
                  </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts?.filter((post) => post.isReel).length ||
                      0}{" "}
                  </span>
                  reels
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers.length}{" "}
                  </span>
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following.length}{" "}
                  </span>
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "bio here..."}
                </span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign />{" "}
                  <span className="pl-1">{userProfile?.username}</span>{" "}
                </Badge>
                <span>Hello world I am a Web Developer</span>
                <span>MERN stack web Developer</span>
                <span>Simple minimalist Social Media</span>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "reels" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("reels")}
            >
              REELS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
            <span className="py-3 cursor-pointer">TAGS</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 mb-4">
                  {activeTab === "posts" && "📷"}
                  {activeTab === "reels" && "🎬"}
                  {activeTab === "saved" && "🔖"}
                </div>
                <p className="text-lg font-semibold text-gray-600">
                  {activeTab === "posts" && "No Posts Yet"}
                  {activeTab === "reels" && "No Reels Yet"}
                  {activeTab === "saved" && "No Saved Posts"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {activeTab === "posts" && "Share photos to get started"}
                  {activeTab === "reels" && "Create your first reel"}
                  {activeTab === "saved" && "Save posts you love"}
                </p>
              </div>
            ) : (
              displayedPost?.map((post) => {
                return (
                  <div
                    key={post?._id}
                    className="relative group cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    {/* Display image for regular posts or video thumbnail for reels */}
                    {post.mediaType === "video" || post.isReel ? (
                      <div className="relative">
                        <video
                          src={post.video}
                          className="rounded-sm my-2 w-full aspect-square object-cover"
                          muted
                          preload="metadata"
                        />
                        {/* Video play icon overlay */}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={post.image}
                        alt="postimage"
                        className="rounded-sm my-2 w-full aspect-square object-cover"
                      />
                    )}

                    {/* Hover overlay with stats */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center text-white space-x-4">
                        <button className="flex items-center gap-2 hover:text-gray-300">
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-gray-300">
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Post/Reel Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-7xl w-full h-[95vh] p-0 overflow-hidden">
          {selectedPost && (
            <div
              className={`flex h-full ${
                selectedPost.isReel ? "justify-center" : ""
              }`}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Media Section */}
              <div
                className={`${
                  selectedPost.isReel ? "w-auto" : "flex-1"
                } bg-black flex items-center justify-center`}
              >
                {selectedPost.mediaType === "video" || selectedPost.isReel ? (
                  <video
                    src={selectedPost.video}
                    className={`${
                      selectedPost.isReel
                        ? "h-full w-auto max-w-[400px] object-cover"
                        : "max-w-full max-h-full object-contain"
                    }`}
                    controls
                    autoPlay
                    loop={selectedPost.isReel}
                    muted={false}
                  />
                ) : (
                  <img
                    src={selectedPost.image}
                    alt="Post"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Post Component Sidebar - Only show for regular posts */}
              {!selectedPost.isReel && (
                <div className="w-96 bg-white border-l flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <Post post={selectedPost} />
                  </div>
                </div>
              )}

              {/* Reel info overlay - Only show for reels */}
              {selectedPost.isReel && (
                <div className="absolute bottom-4 left-4 text-white z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8 border-2 border-white">
                      <AvatarImage src={selectedPost.author?.profilePicture} />
                      <AvatarFallback className="text-xs">
                        {selectedPost.author?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">
                      {selectedPost.author?.username}
                    </span>
                  </div>
                  {selectedPost.caption && (
                    <p className="text-sm mb-2 max-w-xs">
                      {selectedPost.caption}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {selectedPost.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {selectedPost.comments?.length || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
