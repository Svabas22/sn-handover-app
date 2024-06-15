<template>
  <div class="sidebar-comp d-flex flex-column">
    <div class="flex-shrink-0 p-3 bg-light sidebar-content">
      <div class="pb-3 mb-3 border-bottom">
        <input v-model="searchQuery" type="text" class="form-control" placeholder="Enter page title">
      </div>
      <div class="nav-pills-wrapper flex-grow-1 overflow-auto">
        <ul class="nav nav-pills flex-column mb-auto">
          <li class="nav-item">
            <ul class="nav flex-column">
              <li class="nav-item" v-for="page in filteredPages" :key="page.id">
                <a href="#" class="nav-link link-dark" :class="{ active: page.id === currentPage?.id }" @click="loadPage(page.id)">
                  {{ page.title }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <hr>
    <div class="dropup w-100">
      <button class="btn btn-secondary dropdown-toggle w-100" type="button" id="dropupMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
        New Page
      </button>
      <ul class="dropdown-menu w-100" aria-labelledby="dropupMenuButton">
        <li><a class="dropdown-item" href="#" @click="copyLastPageWithData">Copy last handover</a></li>
        <li><a class="dropdown-item" href="#" @click="copyLastPageTemplateOnly">Create a new page</a></li>
      </ul>
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
    };
  },
  computed: {
    ...mapState(['pages', 'currentPage']),
    filteredPages() {
      return this.pages.filter(page => page.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  },
  methods: {
    ...mapActions(['fetchPages', 'fetchPageDetails', 'createHandoverTemplate', 'copyHandover']),
    loadPage(pageId) {
      this.fetchPageDetails(pageId);
    },
    createNewHandoverWithData() {
      this.copyHandover();
    },
    createNewTemplateHandover() {
      this.createHandoverTemplate();
    }
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
  height: 100%;
  width: 280px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
}
.nav-pills-wrapper {
  flex-grow: 1;
}
.nav-link {
  transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover {
  background-color: var(--primary-color);
  color: white !important;
}
.nav-item.active {  
  background-color: var(--primary-color);
  color: white !important;
}

.dropup {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 0.75rem;
}
</style>
