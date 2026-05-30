import { Badge, Button, Form, Input, Popconfirm, Table, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./index.css";
import { type ColumnsType } from "antd/es/table";
import { useForm } from "antd/es/form/Form";
import { chatroomList } from "../../interfaces";

interface SearchGroup {
  name: string;
}

interface GroupSearchResult {
  id: number;
  name: string;
  type: number;
  createdAt: Date;
}

function Group() {
  const [groupResult, setGroupResult] = useState<Array<GroupSearchResult>>([]);

  const columns: ColumnsType<GroupSearchResult> = useMemo(
    () => [
      {
        title: "名称",
        dataIndex: "name",
      },
      {
        title: "类型",
        render: (_, record) => {
          return record.type ? "群聊" : "单聊";
        },
      },
      {
        title: "创建时间",
        render: (_, record) => {
          return new Date(record.createdAt).toLocaleString();
        },
      },
      {
        title: "操作",
        render: (_, record) => (
          <div>
            <a href="#">聊天</a>
          </div>
        ),
      },
    ],
    [],
  );

  const searchGroup = async (values: SearchGroup) => {
    try {
      const res = await chatroomList(values.name || "");

      if (res.status === 201 || res.status === 200) {
        setGroupResult(
          (res.data?.chatRooms || []).map((item: GroupSearchResult) => {
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

  const [form] = useForm();

  useEffect(() => {
    searchGroup({
      name: form.getFieldValue("name"),
    });
  }, []);

  return (
    <div id="group-container">
      <div className="group-form">
        <Form form={form} onFinish={searchGroup} name="search" layout="inline" colon={false}>
          <Form.Item label="名称" name="name">
            <Input />
          </Form.Item>

          <Form.Item label=" ">
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="group-table">
        <Table columns={columns} dataSource={groupResult} style={{ width: "1000px" }} />
      </div>
    </div>
  );
}

export default Group;
