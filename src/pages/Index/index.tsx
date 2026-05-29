import { UserOutlined } from "@ant-design/icons";
import { Link, Outlet } from "react-router-dom";
import "./index.css";

export function Index() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  return (
    <div id="index-container">
      <div className="header">
        <h1>聊天室</h1>

        <Link to="/update_info">
          {userInfo.headPic ? (
            <img src={userInfo.headPic} alt="头像" className="avatar" width={60} height={60} />
          ) : (
            <UserOutlined className="icon" />
          )}
        </Link>
      </div>
      <div className="body">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
