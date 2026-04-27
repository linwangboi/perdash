import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { X } from "lucide-react";

export default function ConfirmDelete({ onDelete, taskId }) {
  return (
    <AlertDialog>
      
      {/* ✅ Proper trigger */}
      <AlertDialogTrigger asChild>
        <button>
          <X className="text-red-400 cursor-pointer" size={16} />
        </button>
      </AlertDialogTrigger>

      {/* Dialog content */}
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your task.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-brand border-0 text-white">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction onClick={() => onDelete(taskId)}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

    </AlertDialog>
  );
}