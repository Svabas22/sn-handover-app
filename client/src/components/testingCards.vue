<template>
    <div class="container">
      <div class="row">
        <div class="col-md-4" v-for="item in items" :key="item.id">
          <div class="card">
            <img src="item.imageUrl" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">{{ item.title }}</h5>
              <p class="card-text">{{ item.description }}</p>
              <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TestingCards',
    data() {
      return {
        items: [
          { id: 1, title: 'Item 1', description: 'Description of item 1', imageUrl: '...' },
          { id: 2, title: 'Item 2', description: 'Description of item 2', imageUrl: '...' },
          // Add more items as needed
        ]
      };
    }
  }
  </script>
  