import {
  checkPasswordStrength
} from "../utils/passwordStrength";

export default function PasswordStrengthMeter({
  password
}) {

  const strength =
    checkPasswordStrength(password);

  return (

    <div className="mt-2">

      <div
        className="
        w-full
        h-3
        bg-gray-200
        rounded-full
        overflow-hidden
        "
      >

        <div
          className={`
            h-full
            transition-all
            ${
              strength.score <= 2
                ? "bg-red-500 w-1/3"

              : strength.score <= 4
                ? "bg-yellow-500 w-2/3"

              : "bg-green-500 w-full"
            }
          `}
        />

      </div>

      <p
        className="
        text-sm
        mt-1
        font-medium
        "
      >
        Seguridad: {strength.label}
      </p>

    </div>
  );
}