import Image from "next/image";
import Link from "next/link";
import styles from "./CommonHeader.module.css";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CommonHeader() {
  return (
    <header className={styles["header"]}>
        {/* 左　のドロップダウンメニュー */}
        <div className={styles["menu"]}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
           <DropdownMenuItem asChild>
             <Link href="/">Home</Link>
           </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/tier-list">Tier List</Link>
             </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/new-characters">New Characters</Link>
           </DropdownMenuItem>
            {/*
           <DropdownMenuItem asChild>
             <Link href="/new-scout">New Scout</Link>
           </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/scout-simulator">Scout Simulator</Link>
           </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/beginner-guide">Beginner Guide</Link>
           </DropdownMenuItem>
           */}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>


        {/* 中央のロゴ */}
        <Link href="/" className={styles["logoWrap"]}>
            <Image src="/new-logo2.png" alt="OPBR Logo" width={100} height={100} className={styles["logo"]} priority />
        </Link>

    </header>
  )
}

