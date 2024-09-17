import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChallengeSubmissionForm from "../Forms/ChallengeSubmissionForm";
import { TakenChallengeStatus } from "@/types/challenges";
export default function ChallengeSubmissionDialog({
  challengeId,
  challengeTitle,
  setOpen,
  setChallengeStatus,
}: {
  challengeId: string;
  challengeTitle: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setChallengeStatus: React.Dispatch<React.SetStateAction<TakenChallengeStatus>>;
}) {
  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit your solution</DialogTitle>
          <DialogDescription>
            You are submitting your solution for the{" "}
            <span className="font-medium">{challengeTitle}</span> challenge
          </DialogDescription>
        </DialogHeader>
        <ChallengeSubmissionForm
          challengeId={challengeId}
          setOpen={setOpen}
          setChallengeStatus={setChallengeStatus}
        />
      </DialogContent>
    </>
  );
}
