<template>
  <div id="home-container">
      <NavBarComponent/>
    <div class="main-container">
      <aside class="sidebar">
        <SideBarComponent />
      </aside>
      <div class="content">
        <shiftComp />
      </div>
    </div>
  </div>
</template>

<script>
import 'bootstrap/dist/js/bootstrap.bundle.js';
import NavBarComponent from './NavBar.vue';
import SideBarComponent from './sideBar.vue';
import shiftComp from './contentComp.vue';
export default {
  components: {
    NavBarComponent,
    SideBarComponent,
    shiftComp
  }
};
</script>

<style>
#home-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Use viewport height to make it fit the entire screen */
  width: 100vw; /* Ensures full viewport width usage */
  overflow: hidden; /* Ensures that overflow is only handled by specific children */
}

.navbar {
  flex-shrink: 0; /* Ensures the navbar does not shrink */
}

.main-container {
  display: flex;
  flex-direction: row;
  flex-grow: 1; /* Allows this container to take up all available space */
  height: calc(100vh - 56px); /* Subtract the height of the navbar if it's fixed height */
  overflow: hidden; /* Prevents scroll on the main container */
}

.sidebar {
  width: 280px; /* Fixed width for the sidebar */
  background-color: #f8f9fa;
  overflow-y: auto; /* Allows scrolling inside the sidebar if needed */
}

.content {
  flex-grow: 1;
  overflow-y: auto; /* Allows scrolling within the content area only */
  padding: 20px;
}
</style>
