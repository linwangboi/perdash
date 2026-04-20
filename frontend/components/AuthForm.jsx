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
      const url = type === "sign-in" ? `${BASE_URL}/api/token/` : `${BASE_URL}/api/signup/`;
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
        return
      }

      if (type === "sign-in") {
        window.localStorage.setItem("access", data.access);
        window.localStorage.setItem("refresh", data.refresh);
      } else if (type === 'sign-up') {
        router.push('/sign-in');
        return;
      }
      router.push('/');
    } catch (error) {
      setErrorMessage("Something went wrong");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <Button variant="link" onClick={() => router.push('/sign-up')}>Sign Up</Button>
          ) : (
            <Button variant="link"onClick={() => router.push('/sign-in')} >Login</Button>
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
              <p className="text-red-500 text-sm">
                {errorMessage}
              </p>
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
