<template>
  <nav class="navbar navbar-expand-lg bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">Handover pages</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-between" id="navbarSupportedContent">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#" @click="openSlaModal">SLA Progress</a>
          </li>
        </ul>

        <form class="d-flex justify-content-center flex-grow-1 mx-3" role="search" @submit.prevent="performSearch">
          <input
            class="form-control w-100"
            v-model="searchTerm"
            type="search"
            placeholder="Search"
            aria-label="Search"
            @keyup.enter="performSearch"
          />
          <div v-if="searchResults.length" class="search-results">
            <ul>
              <li v-for="result in searchResults" :key="result.id">
                <a href="#" @click.prevent="loadPage(result.id)">{{ result.title }}</a>
              </li>
            </ul>
          </div>
        </form>
        <div class="d-flex align-items-center">
          <button class="btn btn-link text-decoration-none" id="settings-btn" href="#" @click="openSettingsModal">
            <i class="bi bi-gear"></i>
          </button>
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ userProfile.displayName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                <li><a class="dropdown-item" href="/auth/signout">Sign out</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <SLAProgressModal ref="slaModal" />
      <settingsModal ref="settingsModal" />
    </div>
  </nav>
</template>


<script>
import 'bootstrap/dist/js/bootstrap.bundle.js';
import SLAProgressModal from './SLAComp.vue';
import settingsModal from './settingsComp.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'NavBarComponent',
  components: {
    SLAProgressModal,
    settingsModal
  },
  data() {
    return {
      userProfile: { displayName: localStorage.getItem('user') },
      searchTerm: ''
    };
  },
  computed: {
    ...mapState(['searchResults']),
    searchResults() {
      return this.$store.state.searchResults;
    }
  },
  methods: {
    ...mapActions(['debouncedPerformSearch', 'fetchPageDetails']),
    loadPage(pageId) {
      this.fetchPageDetails(pageId);
      this.clearSearchResults();
    },
    performSearch() {
      this.$store.dispatch('debouncedPerformSearch', this.searchTerm);
    },
    openSlaModal() {
      this.$refs.slaModal.openSlaModal();
    },
    openSettingsModal() {
      this.$refs.settingsModal.openSettingsModal();
    },
    clearSearchResults() {
      this.$store.commit('setSearchResults', []);
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.clearSearchResults();
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>



<style scoped>
nav {
  padding: 10px;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

li {
  float: none;
}

li a {
  display: left;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

li a:hover {
  background-color: var(--secondary-color) !important;
}

.dropdown-item:hover {
  background-color: var(--secondary-color) !important;
}

.navbar-nav img {
  vertical-align: middle;
  border-radius: 50%;
}

.nav-options {
  display: flex;
  align-items: center;
}

form {
  max-width: 600px;
  flex-grow: 1;
  position: relative;
}
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%; 
  background: white;
  border: 1px solid #ccc;
  z-index: 1000;
  box-sizing: border-box;
}

.search-results ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.search-results li {
  display: block;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.search-results li:last-child {
  border-bottom: none;
}

.search-results a {
  color: #333;
  text-decoration: none;
  display: block;
}

.search-results a:hover {
  background-color: #f0f0f0;
}

#settings-btn {
  margin-right: 10px;
  color: black;
}
</style>
