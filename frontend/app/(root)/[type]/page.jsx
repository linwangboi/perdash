'use client'
import { fetchWithAuth } from "@/lib/auth";
import React, { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getTasks = async (view) => {
  const res = await fetchWithAuth(`${BASE_URL}/api/tasks/`);
  const tasks = await res.json();
  const now = new Date();
  switch (view) {
    case "all":
      return tasks;
    case "today":
      return tasks.filter(
        (t) => new Date(t.created_at).toDateString() === now.toDateString(),
      );
    case "completed":
      return tasks.filter((t) => t.done);
    case "important":
      return tasks.filter((t) => t.star);
    case "upcoming":
      return tasks.filter((t) => new Date(t.created_at) > now);
    default:
      return tasks;
  }
};

const Page = ({ params }) => {
  const { view } = params;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filteredTasks = await getTasks(view);
        setTasks(filteredTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view]);

  if (loading) return <div>Loading...</div>;

  return <div>Page</div>;
};

export default Page;
