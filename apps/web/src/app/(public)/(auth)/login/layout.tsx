import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Login",
	description: "",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
    <>
      { children }
    </>
  );
}
