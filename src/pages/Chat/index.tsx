import { Button, Image, message, Popover } from "antd";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./index.scss";
import { chatroomList, chatHistoryList } from "@/interfaces";
import type { UserInfo } from "../UpdateInfo";
import TextArea from "antd/es/input/TextArea";
import { useLocation } from "react-router-dom";
import EmojiPicker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import { UploadModal } from "./UploadModal";

interface JoinRoomPayload {
  chatroomId: number;
  userId: number;
}

interface SendMessagePayload {
  sendUserId: number;
  chatroomId: number;
  message: Message;
}

type MessageType = "text" | "image" | "file";

interface Message {
  type: MessageType;
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
  type: 0 | 1 | 2; // 0: 文本，1：图片，2：文件
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
  const socketRef = useRef<Socket>(null);
  const [roomList, setRoomList] = useState<Array<Chatroom>>();
  const [inputText, setInputText] = useState("");
  const [roomId, setRoomId] = useState<number>();
  const userInfo = getUserInfo();
  const location = useLocation();
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "file">("image");

  useEffect(() => {
    queryChatroomList();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      document.getElementById("bottom-bar")?.scrollIntoView({ block: "end" });
    }, 300);
  }, [roomId]);

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
        console.log("收到消息", reply);
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

  function sendMessage(value: string, type: MessageType = "text") {
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
        type,
        content: value,
      },
    };

    socketRef.current?.emit("sendMessage", payload);
  }

  const renderMessageContent = (message: ChatHistory) => {
    if (message.type === 0) {
      return message.content;
    } else if (message.type === 1) {
      return <Image src={message.content} style={{ maxWidth: "200px" }} />;
    } else if (message.type === 2) {
      return (
        <div
          style={{
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
            maxWidth: "400px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          onClick={() => window.open(message.content)}
        >
          {message.content}
        </div>
      );
    }
  };

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
                <Image src={item.sender.headPic} />
                <span className="sender-nickname">{item.sender.nickname}</span>
              </div>
              <div className="message-content">{renderMessageContent(item)}</div>
            </div>
          );
        })}
        <div id="bottom-bar" key="bottom-bar"></div>
      </div>

      <div className="message-input">
        <div className="message-type">
          <Popover
            trigger="click"
            content={
              <EmojiPicker
                data={emojiData}
                onEmojiSelect={(emoji: any) => {
                  setInputText((prev) => prev + emoji.native);
                }}
              />
            }
          >
            <div className="message-type-item">表情</div>
          </Popover>
          <div
            className="message-type-item"
            onClick={() => {
              setUploadModalOpen(true);
              setUploadType("image");
            }}
          >
            图片
          </div>
          <div
            className="message-type-item"
            onClick={() => {
              setUploadModalOpen(true);
              setUploadType("file");
            }}
          >
            文件
          </div>
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

      <UploadModal
        type={uploadType}
        isOpen={isUploadModalOpen}
        handleClose={(src) => {
          setUploadModalOpen(false);
          // console.log("图片地址", src);
          // if (src) {
          //   sendMessage(src, 1);
          // }
          const testSrc =
            "https://cdn.jsdelivr.net/gh/cwy007/pic_bed@main/images/60249ce21c284c928086815fec6801e9~tplv-k3u1fbpfcp-jj-mark%3A3024%3A0%3A0%3A0%3Aq75.awebp";
          sendMessage(testSrc, uploadType === "image" ? "image" : "file");
        }}
      />
    </div>
  );
}

export default Chat;
