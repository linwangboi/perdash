"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import { useDebounce } from "use-debounce";
import { formatCreatedAt } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Search = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  const access = useMemo(() => localStorage.getItem("access"), []);
  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        (setResults([]), setOpen(false));
        return;
      }
      const res = await fetch(
        `${BASE_URL}/api/tasks/search/?q=${debouncedQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        },
      );
      const data = await res.json();
      setResults(data);
      setOpen(true);
    };
    fetchFiles();
  }, [debouncedQuery]);

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image src="/assets/search.svg" alt="search" width={24} height={24} />
        <Input
          value={query}
          placeholder="Search..."
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {open && (
        <ul className="search-result min-w-[800px] max-w-[900px]">
          {results.length > 0 ? (
            results.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between"
                onClick={() => {}}
              >
                <div className="flex cursor-pointer items-center gap-4">
                  <p className="line-clamp-1">{task.title}</p>
                  <p className="subtitle-2 line-clamp-1 text-gray-400">
                    {task.content}
                  </p>
                </div>
                <p className="caption line-clamp-1 text-gray-300">
                  {formatCreatedAt(task.created_at)}
                </p>
              </li>
            ))
          ) : (
            <p className="empty-result">No files found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;
