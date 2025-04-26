"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = {
    OAuthSignin:
      "Error in constructing an authorization URL. Please check your settings.",
    OAuthCallback: "Error in handling the response from Google. Try again.",
    OAuthCreateAccount: "Could not create account with Google credentials.",
    OAuthAccountNotLinked:
      "Email already exists with different sign-in method.",
    EmailCreateAccount: "Error creating account with email.",
    Callback: "Error during callback handling.",
    Configuration: "Server configuration error. Contact support.",
    AccessDenied: "Access denied. Please contact admin.",
    Verification: "Email verification failed.",
    default: "Something went wrong during login. Please try again.",
  };

  const message = errorMessage[error] || errorMessage["default"];

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>⚠️ Login Error</h1>
      <p>{message}</p>

      <Link href="/authflow">
        <button
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Sign In Again
        </button>
      </Link>
    </div>
  );
}
