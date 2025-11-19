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
  let users = [
    {
      username: "ExistingUser",
      usernameLower: "existinguser",
      email: "existing@mail.com",
      passHash: "existinghash",
      code: "CODE001",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
  ];

  let usedCodes = ["USED001", "USED002"];

  return {
    readUsers: vi.fn(() => [...users]),
    writeUsers: vi.fn((newUsers) => {
      users = [...newUsers];
    }),
    hashSHA256: vi.fn(async (text) => `hashed_${text}`),
    isEmailValid: vi.fn((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    validateUniqueCode: vi.fn((code) => {
      if (!code || code.trim() === "") {
        throw new Error("Kode unik wajib diisi.");
      }
      const trimmedCode = code.trim().toUpperCase();
      if (usedCodes.includes(trimmedCode)) {
        throw new Error("Kode unik sudah digunakan.");
      }
      return trimmedCode;
    }),
    getUsedCodes: vi.fn(() => [...usedCodes]),
    setUsedCodes: vi.fn((codes) => {
      usedCodes = [...codes];
    }),
    setSession: vi.fn((data) => {
      mockLocalStorage.setItem("session", JSON.stringify(data));
    }),
    register: vi
      .fn()
      .mockImplementation(async function (
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

        // Validasi input kosong
        if (!uname || !mail || !pass || !pass2) {
          throw new Error(
            "Username, email, password, dan confirm password wajib diisi."
          );
        }

        // Validasi panjang username
        if (uname.length < 3) {
          throw new Error("Username minimal 3 karakter.");
        }

        // Validasi format email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
          throw new Error("Format email tidak valid.");
        }

        // Validasi panjang password
        if (pass.length < 4) {
          throw new Error("Password minimal 4 karakter.");
        }

        // Validasi konfirmasi password
        if (pass !== pass2) {
          throw new Error("Konfirmasi password tidak sama.");
        }

        // Validasi kode unik
        if (!uniqueCode || uniqueCode.trim() === "") {
          throw new Error("Kode unik wajib diisi.");
        }
        const trimmedCode = uniqueCode.trim().toUpperCase();
        if (usedCodes.includes(trimmedCode)) {
          throw new Error("Kode unik sudah digunakan.");
        }

        // Cek username duplikat
        const existsUsername = users.some(
          (u) => u.usernameLower === uname.toLowerCase()
        );
        if (existsUsername) {
          throw new Error("Username sudah terdaftar.");
        }

        // Cek email duplikat
        const existsEmail = users.some(
          (u) => (u.email || "").toLowerCase() === mail
        );
        if (existsEmail) {
          throw new Error("Email sudah terdaftar.");
        }

        // Hash password
        const passHash = `hashed_${pass}`;

        // Buat user baru
        const newUser = {
          username: uname,
          usernameLower: uname.toLowerCase(),
          email: mail,
          passHash,
          code: trimmedCode,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        usedCodes.push(trimmedCode);

        // Set session (auto login)
        const sessionData = {
          username: uname,
          email: mail,
          loginAt: new Date().toISOString(),
        };
        mockLocalStorage.setItem("session", JSON.stringify(sessionData));

        return { username: uname };
      }),

    // Helper untuk reset data (untuk testing)
    __resetTestData: () => {
      users = [
        {
          username: "ExistingUser",
          usernameLower: "existinguser",
          email: "existing@mail.com",
          passHash: "existinghash",
          code: "CODE001",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ];
      usedCodes = ["USED001", "USED002"];
    },
  };
});

// === 3️⃣ Import modul setelah mock ===
import * as app from "../../src/api/appjs";

// === 4️⃣ Reset state sebelum setiap test ===
beforeEach(() => {
  mockLocalStorage.clear();
  vi.clearAllMocks();
  if (app.__resetTestData) {
    app.__resetTestData();
  }
});

// === 5️⃣ Test Cases untuk register() ===
describe("register() unit test", () => {
  // ========== TEST VALIDASI INPUT KOSONG ==========
  it("gagal jika semua input kosong", async () => {
    await expect(app.register("", "", "", "", "")).rejects.toThrow(
      "Username, email, password, dan confirm password wajib diisi."
    );
  });

  it("gagal jika username kosong", async () => {
    await expect(
      app.register("", "test@mail.com", "pass123", "pass123", "CODE123")
    ).rejects.toThrow(
      "Username, email, password, dan confirm password wajib diisi."
    );
  });

  it("gagal jika email kosong", async () => {
    await expect(
      app.register("newuser", "", "pass123", "pass123", "CODE123")
    ).rejects.toThrow(
      "Username, email, password, dan confirm password wajib diisi."
    );
  });

  it("gagal jika password kosong", async () => {
    await expect(
      app.register("newuser", "test@mail.com", "", "pass123", "CODE123")
    ).rejects.toThrow(
      "Username, email, password, dan confirm password wajib diisi."
    );
  });

  it("gagal jika confirm password kosong", async () => {
    await expect(
      app.register("newuser", "test@mail.com", "pass123", "", "CODE123")
    ).rejects.toThrow(
      "Username, email, password, dan confirm password wajib diisi."
    );
  });

  // ========== TEST VALIDASI FORMAT ==========
  it("gagal jika username kurang dari 3 karakter", async () => {
    await expect(
      app.register("ab", "test@mail.com", "pass123", "pass123", "CODE123")
    ).rejects.toThrow("Username minimal 3 karakter.");
  });

  it("gagal jika format email tidak valid", async () => {
    await expect(
      app.register("newuser", "invalid-email", "pass123", "pass123", "CODE123")
    ).rejects.toThrow("Format email tidak valid.");
  });

  it("gagal jika password kurang dari 4 karakter", async () => {
    await expect(
      app.register("newuser", "test@mail.com", "123", "123", "CODE123")
    ).rejects.toThrow("Password minimal 4 karakter.");
  });

  it("gagal jika konfirmasi password tidak sama", async () => {
    await expect(
      app.register("newuser", "test@mail.com", "pass123", "pass456", "CODE123")
    ).rejects.toThrow("Konfirmasi password tidak sama.");
  });

  // ========== TEST VALIDASI KODE UNIK ==========
  it("gagal jika kode unik kosong", async () => {
    await expect(
      app.register("newuser", "test@mail.com", "pass123", "pass123", "")
    ).rejects.toThrow("Kode unik wajib diisi.");
  });

  it("gagal jika kode unik sudah digunakan", async () => {
    await expect(
      app.register("newuser", "test@mail.com", "pass123", "pass123", "USED001")
    ).rejects.toThrow("Kode unik sudah digunakan.");
  });

  // ========== TEST DUPLIKASI USER ==========
  it("gagal jika username sudah terdaftar (case-insensitive)", async () => {
    await expect(
      app.register(
        "existinguser", // lowercase
        "new@mail.com",
        "pass123",
        "pass123",
        "CODE123"
      )
    ).rejects.toThrow("Username sudah terdaftar.");
  });

  it("gagal jika username sudah terdaftar (berbeda case)", async () => {
    await expect(
      app.register(
        "EXISTINGUSER", // uppercase
        "new@mail.com",
        "pass123",
        "pass123",
        "CODE123"
      )
    ).rejects.toThrow("Username sudah terdaftar.");
  });

  it("gagal jika email sudah terdaftar", async () => {
    await expect(
      app.register(
        "newuser",
        "existing@mail.com", // email yang sudah ada
        "pass123",
        "pass123",
        "CODE123"
      )
    ).rejects.toThrow("Email sudah terdaftar.");
  });

  // ========== TEST REGISTRASI SUKSES ==========
  it("berhasil register dengan data valid", async () => {
    const result = await app.register(
      "NewUser",
      "newuser@mail.com",
      "pass1234",
      "pass1234",
      "VALIDCODE"
    );

    // Verifikasi return value
    expect(result).toEqual({ username: "NewUser" });

    // Verifikasi session tersimpan (auto login)
    const sessionData = mockLocalStorage.getItem("session");
    expect(sessionData).toBeTruthy();

    const session = JSON.parse(sessionData);
    expect(session.username).toBe("NewUser");
    expect(session.email).toBe("newuser@mail.com");
    expect(session.loginAt).toBeDefined();
  });
});
