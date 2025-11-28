import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      termsAgreed?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    termsAgreed?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    termsAgreed?: boolean;
  }
}
