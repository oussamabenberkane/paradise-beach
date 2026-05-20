// User-scoped memory for the agent. Memories are explicit ("the user said
// 'remember that…'" or used the explicit save action in the UI). Auto-extraction
// is deliberately out of scope for v1.

export type MemoryKind = "preference" | "watch" | "saved-view" | "note";

export interface Memory {
  id: string;
  kind: MemoryKind;
  name: string;
  body: string;
  /** Optional entity id this memory is about, e.g. "s1" for kind: "watch". */
  target?: string;
  createdAt: number;
  updatedAt: number;
}

/** What `save_memory` accepts — id/timestamps are assigned by the store. */
export interface MemoryInput {
  kind: MemoryKind;
  name: string;
  body: string;
  target?: string;
}
