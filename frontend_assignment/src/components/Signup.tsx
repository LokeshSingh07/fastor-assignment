import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://staging.fastor.ai/v1/pwa/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ phone, dial_code: "+91" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      toast.success("OTP sent successfully!");

      navigate("/otp", { state: { phone, dial_code: "+91" } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col justify-between bg-white p-6 sm:p-8"
      >
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-800">Sign Up to Fastor</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your mobile number and we will send you an OTP for verification.
          </p>

          <div
            className={`mt-8 flex h-14 items-center rounded-xl border bg-slate-50 px-4 focus-within:border-[#ff5108] ${
              error ? "border-red-300" : "border-slate-200"
            }`}
          >
            <span className="font-semibold text-slate-800">+91</span>
            <span className="mx-3 h-5 w-0.5 bg-[#ff5108]" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              placeholder="Mobile number"
              maxLength={10}
              autoFocus
              className="flex-1 bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="pt-8">
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#ff5108] font-semibold text-white disabled:opacity-70"
          >
            {loading ? "Sending OTP..." : "Get OTP"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            By continuing, you accept the{" "}
            <a href="/terms" className="font-semibold text-slate-700">Terms &amp; Conditions</a>{" "}
            and{" "}
            <a href="/privacy" className="font-semibold text-slate-700">Privacy Policy</a>
          </p>
        </div>
      </form>
    </div>
  );
}