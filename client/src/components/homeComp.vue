<template>
  <div id="home-container">
      <NavBarComponent/>
    <div class="main-container">
      <aside class="sidebar">
        <SideBarComponent />
      </aside>
      <div class="content">
        <shiftComp />
        <testingCards />
      </div>
    </div>
  </div>
</template>

<script>
import 'bootstrap/dist/js/bootstrap.bundle.js';
import NavBarComponent from './NavBar.vue';
import SideBarComponent from './sideBar.vue';
import shiftComp from './shiftComp.vue';
import testingCards from './testingCards.vue';
export default {
  components: {
    NavBarComponent,
    SideBarComponent,
    shiftComp,
    testingCards
  }
};
</script>

<style>


#home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  display: flex;
  flex-direction: row !important;
  flex-grow: 1;
  min-height: 0;
}
.content {
  flex-grow: 1;
  padding: 20px; /* Adjust as needed */
}

.sidebar {
  width: 280px; /* Adjust as needed */
  background-color: #f8f9fa; /* Adjust as needed */
}

.content {
  flex-grow: 1;
  padding: 20px; /* Adjust as needed */
}
</style>
