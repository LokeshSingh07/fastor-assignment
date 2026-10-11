import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";

const API_URL = "https://staging.fastor.ai/v1/pwa/user";

export default function Otp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone || "";
  const dialCode = state?.dial_code || "+91";

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef([]);

  useEffect(() => {
    if (!phone) navigate("/signup");
  }, [phone, navigate]);

  useEffect(() => {
    if (timer === 0) return;
    const id = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleChange = (i, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setError("");
    if (digit && i < 5) inputs.current[i + 1].focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setOtp(Array.from({ length: 6 }, (_, i) => digits[i] || ""));
    inputs.current[Math.min(digits.length, 5)]?.focus();
  };

  const post = (path, params) =>
    fetch(`${API_URL}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params),
    });

  const handleResend = async () => {
    setError("");
    try {
      const res = await post("register", { phone, dial_code: dialCode });
      if (!res.ok) throw new Error("Failed to resend OTP");
      setTimer(30);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length < 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await post("login", { phone, otp: code, dial_code: dialCode });
      const data = await res.json().catch(() => ({}));
      const token = data?.data?.token || data?.token;

      if (!res.ok || !token) {
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }

      localStorage.setItem("fastor_token", token);
      if (data.data) localStorage.setItem("fastor_user", JSON.stringify(data.data));

      toast("Login successful!");
      navigate("/restaurant", { state: { token } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-slate-50">
      <form
        onSubmit={handleVerify}
        className="flex w-full max-w-lg flex-col justify-between bg-white p-6 sm:p-8"
      >
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-800">6-digit code</h1>
          <p className="mt-2 text-sm text-slate-500">Enter the code we sent to</p>
          <p className="font-bold text-slate-800">
            {dialCode} {phone}
          </p>

          <div className="mt-8 flex items-center justify-center gap-2">
            {otp.map((digit, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  ref={(el) => (inputs.current[i] = el)}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="h-14 w-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-800 outline-none focus:border-[#ff5108] sm:w-12"
                />
                {i === 2 && <span className="text-slate-400">-</span>}
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-slate-600">
            I didn't receive a code{" "}
            {timer > 0 ? (
              <span className="font-semibold text-[#ff5108]">
                (00:{String(timer).padStart(2, "0")})
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-semibold text-[#ff5108] underline"
              >
                Resend code
              </button>
            )}
          </p>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {/* use this otp */}
          <p className="text-sm text-slate-600">use otp (testing) : 123456</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 h-12 w-full rounded-xl bg-[#ff5108] font-semibold text-white disabled:opacity-70"
        >
          {loading ? "Verifying..." : "Continue"}
        </button>
      </form>
    </div>
  );
}