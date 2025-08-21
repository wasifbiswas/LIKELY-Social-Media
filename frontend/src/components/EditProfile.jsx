import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import api from "../lib/api";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const EditProfile = () => {
  const imageRef = useRef();
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto: null,
    bio: user?.bio || "",
    gender: user?.gender || "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Cleanup function to revoke object URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetImageHandler = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setInput({ ...input, profilePhoto: null });
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, profilePhoto: file });

      // Revoke previous preview URL to prevent memory leaks
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      // Create new preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  const editProfileHandler = async () => {
    console.log("Input data:", input);
    const formData = new FormData();
    formData.append("bio", input.bio || "");
    if (
      input.gender &&
      (input.gender === "male" || input.gender === "female")
    ) {
      formData.append("gender", input.gender);
    }
    if (input.profilePhoto && input.profilePhoto instanceof File) {
      formData.append("profilePhoto", input.profilePhoto);
    }

    // Debug: Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      setLoading(true);
      const res = await api.post("/api/v1/user/profile/edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response:", res.data);

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user.gender,
        };
        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log("Error details:", error);
      console.log("Error response:", error.response);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex max-w-2xl mx-auto px-4 lg:pl-10 pt-16 lg:pt-0 pb-16 lg:pb-0">
      <section className="flex flex-col gap-4 lg:gap-6 w-full my-4 lg:my-8">
        <h1 className="font-bold text-lg lg:text-xl">Edit Profile</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-100 rounded-xl p-4 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-16 h-16 lg:w-20 lg:h-20">
                <AvatarImage
                  src={imagePreview || user?.profilePicture}
                  alt="profile_image"
                />
                <AvatarFallback>W</AvatarFallback>
              </Avatar>
              {imagePreview && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                  New
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold text-sm lg:text-base">
                {user?.username}
              </h1>
              <span className="text-gray-600 text-xs lg:text-sm">
                {user?.bio || "Bio here..."}
              </span>
            </div>
          </div>
          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            className="hidden"
          />
          <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
            <Button
              onClick={() => imageRef?.current.click()}
              className="bg-[#0095F6] h-8 lg:h-10 hover:bg-[#318bc7] text-xs lg:text-sm"
            >
              {imagePreview ? "Choose different" : "Change photo"}
            </Button>
            {imagePreview && (
              <Button
                onClick={resetImageHandler}
                variant="outline"
                className="h-8 lg:h-10 text-xs lg:text-sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        <div>
          <h1 className="font-bold text-lg lg:text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            name="bio"
            className="focus-visible:ring-transparent text-sm lg:text-base"
          />
        </div>
        <div>
          <h1 className="font-bold mb-2 text-lg lg:text-xl">Gender</h1>
          <Select
            value={input.gender || undefined}
            onValueChange={selectChangeHandler}
          >
            <SelectTrigger className="w-full text-sm lg:text-base">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
