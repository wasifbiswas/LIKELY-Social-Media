import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, Image, Video } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const videoRef = useRef();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [isReel, setIsReel] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e, type) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (type === "image" && !selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (type === "video" && !selectedFile.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }

      // Validate video duration (max 60 seconds for reels)
      if (type === "video") {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            toast.error("Video must be 60 seconds or less");
            return;
          }
        };
        video.src = URL.createObjectURL(selectedFile);
      }

      setFile(selectedFile);
      setMediaType(type);
      const dataUrl = await readFileAsDataURL(selectedFile);
      setMediaPreview(dataUrl);

      // Auto-set as reel if video is selected
      if (type === "video") {
        setIsReel(true);
      }
    }
  };

  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("isReel", isReel);
    if (file) formData.append("media", file);

    try {
      setLoading(true);
      const res = await api.post("/api/v1/post/addpost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        // Reset form
        setCaption("");
        setFile(null);
        setMediaPreview("");
        setMediaType("");
        setIsReel(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-lg"
      >
        <DialogHeader className="text-center font-semibold">
          Create New {mediaType === "video" ? "Reel" : "Post"}
        </DialogHeader>
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>W</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-gray-600 text-xs">Bio here...</span>
          </div>
        </div>

        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus-visible:ring-transparent border-none"
          placeholder={`Write a caption for your ${
            mediaType === "video" ? "reel" : "post"
          }...`}
        />

        {/* Media Type Selection */}
        {!mediaPreview && (
          <div className="flex gap-2">
            <Button
              onClick={() => imageRef.current.click()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Image className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              onClick={() => videoRef.current.click()}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Reel
            </Button>
          </div>
        )}

        {/* Media Preview */}
        {mediaPreview && (
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            {mediaType === "video" ? (
              <video
                src={mediaPreview}
                className="object-cover h-full w-full rounded-md"
                controls
                muted
              />
            ) : (
              <img
                src={mediaPreview}
                alt="preview_img"
                className="object-cover h-full w-full rounded-md"
              />
            )}
          </div>
        )}

        {/* Reel Toggle */}
        {mediaType === "video" && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isReel"
              checked={isReel}
              onChange={(e) => setIsReel(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isReel" className="text-sm">
              Post as Reel (appears in Reels section)
            </label>
          </div>
        )}

        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => fileChangeHandler(e, "image")}
        />
        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => fileChangeHandler(e, "video")}
        />

        {mediaPreview && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setMediaPreview("");
                setFile(null);
                setMediaType("");
                setIsReel(false);
              }}
              variant="outline"
              className="flex-1"
            >
              Change Media
            </Button>
            {loading ? (
              <Button disabled className="flex-1">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </Button>
            ) : (
              <Button
                onClick={createPostHandler}
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Share {mediaType === "video" ? "Reel" : "Post"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
