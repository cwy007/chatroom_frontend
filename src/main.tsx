import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UpdatePassword from "@/pages/UpdatePassword";

const routes = [
  {
    path: "/",
    element: <div>index</div>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/update_password",
    element: <UpdatePassword />,
  },
];

const router = createBrowserRouter(routes);

const root = createRoot(document.getElementById("root")!);

root.render(<RouterProvider router={router} />);
