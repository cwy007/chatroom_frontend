import axios from "axios";
import type { RegisterUser } from "@/pages/Register";
import type { UpdatePassword } from "@/pages/UpdatePassword";
import type { UserInfo } from "@/pages/UpdateInfo";
import message from "antd/lib/message";

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 9000
});

axiosInstance.interceptors.request.use(function (config) {
  const accessToken = localStorage.getItem('token');

  if (accessToken) {
    config.headers.authorization = 'Bearer ' + accessToken;
  }
  return config;
})

axiosInstance.interceptors.response.use(
  (response) => {
    const newToken = response.headers['token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response;
  }, async (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }
    let { data } = error.response;
    if (data.statusCode === 401) {
      message.error(data.message);

      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else {
      return Promise.reject(error);
    }
  }
)


export async function login(username: string, password: string) {
  return await axiosInstance.post('/user/login', {
    username, password
  });
}

export async function registerCaptcha(email: string) {
  return await axiosInstance.get('/user/register-captcha', {
    params: {
      email
    }
  });
}

export async function register(registerUser: RegisterUser) {
  return await axiosInstance.post('/user/register', registerUser);
}

export async function updatePasswordCaptcha(email: string) {
  return await axiosInstance.get('/user/update_password_captcha', {
    params: {
      email
    }
  });
}

export async function updatePassword(data: UpdatePassword) {
  return await axiosInstance.post('/user/update_password', data);
}

export async function getUserInfo() {
  return await axiosInstance.get('/user/info');
}

export async function updateInfo(data: UserInfo) {
  return await axiosInstance.post('/user/update', data);
}

export async function updateUserInfoCaptcha(email: string) {
  return await axiosInstance.get('/user/update_user_captcha', {
    params: {
      email
    }
  });
}

export async function friendshipList(nickname?: string) {
  return axiosInstance.get(`/friendship/list?nickname=${nickname || ''}`);
}

export async function chatroomList(name: string) {
  return axiosInstance.get(`/chatroom/list?name=${name}`);
}
