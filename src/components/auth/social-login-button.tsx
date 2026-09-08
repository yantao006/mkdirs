"use client";

import { Icons } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getProviders, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBrandsGitHub } from "../icons/github";
import { FaBrandsGoogle } from "../icons/google";

export const SocialLoginButton = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [providers, setProviders] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProviders()
      .then((available) => {
        if (active) setProviders(Object.keys(available || {}));
      })
      .catch(() => {
        if (active) setProviders([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const onClick = async (provider: "google" | "github") => {
    setError("");
    setIsLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
      });
    } catch {
      setError("Could not start sign-in. Please try again.");
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {(["google", "github"] as const).map((provider) => {
        const configured = providers?.includes(provider);
        const Icon = provider === "google" ? FaBrandsGoogle : FaBrandsGitHub;
        const name = provider === "google" ? "Google" : "GitHub";
        return (
          <div key={provider}>
            <Button
              size="lg"
              className="w-full"
              variant="outline"
              onClick={() => onClick(provider)}
              disabled={!configured || !!isLoading}
            >
              {isLoading === provider ? (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              ) : (
                <Icon className="size-5 mr-2" />
              )}
              <span>Login with {name}</span>
            </Button>
            {providers && !configured && (
              <p className="mt-2 text-xs text-muted-foreground">
                {name} sign-in is awaiting this site's configuration.
              </p>
            )}
          </div>
        );
      })}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
