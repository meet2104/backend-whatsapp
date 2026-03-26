import { Schema, model, Types } from "mongoose";

export interface IUnit {
  id: Types.ObjectId;
  name: string; // kg, gm, piece, litre etc.
  displayName: string; // Kilogram, Gram, Piece, Litre etc.
}

const unitSchema = new Schema<IUnit>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IUnit>("Unit", unitSchema); // ✅ CAPITAL U
