<!-- LayoutComponent.vue -->
<template>
    <div>
      <NavBarComponent />
      <div class="main-content">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  import NavBarComponent from './NavBar.vue';
  
  export default {
    components: {
      NavBarComponent,
    },
  };
  </script>
  
  <style scoped>
  .main-content {
    padding-top: 56px;
  }
  </style>