describe("Paws Kingdoms - Edit Cat Food (E2E Stabil)", () => {
  const baseUrl = "http://localhost:5173/admin/catfoods/edit/11";
  const apiUrl = "http://localhost:8000/api/cat_foods/11";

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

    cy.intercept("POST", apiUrl, {
      statusCode: 200,
      body: { message: "Update sukses (mocked response)" },
    }).as("updateCatFood");

    cy.visit(baseUrl);
  });

  const verifyAlert = (...messages) => {
    cy.wait(300);
    cy.get(".alert-danger")
      .should("exist")
      .and("be.visible")
      .then(($alerts) => {
        const text = $alerts.text().toLowerCase();
        messages.forEach((msg) => {
          expect(text).to.include(msg.toLowerCase());
        });
      });
  };
  // TC-UPDATECATFOOD-01: Semua input valid
  it("TC-UPDATECATFOOD-01: Berhasil update jika semua input valid", () => {
    cy.get('input[placeholder="Enter Product Name"]')
      .clear()
      .type("Whiskas Updated");
    cy.get('textarea[placeholder="Enter Description"]')
      .clear()
      .type("Whiskas tuna formula lengkap untuk kucing aktif.");
    cy.get('input[placeholder="Enter Stock"]').clear().type("25");
    cy.get('input[placeholder="Enter Price"]').clear().type("30000");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy image data"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();

    cy.wait("@updateCatFood").then((intercept) => {
      expect([200, 201]).to.include(intercept.response.statusCode);
      cy.url().should("include", "/admin/catfoods");
    });
  });

  // TC-UPDATECATFOOD-02: Product Name kosong
  it("TC-UPDATECATFOOD-02: Gagal jika product name kosong", () => {
    // field lain DIISI BENAR
    cy.get('input[placeholder="Enter Product Name"]').clear(); // TARGET
    cy.get('textarea[placeholder="Enter Description"]')
      .clear()
      .type("Deskripsi valid lebih dari 20 karakter.");
    cy.get('input[placeholder="Enter Stock"]').clear().type("20");
    cy.get('input[placeholder="Enter Price"]').clear().type("20000");
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();
    verifyAlert("Product name wajib diisi");
  });

  // TC-UPDATECATFOOD-03: Deskripsi kurang dari 20 karakter
  it("TC-UPDATECATFOOD-03: Gagal jika deskripsi kurang dari 20 karakter", () => {
    // field lain DIISI BENAR
    cy.get('input[placeholder="Enter Product Name"]')
      .clear()
      .type("Whiskas Short Desc");
    cy.get('textarea[placeholder="Enter Description"]').clear().type("pendek"); // TARGET
    cy.get('input[placeholder="Enter Stock"]').clear().type("20");
    cy.get('input[placeholder="Enter Price"]').clear().type("20000");
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();
    verifyAlert("Deskripsi minimal 20 karakter");
  });

  // TC-UPDATECATFOOD-04: Deskripsi lebih dari 200 karakter
  it("TC-UPDATECATFOOD-04: Gagal jika deskripsi lebih dari 200 karakter", () => {
    const longText = "A".repeat(210);

    cy.get('input[placeholder="Enter Product Name"]')
      .clear()
      .type("Whiskas Long Desc");
    cy.get('textarea[placeholder="Enter Description"]').clear().type(longText); // TARGET
    cy.get('input[placeholder="Enter Stock"]').clear().type("20");
    cy.get('input[placeholder="Enter Price"]').clear().type("20000");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();
    verifyAlert("Deskripsi maksimal 200 karakter");
  });

  // TC-UPDATECATFOOD-05: Deskripsi mengandung emoji
  it("TC-UPDATECATFOOD-05: Gagal jika deskripsi mengandung emoji", () => {
    cy.get('input[placeholder="Enter Product Name"]')
      .clear()
      .type("Whiskas Emoji");
    cy.get('textarea[placeholder="Enter Description"]').clear().type(
      "Whiskas enak untuk kucing 🐱" // TARGET
    );
    cy.get('input[placeholder="Enter Stock"]').clear().type("20");
    cy.get('input[placeholder="Enter Price"]').clear().type("20000");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();
    verifyAlert("Deskripsi tidak boleh mengandung emoji");
  });

  // TC-UPDATECATFOOD-06: Stock kosong
  it("TC-UPDATECATFOOD-06: Gagal jika stok kosong", () => {
    cy.get('input[placeholder="Enter Product Name"]')
      .clear()
      .type("Whiskas No Stock");
    cy.get('textarea[placeholder="Enter Description"]')
      .clear()
      .type("Deskripsi valid dan lengkap untuk pengujian.");
    cy.get('input[placeholder="Enter Stock"]').clear(); // TARGET
    cy.get('input[placeholder="Enter Price"]').clear().type("20000");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();
    verifyAlert("Stok wajib diisi");
  });

  // TC-UPDATECATFOOD-07: Harga kosong
  it("TC-UPDATECATFOOD-07: Gagal jika harga kosong", () => {
    cy.get('input[placeholder="Enter Product Name"]')
      .clear()
      .type("Whiskas No Price");
    cy.get('textarea[placeholder="Enter Description"]')
      .clear()
      .type("Deskripsi lengkap valid untuk harga kosong.");
    cy.get('input[placeholder="Enter Stock"]').clear().type("22");
    cy.get('input[placeholder="Enter Price"]').clear(); // TARGET

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();
    verifyAlert("Harga wajib diisi");
  });

  // TC-UPDATECATFOOD-08: Format gambar tidak valid
  it("TC-UPDATECATFOOD-08: Gagal jika format gambar tidak valid", () => {
    cy.get('input[placeholder="Enter Product Name"]')
      .clear()
      .type("Whiskas Invalid File");
    cy.get('textarea[placeholder="Enter Description"]')
      .clear()
      .type("Deskripsi valid tanpa masalah.");
    cy.get('input[placeholder="Enter Stock"]').clear().type("20");
    cy.get('input[placeholder="Enter Price"]').clear().type("20000");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("salah format"),
        fileName: "file.txt", // TARGET
        mimeType: "text/plain",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();
    verifyAlert("Format gambar harus jpeg, png, jpg, gif, atau svg");
  });

  // TC-UPDATECATFOOD-09: Deskripsi kosong
  it("TC-UPDATECATFOOD-09: Gagal jika deskripsi kosong", () => {
    cy.get('input[placeholder="Enter Product Name"]')
      .clear()
      .type("Whiskas No Desc");
    cy.get('textarea[placeholder="Enter Description"]').clear(); // TARGET
    cy.get('input[placeholder="Enter Stock"]').clear().type("20");
    cy.get('input[placeholder="Enter Price"]').clear().type("20000");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy"),
        fileName: "cat.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    cy.get("button").contains("Update").click();
    verifyAlert("Deskripsi wajib diisi");
  });
});
