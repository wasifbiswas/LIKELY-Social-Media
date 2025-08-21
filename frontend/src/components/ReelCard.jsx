import React from "react";
import { Video, Play } from "lucide-react";
import { Link } from "react-router-dom";

const ReelCard = ({ reel }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return "";
    return `${Math.floor(seconds / 60)}:${(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Link to={`/reels?id=${reel._id}`} className="group relative">
      <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
        {/* Video Thumbnail */}
        <video
          src={reel.video}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          muted
          preload="metadata"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                <span>Reel</span>
              </div>
              {reel.duration && (
                <span className="bg-black/30 px-1 rounded">
                  {formatDuration(reel.duration)}
                </span>
              )}
            </div>

            {reel.caption && (
              <p className="text-white text-xs mt-1 line-clamp-2">
                {reel.caption}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ReelCard;
