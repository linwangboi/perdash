"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/utils";
import { saveTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AuthForm = ({ type }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    password2: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const url =
        type === "sign-in"
          ? `${BASE_URL}/api/token/`
          : `${BASE_URL}/api/signup/`;
      const payload =
        type === "sign-in"
          ? {
              email: form.email,
              password: form.password,
            }
          : {
              email: form.email,
              password: form.password,
              password2: form.password2,
            };
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(getErrorMessage(data));
        return;
      }

      if (type === "sign-in") {
        saveTokens({ access: data.access, refresh: data.refresh });
      } else if (type === "sign-up") {
        setSignUpSuccess(true);
        return;
      }
      router.push("/");
    } catch (error) {
      setErrorMessage("Something went wrong");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (signUpSuccess) {
    return (
      <Card className="w-full max-w-xl">
        <CardHeader className="mb-2">
          <div className="flex justify-center mb-4">
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand)), hsl(var(--pink)))",
              }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Account Created!
          </CardTitle>
          <CardDescription className="text-center mt-2">
            We&apos;ve sent a verification link to
            <br />
            <span className="font-semibold text-foreground">{form.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="bg-light-400 rounded-2xl p-4">
              <p className="text-sm text-muted-foreground text-center">
                Please check your email and click the verification link to
                complete your registration.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Once verified, you&apos;ll be able to access all features and
                start creating tasks.
              </p>
            </div>

            <hr className="text-gray-500/30" />

            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full bg-brand rounded-3xl text-lg text-white font-semibold py-4 shadow-xs"
            >
              Back to Login
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="mb-2">
        <CardTitle className="text-semibold text-2xl">
          {type === "sign-in"
            ? "Login to your account"
            : "Sign up for an account"}
        </CardTitle>
        <CardDescription>
          {type === "sign-in"
            ? "Enter your email below to login to your account"
            : "Enter your email and confirm your password"}
        </CardDescription>
        <CardAction>
          {type === "sign-in" ? (
            <Button variant="link" onClick={() => router.push("/sign-up")}>
              Sign Up
            </Button>
          ) : (
            <Button variant="link" onClick={() => router.push("/sign-in")}>
              Login
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="border border-gray-400 rounded-2xl"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                className="border border-gray-400 rounded-2xl"
                value={form.password}
                onChange={handleChange}
                type="password"
                required
              />
            </div>
            {type === "sign-up" && (
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Confirm password</Label>
                </div>
                <Input
                  id="password2"
                  className="border border-gray-400 rounded-2xl"
                  type="password"
                  value={form.password2}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <hr className="text-gray-500/30" />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand rounded-3xl text-lg text-white font-semibold py-4 shadow-xs"
            >
              {isLoading
                ? "Loading..."
                : type === "sign-in"
                  ? "Login"
                  : "Sign Up"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
