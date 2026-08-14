"use server";

import { cookies } from "next/headers";
import { authControllerLogin } from "@/lib/api/generated";

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
    const response = await authControllerLogin({
      username,
      password,
    });

    const accessToken = response.access_token;
    if (!accessToken) {
      return {
        errors: {
          form: "Invalid email or password",
        },
        success: false,
        data: { username, remember },
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, {
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
  } catch (error: any) {
    let formError = "Network error. Please check your connection.";

    if (error.response?.status === 401) {
      formError = "Invalid email or password";
    } else if (error.response?.status === 429) {
      formError = "Too many attempts. Please try again later";
    } else if (error.response?.status >= 500) {
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
}
