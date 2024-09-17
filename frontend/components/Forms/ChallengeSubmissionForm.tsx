"use client";

import { useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { takenChallengeInfo } from "@/data-access/challenge";
import { TakenChallengeStatus } from "@/types/challenges";
import { useToast } from "@/hooks/use-toast";

interface Inputs {
  challenge_id: string;
  github_url: string;
  presentation_video_url: string;
  deployed_application_url?: string;
}

export default function ChallengeSubmissionForm({
  challengeId,
  setOpen,
  setChallengeStatus,
}: {
  challengeId: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setChallengeStatus: React.Dispatch<
    React.SetStateAction<TakenChallengeStatus>
  >;
}) {
  const { toast } = useToast();

  const { data: takenChallenge } = useQuery({
    queryKey: ["taken-challenge-info", challengeId],
    queryFn: async () => await takenChallengeInfo(challengeId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      challenge_id: challengeId,
      github_url: takenChallenge?.github_url || "",
      presentation_video_url: takenChallenge?.presentation_video_url || "",
      deployed_application_url: takenChallenge?.deployed_application_url || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Inputs) => {
      const response = await axiosInstance.patch(
        "/challenge/submit-challenge-solution",
        data
      );
      return response.data;
    },
    onSuccess(data, variables, context) {
      // TODO: Add success toast

      toast({
        title: "Success",
        description: "Challenge submission successful. Thank you!",
        variant: "success",
      });

      setOpen(false); // close the dialog
      setChallengeStatus(TakenChallengeStatus.SUBMITTED);
    },

    onError(error, variables, context) {
      // TODO: Add error toast

      toast({
        title: "Error",
        description: (error as any).response.data.detail,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Inputs) => {
    mutation.mutate(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <strong>
          Read guidelines carefully, if you haven&apos;t read, please do before
          submitting.
        </strong>
        {takenChallenge?.feedback && (
          <div>
            <h2 className="text-xl">Feedback</h2>
            <p className="text-gray-700">{takenChallenge?.feedback}</p>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="challengeId">Challenge id</label>
          <Input
            {...register("challenge_id")}
            id="challengeId"
            type="text"
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="githubUrl">
            Github url <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("github_url", {
              required: "Github url is required",
              pattern: {
                value:
                  /^(https?:\/\/)?(www\.)?(github\.com|gitlab\.com)\/[-a-zA-Z0-9_@:%+.~#?&//=]*\/?$/i,
                message: "Only github or gitlab url is valid",
              },
            })}
            id="githubUrl"
            type="text"
            placeholder="https://github.com/username/repo"
          />
          {errors.github_url && (
            <p className="text-red-500 text-xs">{errors.github_url.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="presentationVideoUrl">
            Video presentation url <span className="text-red-500">*</span>{" "}
          </label>
          <Input
            {...register("presentation_video_url", {
              required: "Video presentation url is required",
              pattern: {
                value:
                  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[-a-zA-Z0-9_@:%+.~#?&//=]*$/i,
                message: "Only youtube url is valid",
              },
            })}
            id="presentationVideoUrl"
            type="text"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />
          {errors.presentation_video_url && (
            <p className="text-red-500 text-xs">
              {errors.presentation_video_url.message}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="deployedApplicationUrl">Hosted application url</label>
          <Input
            {...register("deployed_application_url", {
              required: false,
              pattern: {
                value:
                  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i,
                message: "Add a link so other can see your submission",
              },
            })}
            id="deployedApplicationUrl"
            type="text"
            placeholder="https://learn.dev.com"
          />
          {errors.deployed_application_url && (
            <p className="text-red-500 text-xs">
              {errors.deployed_application_url.message}
            </p>
          )}
        </div>
        <div className="form-group">
          <Button type="submit" disabled={mutation.isPending}>
            Submit
          </Button>
        </div>
      </form>
    </>
  );
}
