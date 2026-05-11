export const checkPasswordStrength = (
  password
) => {

  let score = 0;

  if (password.length >= 8) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  }

  if (/[a-z]/.test(password)) {
    score++;
  }

  if (/[0-9]/.test(password)) {
    score++;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  if (score <= 2) {

    return {
      score,
      label: "Débil"
    };
  }

  if (score <= 4) {

    return {
      score,
      label: "Media"
    };
  }

  return {
    score,
    label: "Fuerte"
  };
};