const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type SendOtpResponse = {
  message: string;
  otp?: string;
};

type VerifyOtpResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
};

async function request<TResponse>(
  endpoint: string,
  body: Record<string, string>,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Something went wrong");
  }

  return data as TResponse;
}

export function sendOtp(mobileNumber: string) {
  return request<SendOtpResponse>("/v1/user/login", { mobileNumber });
}

export function verifyOtp(mobileNumber: string, otp: string) {
  return request<VerifyOtpResponse>("/v1/user/verify-otp", {
    mobileNumber,
    otp,
  });
}
