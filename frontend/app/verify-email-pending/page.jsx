"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clearTokens, fetchWithAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const VerifyEmailPending = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const accessToken =
          typeof window !== "undefined"
            ? window.localStorage.getItem("access")
            : null;

        if (!accessToken) {
          router.push("/sign-in");
          return;
        }

        const response = await fetch(`${BASE_URL}/api/user/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEmail(data.email);

          // If already verified, redirect to home
          if (data.is_verified) {
            router.push("/");
          }
        } else {
          clearTokens();
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        clearTokens();
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail();
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push("/sign-in");
  };
  const handleResend = async () => {
    try {
      const response = await fetchWithAuth(
        `${BASE_URL}/api/user/resend_verification_email/`,
        {
          method: "POST",
        },
      );
      if (response.ok) {
        toast.success(
          "Email verification sent successfully, please check your email.",
          { position: "top-center" },
        );
      } else {
        toast.error("Failed to send, please try again.", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error("Failed to send, please try again.", {
        position: "top-center",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-300">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-300 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand-100)), hsl(var(--pink)))",
                color: "white",
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
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center mt-2">
            We&apos;ve sent a verification link to
            <br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="bg-light-400 rounded-2xl p-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in your email to verify your account and start
                creating tasks.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Didn&apos;t receive the email? Check your spam folder or click{" "}
                <Button className="underline" onClick={handleResend}>
                  here
                </Button>{" "}
                to resend Email verification.
              </p>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-2xl border-border hover:bg-light-400"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPending;
