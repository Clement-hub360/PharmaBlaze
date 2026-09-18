import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Pill } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

type LoginUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: LoginUser;
  };
  token?: string;
  user?: LoginUser;
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: normalizedEmail,
        password,
      });

      const result = response.data;

      const token = result.data?.token ?? result.token;
      const loggedInUser = result.data?.user ?? result.user;

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned.",
        );
      }

      if (!loggedInUser) {
        throw new Error(
          "Login succeeded, but user information was not returned.",
        );
      }

      localStorage.setItem("pharmablaze_token", token);
      localStorage.setItem("pharmablaze_user", JSON.stringify(loggedInUser));

      setSuccessMessage("Login successful. Redirecting...");

      const role = loggedInUser.role?.toUpperCase();

      if (role === "ADMIN") {
        window.setTimeout(() => {
          navigate("/admin", { replace: true });
        }, 500);

        return;
      }

      const requestedPath =
        typeof location.state?.from === "string" ? location.state.from : "";

      const isValidProtectedPath =
        requestedPath &&
        requestedPath !== "/" &&
        requestedPath !== "/login" &&
        requestedPath !== "/register";

      const destination = isValidProtectedPath ? requestedPath : "/account";

      window.setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } catch (loginError) {
      console.error("Login error:", loginError);

      if (loginError instanceof Error) {
        setError(loginError.message);
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Pill size={32} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Sign in to your Pharmablaze account
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
                >
                  {successMessage}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      setError(
                        "Password recovery will be added in the authentication improvements stage.",
                      );
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs text-gray-400">OR</span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">Don't have an account?</p>

              <Link
                to="/register"
                className="mt-2 inline-block font-semibold text-blue-600 hover:text-blue-700"
              >
                Create a new account
              </Link>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3 text-center">
              <p className="text-xs leading-5 text-gray-500">
                Your account gives you access to orders, prescriptions, wishlist
                and other Pharmablaze services.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-500 transition hover:text-gray-700"
            >
              ← Back to Pharmablaze Pharmacy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
