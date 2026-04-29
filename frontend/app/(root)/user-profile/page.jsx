"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { clearTokens, fetchWithAuth } from "@/lib/auth";
import { ArrowLeft, Edit2, Check, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const UserProfilePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth(`${BASE_URL}/api/user/profile/`, {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setEditData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
          });
        } else {
          clearTokens();
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
        clearTokens();
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Handle edit input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save profile
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/user/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditData({
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Profile Info Card */}
        <Card className="backdrop-blur-lg border border-red-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Account Information</CardTitle>
                <CardDescription>Manage your profile details</CardDescription>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <Image
                src="/assets/avatar.png"
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full border border-gray-200"
              />
              <div>
                <p className="font-semibold">
                  {userData.first_name || userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`.trim()
                    : "User Profile"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userData.email}
                </p>
              </div>
            </div>

            {/* Editable Fields */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={editData.first_name}
                      onChange={handleEditChange}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={editData.last_name}
                      onChange={handleEditChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    First Name
                  </p>
                  <p className="text-base">
                    {userData.first_name || (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Last Name
                  </p>
                  <p className="text-base">
                    {userData.last_name || (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Read-only Fields */}
            <div className="pt-4 space-y-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Email Address
                </p>
                <p className="text-base break-all">{userData.email}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Account Status
                  </p>
                  <Badge
                    variant={userData.is_verified ? "default" : "secondary"}
                    className={`${
                      userData.is_verified
                        ? "bg-green-200 text-green-900"
                        : "bg-yellow-100 text-yellow-900"
                    }`}
                  >
                    {userData.is_verified
                      ? "✓ Verified"
                      : "Pending Verification"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Member Since
                  </p>
                  <p className="text-base">
                    {new Date(userData.date_joined).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          {isEditing && (
            <CardFooter className="flex gap-2 justify-end border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Placeholder Sections for Future Features */}
        <Card className="backdrop-blur-lg border border-red-100">
          <CardHeader>
            <CardTitle className="text-lg">Privacy & Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon: Change password, Two-factor authentication, Login
              history
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg border border-red-100">
          <CardHeader>
            <CardTitle className="text-lg">Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon: Notifications, Theme, Language preferences
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg border border-red-100">
          <CardHeader>
            <CardTitle className="text-lg">Activity</CardTitle>
            <CardDescription>View your recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon: Login activity, Recent changes, Task statistics
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg border border-red-100">
          <CardHeader>
            <CardTitle className="text-lg">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon: Delete account, Export data
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
