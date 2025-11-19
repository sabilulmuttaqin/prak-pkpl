import { describe, it, expect, beforeEach, vi } from "vitest";

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => (store[key] = String(val)),
    removeItem: (key) => delete store[key],
    clear: () => (store = {}),
  };
})();

global.localStorage = mockLocalStorage;

vi.mock("../../src/api/appjs", () => {
  // Data pengguna palsu
  const users = [
    {
      username: "Sabil",
      usernameLower: "sabil",
      email: "sabil@mail.com",
      passHash: "mockedhash",
    },
  ];

  return {
    readUsers: vi.fn(() => users),
    hashSHA256: vi.fn(async (text) => {
      return text === "benar" ? "mockedhash" : "mockedhash_salah";
    }),
    isEmailValid: vi.fn((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    setSession: vi.fn((data) => {
      mockLocalStorage.setItem("session", JSON.stringify(data));
    }),

    login: vi
      .fn()
      .mockImplementation(async function (username, email, password) {
        // Copy logic dari fungsi asli
        const uname = (username || "").trim();
        const mail = (email || "").trim().toLowerCase();
        const pass = (password || "").trim();

        if (!uname || !mail || !pass) {
          throw new Error("Username, email, dan password wajib diisi.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
          throw new Error("Format email tidak valid.");
        }

        const user = users.find((u) => u.usernameLower === uname.toLowerCase());

        if (!user) {
          throw new Error("User tidak ditemukan.");
        }

        if ((user.email || "").toLowerCase() !== mail) {
          throw new Error("Email tidak sesuai dengan akun ini.");
        }

        const passHash = pass === "benar" ? "mockedhash" : "mockedhash_salah";

        if (passHash !== user.passHash) {
          throw new Error("Password salah.");
        }

        const sessionData = {
          username: user.username,
          email: user.email,
          loginAt: new Date().toISOString(),
        };

        mockLocalStorage.setItem("session", JSON.stringify(sessionData));

        return { username: user.username };
      }),
  };
});

import * as app from "../../src/api/appjs";

beforeEach(() => {
  mockLocalStorage.clear();
  vi.clearAllMocks();
});

describe("login() unit test", () => {
  it("gagal jika input kosong", async () => {
    await expect(app.login("", "", "")).rejects.toThrow(
      "Username, email, dan password wajib diisi."
    );
  });

  it("gagal jika email tidak valid", async () => {
    await expect(app.login("Sabil", "salah-email", "benar")).rejects.toThrow(
      "Format email tidak valid."
    );
  });

  it("gagal jika user tidak ditemukan", async () => {
    await expect(
      app.login("OrangLain", "sabil@mail.com", "benar")
    ).rejects.toThrow("User tidak ditemukan.");
  });

  it("gagal jika email tidak sesuai", async () => {
    await expect(
      app.login("Sabil", "email_salah@mail.com", "benar")
    ).rejects.toThrow("Email tidak sesuai dengan akun ini.");
  });

  it("gagal jika password salah", async () => {
    await expect(app.login("Sabil", "sabil@mail.com", "salah")).rejects.toThrow(
      "Password salah."
    );
  });

  it("berhasil login jika semua benar", async () => {
    const result = await app.login("Sabil", "sabil@mail.com", "benar");

    expect(result).toEqual({ username: "Sabil" });

    // Verifikasi session tersimpan
    const sessionData = mockLocalStorage.getItem("session");
    expect(sessionData).toBeTruthy();

    const session = JSON.parse(sessionData);
    expect(session.username).toBe("Sabil");
    expect(session.email).toBe("sabil@mail.com");
    expect(session.loginAt).toBeDefined();
  });
});
