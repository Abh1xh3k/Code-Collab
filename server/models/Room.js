import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const participantSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { _id: false }
);

const roomSchema = new Schema(
  {
    name: { type: String, required: true },

    // store only the hash of the join password (if room is private)
    joinCodeHash: {
      type: String,
      required: function () {
        return this.isPrivate === true;
      },
    },

    participants: { type: [participantSchema], default: [] },

    // whether room requires id+password to join
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Instance method to set (hash) a join code.
 * Usage: await room.setJoinCode('plainSecret'); then await room.save();
 */
roomSchema.methods.setJoinCode = async function (plainJoinCode) {
  if (!plainJoinCode) {
    this.joinCodeHash = undefined;
    return;
  }
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainJoinCode, saltRounds);
  this.joinCodeHash = hash;
};

/**
 * Instance method to compare a plain join code with the stored hash.
 * Returns true/false.
 */
roomSchema.methods.verifyJoinCode = async function (plainJoinCode) {
  if (!this.joinCodeHash) return false; // no password set
  return bcrypt.compare(plainJoinCode, this.joinCodeHash);
};

// addParticipant and removeParticipant (no double-save issues — they save)
roomSchema.methods.addParticipant = async function (userId, role = "member") {
  const exists = this.participants.some(
    (p) => p.userId.toString() === userId.toString()
  );
  if (!exists) {
    this.participants.push({ userId, role });
    await this.save();
  }
  return this;
};

roomSchema.methods.removeParticipant = async function (userId) {
  this.participants = this.participants.filter(
    (p) => p.userId.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

export default mongoose.model("Room", roomSchema);
