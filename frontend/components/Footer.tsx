import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-12 mt-16">
      <MaxWidthWrapper>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">learn.dev</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Empowering developers through real-world challenges and
              collaborative learning.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/challenges"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Challenges
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Connect with us
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/_Thakur__"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>

              <a
                href="https://www.linkedin.com/in/ravi-kr-thakur-aa1820216/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="https://github.com/Thakur127"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} learn.dev. All rights reserved.
          </p>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
