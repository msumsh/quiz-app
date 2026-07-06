import bcrypt from "bcryptjs";
import { query } from "./db.js";

export async function createUser({ email, password, name }) {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [email, passwordHash, name]
    );
    return toPublicUser(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      throw new Error("An account with this email already exists");
    }
    throw err;
  }
}

export async function verifyCredentials(email, password) {
  const result = await query(
    `SELECT id, email, name, password_hash FROM users WHERE email = $1`,
    [email]
  );
  const user = result.rows[0];
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password_hash);
  return isValid ? toPublicUser(user) : null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT id, email, name FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? toPublicUser(result.rows[0]) : null;
}

function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  };
}
