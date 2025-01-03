<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const catFoodProducts = ref([]);
const catToyProducts = ref([]);

const fetchCatFoodData = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/cat_foods");
    catFoodProducts.value = response.data.data.data;
  } catch (error) {
    console.error("Error fetching cat food data:", error);
  }
};

const fetchCatToyData = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/cat_toys");
    catToyProducts.value = response.data.data.data;
  } catch (error) {
    console.error("Error fetching cat toy data:", error);
  }
};

onMounted(() => {
  fetchCatToyData();
  fetchCatFoodData();
});
</script>

<template>
  <div class="container">
    <div class="row mb-5">
      <div class="col-12">
        <div class="quote-box">
          <p class="quote-text">
            "The only way to do great work is to love what you do. If you
            haven’t found it yet, keep looking. Don’t settle. As with all
            matters of the heart, you’ll know when you find it." — Steve Jobs
          </p>
        </div>
      </div>
    </div>
    <!-- Cat Food Section -->
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="mb-4 fs-3">Cat Food Products</h2>
      </div>
    </div>
    <!-- Cat Food List Group -->
    <div class="row mb-4">
      <div class="col-12">
        <ul class="list-group">
          <li
            class="list-group-item d-flex justify-content-between align-items-center"
            v-for="(product, index) in catFoodProducts"
            :key="product.id"
          >
            <div class="d-flex align-items-center">
              <img
                :src="product.image"
                alt="product.image"
                width="80"
                height="auto"
                class="me-3"
              />
              <div>
                <h5 class="mb-1">{{ product.product_name }}</h5>
                <p class="mb-1 text-muted">{{ product.description }}</p>
                <small
                  >Price: Rp. {{ product.price }} | Stock:
                  {{ product.stock }}</small
                >
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Cat Toy Section -->
    <div class="row mb-4 mt-5">
      <div class="col-12">
        <h2 class="mb-4 fs-3">Cat Toy Products</h2>
      </div>
    </div>
    <!-- Cat Toy List Group -->
    <div class="row mb-4">
      <div class="col-12">
        <ul class="list-group">
          <li
            class="list-group-item d-flex justify-content-between align-items-center"
            v-for="(product, index) in catToyProducts"
            :key="product.id"
          >
            <div class="d-flex align-items-center">
              <img
                :src="product.image"
                alt="product.image"
                width="80"
                height="auto"
                class="me-3"
              />
              <div>
                <h5 class="mb-1">{{ product.product_name }}</h5>
                <p class="mb-1 text-muted">{{ product.description }}</p>
                <small
                  >Price: Rp. {{ product.price }} | Stock:
                  {{ product.stock }}</small
                >
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styling untuk List Group Item */
.list-group-item {
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.list-group-item img {
  border-radius: 8px;
}

.quote-box {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #505050;
}

.quote-text {
  font-size: 1.2rem;
  font-style: italic;
  color: #505050;
}

/* Menambahkan garis bawah pada judul */
h2 {
  border-bottom: 0.5px solid #505050; /* Menambahkan garis bawah */
  padding-bottom: 20px; /* Memberikan ruang antara teks dan garis */
}
</style>
