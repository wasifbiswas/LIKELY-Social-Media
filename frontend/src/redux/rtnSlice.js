import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    notifications: [], // [{type, userId, userDetails, message, timestamp, postId?, id}]
  },
  reducers: {
    setLikeNotification: (state, action) => {
      // Ensure notifications array exists
      if (!state.notifications) {
        state.notifications = [];
      }
      if (action.payload.type === "like") {
        const existingIndex = state.notifications.findIndex(
          (notif) =>
            notif.userId === action.payload.userId &&
            notif.postId === action.payload.postId &&
            notif.type === "like"
        );
        if (existingIndex === -1) {
          const notification = {
            ...action.payload,
            timestamp: action.payload.timestamp || Date.now(),
            id: `${action.payload.userId}-${
              action.payload.postId
            }-${Date.now()}`,
          };
          state.notifications.unshift(notification);
        }
      } else if (action.payload.type === "dislike") {
        state.notifications = state.notifications.filter(
          (notif) =>
            !(
              notif.userId === action.payload.userId &&
              notif.postId === action.payload.postId &&
              notif.type === "like"
            )
        );
      }
    },
    addNotification: (state, action) => {
      // Ensure notifications array exists
      if (!state.notifications) {
        state.notifications = [];
      }
      const notification = {
        ...action.payload,
        timestamp: action.payload.timestamp || Date.now(),
        id: `${action.payload.type}-${action.payload.userId}-${Date.now()}`,
      };
      state.notifications.unshift(notification);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    removeNotification: (state, action) => {
      // Ensure notifications array exists
      if (!state.notifications) {
        state.notifications = [];
        return;
      }
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload
      );
    },
  },
});
export const {
  setLikeNotification,
  addNotification,
  clearNotifications,
  removeNotification,
} = rtnSlice.actions;
export default rtnSlice.reducer;
