import Link from "next/link"
import styles from "./topHeader.module.css"

export function TopHeader() {
  return (
    <header className={styles.page}>
        {/* サイトのロゴやタイトルを表示する部分 */}
        <div className={styles["header-logo"]}>
            <h1>Any Lantern</h1>
        </div>
        {/* 記事のリンク */}
        <div className={styles["header-links"]}>
            <nav>
                <ul>
                    <li>
                        <Link href="/">Tier List</Link>
                    </li>
                    <li>
                        <Link href="/">New Character</Link>
                    </li>
                    <li>
                        <Link href="/">New Scout</Link>
                    </li>
                </ul>
            </nav>
        </div>
        <div className={styles["header-links"]}>
            <nav>
                <ul>
                    <li>
                        <Link href="/">Top Page</Link>
                    </li>
                    <li>
                        <Link href="/">Scout Simulater</Link>
                    </li>
                    <li>
                        <Link href="/">Beginner Guide</Link>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
  )
}
