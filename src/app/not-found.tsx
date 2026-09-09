import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" tabIndex={-1} className="article-container section">
    <h1>Page not found</h1>
    <p>This page may have moved or is not available yet.</p>
    <Link href="/" className="recovery-action">Return home</Link>
  </main>;
}
