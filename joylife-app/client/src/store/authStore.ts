import { create } from './create';
import { authApi, UserInfo, AuthResult } from '../api/auth';

interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
}

interface AuthActions {
  login: (result: AuthResult) => void;
  logout: () => void;
  setUserInfo: (userInfo: UserInfo) => void;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo') || 'null')
    : null,
  isLoggedIn: !!localStorage.getItem('token'),
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,
  login: (result: AuthResult) => {
    localStorage.setItem('token', result.token);
    localStorage.setItem('userInfo', JSON.stringify(result.user));
    set({
      token: result.token,
      userInfo: result.user,
      isLoggedIn: true,
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    set({
      token: null,
      userInfo: null,
      isLoggedIn: false,
    });
  },
  setUserInfo: (userInfo: UserInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    set({ userInfo });
  },
}));
