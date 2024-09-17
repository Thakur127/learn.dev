"use client";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RenderMarkdown from "../RenderMarkdown";
import MultiSelectCombobox from "../MultipleSelectCombobox";
import React, { useState } from "react";
import axiosInstance from "@/lib/axios";
import { Topic } from "@/types/challenges";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getTopics } from "@/data-access/challenge";

type Inputs = {
  title: string;
  description: string;
  difficulty_tag: string;
  topic_tags: Topic[];
};

export default function ContributeChallengeForm() {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog state
  const router = useRouter();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<Inputs>({
    defaultValues: {
      topic_tags: [],
      description:
        "<!-- Use the same format to add any new section from your end. Feel free to add more sections or remove any unnecessary sections. but make sure your markdown conveys the requirements clearly -->\n\n## Overview\n\n<!-- Write the overview of your challenge here -->\n\n## Instructions\n\n<!-- Write the instructions of your challenge here -->\n\n## Must Have Features\n\n<!-- Write the must-have features of your challenge here -->\n\n## Recommended Features\n\n<!-- Write the recommended features of your challenge here -->\n\n## Tips\n\n<!-- Write the tips of your challenge here -->\n\n## Resources\n\n<!-- Provide resource links here, for reference and learning -->\n\n## Additional Notes\n\n<!-- Write the additional notes of your challenge here, else remove this section -->\n\n## Conclusion\n\n<!-- Write the conclusion of your challenge here, like what will be the learning outcome, etc.-->\n\n**Happy Coding 😄**",
    },
  });

  const { data: topics } = useQuery({
    queryKey: ["challenge-topics"],
    queryFn: () => getTopics(),
  });

  // useMutation for handling form submission
  const mutation = useMutation({
    mutationFn: async (data: Inputs) => {
      data.topic_tags = selectedTopics; // Add the selected topics to data
      const res = await axiosInstance.post("/challenge/create-new", data, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      // Redirect to contributions page after successful submission
      router.push("/contributions");
    },
    onError: (error) => {
      // Log the error for debugging
      console.error("Error submitting the form", error);
    },
  });

  // Form submit handler
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setIsDialogOpen(true); // Open the dialog on initial submit
  };

  // Final approval submission
  const handleFinalSubmit = () => {
    setIsDialogOpen(false); // Close dialog
    handleSubmit((data) => mutation.mutate(data))(); // Submit the form
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Title Input */}
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      {/* Difficulty Level Select */}
      <div className="form-group">
        <label htmlFor="difficulty">Difficulty level</label>
        <Select onValueChange={(value) => setValue("difficulty_tag", value)}>
          <SelectTrigger id="difficulty" className="">
            <SelectValue placeholder="Difficulty level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advance">Advance</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
        {errors.difficulty_tag && (
          <p className="text-red-500">{errors.difficulty_tag.message}</p>
        )}
      </div>

      {/* Topics MultiSelect */}
      <div className="form-group">
        <label htmlFor="topics">Select Topics</label>
        <MultiSelectCombobox
          id="topics"
          values={topics as Topic[]}
          selectedValues={selectedTopics}
          setSelectedValues={setSelectedTopics}
          inputCommandPlaceholder="Select Topics"
        />
      </div>

      {/* Description Input with Resizable Panel */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <Textarea
              className="w-full"
              id="description"
              rows={40}
              {...register("description", {
                required: "Description is required",
              })}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <div className="px-4 py-2">
              <RenderMarkdown content={watch("description") || ""} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        {errors.description && (
          <p className="text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="button" onClick={handleSubmit(onSubmit)}>
        Submit
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Your contribution will be reviewed to ensure it meets our
              guidelines. Once approved, it will be published, and you will be
              notified. Please confirm that your submission is ready for review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleFinalSubmit}>
              Send for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
