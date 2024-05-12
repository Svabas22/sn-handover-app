<template>
  <div id="app-container">
    <NavbarComponent />
    <div class="main-container">
      <aside class="sidebar">
        <SidebarComponent />
      </aside>
      <RouterView />
    </div>
  </div>
</template>

<script>
  import NavbarComponent from './components/NavBar.vue';
  import SidebarComponent from './components/sideBar.vue';
  export default {
    components: {
      NavbarComponent,
      SidebarComponent
    }
  }
</script>


<style>
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --info-color: #17a2b8;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}
button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  appearance: none;
}

/* .app-container {
  display: flex;
} */
</style>