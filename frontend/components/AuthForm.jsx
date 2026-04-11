"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AuthForm = ({ type }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className='mb-2'>
        <CardTitle className='text-semibold text-2xl'>
          {type === "sign-in"
            ? "Login to your account"
            : "Sign up for an account"}
        </CardTitle>
        <CardDescription>
          {type === "sign-in"
            ? "Enter your email below to login to your account"
            : "Enter your email below and confirm your password"}
        </CardDescription>
        <CardAction>
          {type === "sign-in" ? (
            <Button variant="link">Sign Up</Button>
          ) : (
            <Button variant="link">Login</Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className='border border-gray-400 rounded-2xl'
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" className='border border-gray-400 rounded-2xl' type="password" required />
            </div>
            {type === "sign-up" && (
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Confirm password</Label>
                </div>
                <Input id="password2" className='border border-gray-400 rounded-2xl' type="password" required />
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2 border-gray-400/30">
        <Button
          type="submit"
          className="w-full bg-brand rounded-3xl text-lg text-white font-semibold py-4"
        >
          Login
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
