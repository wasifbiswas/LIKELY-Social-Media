import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  MessageCircle,
  Share,
  Bookmark,
  MoreVertical,
  Play,
  Pause,
  VolumeX,
  Volume2,
} from "lucide-react";
import { Badge } from "./ui/badge";
import api from "../lib/api";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
import CommentDialog from "./CommentDialog";

const ReelItem = ({ reel, isActive, onLike, onComment }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Changed to false for audio by default
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    setLiked(reel.likes?.includes(user?._id) || false);
    setLikeCount(reel.likes?.length || 0);
  }, [reel, user]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      // Set initial volume
      video.volume = 0.7;
      video.muted = isMuted;
      video.play().catch((e) => {
        console.log("Video play failed:", e);
        // If autoplay fails, try muted first
        video.muted = true;
        setIsMuted(true);
        video.play();
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }

    const handleVideoEnd = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener("ended", handleVideoEnd);
    return () => video.removeEventListener("ended", handleVideoEnd);
  }, [isActive, isMuted]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);

    // If unmuting, ensure video is playing
    if (!video.muted && video.paused) {
      video.play().catch(console.error);
    }

    // Show toast feedback
    toast.success(video.muted ? "Sound off" : "Sound on");
  };

  const handleLike = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await api.get(`/api/v1/post/${reel._id}/${action}`);
      if (res.data.success) {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        onLike(reel._id, !liked);
      }
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const formatDuration = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="reel-container relative snap-start snap-always overflow-hidden">
      {/* Video Container */}
      <video
        ref={videoRef}
        src={reel.video}
        className="reel-video"
        muted={isMuted}
        playsInline
        loop
        onClick={togglePlayPause}
        preload="metadata"
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20"
          onClick={togglePlayPause}
        >
          <Play className="w-20 h-20 text-white opacity-80" fill="white" />
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="text-white">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
            Reel
          </Badge>
          {isMuted && (
            <p className="text-xs mt-1 bg-black/50 rounded px-2 py-1">
              Tap 🔊 for sound
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className={`text-white hover:bg-white/20 ${
              !isMuted ? "bg-white/20" : ""
            }`}
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-end justify-between">
          {/* Left side - User info and caption */}
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={reel.author?.profilePicture} />
                <AvatarFallback className="bg-purple-500 text-white">
                  {reel.author?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  @{reel.author?.username}
                </h3>
                {reel.duration && (
                  <span className="text-white/70 text-xs">
                    {formatDuration(reel.duration)}
                  </span>
                )}
              </div>
            </div>
            {reel.caption && (
              <p className="text-white text-sm mb-2 line-clamp-3">
                {reel.caption}
              </p>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col gap-4 items-center">
            {/* Like */}
            <div className="flex flex-col items-center">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-12 w-12"
                onClick={handleLike}
              >
                {liked ? (
                  <FaHeart size={24} className="text-red-500" />
                ) : (
                  <FaRegHeart size={24} />
                )}
              </Button>
              <span className="text-white text-xs font-semibold">
                {likeCount > 0
                  ? likeCount > 999
                    ? `${Math.floor(likeCount / 1000)}k`
                    : likeCount
                  : ""}
              </span>
            </div>

            {/* Comment */}
            <div className="flex flex-col items-center">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-12 w-12"
                onClick={() => setShowComments(true)}
              >
                <MessageCircle size={24} />
              </Button>
              <span className="text-white text-xs font-semibold">
                {reel.comments?.length > 0 ? reel.comments.length : ""}
              </span>
            </div>

            {/* Share */}
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 h-12 w-12"
            >
              <Share size={24} />
            </Button>

            {/* Bookmark */}
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 h-12 w-12"
            >
              <Bookmark size={24} />
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Dialog */}
      {showComments && (
        <CommentDialog
          open={showComments}
          setOpen={setShowComments}
          post={reel}
        />
      )}
    </div>
  );
};

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    // Intersection Observer to detect which reel is currently visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index"));
            setCurrentIndex(index);
          }
        });
      },
      {
        threshold: 0.8,
        rootMargin: "0px 0px -20% 0px",
      }
    );

    const reelElements = containerRef.current?.querySelectorAll("[data-index]");
    reelElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reels]);

  const fetchReels = async () => {
    try {
      const res = await api.get("/api/v1/post/reels");
      if (res.data.success) {
        setReels(res.data.reels);
      }
    } catch (error) {
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (reelId, liked) => {
    setReels((prevReels) =>
      prevReels.map((reel) =>
        reel._id === reelId
          ? {
              ...reel,
              likes: liked
                ? [...(reel.likes || []), "currentUser"]
                : (reel.likes || []).filter((id) => id !== "currentUser"),
            }
          : reel
      )
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading Reels...</div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h2 className="text-2xl font-bold mb-4">No Reels Yet</h2>
        <p className="text-gray-400 text-center mb-6">
          Be the first to create a reel!
          <br />
          Share your moments with the world.
        </p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-20 overflow-y-auto snap-y snap-mandatory bg-black scrollbar-hide flex flex-col items-center"
      ref={containerRef}
    >
      {reels.map((reel, index) => (
        <div
          key={reel._id}
          data-index={index}
          className="w-full min-h-screen flex items-center justify-center"
        >
          <ReelItem
            reel={reel}
            isActive={index === currentIndex}
            onLike={handleLike}
            onComment={() => {}}
          />
        </div>
      ))}
    </div>
  );
};

export default Reels;
