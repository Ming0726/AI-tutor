"use client";

import { create } from "zustand";

type ToastType = "success" | "error";

type ToastStore = {
  visible: boolean;
  message: string;
  type: ToastType;
  showToast: (payload: { message: string; type?: ToastType }) => void;
  hideToast: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  visible: false,
  message: "",
  type: "success",
  showToast: ({ message, type = "success" }) =>
    set({ visible: true, message, type }),
  hideToast: () => set((state) => ({ ...state, visible: false })),
}));
