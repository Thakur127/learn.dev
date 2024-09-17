"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import ChallengeStatusButton from "./ChallengeStatusButton";
import { TakenChallengeStatus } from "@/types/challenges";

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = new QueryClient();

  const handleClick = async () => {
    if (status === "unauthenticated")
      router.push("/signin?callbackUrl=" + window.location.pathname);

    if (status === "authenticated") {
      try {
        const res = await axiosInstance.post("/challenge/take-new", {
          challenge_id: challengeId,
        });
        console.log("New Challenge:", res.data);
        setChallengeTaken(true);
        // refetch the data
        queryClient.invalidateQueries({
          queryKey: ["challenge", challengeSlug],
        });
      } catch (error) {
        console.log(error);
      }
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
        <Button size="lg" onClick={handleClick}>
          {text}
        </Button>
      )}
    </>
  );
};
export default TakeChallengeButton;
