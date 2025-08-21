import { setReels } from "@/redux/postSlice";
import api from "../lib/api";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllReels = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllReels = async () => {
      try {
        const res = await api.get("/api/v1/post/reels");
        if (res.data.success) {
          dispatch(setReels(res.data.reels));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllReels();
  }, [dispatch]);
};

export default useGetAllReels;
