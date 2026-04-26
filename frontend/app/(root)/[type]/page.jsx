"use client";
import { fetchWithAuth } from "@/lib/auth";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import Pages from "@/components/Pages";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getTasks = async (
  view,
  page = 1,
  limit = 10,
  sortBy = "created_at",
  order = "desc",
) => {
  const params = new URLSearchParams({
    page,
    limit,
    sort_by: sortBy,
    order,
    view,
  });

  const res = await fetchWithAuth(`${BASE_URL}/api/tasks/?${params}`);
  const data = await res.json();

  // If we get paginated response
  if (data.results && data.pagination) {
    const tasks = data.results;
    return { tasks: tasks, pagination: data.pagination };
  }
  // Fallback for old response format
  return { tasks: data, pagination: null };
};

const Page = () => {
  const params = useParams();
  const view = params.type;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const limit = 8;

  const handleUpdate = async (id, data) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    await fetchWithAuth(`${BASE_URL}/api/tasks/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  };

  const handleDelete = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetchWithAuth(`${BASE_URL}/api/tasks/${id}/`, {
      method: "DELETE",
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (newSortBy, newOrder) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { tasks: fetchedTasks, pagination: paginationData } =
          await getTasks(view, currentPage, limit, sortBy, order);
        setTasks(fetchedTasks);
        setPagination(paginationData);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    if (view) {
      fetchData();
    }
  }, [view, currentPage, sortBy, order]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{view}</h1>
        <div className="tasks-header">
          <p className="body-1">
            Count: <span className="h5">{pagination?.total_count || 0}</span>
          </p>
          <div className="sort-container">
            <p className="body-1 hidden text-gray-500 sm:block">Sort by:</p>
            <Select
              value={`${sortBy}-${order}`}
              onValueChange={(value) => {
                const [field, ord] = value.split("-");
                handleSortChange(field, ord);
              }}
            >
              <SelectTrigger className='border border-gray-200 text-gray-600'>
                <SelectValue placeholder="Sort..." />
              </SelectTrigger>
              <SelectContent className='backdrop-blur-md bg-white text-gray-600 border border-gray-200'>
                <SelectGroup>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [field, ord] = e.target.value.split("-");
                handleSortChange(field, ord);
              }}
              className="px-2 py-1 border rounded"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select> */}
          </div>
        </div>
        {tasks.length > 0 ? (
          <>
            <section className="task-grid pt-3">
              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </section>
            {pagination && (
              <Pages
                current={currentPage}
                total={pagination.total_pages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <p className="empty-grid body-1">No tasks here</p>
        )}
      </section>
    </div>
  );
};

export default Page;
