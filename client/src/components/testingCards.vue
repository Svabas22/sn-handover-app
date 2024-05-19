<template>
  <div class="content-data">
    <h1>Product List</h1>
    <div v-for="product in products" :key="product.id" class="product-item">
      <h2>{{ product.name }} - {{ product.sku }}</h2>
      <p>{{ product.description }}</p>
      <p>Category: {{ product.categoryName }}</p>
      <p>Price: ${{ product.price }}</p>
      <div>
        Tags:
        <span v-for="tag in product.tags" :key="tag.id">{{ tag.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // make sure to install axios via npm

export default {
  data() {
    return {
      products: []
    }
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('/api/records');
        this.products = response.data;
      } catch (error) {
        console.error('There was an error fetching the products:', error);
      }
    }
  }
}
</script>

<style>
.product-item {
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.product-item h2 {
  color: #333;
}

.product-item p {
  margin: 5px 0;
}
</style>
