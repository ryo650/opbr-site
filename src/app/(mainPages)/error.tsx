"use client";

import Link from "next/link";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <main id="main-content" tabIndex={-1} className="article-container section">
    <h1>Something went wrong</h1>
    <p>We couldn&apos;t load this page. Please try again.</p>
    <button type="button" onClick={retry} className="recovery-action">Try again</button>
    <Link href="/" className="recovery-action">Return home</Link>
  </main>;
}
