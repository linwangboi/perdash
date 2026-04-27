import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AddTask = ({onTaskCreated}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [star, setStar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      title,
      content,
      star,
    };
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/tasks/`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to create task");
      }
      setTitle("");
      setContent("");
      setStar(false);
      setOpen(false);
      onTaskCreated();
      toast.success('Task has been created', { position: "top-center"})
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Plus className="text-white bg-red-300 rounded-full cursor-pointer" />
      </SheetTrigger>
      <SheetContent className='bg-white'>
        <SheetHeader>
          <SheetTitle>Create New Task</SheetTitle>
          <SheetDescription>
            Fill in the details and click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="task-title">Title</Label>
              <Input id="task-title" value={title} onChange={e => setTitle(e.target.value)}/>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="task-content">Content</Label>
              <Textarea id="task-content" value={content} onChange={e => setContent(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="task-star">Important</Label>
              <Checkbox id="task-star" onChange={() => setStar(!star)} />
            </div>
          </div>
          <SheetFooter className='mt-5'>
            <Button type="submit" variant="outline">Submit</Button>
            <SheetClose asChild>
              <Button>Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddTask;
