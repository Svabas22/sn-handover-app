<template>
    <div class="sidebar-comp">
    <div class="d-flex flex-column flex-shrink-0 p-3 bg-light" style="width: 280px;">
      <div class="pb-3 mb-3 border-bottom">
        <input v-model="searchQuery" type="text" class="form-control" placeholder="Enter page title">
    </div>
      <div class="nav-pills-wrapper">
        <ul class="nav nav-pills flex-column mb-auto">
            <li class="nav-item">
            <ul class="nav flex-column" v-for="page in filteredPages" :key="page.id">
                <li class="nav-item"><a href="#" class="nav-link link-dark" :class="{'active-page': page.id === selectedPage}" @click.prevent="selectPage(page.id)">{{ page.name }}</a></li>
            </ul>
            </li>
        </ul>
    </div>
    </div>
  </div>
  </template>
  
  <script>
  export default {
    name: 'SidebarComponent',
    data() {
      return {
        searchQuery: '',
        pages: [
          { id: 1, name: 'Page 1' },
          { id: 2, name: 'Page 2' },
          { id: 3, name: 'Page 3' },
          { id: 4, name: 'Page 4' },
          { id: 5, name: 'Page 5' },
          { id: 6, name: 'Page 6' },
          { id: 7, name: 'Page 7' },
          { id: 8, name: 'Page 8' },
          { id: 9, name: 'Page 9' },
          { id: 10, name: 'Page 10'},
          { id: 11, name: 'Page 11'},
          { id: 12, name: 'Page 12'},
          { id: 13, name: 'Page 13'},
          { id: 14, name: 'Page 14'},
          { id: 15, name: 'Page 15'},
          { id: 16, name: 'Page 16'},
          { id: 17, name: 'Page 17'},
          { id: 18, name: 'Page 18'},
          { id: 19, name: 'Page 19'},
          { id: 20, name: 'Page 20'},
          { id: 21, name: 'Page 21'},
          { id: 22, name: 'Page 22'},
          { id: 23, name: 'Page 23'},
          { id: 24, name: 'Page 24'},
          { id: 25, name: 'Page 25'},
          { id: 26, name: 'Page 26'},
          { id: 27, name: 'Page 27'},
          { id: 28, name: 'Page 28'},
          { id: 29, name: 'Page 29'},
          { id: 30, name: 'Page 30'}
        ]
      };
    },
    methods: {
      selectPage(id) {
        this.selectedPage = id;
        this.$router.push({ name: 'page', params: { id } });
      }
    },
    computed: {
      filteredPages() {
        return this.pages.filter(page => page.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
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

.nav-link:hover, .nav-link.active-page {
  background-color: var(--primary-color);
  color: white !important;
}
</style>
  