import { Button, Input, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./index.scss";
import { chatroomList, chatHistoryList } from "@/interfaces";
import type { UserInfo } from "../UpdateInfo";
import TextArea from "antd/es/input/TextArea";
import { useLocation } from "react-router-dom";

interface JoinRoomPayload {
  chatroomId: number;
  userId: number;
}

interface SendMessagePayload {
  sendUserId: number;
  chatroomId: number;
  message: Message;
}

interface Message {
  type: "text" | "image";
  content: string;
}

type Reply =
  | {
      type: "sendMessage";
      userId: number;
      message: ChatHistory;
    }
  | {
      type: "joinRoom";
      userId: number;
    };

interface ChatHistory {
  id: number;
  content: string;
  type: number;
  chatroomId: number;
  senderId: number;
  createTime: Date;
  sender: UserInfo;
}

interface Chatroom {
  id: number;
  name: string;
  type: number;
  createdAt: Date;
}

interface User {
  id: number;
  headPic: string;
  nickname: string;
  username: string;
  email: string;
}

export function getUserInfo() {
  return JSON.parse(localStorage.getItem("userInfo") || "{}") as User;
}

function Chat() {
  const [messageList, setMessageList] = useState<Array<Message>>([]);
  const socketRef = useRef<Socket>(null);
  const [roomList, setRoomList] = useState<Array<Chatroom>>();
  const [inputText, setInputText] = useState("");
  const [roomId, setRoomId] = useState<number>();
  const userInfo = getUserInfo();
  const location = useLocation();

  useEffect(() => {
    queryChatroomList();
  }, []);

  const [chatHistory, setChatHistory] = useState<Array<ChatHistory>>();

  async function queryChatHistoryList(chatroomId: number) {
    try {
      const res = await chatHistoryList(chatroomId);

      if (res.status === 201 || res.status === 200) {
        setChatHistory(
          res.data.map((item: Chatroom) => {
            return {
              ...item,
              key: item.id,
            };
          }),
        );
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || "系统繁忙，请稍后再试");
    }
  }

  async function queryChatroomList() {
    try {
      const res = await chatroomList();

      if (res.status === 201 || res.status === 200) {
        setRoomList(
          (res.data?.chatRooms || []).map((item: Chatroom) => {
            return {
              ...item,
              key: item.id,
            };
          }),
        );

        const firstRoom = res.data?.chatRooms?.[0];
        const chatroomIdFromState = (location.state as any)?.chatroomId;
        if (chatroomIdFromState) {
          setRoomId(chatroomIdFromState);
          queryChatHistoryList(chatroomIdFromState);
        } else if (firstRoom) {
          setRoomId(firstRoom.id);
          queryChatHistoryList(firstRoom.id);
        }
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || "系统繁忙，请稍后再试");
    }
  }

  useEffect(() => {
    if (!roomId) {
      return;
    }
    const socket = (socketRef.current = io("http://localhost:3000"));
    socket.on("connect", function () {
      const payload: JoinRoomPayload = {
        chatroomId: roomId!,
        userId: getUserInfo().id,
      };

      socket.emit("joinRoom", payload);

      socket.on("message", (reply: Reply) => {
        if (reply.type === "sendMessage") {
          setChatHistory((prev) => [...(prev || []), reply.message]);
          setTimeout(() => {
            document.getElementById("bottom-bar")?.scrollIntoView({ block: "end" });
          }, 300);
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  function sendMessage(value: string) {
    if (!value) {
      return;
    }
    if (!roomId) {
      return;
    }
    const payload: SendMessagePayload = {
      sendUserId: getUserInfo().id,
      chatroomId: roomId,
      message: {
        type: "text",
        content: value,
      },
    };

    socketRef.current?.emit("sendMessage", payload);
  }

  return (
    <div id="chat-container">
      <div className="chat-room-list">
        {roomList?.map((item) => {
          return (
            <div
              className={`chat-room-item ${item.id === roomId ? "selected" : ""}`}
              data-id={item.id}
              key={item.id}
              onClick={() => {
                setRoomId(item.id);
                queryChatHistoryList(item.id);
              }}
            >
              {item.name}
            </div>
          );
        })}
      </div>
      <div className="message-list">
        {chatHistory?.map((item) => {
          return (
            <div
              className={`message-item ${item.senderId === userInfo.id ? "from-me" : ""}`}
              data-id={item.id}
              key={item.id}
            >
              <div className="message-sender">
                <img src={item.sender.headPic} />
                <span className="sender-nickname">{item.sender.nickname}</span>
              </div>
              <div className="message-content">{item.content}</div>
            </div>
          );
        })}
        <div id="bottom-bar" key="bottom-bar"></div>
      </div>

      <div className="message-input">
        <div className="message-type">
          <div className="message-type-item">文本</div>
          <div className="message-type-item">图片</div>
          <div className="message-type-item">文件</div>
        </div>
        <div className="message-input-area">
          <TextArea
            className="message-input-box"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Button
            type="primary"
            className="message-send-btn"
            onClick={() => {
              sendMessage(inputText);
              setInputText("");
            }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
