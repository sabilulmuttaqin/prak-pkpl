<script setup>
//import ref
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../../api";

const router = useRouter();

// state
const product_name = ref("");
const image = ref("");
const description = ref("");
const stock = ref("");
const price = ref("");
const errors = ref({});

// handle file
const handleFileChange = (e) => {
  image.value = e.target.files[0];
};

// fungsi deteksi emoji
const containsEmoji = (text) => {
  const emojiRegex =
    /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F1E6}-\u{1F1FF}])/gu;
  return emojiRegex.test(text);
};

// validasi front-end
const validateForm = () => {
  errors.value = {};

  if (!product_name.value) {
    errors.value.product_name = ["Product name wajib diisi."];
  }

  if (!image.value) {
    errors.value.image = ["Gambar wajib diunggah."];
  } else {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(image.value.type)) {
      errors.value.image = [
        "Format gambar harus jpeg, png, jpg, gif, atau svg.",
      ];
    } else if (image.value.size > 2048 * 1024) {
      errors.value.image = ["Ukuran gambar maksimal 2MB."];
    }
  }

  if (!description.value) {
    errors.value.description = ["Deskripsi wajib diisi."];
  } else {
    if (description.value.length < 20) {
      errors.value.description = ["Deskripsi minimal 20 karakter."];
    } else if (description.value.length > 200) {
      errors.value.description = ["Deskripsi maksimal 200 karakter."];
    } else if (containsEmoji(description.value)) {
      errors.value.description = ["Deskripsi tidak boleh mengandung emoji."];
    }
  }

  if (!stock.value) {
    errors.value.stock = ["Stok wajib diisi."];
  }

  if (!price.value) {
    errors.value.price = ["Harga wajib diisi."];
  }

  // jika ada error return false
  return Object.keys(errors.value).length === 0;
};

// kirim data ke backend
const storePost = async () => {
  if (!validateForm()) return;

  let formData = new FormData();
  formData.append("product_name", product_name.value);
  formData.append("image", image.value);
  formData.append("description", description.value);
  formData.append("stock", stock.value);
  formData.append("price", price.value);

  try {
    await api.post("/cat_foods", formData);
    router.push({ path: "/admin/catfoods" });
  } catch (error) {
    errors.value = error.response?.data || {
      general: ["Terjadi kesalahan saat menyimpan data."],
    };
  }
};
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-md-12">
        <h4 class="text-center text-uppercase mb-4 border-bottom pb-3">
          Create Cat Food
        </h4>
        <div class="card border-0 rounded shadow">
          <div class="card-body">
            <form @submit.prevent="storePost()">
              <!-- Product Name -->
              <div class="mb-3">
                <label class="form-label fw-bold">Product Name</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="product_name"
                  placeholder="Enter Product Name"
                />
                <div v-if="errors.product_name" class="alert alert-danger mt-2">
                  <span>{{ errors.product_name[0] }}</span>
                </div>
              </div>

              <!-- Image -->
              <div class="mb-3">
                <label class="form-label fw-bold">Image</label>
                <input
                  type="file"
                  class="form-control"
                  @change="handleFileChange($event)"
                />
                <div v-if="errors.image" class="alert alert-danger mt-2">
                  <span>{{ errors.image[0] }}</span>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label class="form-label fw-bold">Description</label>
                <textarea
                  class="form-control"
                  v-model="description"
                  rows="5"
                  placeholder="Enter Description Product"
                ></textarea>
                <div v-if="errors.description" class="alert alert-danger mt-2">
                  <span>{{ errors.description[0] }}</span>
                </div>
              </div>

              <!-- Stock -->
              <div class="mb-3">
                <label class="form-label fw-bold">Stock</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="stock"
                  placeholder="Enter stock"
                />
                <div v-if="errors.stock" class="alert alert-danger mt-2">
                  <span>{{ errors.stock[0] }}</span>
                </div>
              </div>

              <!-- Price -->
              <div class="mb-3">
                <label class="form-label fw-bold">Price</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="price"
                  placeholder="Enter price"
                />
                <div v-if="errors.price" class="alert alert-danger mt-2">
                  <span>{{ errors.price[0] }}</span>
                </div>
              </div>

              <!-- Button -->
              <button
                type="submit"
                class="btn btn-md btn-primary rounded-sm shadow border-0"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
