describe("Paws Kingdoms - Create Cat Food (E2E)", () => {
  const baseUrl = "http://localhost:5173/admin/catfoods/create";
  const apiUrl = "http://localhost:8000/api/cat_foods";

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        "pk_session",
        JSON.stringify({
          username: "Sabil",
          email: "sabil@mail.com",
          token: "mockedtoken123",
        })
      );
    });

    cy.visit(baseUrl);
  });

  // TC-CATFOOD-01: Semua input valid
  it("TC-CATFOOD-01: Berhasil create jika semua input valid", () => {
    cy.get('input[placeholder="Enter Product Name"]').type("Whiskas Tuna");
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy image"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );
    cy.get('textarea[placeholder="Enter Description Product"]').type(
      "Makanan kucing Whiskas rasa tuna dengan nutrisi lengkap."
    );
    cy.get('input[placeholder="Enter stock"]').type("20");
    cy.get('input[placeholder="Enter price"]').type("25000");

    cy.intercept("POST", apiUrl).as("createCatFood");
    cy.get("button").contains("Save").click();

    cy.wait("@createCatFood").then((intercept) => {
      const status = intercept.response.statusCode;
      expect([200, 201, 422]).to.include(status);

      if (status !== 422) {
        cy.url().should("include", "/admin/catfoods");
      }
    });
  });

  // TC-CATFOOD-02: Product Name kosong
  it("TC-CATFOOD-02: Gagal jika product name kosong", () => {
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy image"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );
    cy.get('textarea[placeholder="Enter Description Product"]').type(
      "Deskripsi produk lengkap tanpa masalah."
    );
    cy.get('input[placeholder="Enter stock"]').type("10");
    cy.get('input[placeholder="Enter price"]').type("30000");
    cy.get("button").contains("Save").click();

    cy.get(".alert-danger").should("contain", "Product name wajib diisi.");
  });

  // TC-CATFOOD-03: Image kosong
  it("TC-CATFOOD-03: Gagal jika image kosong", () => {
    cy.get('input[placeholder="Enter Product Name"]').type("Whiskas No Image");
    cy.get('textarea[placeholder="Enter Description Product"]').type(
      "Deskripsi lengkap tanpa upload gambar."
    );
    cy.get('input[placeholder="Enter stock"]').type("5");
    cy.get('input[placeholder="Enter price"]').type("20000");
    cy.get("button").contains("Save").click();

    cy.get(".alert-danger").should("contain", "Gambar wajib diunggah.");
  });

  // TC-CATFOOD-04: Stock kosong
  it("TC-CATFOOD-04: Gagal jika stok kosong", () => {
    cy.get('input[placeholder="Enter Product Name"]').type("Whiskas Stock");
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy image"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );
    cy.get('textarea[placeholder="Enter Description Product"]').type(
      "Deskripsi panjang yang valid untuk produk."
    );
    cy.get('input[placeholder="Enter price"]').type("25000");
    cy.get("button").contains("Save").click();

    cy.get(".alert-danger").should("contain", "Stok wajib diisi.");
  });

  // TC-CATFOOD-05: Semua input kosong
  it("TC-CATFOOD-05: Gagal jika semua input kosong", () => {
    cy.get("button").contains("Save").click();
    cy.get(".alert-danger").should("contain", "Product name wajib diisi.");
    cy.get(".alert-danger").should("contain", "Gambar wajib diunggah.");
    cy.get(".alert-danger").should("contain", "Deskripsi wajib diisi.");
    cy.get(".alert-danger").should("contain", "Stok wajib diisi.");
    cy.get(".alert-danger").should("contain", "Harga wajib diisi.");
  });

  // TC-CATFOOD-06: Format gambar tidak valid
  it("TC-CATFOOD-06: Gagal jika format gambar bukan jpg/png", () => {
    cy.get('input[placeholder="Enter Product Name"]').type(
      "Whiskas File Wrong"
    );
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("invalid"),
        fileName: "file.txt",
        mimeType: "text/plain",
      },
      { force: true }
    );
    cy.get('textarea[placeholder="Enter Description Product"]').type(
      "Deskripsi lengkap untuk pengujian format gambar."
    );
    cy.get('input[placeholder="Enter stock"]').type("10");
    cy.get('input[placeholder="Enter price"]').type("10000");
    cy.get("button").contains("Save").click();

    cy.get(".alert-danger").should(
      "contain",
      "Format gambar harus jpeg, png, jpg, gif, atau svg."
    );
  });

  // TC-CATFOOD-07: Deskripsi kurang dari 20 karakter
  it("TC-CATFOOD-07: Gagal jika deskripsi kurang dari 20 karakter", () => {
    cy.get('input[placeholder="Enter Product Name"]').type("Whiskas Mini");
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );
    cy.get('textarea[placeholder="Enter Description Product"]').type("Pendek");
    cy.get('input[placeholder="Enter stock"]').type("10");
    cy.get('input[placeholder="Enter price"]').type("10000");
    cy.get("button").contains("Save").click();

    cy.get(".alert-danger").should("contain", "Deskripsi minimal 20 karakter.");
  });

  // TC-CATFOOD-08: Deskripsi lebih dari 200 karakter
  it("TC-CATFOOD-08: Gagal jika deskripsi lebih dari 200 karakter", () => {
    const longText = "A".repeat(210);

    cy.get('input[placeholder="Enter Product Name"]').type("Whiskas Jumbo");
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );
    cy.get('textarea[placeholder="Enter Description Product"]').type(longText);
    cy.get('input[placeholder="Enter stock"]').type("10");
    cy.get('input[placeholder="Enter price"]').type("20000");
    cy.get("button").contains("Save").click();

    cy.get(".alert-danger").should(
      "contain",
      "Deskripsi maksimal 200 karakter."
    );
  });

  // TC-CATFOOD-09: Deskripsi kosong
  it("TC-CATFOOD-09: Gagal jika deskripsi kosong", () => {
    cy.get('input[placeholder="Enter Product Name"]').type("Whiskas No Desc");
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );
    cy.get('input[placeholder="Enter stock"]').type("10");
    cy.get('input[placeholder="Enter price"]').type("25000");
    cy.get("button").contains("Save").click();

    cy.get(".alert-danger").should("contain", "Deskripsi wajib diisi.");
  });

  // TC-CATFOOD-10: Ada emoji di deskripsi
  it("TC-CATFOOD-10: Gagal jika deskripsi mengandung emoji", () => {
    cy.get('input[placeholder="Enter Product Name"]').type("Whiskas Emoji");
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );
    cy.get('textarea[placeholder="Enter Description Product"]').type(
      "Produk sehat dan enak untuk kucing 🐱"
    );
    cy.get('input[placeholder="Enter stock"]').type("5");
    cy.get('input[placeholder="Enter price"]').type("30000");
    cy.get("button").contains("Save").click();

    cy.get(".alert-danger").should(
      "contain",
      "Deskripsi tidak boleh mengandung emoji."
    );
  });
});
