import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import IndexCatFood from "@/views/catfoods/index.vue";

// Mock API
vi.mock("@/api", () => {
  const mockGet = vi.fn(() =>
    Promise.resolve({
      data: {
        data: {
          data: [
            {
              id: 1,
              product_name: "Whiskas",
              image: "test.jpg",
              description: "Makanan kucing bergizi",
              stock: 10,
              price: 20000,
            },
          ],
        },
      },
    })
  );

  const mockDelete = vi.fn(() => Promise.resolve());

  return {
    default: {
      get: mockGet,
      delete: mockDelete,
    },
  };
});

describe("IndexCatFood.vue", () => {
  let wrapper;
  let api;

  beforeEach(async () => {
    vi.clearAllMocks();

    api = (await import("@/api")).default;

    wrapper = mount(IndexCatFood, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick(); // tunggu mounted selesai
  });

  it("memanggil fetchDataPosts saat mounted", async () => {
    expect(api.get).toHaveBeenCalledWith("/cat_foods");
    expect(wrapper.vm.posts.length).toBeGreaterThan(0);
  });

  it("data ter-update setelah delete berhasil", async () => {
    // Set initial data
    wrapper.vm.posts = [
      {
        id: 1,
        product_name: "Whiskas",
        image: "test.jpg",
        description: "Makanan kucing bergizi",
        stock: 10,
        price: 20000,
      },
      {
        id: 2,
        product_name: "Royal Canin",
        image: "test2.jpg",
        description: "Premium cat food",
        stock: 5,
        price: 50000,
      },
    ];

    expect(wrapper.vm.posts.length).toBe(2);

    // Mock response setelah delete (hanya 1 item tersisa)
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          data: [
            {
              id: 2,
              product_name: "Royal Canin",
              image: "test2.jpg",
              description: "Premium cat food",
              stock: 5,
              price: 50000,
            },
          ],
        },
      },
    });

    await wrapper.vm.deletePost(1);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.posts.length).toBe(1);
    expect(wrapper.vm.posts[0].id).toBe(2);
  });
});
