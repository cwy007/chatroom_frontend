import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UpdatePassword from "@/pages/UpdatePassword";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Index } from "./pages/Index";
import { UpdateInfo } from "./pages/UpdateInfo";
import Group from "./pages/Group";
import Collection from "./pages/Collection";
import Chat from "./pages/Chat";
import Notification from "./pages/Notification";
import Menu from "./pages/Menu";
import Friendship from "./pages/Friendship";

const routes = [
  {
    path: "/",
    element: <Index />,
    children: [
      {
        path: "update_info",
        element: <UpdateInfo />,
      },
      {
        path: "/",
        element: <Menu />,
        children: [
          {
            path: "/",
            element: <Friendship />,
          },
          {
            path: "group",
            element: <Group />,
          },
          {
            path: "chat",
            element: <Chat />,
          },
          {
            path: "collection",
            element: <Collection />,
          },
          {
            path: "notification",
            element: <Notification />,
          },
        ],
      },
    ],
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

export const router = createBrowserRouter(routes);

const root = createRoot(document.getElementById("root")!);

root.render(
  <ConfigProvider locale={zhCN}>
    <RouterProvider router={router} />
  </ConfigProvider>,
);
