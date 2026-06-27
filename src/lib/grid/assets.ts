import type { CharacterSprite, ObjectSprite } from "@/types";

export const CHARACTER_SPRITES: CharacterSprite[] = [
  { id: "manager_blue", label: "MGR", color: "#2563eb", roles: ["office", "leader"] },
  { id: "coworker_green", label: "CO", color: "#16a34a", roles: ["office", "helper"] },
  { id: "client_purple", label: "CLI", color: "#7c3aed", roles: ["office", "guest"] },
  { id: "staff_red", label: "STF", color: "#dc2626", roles: ["airport", "service"] },
  { id: "traveler_yellow", label: "TRV", color: "#f59e0b", roles: ["airport", "guest"] },
  { id: "barista_brown", label: "BAR", color: "#92400e", roles: ["cafe", "service"] },
  { id: "doctor_teal", label: "DOC", color: "#0f766e", roles: ["clinic", "helper"] },
  { id: "student_orange", label: "STD", color: "#ea580c", roles: ["school", "helper"] },
  { id: "guard_gray", label: "GRD", color: "#475569", roles: ["security", "guide"] },
  { id: "robot_silver", label: "BOT", color: "#94a3b8", roles: ["assistant", "guide"] },
];

export const OBJECT_SPRITES: ObjectSprite[] = [
  { id: "urgent_notice", label: "Notice", symbol: "!", color: "#ef4444", themes: ["office", "airport"] },
  { id: "whiteboard", label: "Board", symbol: "W", color: "#e0f2fe", themes: ["office", "school"] },
  { id: "calendar", label: "Calendar", symbol: "S", color: "#93c5fd", themes: ["office", "hotel"] },
  { id: "laptop", label: "Laptop", symbol: "L", color: "#64748b", themes: ["office", "cafe"] },
  { id: "phone", label: "Phone", symbol: "P", color: "#22c55e", themes: ["office", "hotel"] },
  { id: "door", label: "Door", symbol: "D", color: "#a16207", themes: ["office", "airport", "cafe"] },
  { id: "coffee_machine", label: "Coffee", symbol: "C", color: "#78350f", themes: ["office", "cafe"] },
  { id: "suitcase", label: "Bag", symbol: "B", color: "#f97316", themes: ["airport", "hotel"] },
  { id: "ticket_screen", label: "Screen", symbol: "T", color: "#38bdf8", themes: ["airport"] },
  { id: "menu_board", label: "Menu", symbol: "M", color: "#fde68a", themes: ["cafe"] },
  { id: "plant", label: "Plant", symbol: "*", color: "#15803d", themes: ["office", "cafe", "hotel"] },
  { id: "file_box", label: "Files", symbol: "F", color: "#c084fc", themes: ["office"] },
  { id: "desk_lamp", label: "Lamp", symbol: "I", color: "#facc15", themes: ["office", "hotel"] },
  { id: "book_stack", label: "Books", symbol: "K", color: "#fb7185", themes: ["school", "office"] },
  { id: "projector", label: "Projector", symbol: "Q", color: "#4b5563", themes: ["office", "school"] },
];

export function getCharacterSprite(id: string) {
  return CHARACTER_SPRITES.find((sprite) => sprite.id === id) ?? CHARACTER_SPRITES[0];
}

export function getObjectSprite(id: string) {
  return OBJECT_SPRITES.find((sprite) => sprite.id === id) ?? OBJECT_SPRITES[0];
}
