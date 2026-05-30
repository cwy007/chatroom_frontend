import { Modal } from "antd";
import { useState } from "react";
import { ImageUpload } from "./ImageUpload";

interface UploadImageModalProps {
  isOpen: boolean;
  handleClose: (imageSrc?: string) => void;
}

export function UploadImageModal(props: UploadImageModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");

  return (
    <Modal
      title="上传图片"
      open={props.isOpen}
      onOk={() => {
        props.handleClose(imgSrc);
        setImgSrc("");
      }}
      onCancel={() => props.handleClose()}
      okText={"确认"}
      cancelText={"取消"}
    >
      <ImageUpload
        value={imgSrc}
        onChange={(value: string) => {
          setImgSrc(value);
        }}
      />
    </Modal>
  );
}
