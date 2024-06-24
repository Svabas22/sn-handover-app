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
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#" @click="openSlaModal">SLA Progress</a>
          </li>
        </ul>
        <form class="d-flex position-relative" role="search" @submit.prevent="performSearch">
          <input
            class="form-control me-2"
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
      <SLAProgressModal ref="slaModal" />
    </div>
  </nav>
</template>


<script>
import 'bootstrap/dist/js/bootstrap.bundle.js';
import SLAProgressModal from './SLAComp.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'NavBarComponent',
  components: {
    SLAProgressModal,
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
    ...mapActions(['performSearch', 'fetchPageDetails']),
    loadPage(pageId) {
      this.fetchPageDetails(pageId);
      this.clearSearchResults(); // Hide search results after selection
    },
    performSearch() {
      this.$store.dispatch('performSearch', this.searchTerm);
    },
    openSlaModal() {
      this.$refs.slaModal.openSlaModal();
    },
    clearSearchResults() {
      this.$store.commit('setSearchResults', []); // Clear search results
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
  float: left;
}

li a {
  display: block;
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

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  z-index: 1000;
}

.search-results ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.search-results li {
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.search-results li:last-child {
  border-bottom: none;
}

.search-results a {
  color: #333;
  text-decoration: none;
}

.search-results a:hover {
  background-color: #f0f0f0;
}
</style>
