export interface UserInterface {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: "user" | "admin";
  profile?: {
    image_url: string;
    about: string;
  };
  isVerified: boolean;
  created_at: string;
}
