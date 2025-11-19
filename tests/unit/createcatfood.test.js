import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateCatFood from "@/views/catfoods/create.vue";

// mock api dan router
vi.mock("@/api", () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Tambahkan ini untuk menghindari error HTTP request
global.fetch = vi.fn();

describe("CreateCatFood.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountOptions = {
    global: {
      stubs: {
        // Stub komponen yang mungkin load asset eksternal
        RouterLink: true,
        RouterView: true,
      },
    },
  };

  it("gagal jika semua field kosong", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    await wrapper.find("form").trigger("submit.prevent");

    const e = wrapper.vm.errors;
    expect(e.product_name).toBeTruthy();
    expect(e.image).toBeTruthy();
    expect(e.description).toBeTruthy();
    expect(e.stock).toBeTruthy();
    expect(e.price).toBeTruthy();
  });

  it("gagal jika format gambar tidak valid", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.image = new File(["dummy"], "file.txt", { type: "text/plain" });
    wrapper.vm.description = "Makanan kucing sehat bergizi tinggi.";
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.image[0]).toContain("Format gambar");
  });

  it("gagal jika ukuran gambar > 2MB", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    const largeContent = new Array(2048 * 1025).fill("a").join("");
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.image = new File([largeContent], "big.jpg", {
      type: "image/jpeg",
    });
    // Set size manually karena JSDOM tidak menghitung size otomatis
    Object.defineProperty(wrapper.vm.image, "size", {
      value: 2048 * 1025,
      writable: false,
    });
    wrapper.vm.description = "Makanan kucing sehat bergizi tinggi.";
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.image[0]).toContain("2MB");
  });

  it("gagal jika deskripsi kosong", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.image = new File(["a"], "test.jpg", { type: "image/jpeg" });
    wrapper.vm.description = "";
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.description[0]).toContain("wajib diisi");
  });

  it("gagal jika deskripsi < 20 karakter", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Pendek banget";
    wrapper.vm.image = new File(["a"], "test.jpg", { type: "image/jpeg" });
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.description[0]).toContain("minimal");
  });

  it("gagal jika deskripsi > 200 karakter", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "a".repeat(210);
    wrapper.vm.image = new File(["a"], "test.jpg", { type: "image/jpeg" });
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.description[0]).toContain("maksimal");
  });

  it("gagal jika deskripsi mengandung emoji", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Kucing senang 😺 dengan makanan ini.";
    wrapper.vm.image = new File(["a"], "test.jpg", { type: "image/jpeg" });
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.description[0]).toContain("emoji");
  });

  it("gagal jika stok kosong", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Makanan kucing sehat bergizi tinggi.";
    wrapper.vm.image = new File(["a"], "test.jpg", { type: "image/jpeg" });
    wrapper.vm.stock = "";
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.stock[0]).toContain("wajib diisi");
  });

  it("gagal jika harga kosong", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Makanan kucing sehat bergizi tinggi.";
    wrapper.vm.image = new File(["a"], "test.jpg", { type: "image/jpeg" });
    wrapper.vm.stock = 10;
    wrapper.vm.price = "";

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.price[0]).toContain("wajib diisi");
  });

  it("berhasil jika semua valid", async () => {
    const wrapper = mount(CreateCatFood, mountOptions);
    wrapper.vm.product_name = "Whiskas Premium";
    wrapper.vm.description = "Makanan kucing sehat bergizi tinggi.";
    wrapper.vm.image = new File(["abc"], "test.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(wrapper.vm.image, "size", {
      value: 100000,
      writable: false,
    });
    wrapper.vm.stock = 10;
    wrapper.vm.price = 15000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(Object.keys(wrapper.vm.errors).length).toBe(0);
  });
});
