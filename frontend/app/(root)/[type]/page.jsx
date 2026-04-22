'use client'
import { fetchWithAuth } from "@/lib/auth";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

const Page = () => {
  const params = useParams();
  const view = params.type;
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

    if (view) {
      fetchData();
    }
  }, [view]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{view}</h1>
        <div className="tasks-header">
          <p className="body-1">Count: <span className="h5">0</span></p>
          <div className="sort-container">
            <p className="body-1 hidden text-gray-500 sm:block">Sort by:</p>
            Sort
          </div>
        </div>
        {tasks.length > 0 ? (
          <section className="task-grid pt-3">
            {tasks.map((t) => (
              <p>{t.title}</p>
            ))}
          </section>
        ): (
          <p className='empty-grid body-1'>No tasks here</p>
        )}
      </section>
    </div>
  );
};

export default Page;
