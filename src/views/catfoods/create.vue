<script setup>
//import ref
import { ref } from "vue";

//import router
import { useRouter } from "vue-router";

//import api
import api from "../../api";

//init router
const router = useRouter();

const product_name = ref("");
const image = ref("");
const description = ref("");
const stock = ref("");
const price = ref("");

const errors = ref([]);

//method for handle file changes
const handleFileChange = (e) => {
  //assign file to state
  image.value = e.target.files[0];
};

//method "storePost"
const storePost = async () => {
  //init formData
  let formData = new FormData();

  //assign state value to formData
  formData.append("product_name", product_name.value);
  formData.append("image", image.value);
  formData.append("description", description.value);
  formData.append("stock", stock.value);
  formData.append("price", price.value);

  //store data with API
  await api
    .post("/cat_foods", formData)
    .then(() => {
      //redirect
      router.push({ path: "/admin/catfoods" });
    })
    .catch((error) => {
      //assign response error data to state "errors"
      errors.value = error.response.data;
    });
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
