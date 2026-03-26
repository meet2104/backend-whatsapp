// models/Role.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
    name : string;
    displayName : string;
}

const roleSchema = new Schema<IRole>({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
});

export default mongoose.model<IRole>("Role", roleSchema);
