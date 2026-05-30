import { UserOutlined } from "@ant-design/icons";
import { Link, Outlet } from "react-router-dom";
import "./index.css";

export function Index() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const getInfoElement = () => {
    if (userInfo.headPic) {
      return <img src={userInfo.headPic} alt="头像" className="avatar" width={60} height={60} />;
    } else if (userInfo.username) {
      return <div className="avatar">{userInfo.username}</div>;
    }
    return <UserOutlined className="icon" />;
  };
  return (
    <div id="index-container">
      <div className="header">
        <h1>聊天室</h1>

        <Link to="/update_info">{getInfoElement()}</Link>
      </div>
      <div className="body">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
