import { create } from "zustand";

interface UiState {
  page: string;
  toast: string | null;
  isAuthenticated: boolean;
  setPage: (page: string) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  notify: (toast: string) => void;
  clearToast: () => void;
}

const SESSION_KEY = "nucleo-inventario-auth";

export const useUiStore = create<UiState>((set) => ({
  page: "Dashboard",
  toast: null,
  isAuthenticated: localStorage.getItem(SESSION_KEY) === "samuel",
  setPage: (page) => set({ page }),
  login: (username, password) => {
    const valid = username === "samuel" && password === "samuel";
    if (valid) {
      localStorage.setItem(SESSION_KEY, "samuel");
      set({ isAuthenticated: true, toast: "Sesión iniciada." });
    } else {
      set({ toast: "Usuario o contraseña incorrectos." });
    }
    return valid;
  },
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    set({ isAuthenticated: false, page: "Dashboard", toast: "Sesión cerrada." });
  },
  notify: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
}));
