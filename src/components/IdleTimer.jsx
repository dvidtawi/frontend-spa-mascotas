import {
  useEffect
} from "react";

import {
  useAuth
} from "../auth/AuthContext";

export default function IdleTimer() {

  const { logout } =
    useAuth();

  useEffect(() => {

    let timeout;

    const resetTimer = () => {

      clearTimeout(timeout);

      timeout = setTimeout(() => {

        logout();

      }, 5 * 60 * 1000);
    };

    window.addEventListener(
      "mousemove",
      resetTimer
    );

    window.addEventListener(
      "keydown",
      resetTimer
    );

    resetTimer();

    return () => {

      clearTimeout(timeout);

      window.removeEventListener(
        "mousemove",
        resetTimer
      );

      window.removeEventListener(
        "keydown",
        resetTimer
      );
    };

  }, []);

  return null;
}