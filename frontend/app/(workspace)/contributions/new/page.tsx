import BreadcrumPath from "@/components/BreadcrumPath";
import ContributeChallengeForm from "@/components/Forms/ContributeChallengeForm";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const page = () => {
  return (
    <MaxWidthWrapper>
      <BreadcrumPath />
      <h1 className="text-center text-3xl">Create a new Challenge</h1>
      <ContributeChallengeForm />
    </MaxWidthWrapper>
  );
};
export default page;
