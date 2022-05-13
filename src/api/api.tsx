import axios from 'axios';

const API_URL = 'http://172.105.75.240:8080/http://172.105.75.240:4000';

export const signUp = async (username: string, login: string, password: string) => {
  return await axios
    .post(`${API_URL}/signup`, {
      name: username,
      login: login,
      password: password,
    })
    .then((res) => res.data);
};

export const signIn = async (login: string, password: string) => {
  return await axios
    .post(`${API_URL}/signin`, {
      login: login,
      password: password,
    })
    .then((res) => {
      if (res.data.token) {
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      return res.data;
    });
};

export const signOut = async () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

export const authHeader = async () => {
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr) user = JSON.parse(userStr);
  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken };
  } else {
    return {};
  }
};
export const getBoards = async (token: string) => {
  return await axios
    .get(`${API_URL}/boards`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: `application/json`,
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.data);
};

export const addBoard = async (token: string, title: string) => {
  return await axios
    .post(
      `${API_URL}/boards`,
      {
        title: title,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: `application/json`,
          'Content-Type': 'application/json',
        },
      }
    )
    .then((res) => res.data);
};

export const deleteBoard = async (boardId: string, token: string) => {
  return await axios.delete(`${API_URL}/boards/${boardId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: `application/json`,
      'Content-Type': 'application/json',
    },
  });
};
