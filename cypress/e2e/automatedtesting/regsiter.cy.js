describe("Paws Kingdoms - Register Flow (E2E)", () => {
  const baseUrl = "http://localhost:5173";

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.clearLocalStorage();
    cy.get("button").contains("Register").click();
  });

  // TC-REG-01: Semua Input benar format benar dan belum terdaftar sebelumnya
  it("TC-REG-01: Berhasil register dengan data valid dan belum terdaftar", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-GAMMA");
    cy.get("button").contains("Create Account").click();

    cy.wait(1000);

    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem("pk_users"));
      expect(users[0].username).to.eq("Sabil");
      const session = JSON.parse(win.localStorage.getItem("pk_session"));
      expect(session.username).to.eq("Sabil");
    });

    cy.contains("Welcome, Sabil").should("be.visible");
  });

  // TC-REG-02: Username sudah digunakan
  it("TC-REG-02: Gagal jika username sudah terdaftar", () => {
    cy.window().then(async (win) => {
      const passHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("1234")
      );
      const hashArray = Array.from(new Uint8Array(passHash));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const users = [
        {
          username: "Sabil",
          usernameLower: "sabil",
          email: "sabil@mail.com",
          passHash: hashHex,
        },
      ];
      win.localStorage.setItem("pk_users", JSON.stringify(users));
    });

    cy.reload();
    cy.contains("Register", { timeout: 8000 }).click();
    cy.get("#nameInput", { timeout: 8000 }).should("be.visible");

    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("baru@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-BETA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "Username sudah terdaftar");
  });

  // TC-REG-03: Email sudah digunakan
  it("TC-REG-03: Gagal jika email sudah terdaftar", () => {
    cy.window().then(async (win) => {
      const passHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("1234")
      );
      const hashArray = Array.from(new Uint8Array(passHash));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const users = [
        {
          username: "Lain",
          usernameLower: "lain",
          email: "sabil@mail.com",
          passHash: hashHex,
        },
      ];
      win.localStorage.setItem("pk_users", JSON.stringify(users));
    });

    cy.reload();
    cy.contains("Register", { timeout: 8000 }).click();
    cy.get("#nameInput", { timeout: 8000 }).should("be.visible");

    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-BETA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "Email sudah terdaftar");
  });

  // TC-REG-04: Kode Unik sudah digunakan
  it("TC-REG-04: Gagal jika kode unik sudah digunakan", () => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        "pk_used_codes",
        JSON.stringify(["PK-ADMIN-ALPHA"])
      );
    });

    cy.reload();
    cy.contains("Register", { timeout: 8000 }).click();
    cy.get("#nameInput", { timeout: 8000 }).should("be.visible");

    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-ALPHA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "Kode unik sudah dipakai");
  });

  // TC-REG-05: Semua Input kosong
  it("TC-REG-05: Gagal jika semua input kosong", () => {
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });

  // TC-REG-06: Format email tidak sesuai ketentuan
  it("TC-REG-06: Gagal jika format email tidak valid", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("salahformat");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-ALPHA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "Format email tidak valid");
  });

  // TC-REG-07: Field confirm password tidak sama dengan field password
  it("TC-REG-07: Gagal jika konfirmasi password tidak sama", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("9999");
    cy.get("#codeInput").type("PK-ADMIN-ALPHA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "Konfirmasi password tidak sama");
  });

  // TC-REG-08: Menggunakan Invalid kode unik
  it("TC-REG-08: Gagal jika kode unik tidak valid", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("KODE-SALAH");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "Kode unik tidak valid");
  });

  // TC-REG-09: Username kosong
  it("TC-REG-09: Gagal jika username kosong", () => {
    cy.get("#emailInput").type("user@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-ALPHA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });

  // TC-REG-10: Email kosong
  it("TC-REG-10: Gagal jika email kosong", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-ALPHA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });

  // TC-REG-11: Password kosong
  it("TC-REG-11: Gagal jika password kosong", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-ALPHA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });

  // TC-REG-12: Confirm password kosong
  it("TC-REG-12: Gagal jika confirm password kosong", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#codeInput").type("PK-ADMIN-ALPHA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });

  // TC-REG-13: Kode unik kosong
  it("TC-REG-13: Gagal jika kode unik kosong", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("1234");
    cy.get("#confirmPasswordInput").type("1234");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "Kode unik wajib diisi");
  });

  // TC-REG-14: Password kurang dari 4 karakter
  it("TC-REG-14: Gagal jika password kurang dari 4 karakter", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("123");
    cy.get("#confirmPasswordInput").type("123");
    cy.get("#codeInput").type("PK-ADMIN-ALPHA");
    cy.get("button").contains("Create Account").click();
    cy.get(".alert-danger").should("contain", "Password minimal 4 karakter");
  });
});
