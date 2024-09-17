import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Code,
  Lightbulb,
  Trophy,
  Users,
  Share2,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <MaxWidthWrapper>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Level Up Your Dev Skills with Real-World Challenges
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Build exciting projects, learn new technologies, and showcase
                  your skills with our curated development challenges.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button variant="outline">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <MaxWidthWrapper>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Why learn.dev?
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <Lightbulb className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Curated Challenges</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Tackle real-world projects without the hassle of coming up
                  with ideas.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <BookOpen className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Learn by Doing</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Gain hands-on experience with the latest technologies and best
                  practices.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Trophy className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Build Your Portfolio</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Complete challenges and showcase your projects to potential
                  employers.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Share2 className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Shareable Profile</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Share your achievements and completed projects with
                  recruiters.
                </p>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        <section
          id="shareable-profile"
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <MaxWidthWrapper>
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Showcase Your Skills with Shareable Profiles
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Create a dynamic portfolio of your completed challenges and
                    share your progress with potential employers.
                  </p>
                </div>
                <ul className="grid gap-2 py-4">
                  <li className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    <span>Highlight your best projects</span>
                  </li>
                  <li className="flex items-center">
                    <Share2 className="mr-2 h-5 w-5" />
                    <span>Share your profile with a single link</span>
                  </li>
                  <li className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    <span>Stand out to recruiters and peers</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild>
                    <Link href={"/signup"}>Create Your Profile</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1569322977266-acff659212fd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                width={600}
                height={400}
                alt="Shareable Profile Example"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </MaxWidthWrapper>
        </section>

        <section
          id="contribute"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <MaxWidthWrapper>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">
                Contribute and Grow Together
              </h2>
              <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Everyone can contribute! Whether you&apos;re a learner or an
                expert, your insights can help the community grow.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <PlusCircle className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Add New Challenges</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create and share new development challenges for others to
                  tackle.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contributions/new">Create a Challenge</Link>
                </Button>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <BookOpen className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Share Resources</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Contribute helpful resources, tutorials, and tips for specific
                  challenges.
                </p>
                <Button variant="outline">Add Resources</Button>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <Users className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">
                  Engage in Discussions
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Participate in community discussions, offer help, and learn
                  from others.
                </p>
                <Button variant="outline">Join Discussions</Button>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <MaxWidthWrapper>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 flex flex-col items-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Level Up Your Dev Skills?
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 ">
                  Join our community of developers, start tackling exciting
                  challenges, and build your shareable portfolio today.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button>Sign Up</Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-2">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>
      </main>
      <Footer />
    </div>
  );
}
