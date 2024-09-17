import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditProfileForm from "../Forms/EditProfileForm";
export default function EditProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Changes will be saved to your account.</DialogDescription>
        </DialogHeader>
          <EditProfileForm onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
