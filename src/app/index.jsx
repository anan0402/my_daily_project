import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

import { router } from "@/app/router";
import { useGlobalSocketSubscriptions } from "@/app/use-global-socket-subscriptions";
import { initSocket, disconnectSocket } from "@/lib/socket";
import { selectCurrentUser } from "@/lib/store/user-slice";

function App() {
  const currentUser = useSelector(selectCurrentUser);
  const queryClient = useQueryClient();

  // Initialize socket connection when user is logged in (handles page refresh)
  useEffect(() => {
    if (currentUser) {
      initSocket();
    } else {
      disconnectSocket();
      // Clear all React Query cache when user logs out or refresh token expires
      queryClient.clear();
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [currentUser, queryClient]);

  // Global socket subscriptions (always active after login)
  useGlobalSocketSubscriptions();

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        newestOnTop
        theme="light"
        closeButton={false}
        toastStyle={{
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        }}
      />
    </>
  );
}

export default App;
