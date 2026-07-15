export type Character = {
    id: string;
    name: string;
    image: string;
    grade: "ex" | "bf" | "sp" | "star-4" | "star-3" | "star-2" | "free" | "exchange" | "cola" | "unknown";
    element:"red" | "blue" | "green" | "white" | "black";
    role: "attacker" | "defender" | "runner" | "unknown" ;
}
