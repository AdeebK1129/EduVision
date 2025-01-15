import { useAuth } from '../context/AuthContext';

export const useAuthToken = () => {
  const { token } = useAuth();
  return token;
};

export const useSetAuthToken = () => {
  const { setToken } = useAuth();
  return setToken;
};

export const useLogout = () => {
  const { logout } = useAuth();
  return logout;
};
