import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, User, Camera, Mail, AtSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Inputs {
  first_name: string;
  last_name: string;
  username: string;
}

export default function EditProfileForm({
  onOpenChange,
}: {
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { data: session, status, update } = useSession();

  const [avatarSrc, setAvatarSrc] = useState(
    (session?.user as any)?.image || ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      first_name: session?.user?.name.split(" ")[0],
      last_name: session?.user?.name.split(" ")[1],
      username: session?.user?.username,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Inputs) => {
      const response = await axiosInstance.patch(
        "/user/update-user-info",
        data,
        {
          headers: {
            Authorization: "Bearer " + session?.accessToken,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return response.data;
    },
    onSuccess(data, variables, context) {
      // console.log('update successfully', data)
      // update session
      update({
        user: {
          ...session?.user,
          name: data.first_name + " " + data.last_name,
          username: data.username,
        },
      });

      toast({
        title: "Profile updated",
        description: "Profile updated successfully",
        variant: "success",
      });

      // close dialog
      onOpenChange(false);

      // redirect to user profile
      router.push(`/user/${data.username}`, {
        
      });
    },
    onError(error, variables, context) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Inputs) => {
    // console.log(data)
    mutation.mutate(data);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(e.target?.result);
        setAvatarSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadToServer = async () => {
    if (selectedFile) {
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        // TODO: Add endpoint for uploading image
        const response = await axiosInstance.post(
          "/user/upload-image",
          formData
        );

        if (response.status === 200) {
          console.log("Image uploaded successfully");
          // You might want to update the user's avatar URL here
        } else {
          console.error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      {/* <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">
          Edit Your Profile
        </CardTitle>
      </CardHeader> */}
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-40 h-40 border-4 border-background shadow-lg">
                <AvatarImage src={avatarSrc} alt="Profile picture" />
                <AvatarFallback>
                  <User className="w-20 h-20" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-6 h-6" />
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {selectedFile && (
              <Button
                onClick={handleImageUploadToServer}
                variant="outline"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New Avatar
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first-name" className="text-sm font-medium">
                  First Name
                </label>
                <Input
                  id="first-name"
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                  className={errors.first_name ? "border-red-500" : ""}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="last-name" className="text-sm font-medium">
                  Last Name
                </label>
                <Input
                  id="last-name"
                  {...register("last_name", {
                    required: "Last name is required",
                  })}
                  className={errors.last_name ? "border-red-500" : ""}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email}
                  disabled
                  className="pl-10 bg-muted text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
