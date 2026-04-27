"use client";
import React, { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "./ui/input";
import { Delete, Star, X } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { formatCreatedAt } from "@/lib/utils";
import ConfirmDelete from "./ConfirmDelete";

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);

  return (
    <Card
      className={`relative flex flex-col justify-between backdrop-blur-lg border border-red-100 drop-shadow-md ${task.done ? "opacity-60" : ""}`}
    >
      <CardHeader className="flex items-start justify-between gap-2 pb-2">
        {editing ? (
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        ) : (
          <p className="font-medium  text-sm leading-snug line-clamp-2">
            {task.title}
          </p>
        )}
        <button onClick={() => onUpdate(task.id, { star: !task.star })}>
          <Star
            size={16}
            fill={task.star ? "gold" : "none"}
            stroke={task.star ? "gold" : "currentColor"}
            className="text-muted-foreground"
          />
        </button>
      </CardHeader>
      <CardContent>
        {editing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <p className="text-sm text-gray-500 line-clamp-3">{content}</p>
        )}
        <div className="flex justify-between items-center mt-10">
          <ConfirmDelete onDelete={onDelete} taskId={task.id} />
          <p className="text-xs text-gray-400">
            {formatCreatedAt(task.created_at)}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge
          variant={task.done ? "default" : "secondary"}
          className={`cursor-pointer ${task.done ? "bg-green-200 hover:bg-green-300" : "bg-sky-100 hover:bg-sky-200"}`}
          onClick={() => onUpdate(task.id, { done: !task.done })}
        >
          {task.done ? "✓ Done" : "Pending"}
        </Badge>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onUpdate(task.id, { title, content });
                  setEditing(false);
                }}
              >
                Save
              </Button>
              <Button size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
