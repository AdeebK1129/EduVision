import api from './api';

export async function loginUser(email: string, password: string) {
  const response = await api.post('/users/login/', { email, password });
  return response.data.token;
}

export async function registerUser(username: string, email: string, password: string) {
  await api.post('/users/register/', { username, email, password });
}


export async function fetchUserDetails() {
  const response = await api.get('/users/me/');
  return response.data;
}
