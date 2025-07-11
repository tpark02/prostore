'use client';
import { useState } from 'react';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import {
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@radix-ui/react-alert-dialog';

const DeleteDialog = ({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<{ success: boolean; message: string }>;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const handleDeleteClick = () => {
    startTransition(async () => {
      const res = await action(id);
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
      } else {
        setOpen(false);
        toast({ description: res.message });
      }
    });
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" className="ml-2">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can't be undone
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleDeleteClick}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
