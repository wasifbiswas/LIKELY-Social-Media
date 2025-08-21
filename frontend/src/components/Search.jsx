import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import { Search as SearchIcon, UserCheck, UserPlus } from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(
        `/api/v1/user/search?query=${encodeURIComponent(query)}`
      );
      if (res.data.success) {
        setSearchResults(res.data.users);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Search failed");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const followOrUnfollowHandler = async (targetUserId) => {
    try {
      if (user._id === targetUserId) {
        toast.error("You cannot follow yourself");
        return;
      }

      setFollowLoading((prev) => ({ ...prev, [targetUserId]: true }));
      const res = await api.post(
        `/api/v1/user/followorunfollow/${targetUserId}`
      );

      if (res.data.success) {
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
      setFollowLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Search</h1>

        {/* Search Input */}
        <div className="relative mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 text-base focus-visible:ring-transparent"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {/* No Query State */}
        {!searchQuery.trim() && !loading && (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              Search for people
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Find users by their username or bio
            </p>
          </div>
        )}

        {/* No Results */}
        {searchQuery.trim() && !loading && searchResults.length === 0 && (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600">No users found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try searching for a different name or keyword
            </p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {searchResults.length}{" "}
              {searchResults.length === 1 ? "result" : "results"} found
            </h2>
            {searchResults.map((searchUser) => {
              const isFollowing = (user.following || []).includes(
                searchUser._id
              );
              const isLoading = followLoading[searchUser._id];

              return (
                <div
                  key={searchUser._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${searchUser._id}`}>
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={searchUser.profilePicture}
                          alt="profile"
                        />
                        <AvatarFallback>
                          {searchUser.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link
                        to={`/profile/${searchUser._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {searchUser.username}
                      </Link>
                      {searchUser.bio && (
                        <p className="text-sm text-gray-600 mt-1">
                          {searchUser.bio.length > 50
                            ? `${searchUser.bio.substring(0, 50)}...`
                            : searchUser.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>
                          {searchUser.followers?.length || 0} followers
                        </span>
                        <span>{searchUser.posts?.length || 0} posts</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    size="sm"
                    onClick={() => followOrUnfollowHandler(searchUser._id)}
                    disabled={isLoading}
                    className={`min-w-[80px] ${
                      isFollowing
                        ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        : "bg-[#0095F6] hover:bg-[#3192d2]"
                    }`}
                  >
                    {isLoading ? (
                      "Loading..."
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
