import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

const FIVE_MINUTES =
  5 * 60 * 1000;

export default function IdleTimer() {

  const { logout, user } =
    useAuth();

  useEffect(() => {

    if (!user) return;

    let timeout;

    const resetTimer = () => {

      clearTimeout(timeout);

      timeout = setTimeout(() => {

        alert(
          "Sesión cerrada por inactividad"
        );

        logout();

      }, FIVE_MINUTES);
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

  }, [user]);

  return null;
}