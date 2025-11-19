const USERS_KEY = "pk_users"; // daftar user
const SESSION_KEY = "pk_session"; // sesi login aktif
const USED_CODES_KEY = "pk_used_codes"; // kode unik yang sudah terpakai

const UNIQUE_CODES = ["PK-ADMIN-ALPHA", "PK-ADMIN-BETA", "PK-ADMIN-GAMMA"];

// ---------- Util dasar penyimpanan ----------
function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getUsedCodes() {
  try {
    const raw = localStorage.getItem(USED_CODES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function setUsedCodes(arr) {
  localStorage.setItem(USED_CODES_KEY, JSON.stringify(arr));
}
function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function isAuthenticated() {
  return !!getCurrentUser();
}

// ---------- Hashing password ----------
export async function hashSHA256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(buf));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// ---------- Init ----------
export function initAuth() {
  if (!localStorage.getItem(USERS_KEY)) writeUsers([]);
  if (!localStorage.getItem(USED_CODES_KEY)) setUsedCodes([]);
  return isAuthenticated();
}

// ---------- Helper kode unik ----------
export function availableCodes() {
  const used = new Set(getUsedCodes().map((c) => c.toUpperCase()));
  return UNIQUE_CODES.filter((c) => !used.has(c.toUpperCase()));
}
function validateUniqueCode(inputCode) {
  const code = (inputCode || "").trim().toUpperCase();
  if (!code) throw new Error("Kode unik wajib diisi.");
  const isKnown = UNIQUE_CODES.map((c) => c.toUpperCase()).includes(code);
  if (!isKnown) throw new Error("Kode unik tidak valid.");
  const alreadyUsed = getUsedCodes()
    .map((c) => c.toUpperCase())
    .includes(code);
  if (alreadyUsed) throw new Error("Kode unik sudah dipakai.");
  return code;
}

// ---------- Register / Login / Logout ----------
// Tambahan: email & confirmPassword
function isEmailValid(email) {
  const e = (email || "").trim().toLowerCase();
  // regex sederhana
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(e);
}

export async function register(
  username,
  email,
  password,
  confirmPassword,
  uniqueCode
) {
  const uname = (username || "").trim();
  const mail = (email || "").trim().toLowerCase();
  const pass = (password || "").trim();
  const pass2 = (confirmPassword || "").trim();

  if (!uname || !mail || !pass || !pass2) {
    throw new Error(
      "Username, email, password, dan confirm password wajib diisi."
    );
  }
  if (uname.length < 3) throw new Error("Username minimal 3 karakter.");
  if (!isEmailValid(mail)) throw new Error("Format email tidak valid.");
  if (pass.length < 4) throw new Error("Password minimal 4 karakter.");
  if (pass !== pass2) throw new Error("Konfirmasi password tidak sama.");

  // Validasi dan tandai kode unik
  const validCode = validateUniqueCode(uniqueCode);

  const users = readUsers();
  const existsUsername = users.some(
    (u) => u.usernameLower === uname.toLowerCase()
  );
  if (existsUsername) throw new Error("Username sudah terdaftar.");
  const existsEmail = users.some((u) => (u.email || "").toLowerCase() === mail);
  if (existsEmail) throw new Error("Email sudah terdaftar.");

  const passHash = await hashSHA256(pass);
  const newUser = {
    username: uname,
    usernameLower: uname.toLowerCase(),
    email: mail,
    passHash,
    code: validCode,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeUsers(users);

  // tandai kode terpakai
  const used = getUsedCodes();
  used.push(validCode);
  setUsedCodes(used);

  // otomatis login
  setSession({
    username: uname,
    email: mail,
    loginAt: new Date().toISOString(),
  });
  return { username: uname };
}

export async function login(username, email, password) {
  // S1 Inisiasi
  const uname = (username || "").trim();
  // S2
  const mail = (email || "").trim().toLowerCase();
  // S3
  const pass = (password || "").trim();
  // S4 & D1
  if (!uname || !mail || !pass) {
    // 5
    throw new Error("Username, email, dan password wajib diisi.");
  }
  // S6 & D2
  if (!isEmailValid(mail))
    // S7
    throw new Error("Format email tidak valid.");

  // S8
  const users = readUsers();
  // S9
  const user = users.find((u) => u.usernameLower === uname.toLowerCase());
  // S10 & D3
  if (!user)
    // S11
    throw new Error("User tidak ditemukan.");
  // S12 & D4
  if ((user.email || "").toLowerCase() !== mail)
    // S13
    throw new Error("Email tidak sesuai dengan akun ini.");

  // S14
  const passHash = await hashSHA256(pass);
  // S15 & D5
  if (passHash !== user.passHash)
    // S16
    throw new Error("Password salah.");

  // S17
  setSession({
    username: user.username,
    email: user.email,
    loginAt: new Date().toISOString(),
  });
  // S18
  return { username: user.username };
}

export function logout() {
  clearSession();
}
