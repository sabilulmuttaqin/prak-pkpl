describe("Paws Kingdoms - Delete Cat Food (Hybrid Stable)", () => {
  const baseUrl = "http://localhost:5173/admin/catfoods";
  const baseApi = "http://localhost:8000/api/cat_foods";
  const itemId = 10;

  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    cy.session("mockLogin", () => {
      cy.visit("http://localhost:5173/login");
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
    });

    cy.visit(baseUrl);
    cy.get("table", { timeout: 10000 }).should("exist");
  });

  // TC-DELCATFOOD-01: Admin menekan tombol Delete dan berhasil
  it("TC-DELCATFOOD-01: Berhasil menghapus data dengan ID valid", () => {
    cy.intercept("DELETE", `${baseApi}/${itemId}`, {
      statusCode: 200,
      body: { message: "Data deleted successfully (mocked)" },
    }).as("deleteCatFood");

    cy.contains("Whiskas").should("exist");
    cy.get("button.btn-danger").first().click();

    cy.wait("@deleteCatFood").its("response.statusCode").should("eq", 200);

    cy.log("✓ Delete sukses (mocked 200)");
  });
});
