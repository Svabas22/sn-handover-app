<template>
  <div id="home-container">
    <NavBarComponent />
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
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.navbar {
  flex-shrink: 0;
}

.main-container {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  height: calc(100vh - 56px);
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background-color: #f8f9fa;
  overflow-y: auto; 
}

.content {
  flex-grow: 1;
  overflow-y: auto; 
  padding: 20px;
}
</style>
