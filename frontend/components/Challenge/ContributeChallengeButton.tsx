import { Button } from "../ui/button";
import Link from "next/link";

export default function ContributeChallengeButton({ text }: { text: string }) {
  return (
    <Button asChild size={"lg"} className="bg-green-500 hover:bg-green-500/80">
      <Link href="/contributions/new">{text || "Contribute"}</Link>
    </Button>
  );
}
