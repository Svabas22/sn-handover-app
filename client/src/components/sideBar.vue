<template>
    <div class="sidebar-comp">
    <div class="d-flex flex-column flex-shrink-0 p-3 bg-light" style="width: 280px;">
      <div class="pb-3 mb-3 border-bottom">
        <input v-model="searchQuery" type="text" class="form-control" placeholder="Enter page title">
    </div>
      <div class="nav-pills-wrapper">
        <ul class="nav nav-pills flex-column mb-auto">
            <li class="nav-item">
            <ul class="nav flex-column" >
                <li class="nav-item" v-for="page in filteredPages" :key="page.id">
                  <a href="#" class="nav-link link-dark" :class="{active: page.id === currentPage?.id }" @click="loadPage(page.id)">{{ page.title }}</a>
                </li>
            </ul>
            </li>
        </ul>
    </div>
    </div>
  </div>
  </template>
  
  <script>
  import { mapActions, mapState } from 'vuex';
  export default {
    name: 'SidebarComponent',
    data() {
      return {
        searchQuery: '',
        //pages: [],
        //selectedPage: null
      };
    },
    computed: {
      ...mapState(['pages', 'currentPage']),
      filteredPages() {
        return this.pages.filter(page => page.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
    },
    methods: {
      ...mapActions(['fetchPages', 'fetchPageDetails']),
      loadPage(pageId) {
        this.fetchPageDetails(pageId);
      },
    },
    created() {
      this.fetchPages();
    }
    
  }
  </script>
  
<style lang="scss" scoped>
.sidebar-comp {
  position: fixed;
  left: 0;
  height: 100vh;
  //z-index: 100;
  //padding: 48px 0 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.nav-pills-wrapper {
  overflow-y: auto; /* Enables vertical scrolling */
  max-height: calc(100vh - 100px); /* Adjust height as needed */
}
.nav-link {
  transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover{
  background-color: var(--primary-color);
  color: white !important;
}
.nav-item.active {
  background-color: var(--primary-color);
  color: white !important;
}
</style>
  