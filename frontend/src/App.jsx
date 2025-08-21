import { useEffect, Suspense } from "react";
import ChatPage from "./components/ChatPage";
import EditProfile from "./components/EditProfile";
import Home from "./components/Home";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import Search from "./components/Search";
import Explore from "./components/Explore";
import Notifications from "./components/Notifications";
import Reels from "./components/Reels";
import NotFound from "./components/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification, addNotification } from "./redux/rtnSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { toast } from "sonner";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes>
            {" "}
            <Profile />
          </ProtectedRoutes>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes>
            <EditProfile />
          </ProtectedRoutes>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes>
            <ChatPage />
          </ProtectedRoutes>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/search",
        element: (
          <ProtectedRoutes>
            <Search />
          </ProtectedRoutes>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/explore",
        element: (
          <ProtectedRoutes>
            <Explore />
          </ProtectedRoutes>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/notifications",
        element: (
          <ProtectedRoutes>
            <Notifications />
          </ProtectedRoutes>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/reels",
        element: (
          <ProtectedRoutes>
            <Reels />
          </ProtectedRoutes>
        ),
        errorElement: <NotFound />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <NotFound />,
  },
  {
    path: "/signup",
    element: <Signup />,
    errorElement: <NotFound />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:8000", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));

      // listen all the events
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on("notification", (notification) => {
        if (notification.type === "like" || notification.type === "dislike") {
          dispatch(setLikeNotification(notification));
        } else {
          dispatch(addNotification(notification));
          // Show toast for message notifications
          if (notification.type === "message") {
            toast(
              `💬 ${notification.userDetails?.username} sent you a message`,
              {
                duration: 3000,
              }
            );
          }
        }
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={browserRouter} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
