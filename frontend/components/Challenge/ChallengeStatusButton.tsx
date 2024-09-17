import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChallengeSubmissionDialog from "./ChallengeSubmissionDialog";
import { Challenge, TakenChallengeStatus } from "@/types/challenges";
import React from "react";
import TakeChallengeButton from "./TakeChallengeButton";

export default function ChallengeStatusButton({
  text,
  status,
  challengeId,
  challengeTitle,
}: {
  text: string;
  status: TakenChallengeStatus;
  challengeId: string;
  challengeTitle?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [challengeStatus, setChallengeStatus] =
    React.useState<TakenChallengeStatus>(status);

  if (
    challengeStatus === TakenChallengeStatus.PENDING ||
    challengeStatus === TakenChallengeStatus.REJECTED
  ) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size={"lg"}
            className={cn(
              challengeStatus === TakenChallengeStatus.PENDING
                ? "bg-yellow-500 hover:bg-yellow-500/80"
                : "bg-red-500 hover:bg-red-500/80"
            )}
          >
            {challengeStatus === TakenChallengeStatus.REJECTED
              ? "Submission rejected"
              : text}
          </Button>
        </DialogTrigger>
        <ChallengeSubmissionDialog
          challengeId={challengeId}
          challengeTitle={challengeTitle as string}
          setOpen={setOpen}
          setChallengeStatus={setChallengeStatus}
        />
      </Dialog>
    );
  }

  return (
    <Button
      size={"lg"}
      className={cn(
        challengeStatus === TakenChallengeStatus.ACCEPTED
          ? "bg-green-500 hover:bg-green-500/80"
          : challengeStatus === TakenChallengeStatus.SUBMITTED
          ? "bg-gray-500 hover:bg-gray-500/80"
          : challengeStatus === TakenChallengeStatus.REJECTED &&
            "bg-red-500 hover:bg-red-500/80"
      )}
    >
      {challengeStatus === TakenChallengeStatus.SUBMITTED
        ? "Solution Submitted"
        : text}
    </Button>
  );
}
