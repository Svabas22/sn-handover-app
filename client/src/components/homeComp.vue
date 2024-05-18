<template>
  <div id="home-container">
    <NavBarComponent />
    <div class="main-container">
      <aside class="sidebar">
        <SideBarComponent />
      </aside>
      <div class="content">
        <TestingCards />
      </div>
    </div>
  </div>
</template>

<script>
import NavBarComponent from './NavBar.vue';
import SideBarComponent from './sideBar.vue';
import TestingCards from './testingCards.vue';
export default {
  components: {
    NavBarComponent,
    SideBarComponent,
    TestingCards
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
  flex-grow: 1;
}

.sidebar {
  width: 250px; /* Adjust as needed */
  background-color: #f8f9fa; /* Adjust as needed */
}

.content {
  flex-grow: 1;
  padding: 20px; /* Adjust as needed */
}
</style>
