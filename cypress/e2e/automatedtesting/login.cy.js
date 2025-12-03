describe("Paws Kingdoms - Login Flow (E2E)", () => {
  const baseUrl = "http://localhost:5173";

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.clearLocalStorage();
  });

  // TC-LOGIN-01: Semua input valid dan sudah terdaftar
  it("TC-LOGIN-01: Berhasil login jika semua input valid dan sudah terdaftar", () => {
    cy.window().then(async (win) => {
      const passHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("benar")
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
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("benar");
    cy.get("button").contains("Log in").click();

    cy.wait(1000);

    cy.window().then((win) => {
      const session = JSON.parse(win.localStorage.getItem("pk_session"));
      expect(session).to.have.property("username", "Sabil");
    });

    cy.contains("Welcome, Sabil").should("be.visible");
  });

  // TC-LOGIN-02: Username salah
  it("TC-LOGIN-02: Gagal login jika username salah", () => {
    cy.window().then(async (win) => {
      const passHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("benar")
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
    cy.get("#nameInput").type("UsernameSalah");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("benar");
    cy.get("button").contains("Log in").click();
    cy.get(".alert-danger").should("contain", "User tidak ditemukan");
  });

  // TC-LOGIN-03: Password salah
  it("TC-LOGIN-03: Gagal login jika password salah", () => {
    cy.window().then(async (win) => {
      const passHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("benar")
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
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("salah");
    cy.get("button").contains("Log in").click();
    cy.get(".alert-danger").should("contain", "Password salah");
  });

  // TC-LOGIN-04: Email salah
  it("TC-LOGIN-04: Gagal login jika email salah", () => {
    cy.window().then(async (win) => {
      const passHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("benar")
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
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("emailsalah@mail.com");
    cy.get("#passwordInput").type("benar");
    cy.get("button").contains("Log in").click();
    cy.get(".alert-danger").should(
      "contain",
      "Email tidak sesuai dengan akun ini"
    );
  });

  // TC-LOGIN-05: Semua input invalid (tidak sesuai dengan akun yang terdaftar)
  it("TC-LOGIN-05: Gagal login jika semua input invalid", () => {
    cy.window().then(async (win) => {
      const passHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("benar")
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
    cy.get("#nameInput").type("UsernameSalah");
    cy.get("#emailInput").type("emailsalah@mail.com");
    cy.get("#passwordInput").type("passwordsalah");
    cy.get("button").contains("Log in").click();
    cy.get(".alert-danger").should("contain", "User tidak ditemukan");
  });

  // TC-LOGIN-06: Semua Input Kosong
  it("TC-LOGIN-06: Gagal login jika semua input kosong", () => {
    cy.get("button").contains("Log in").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });

  // TC-LOGIN-07: Username Kosong
  it("TC-LOGIN-07: Gagal login jika username kosong", () => {
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("#passwordInput").type("benar");
    cy.get("button").contains("Log in").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });

  // TC-LOGIN-08: Email kosong
  it("TC-LOGIN-08: Gagal login jika email kosong", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#passwordInput").type("benar");
    cy.get("button").contains("Log in").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });

  // TC-LOGIN-09: Password kosong
  it("TC-LOGIN-09: Gagal login jika password kosong", () => {
    cy.get("#nameInput").type("Sabil");
    cy.get("#emailInput").type("sabil@mail.com");
    cy.get("button").contains("Log in").click();
    cy.get(".alert-danger").should("contain", "wajib diisi");
  });
});
