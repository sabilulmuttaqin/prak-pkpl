import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditCatFood from "@/views/catfoods/edit.vue";

// ✅ Mock API dan Router
vi.mock("@/api", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          data: {
            product_name: "Whiskas",
            description: "Makanan kucing sehat dan bergizi tinggi.",
            stock: 5,
            price: 10000,
          },
        },
      })
    ),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: { id: 1 } }),
}));

describe("EditCatFood.vue", () => {
  let wrapper;

  beforeEach(async () => {
    vi.clearAllMocks();
    wrapper = mount(EditCatFood);
    // tunggu onMounted selesai
    await Promise.resolve();
  });

  it("memuat data awal dari API saat mounted", async () => {
    expect(wrapper.vm.product_name).toBe("Whiskas");
    expect(wrapper.vm.stock).toBe(5);
  });

  it("menolak jika product_name kosong", async () => {
    wrapper.vm.product_name = "";
    wrapper.vm.description = "Deskripsi cukup panjang untuk validasi.";
    wrapper.vm.stock = 10;
    wrapper.vm.price = 5000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.product_name[0]).toContain("wajib");
  });

  it("menolak jika deskripsi kurang dari 20 karakter", async () => {
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Pendek banget";
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.description[0]).toContain("minimal");
  });

  it("menolak jika deskripsi lebih dari 200 karakter", async () => {
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "a".repeat(210);
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.description[0]).toContain("maksimal");
  });

  it("menolak jika deskripsi mengandung emoji", async () => {
    const wrapper = mount(EditCatFood);
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Kucing sangat senang 😺 dengan makanan lezat ini";
    wrapper.vm.image = new File(["a"], "test.jpg", { type: "image/jpeg" });
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.description[0]).toContain("emoji");
  });

  it("menolak jika stok kosong", async () => {
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Deskripsi valid tanpa emoji.";
    wrapper.vm.stock = "";
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.stock[0]).toContain("wajib");
  });

  it("menolak jika harga kosong", async () => {
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Deskripsi valid tanpa emoji.";
    wrapper.vm.stock = 10;
    wrapper.vm.price = "";

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.price[0]).toContain("wajib");
  });

  it("menolak jika format gambar tidak valid", async () => {
    wrapper.vm.image = new File(["fake"], "test.txt", { type: "text/plain" });
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Deskripsi valid dan lengkap.";
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.image[0]).toContain("Format gambar");
  });

  it("menolak jika ukuran gambar lebih dari 2MB", async () => {
    wrapper.vm.image = new File(["a".repeat(3 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    wrapper.vm.product_name = "Whiskas";
    wrapper.vm.description = "Deskripsi valid dan lengkap.";
    wrapper.vm.stock = 10;
    wrapper.vm.price = 10000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.vm.errors.image[0]).toContain("Ukuran gambar");
  });

  it("berhasil update jika semua valid", async () => {
    wrapper.vm.product_name = "Whiskas Premium";
    wrapper.vm.description = "Makanan kucing bergizi dan lezat sekali.";
    wrapper.vm.image = new File(["abc"], "test.jpg", {
      type: "image/jpeg",
      size: 1000,
    });
    wrapper.vm.stock = 10;
    wrapper.vm.price = 12000;

    await wrapper.find("form").trigger("submit.prevent");
    expect(Object.keys(wrapper.vm.errors).length).toBe(0);
  });
});
