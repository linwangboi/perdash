"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { useDebounce } from "use-debounce";
import { formatCreatedAt } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Search = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        setOpen(false);
        return;
      }

      try {
        const res = await fetchWithAuth(
          `${BASE_URL}/api/tasks/search/?q=${debouncedQuery}`,
          {
            method: "GET",
          },
        );

        if (!res.ok) {
          setResults([]);
          setOpen(false);
          return;
        }

        const data = await res.json();
        setResults(data.results);
        setOpen(true);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        setOpen(false);
      }
    };
    fetchFiles();
  }, [debouncedQuery]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [])

  return (
    <div ref={searchRef} className="search">
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
        <ul className="search-result min-w-200 max-w-225">
          {results.length > 0 ? (
            results.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between"
                onClick={() => {}}
              >
                <div className="flex cursor-pointer items-center gap-4">
                  <p className="line-clamp-1">{task.title}</p>
                  {/* <p className="subtitle-2 line-clamp-1 text-gray-400">
                    {task.content}
                  </p> */}
                </div>
                <p className="caption line-clamp-1 text-gray-300">
                  {formatCreatedAt(task.created_at)}
                </p>
              </li>
            ))
          ) : (
            <p className="empty-result text-gray-400">No files found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;