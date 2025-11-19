<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../api";

// Define state
const posts = ref([]);
const searchQuery = ref("");
const showLowStockOnly = ref(false);

// Method fetchDataPosts
const fetchDataPosts = async () => {
  try {
    const response = await api.get("/cat_foods");
    console.log(response.data);
    posts.value = response.data.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Computed filtered posts
const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const matchesSearch = post.product_name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesStockFilter = showLowStockOnly.value ? post.stock < 5 : true;
    return matchesSearch && matchesStockFilter;
  });
});

// Run hook "onMounted"
onMounted(() => {
  fetchDataPosts();
});

// Method deletePost
const deletePost = async (id) => {
  await api.delete(`/cat_foods/${id}`).then(() => {
    fetchDataPosts();
  });
};
</script>

<template>
  <div class="container mb-5">
    <div class="row">
      <div class="col-md-12">
        <router-link
          :to="{ name: 'catfoods.create' }"
          class="btn btn-md btn-success rounded shadow-sm mb-3"
        >
          Add New Product
        </router-link>

        <!-- Search and Filter Section -->
        <div class="card border-0 rounded shadow-sm-sm mb-3">
          <div class="card-body px-0">
            <div class="row align-items-center">
              <div class="col-md-8">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Cari nama produk..."
                />
              </div>
              <div class="col-md-4 d-flex justify-content-end">
                <div class="form-check">
                  <input
                    v-model="showLowStockOnly"
                    class="form-check-input"
                    type="checkbox"
                    id="lowStockFilter"
                  />
                  <label
                    class="form-check-label fw-semibold"
                    for="lowStockFilter"
                  >
                    Tampilkan Stok < 5
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card border-0 rounded shadow-sm">
          <div class="card-body">
            <table class="table table-hover table-striped">
              <thead class="">
                <tr>
                  <th scope="col">Product Name</th>
                  <th scope="col">Image</th>
                  <th scope="col">Description</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Price</th>
                  <th scope="col" style="width: 15%">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredPosts.length === 0">
                  <td colspan="6" class="text-center">
                    <div class="alert alert-warning mb-0">
                      Data Not Available!
                    </div>
                  </td>
                </tr>
                <tr v-else v-for="(post, index) in filteredPosts" :key="index">
                  <td>{{ post.product_name }}</td>
                  <td class="text-center">
                    <img
                      :src="post.image"
                      alt="Product Image"
                      class="img-thumbnail"
                      style="width: 150px; height: auto"
                    />
                  </td>
                  <td>{{ post.description }}</td>
                  <td>{{ post.stock }}</td>
                  <td>{{ post.price }}</td>
                  <td class="text-center">
                    <router-link
                      :to="{ name: 'catfoods.edit', params: { id: post.id } }"
                      class="btn btn-sm btn-primary rounded me-2"
                    >
                      Edit
                    </router-link>
                    <button
                      @click.prevent="deletePost(post.id)"
                      class="btn btn-sm btn-danger rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.img-thumbnail {
  max-width: 100%;
  height: auto;
  display: block;
  margin: auto;
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: scale(1.05);
}

.alert {
  font-weight: bold;
  text-transform: uppercase;
}
</style>
