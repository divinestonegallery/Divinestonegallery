"use client";

import { Show, UserButton, useAuth } from "@clerk/react";
import Link from "next/link";
import { CircleUserRound, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthConfigured } from "./auth-provider";

export function AccountControl({
  className,
  signedOutClassName,
}: {
  className?: string;
  signedOutClassName?: string;
}) {
  const configured = useAuthConfigured();
  const publicClassName = signedOutClassName ?? className;

  if (!configured) {
    return (
      <Link className={publicClassName} href="/sign-in" aria-label="Sign in to your account" title="Sign in">
        <CircleUserRound aria-hidden="true" size={21} strokeWidth={1.6} />
      </Link>
    );
  }

  return (
    <ConfiguredAccountControl
      className={className}
      signedOutClassName={signedOutClassName}
    />
  );
}

function ConfiguredAccountControl({
  className,
  signedOutClassName,
}: {
  className?: string;
  signedOutClassName?: string;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    let active = true;
    void getToken()
      .then((token) => fetch("/api/v1/admin/access", {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      }))
      .then(async (response) => {
        if (!response.ok) return false;
        const payload = await response.json() as { data?: { authorized?: boolean } };
        return payload.data?.authorized === true;
      })
      .then((authorized) => { if (active) setIsAdmin(authorized); })
      .catch(() => { if (active) setIsAdmin(false); });

    return () => { active = false; };
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <>
      <Show when="signed-out">
        <Link className={signedOutClassName ?? className} href="/sign-in" aria-label="Sign in to your account" title="Sign in">
          <CircleUserRound aria-hidden="true" size={21} strokeWidth={1.6} />
        </Link>
      </Show>
      <Show when="signed-in">
        <>
          {isAdmin ? (
            <Link className={className} href="/admin" aria-label="Open admin dashboard" title="Admin dashboard">
              <LayoutDashboard aria-hidden="true" size={21} strokeWidth={1.6} />
            </Link>
          ) : null}
          <span className={className} aria-label="Open customer account menu">
            <UserButton
              userProfileMode="modal"
              appearance={{ elements: { avatarBox: { width: "25px", height: "25px" } } }}
            />
          </span>
        </>
      </Show>
    </>
  );
}
