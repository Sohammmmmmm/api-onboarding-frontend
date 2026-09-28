import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { authenticated, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter email or username.");
      return;
    }

    if (!password) {
      setError("Please enter password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (!result?.success) {
        setError(
          result?.message ||
            "Invalid email/username or password."
        );

        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);

      setError("Unable to login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8fcff] px-4 py-8 sm:px-6 md:px-8">

      {/* =====================================================
          TOP LEFT BACKGROUND WAVE
          ===================================================== */}

      <div className="pointer-events-none absolute -left-20 -top-10 h-[260px] w-[85%] sm:h-[320px] sm:w-[70%] md:-left-16 md:h-[360px] md:w-[65%] lg:h-[400px] lg:w-[60%]">
        <svg
          viewBox="0 0 700 300"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0 0H700C580 20 530 75 440 105C340 138 285 128 205 92C125 56 75 25 0 20V0Z"
            fill="#dbeeff"
          />

          <path
            d="M0 0H700C580 45 540 100 445 130C345 162 280 150 200 112C120 74 70 38 0 34V0Z"
            fill="#c5e3ff"
            opacity="0.65"
          />

          <path
            d="M0 0H700C590 70 535 120 445 148C350 178 280 170 195 130C115 92 65 55 0 48V0Z"
            fill="#b3d9fa"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* =====================================================
          BOTTOM RIGHT BACKGROUND WAVE
          ===================================================== */}

      <div className="pointer-events-none absolute -bottom-10 -right-20 h-[260px] w-[85%] rotate-180 sm:h-[320px] sm:w-[70%] md:h-[360px] md:w-[65%] lg:h-[400px] lg:w-[60%]">
        <svg
          viewBox="0 0 700 300"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M700 300H0C120 280 170 225 260 195C360 162 415 172 495 208C575 244 625 275 700 280V300Z"
            fill="#dbeeff"
          />

          <path
            d="M700 300H0C120 255 160 205 255 175C355 143 420 154 500 192C580 230 630 262 700 266V300Z"
            fill="#c5e3ff"
            opacity="0.65"
          />

          <path
            d="M700 300H0C110 230 165 180 255 150C350 120 420 135 505 175C585 214 635 250 700 255V300Z"
            fill="#b3d9fa"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* =====================================================
          LOGIN CARD
          ===================================================== */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-[470px]
          rounded-xl
          border
          border-[#e0ebf5]
          bg-white/95
          px-8
          py-8
          shadow-[0_15px_45px_rgba(40,100,150,0.14),0_3px_10px_rgba(40,100,150,0.06)]
          sm:px-10
          sm:py-9
          md:max-w-[480px]
          md:px-11
          md:py-10
          lg:max-w-[490px]
        "
      >

        {/* =================================================
            GEAR ICON
            ================================================= */}

        <div
          className="
            mx-auto
            mb-3
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#e4f3ff]
            sm:h-16
            sm:w-16
          "
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            className="sm:h-10 sm:w-10"
          >
            <path
              d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.37-.31-.6-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98L14.5 2.42C14.47 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.5.42L9.12 5.07c-.61.25-1.18.59-1.69.98l-2.49-1c-.23-.08-.48 0-.6.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.37.31.6.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1c.23.08.48 0 .6-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65Z"
              fill="#0877d1"
            />

            <circle
              cx="12"
              cy="12"
              r="3"
              fill="white"
            />
          </svg>
        </div>

        {/* =================================================
            TITLE
            ================================================= */}

        <h1
          className="
            mb-8
            text-center
            text-2xl
            font-bold
            tracking-[0.3px]
            text-[#073b7a]
          "
        >
          API ONBOARDING
        </h1>

        {/* =================================================
            FORM
            ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* =================================================
              USERNAME
              ================================================= */}

          <div className="mb-5">

            <label
              htmlFor="username"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-[#1f2937]
              "
            >
              Email / Username
            </label>

            <div className="relative">

              {/* User icon */}

              <svg
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-[#8c9aaa]
                "
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
                  fill="currentColor"
                />

                <path
                  d="M3 22a9 9 0 0 1 18 0"
                  fill="currentColor"
                />
              </svg>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter email or username"
                autoComplete="username"
                disabled={loading}
                className="
                  box-border
                  h-12
                  w-full
                  rounded-md
                  border
                  border-[#cbd5e1]
                  bg-white
                  pl-10
                  pr-3
                  text-sm
                  text-[#334155]
                  outline-none
                  placeholder:text-[#9aa7b5]
                  focus:border-[#2785d8]
                  focus:ring-2
                  focus:ring-[#2785d8]/10
                  disabled:bg-slate-50
                "
              />

            </div>
          </div>

          {/* =================================================
              PASSWORD
              ================================================= */}

          <div className="mb-5">

            <label
              htmlFor="password"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-[#1f2937]
              "
            >
              Password
            </label>

            <div className="relative">

              {/* Lock icon */}

              <svg
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-[#8c9aaa]
                "
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="11"
                  rx="2"
                  fill="currentColor"
                />

                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
                className="
                  box-border
                  h-12
                  w-full
                  rounded-md
                  border
                  border-[#cbd5e1]
                  bg-white
                  pl-10
                  pr-12
                  text-sm
                  text-[#334155]
                  outline-none
                  placeholder:text-[#9aa7b5]
                  focus:border-[#2785d8]
                  focus:ring-2
                  focus:ring-[#2785d8]/10
                  disabled:bg-slate-50
                "
              />

              {/* Password visibility */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                tabIndex="-1"
                className="
                  absolute
                  right-3
                  top-1/2
                  flex
                  h-7
                  w-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded
                  border-0
                  bg-transparent
                  p-0
                  text-[#8996a5]
                  hover:text-[#426b94]
                "
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 3l18 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M10.6 5.2A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 3.9M6.1 6.2C3.4 8.3 2 12 2 12s3.5 7 10 7c1.5 0 2.8-.3 4-.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

            </div>
          </div>

          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <div
              className="
                mb-4
                rounded-md
                bg-red-50
                px-3
                py-2
                text-xs
                text-red-700
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              LOGIN BUTTON
              ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="
              h-12
              w-full
              rounded-md
              border-0
              bg-[#0875d1]
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              duration-150
              hover:bg-[#0668bc]
              active:translate-y-px
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}