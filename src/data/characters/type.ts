export type Character = {
    id: string;
    name: string;
    image: string;
    grade: "ex" | "bf" | "sp" | "4" | "3" | "2" | "free";
    element:"red" | "blue" | "green" | "white" | "black";
    class: "attacker" | "defender" | "runner" ;
}
