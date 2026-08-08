"use client";

import { Show, UserButton } from "@clerk/react";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { useAuthConfigured } from "./auth-provider";

export function AccountControl({ className }: { className?: string }) {
  const configured = useAuthConfigured();

  if (!configured) {
    return (
      <Link className={className} href="/account" aria-label="Customer account">
        <CircleUserRound aria-hidden="true" size={21} strokeWidth={1.6} />
      </Link>
    );
  }

  return (
    <>
      <Show when="signed-out">
        <Link className={className} href="/sign-in" aria-label="Sign in to your account">
          <CircleUserRound aria-hidden="true" size={21} strokeWidth={1.6} />
        </Link>
      </Show>
      <Show when="signed-in">
        <span className={className} aria-label="Open customer account menu">
          <UserButton
            userProfileMode="modal"
            appearance={{ elements: { avatarBox: { width: "25px", height: "25px" } } }}
          />
        </span>
      </Show>
    </>
  );
}
