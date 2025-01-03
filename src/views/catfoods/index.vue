<script setup>
//import ref and onMounted
import { ref, onMounted } from "vue";

//import api
import api from "../../api";

//define state
const posts = ref([]);

//method fetchDataPosts
const fetchDataPosts = async () => {
  try {
    const response = await api.get("/cat_foods");
    console.log(response.data); // Log seluruh response untuk memverifikasi
    posts.value = response.data.data.data; // Mengakses data produk dengan benar
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

//run hook "onMounted"
onMounted(() => {
  //call method "fetchDataPosts"
  fetchDataPosts();
});

//method deletePost
const deletePost = async (id) => {
  //delete post with API
  await api.delete(`/cat_foods/${id}`).then(() => {
    //call method "fetchDataPosts"
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
          class="btn btn-md btn-success rounded shadow mb-3"
        >
          Add New Product
        </router-link>

        <div class="card border-0 rounded shadow">
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
                <tr v-if="posts.length === 0">
                  <td colspan="6" class="text-center">
                    <div class="alert alert-warning mb-0">
                      Data Not Available!
                    </div>
                  </td>
                </tr>
                <tr v-else v-for="(post, index) in posts" :key="index">
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
