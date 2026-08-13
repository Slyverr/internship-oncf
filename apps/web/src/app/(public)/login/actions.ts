"use server";

import { cookies } from "next/headers";

const BACKEND_API_URL = process.env.BACKEND_API_URL;
if (!BACKEND_API_URL) {
  throw new Error("BACKEND_API_URL environment variable is required");
}

export type LoginState = {
  errors?: {
    username?: string;
    password?: string;
    form?: string;
  };
  success?: boolean;
  data?: {
    username: string;
    remember: boolean;
  };
};

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  const errors: LoginState["errors"] = {};

  if (!username?.includes("@") || !username.includes(".")) {
    errors.username = "Please enter a valid email address";
  }

  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (errors.username || errors.password) {
    return {
      errors,
      success: false,
      data: { username, remember },
    };
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      let formError = "Invalid email or password";

      if (response.status === 429) {
        formError = "Too many attempts. Please try again later";
      } else if (response.status >= 500) {
        formError = "Server error. Please try again later";
      }

      return {
        errors: {
          form: formError,
        },
        success: false,
        data: { username, remember },
      };
    }

    const sessionToken = data.access_token;

    if (!sessionToken) {
      return {
        errors: {
          form: "Invalid email or password",
        },
        success: false,
        data: { username, remember },
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? 60 * 60 * 24 * 7 : 60 * 60 * 24,
      path: "/",
    });

    return {
      success: true,
      data: { username, remember },
    };
  } catch (error) {
    return {
      errors: {
        form: "Network error. Please check your connection.",
      },
      success: false,
      data: { username, remember },
    };
  }
}
