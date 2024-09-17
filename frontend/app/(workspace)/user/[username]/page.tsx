import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import UserProfile from "@/components/UserProfile/UserProfile";
import axiosInstance from "@/lib/axios";
import { UserInterface } from "@/lib/definitions";

const page = async ({ params }: { params: any }) => {
  const username = params.username;
  let user: UserInterface | null = null;
  try {
    const res = await axiosInstance.get("/user/" + username);
    user = res.data;
  } catch (error) {
    console.log(error);
  }

  if (!user) {
    return <MaxWidthWrapper>No user found</MaxWidthWrapper>;
  }

  return (
    <MaxWidthWrapper>
      <UserProfile user={user} />
    </MaxWidthWrapper>
  );
};
export default page;
