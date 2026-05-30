import { Modal } from "antd";
import { useState } from "react";
import { FileUpload } from "./FileUpload";

interface UploadImageModalProps {
  isOpen: boolean;
  handleClose: (imageSrc?: string) => void;
  type: "image" | "file";
}

export function UploadModal(props: UploadImageModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");

  return (
    <Modal
      title={props.type === "image" ? "上传图片" : "上传文件"}
      open={props.isOpen}
      onOk={() => {
        props.handleClose(imgSrc);
        setImgSrc("");
      }}
      onCancel={() => props.handleClose()}
      okText={"确认"}
      cancelText={"取消"}
    >
      <FileUpload
        value={imgSrc}
        onChange={(value: string) => {
          setImgSrc(value);
        }}
        type={props.type}
      />
    </Modal>
  );
}
