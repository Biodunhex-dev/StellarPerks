import { v4 as uuidv4 } from "uuid";

export interface Business {
  id: string;
  name: string;
  email: string;
  publicKey: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  publicKey: string;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  programId: string;
  userPublicKey: string;
  action: "issue" | "redeem";
  points: number;
  txHash?: string;
  createdAt: string;
}

class Store {
  businesses = new Map<string, Business>();
  users = new Map<string, User>();
  events: EventRecord[] = [];

  addBusiness(data: Omit<Business, "id" | "createdAt">): Business {
    const b: Business = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    this.businesses.set(b.id, b);
    return b;
  }

  addUser(data: Omit<User, "id" | "createdAt">): User {
    const u: User = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    this.users.set(u.id, u);
    return u;
  }

  addEvent(data: Omit<EventRecord, "id" | "createdAt">): EventRecord {
    const e: EventRecord = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    this.events.push(e);
    return e;
  }

  getAnalytics(programId?: string) {
    const filtered = programId
      ? this.events.filter((e) => e.programId === programId)
      : this.events;
    const issued = filtered.filter((e) => e.action === "issue").reduce((s, e) => s + e.points, 0);
    const redeemed = filtered.filter((e) => e.action === "redeem").reduce((s, e) => s + e.points, 0);
    return { totalIssued: issued, totalRedeemed: redeemed, outstanding: issued - redeemed, eventCount: filtered.length };
  }
}

export const store = new Store();
