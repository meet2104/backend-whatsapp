// scripts/seedRoles.ts
import mongoose from "mongoose";
import Role from "../src/app/modules/role/Role.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedRoles = async () => {
    await mongoose.connect(process.env.MONGO_URI as string);

    const roles = [
        "SUPER ADMIN",
        "ADMIN",
        "SHOP OWNER",
    ];

    for (const name of roles) {
        await Role.updateOne(
            { name },
            { $setOnInsert: { name } },
            { upsert: true }
        );
    }

    console.log("✅ Roles seeded");
    process.exit();
};

seedRoles();
