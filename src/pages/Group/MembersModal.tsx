import { message, Modal, Table } from "antd";
import { type ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { groupMembers } from "../../interfaces";

export interface MembersModalProps {
  isOpen: boolean;
  chatroomId: number;
  handleClose: () => void;
}

interface User {
  id: number;
  username: string;
  nickname: string;
  headPic: string;
  email: string;
}

export function MembersModal(props: MembersModalProps) {
  const [members, setMembers] = useState<Array<User>>();

  const queryMembers = async () => {
    try {
      const res = await groupMembers(props.chatroomId);
      console.log(res);

      if (res.status === 201 || res.status === 200) {
        setMembers(
          (res.data?.members || []).map((item: User) => {
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
  };

  useEffect(() => {
    if (props.isOpen) {
      queryMembers();
    }
  }, [props.chatroomId, props.isOpen]);

  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "用户名",
      dataIndex: "username",
    },
    {
      title: "昵称",
      dataIndex: "nickname",
    },
    {
      title: "头像",
      dataIndex: "headPic",
      render: (_, record) => (
        <div>
          <img src={record.headPic} width={50} height={50} />
        </div>
      ),
    },
    {
      title: "邮箱",
      dataIndex: "email",
    },
  ];

  return (
    <Modal
      title="群聊成员"
      open={props.isOpen}
      onCancel={() => props.handleClose()}
      onOk={() => props.handleClose()}
      width={1000}
    >
      <Table columns={columns} dataSource={members} pagination={false} />
    </Modal>
  );
}
