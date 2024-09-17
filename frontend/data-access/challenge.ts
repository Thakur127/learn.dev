import axiosInstance from "@/lib/axios";
import { Topic } from "@/types/challenges";

export const takenChallengeInfo = async (challengeId: string) => {
  try {
    const response = await axiosInstance.post(
      "/challenge/taken-challenge-info",
      {
        challenge_id: challengeId,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch topics function
export const getTopics = async (): Promise<Topic[]> => {
  try {
    const res = await axiosInstance.get<Topic[]>("/challenge/topics");
    return res.data;
  } catch (error) {
    throw error;
  }
};
