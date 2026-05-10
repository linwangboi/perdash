"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link. Missing token.");
          return;
        }

        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(
          `${BASE_URL}/api/user/verify_email/?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.detail || "Email verified successfully!");
          // Redirect to home after 3 seconds
          setTimeout(() => {
            router.push("/");
          }, 10000);
        } else {
          setStatus("error");
          setMessage(
            data.error ||
              data.detail ||
              "Failed to verify email. Please try again.",
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-300 p-4">
      <Card className="w-full max-w-md">
        {status === "loading" && (
          <>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <CardTitle className="text-center text-2xl font-bold">
                Verifying Email
              </CardTitle>
              <CardDescription className="text-center">
                Please wait while we verify your email...
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === "success" && (
          <>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center animate-bounce"
                  style={{ backgroundColor: "rgb(61, 217, 179)" }}
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-center text-2xl font-bold">
                Email Verified!
              </CardTitle>
              <CardDescription className="text-center">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-light-400 rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You&apos;ll be redirected to your dashboard in a moment...
                </p>
              </div>
            </CardContent>
          </>
        )}

        {status === "error" && (
          <>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgb(255, 116, 116)" }}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-center text-2xl font-bold">
                Verification Failed
              </CardTitle>
              <CardDescription className="text-center">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="bg-light-400 rounded-2xl p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    The verification link may have expired or is invalid.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/sign-in")}
                  className="w-full rounded-2xl text-primary-foreground"
                  style={{ backgroundColor: "rgb(51, 63, 78)" }}
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
