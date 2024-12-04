<template>
  <div class="sidebar-comp d-flex flex-column">
    <div class="flex-shrink-0 p-3 bg-light">
      <div class="pb-3 mb-3 border-bottom">
        <input v-model="searchQuery" type="text" class="form-control" placeholder="Enter page title">
      </div>
    </div>
    <div class="nav-pills-wrapper flex-grow-1 overflow-auto">
      <ul class="nav nav-pills flex-column">
        <li class="nav-item" v-for="page in filteredPages" :key="page.id">
          <a href="#" class="nav-link link-dark" :class="{ active: page.id === currentPage?.id }" @click="loadPage(page.id)">
            {{ page.title }}
          </a>
        </li>
      </ul>
    </div>
    <div :class="{'dropup': true, 'disabled': !isEngineer}">
      <button class="btn btn-secondary dropdown-toggle w-100" type="button" id="dropupMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
        New Page
      </button>
      <ul class="dropdown-menu w-100" aria-labelledby="dropupMenuButton">
        <li><a class="dropdown-item" href="#" @click="createNewHandoverWithData">Copy last handover</a></li>
        <li><a class="dropdown-item" href="#" @click="createNewTemplateHandover">Create a new page</a></li>
      </ul>
    </div>
  </div> 
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';

export default {
  name: 'SidebarComponent',
  
  data() {
    return {
      searchQuery: '',
      userProfile: { role: localStorage.getItem('roles') },
      socketId: null,
    };
  },
  computed: {
    ...mapState(['pages', 'currentPage']),
    filteredPages() {
      const sortedPages = [...this.pages].sort((a, b) => new Date(b.date) - new Date(a.date));
      if (this.searchQuery) {
        return sortedPages.filter(page => 
          page.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      return sortedPages;
    },
    isEngineer() {
      return this.userProfile.role === 'Engineer';
    }
  },
  methods: {
    ...mapActions(['fetchPages', 'fetchPageDetails', 'debouncedCreateHandoverTemplate', 'debouncedCopyHandover', 'addToast']),
    ...mapMutations(['setCurrentPage']),
    loadPage(pageId) {
      const userName = localStorage.getItem('userName');
      this.fetchPageDetails(pageId);
      this.$socket.emit('viewPage', { pageId: pageId, userName: userName });
      console.log(this.userProfile.role);
    },
    createNewHandoverWithData() {
      this.debouncedCopyHandover().then((newPage) => {
      
        this.setCurrentPage(newPage);
      }).catch((error) => {
        this.addToast({ message: `Error: ${error.message}`, type: 'danger' });
      });
    },
    createNewTemplateHandover() {
      this.debouncedCreateHandoverTemplate()
      .then((newPage) => {

        this.setCurrentPage(newPage);
      })
      .catch(error => {
        this.addToast({ message: `Failed to create template ${error.message}`, type: 'danger' });
      });
    }
  },
  created() {
    this.fetchPages();
    this.$socket.on('connect', () => {
      this.socketId = this.$socket.id;
    });

    this.$socket.on('pageCreated', (newPage) => {
      if (newPage.createdBy !== this.socketId) {
        this.addToast({ message: 'A new handover page was created.', type: 'success' });
      } else {
        this.setCurrentPage(newPage);
      }
    });
    this.$socket.on('pageDeleted', (deletedPage) => {
      this.$store.commit('deletePage', deletedPage.id);
      this.addToast({ message: `Page "${deletedPage.title}" has been deleted.`, type: 'danger' });
    });

  },
  beforeUnmount() {
    this.$socket.off('pageCreated');
    this.$socket.off('pageDeleted');
    this.$socket.off('usersOnPage');
  }
}
</script>


<style lang="scss">
.sidebar-comp {
  position: fixed;
  left: 0;
  height: 100vh;
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
  overflow-y: auto;
  overflow-x: hidden;
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

.dropup.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.toast-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 1050;
}
</style>