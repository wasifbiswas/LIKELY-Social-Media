import React from "react";
import Posts from "./Posts";

const Feed = () => {
  return (
    <div className="flex-1 my-4 lg:my-8 flex flex-col items-center px-4 lg:pl-[20%] lg:pr-4">
      <Posts />
    </div>
  );
};

export default Feed;
