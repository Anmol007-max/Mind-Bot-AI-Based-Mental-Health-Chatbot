"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button asChild>
      <Link href="/login">Sign In</Link>
    </Button>
  );
}