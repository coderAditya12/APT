"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "./lib/auth-api";

export default function Home() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isPhoneValid = /^\d{10}$/.test(mobileNumber);
  const isOtpValid = /^\d{6}$/.test(otp);

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isPhoneValid) {
      setError("Enter a valid 10 digit phone number.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await sendOtp(mobileNumber);

      setIsOtpSent(true);
      setMessage(response.message);

      if (response.otp) {
        console.log("Your login OTP is:", response.otp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isOtpValid) {
      setError("Enter the 6 digit OTP.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyOtp(mobileNumber, otp);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setMessage(response.message);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-5 py-10 text-[#1b1f24]">
      <section className="w-full max-w-md rounded-lg border border-[#d8dde5] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#687386]">Blog Admin</p>
          <h1 className="mt-1 text-2xl font-semibold">Login with OTP</h1>
        </div>

        <form className="space-y-4" onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
          <label className="block">
            <span className="text-sm font-medium">Phone number</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-[#cbd5e1] px-3 text-base outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
              inputMode="numeric"
              maxLength={10}
              onChange={(event) =>
                setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="9876543210"
              type="tel"
              value={mobileNumber}
            />
          </label>

          {isOtpSent && (
            <label className="block">
              <span className="text-sm font-medium">OTP</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-[#cbd5e1] px-3 text-base outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                type="text"
                value={otp}
              />
            </label>
          )}

          {message && <p className="rounded-md bg-[#ecfdf3] px-3 py-2 text-sm text-[#027a48]">{message}</p>}
          {error && <p className="rounded-md bg-[#fef3f2] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

          <button
            className="h-11 w-full rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-[#93c5fd]"
            disabled={isLoading || (isOtpSent ? !isOtpValid : !isPhoneValid)}
            type="submit"
          >
            {isLoading ? "Please wait..." : isOtpSent ? "Verify OTP" : "Send OTP"}
          </button>
        </form>
      </section>
    </main>
  );
}
