import Dexie from "dexie";
import type { Table } from "dexie";

export interface User {
    id: string,
    name: string,
    image: string
}

class UserDatabase extends Dexie {
    users!: Table<User, string>

    constructor() {
        super("UserDatabase")
    
        this.version(1).stores({
            users: "id"
        })
    }
}

export const db = new UserDatabase()