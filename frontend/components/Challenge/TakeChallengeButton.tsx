"use client";

import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import ChallengeStatusButton from "./ChallengeStatusButton";
import { TakenChallengeStatus } from "@/types/challenges";
import { useToast } from "@/hooks/use-toast";

const TakeChallengeButton = ({
  text,
  challengeId,
  challengeSlug,
}: {
  text: string;
  challengeId: string;
  challengeSlug?: string;
}) => {
  const [challengeTaken, setChallengeTaken] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = new QueryClient();

  const { toast } = useToast();

  const handleClick = async () => {
    if (status === "unauthenticated")
      router.push("/signin?callbackUrl=" + window.location.pathname);

    if (status === "authenticated") {
      setIsPending(true);
      try {
        const res = await axiosInstance.post("/challenge/take-new", {
          challenge_id: challengeId,
        });
        // console.log("New Challenge:", res.data);

        setChallengeTaken(true);

        toast({
          title: "Success",
          description: "Challenge taken successfully",
          variant: "success",
        });

        // refetch the data
        queryClient.invalidateQueries({
          queryKey: ["challenge", challengeSlug],
        });
      } catch (error: any) {
        // console.log(error);
        toast({
          title: "Error",
          description: error.response.data.detail,
          variant: "destructive",
        });
      }
      setIsPending(false);
    }
  };
  return (
    <>
      {challengeTaken ? (
        <ChallengeStatusButton
          text={"Submission pending"}
          status={TakenChallengeStatus.PENDING}
          challengeId={challengeId}
          challengeTitle=""
        />
      ) : (
        <Button size="lg" onClick={handleClick} disabled={isPending}>
          {text}
        </Button>
      )}
    </>
  );
};
export default TakeChallengeButton;
