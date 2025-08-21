import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
import { Link } from "react-router-dom";

const Explore = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const { posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/post/all");
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, [dispatch]);

  const likeOrDislikeHandler = async (postId, isLiked) => {
    try {
      const action = isLiked ? "dislike" : "like";
      const res = await api.get(`/api/v1/post/${postId}/${action}`);
      if (res.data.success) {
        // Update the posts in redux
        const updatedPosts = posts.map((p) => {
          if (p._id === postId) {
            const updatedLikes = isLiked
              ? p.likes.filter((id) => id !== user._id)
              : [...p.likes, user._id];
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
        dispatch(setPosts(updatedPosts));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update like");
    }
  };

  const bookmarkHandler = async (postId) => {
    try {
      const res = await api.get(`/api/v1/post/${postId}/bookmark`);
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to bookmark post");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Explore</h1>
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-200 animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>

        {posts.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 text-lg font-medium">
              No posts to explore
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Posts from all users will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => {
              const isLiked = post.likes.includes(user?._id);

              return (
                <Dialog key={post._id}>
                  <DialogTrigger asChild>
                    <div
                      className="relative group cursor-pointer aspect-square"
                      onClick={() => setSelectedPost(post)}
                    >
                      {/* Show video or image based on mediaType */}
                      {post.mediaType === "video" || post.isReel ? (
                        <div className="relative w-full h-full">
                          <video
                            src={post.video}
                            className="w-full h-full object-cover rounded-sm"
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
                          alt="post"
                          className="w-full h-full object-cover rounded-sm"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center text-white space-x-6">
                          <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6" fill="white" />
                            <span className="font-semibold">
                              {post.likes?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-6 h-6" fill="white" />
                            <span className="font-semibold">
                              {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                    <div className="flex h-[80vh]">
                      {/* Media Section */}
                      <div className="flex-1 bg-black flex items-center justify-center">
                        {post.mediaType === "video" || post.isReel ? (
                          <video
                            src={post.video}
                            className="max-w-full max-h-full object-contain"
                            controls
                            autoPlay
                            loop={post.isReel}
                          />
                        ) : (
                          <img
                            src={post.image}
                            alt="post"
                            className="max-w-full max-h-full object-contain"
                          />
                        )}
                      </div>

                      {/* Details Section */}
                      <div className="w-80 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                          <div className="flex items-center gap-3">
                            <Link to={`/profile/${post.author?._id}`}>
                              <Avatar>
                                <AvatarImage
                                  src={post.author?.profilePicture}
                                />
                                <AvatarFallback>
                                  {post.author?.username
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <Link
                              to={`/profile/${post.author?._id}`}
                              className="font-semibold hover:text-blue-600"
                            >
                              {post.author?.username}
                            </Link>
                          </div>
                          <MoreHorizontal className="w-5 h-5 cursor-pointer" />
                        </div>

                        {/* Comments Section */}
                        <div className="flex-1 overflow-y-auto p-4">
                          {/* Post Caption */}
                          {post.caption && (
                            <div className="mb-4">
                              <div className="flex gap-3">
                                <Link to={`/profile/${post.author?._id}`}>
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage
                                      src={post.author?.profilePicture}
                                    />
                                    <AvatarFallback>
                                      {post.author?.username
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                <div className="flex-1">
                                  <Link
                                    to={`/profile/${post.author?._id}`}
                                    className="font-semibold hover:text-blue-600 mr-2"
                                  >
                                    {post.author?.username}
                                  </Link>
                                  <span>{post.caption}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Comments */}
                          {post.comments?.map((comment) => (
                            <div key={comment._id} className="mb-3">
                              <div className="flex gap-3">
                                <Link to={`/profile/${comment.author?._id}`}>
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage
                                      src={comment.author?.profilePicture}
                                    />
                                    <AvatarFallback>
                                      {comment.author?.username
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                <div className="flex-1">
                                  <Link
                                    to={`/profile/${comment.author?._id}`}
                                    className="font-semibold hover:text-blue-600 mr-2"
                                  >
                                    {comment.author?.username}
                                  </Link>
                                  <span>{comment.text}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="border-t p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <Heart
                                onClick={() =>
                                  likeOrDislikeHandler(post._id, isLiked)
                                }
                                className={`w-6 h-6 cursor-pointer hover:text-gray-600 ${
                                  isLiked ? "text-red-600 fill-red-600" : ""
                                }`}
                              />
                              <MessageCircle className="w-6 h-6 cursor-pointer hover:text-gray-600" />
                            </div>
                            <Bookmark
                              onClick={() => bookmarkHandler(post._id)}
                              className="w-6 h-6 cursor-pointer hover:text-gray-600"
                            />
                          </div>
                          <div className="text-sm font-semibold mb-1">
                            {post.likes?.length || 0}{" "}
                            {post.likes?.length === 1 ? "like" : "likes"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
