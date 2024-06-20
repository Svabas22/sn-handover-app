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
            <a class="nav-link active" aria-current="page" href="#">SLA Progress</a>
          </li>
        </ul>
        <form class="d-flex" role="search" @submit.prevent="performSearch">
          <input class="form-control me-2" v-model="searchQuery" type="search" placeholder="Search" aria-label="Search" @input="debounceSearch">
        </form>
        <div v-if="searchResults.length" class="search-results">
          <ul>
            <li v-for="result in searchResults" :key="result.id">
              {{ result.title }}
            </li>
          </ul>
        </div>
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ userProfile.displayName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
              <li><a class="dropdown-item" href="/auth/signout">Sign out</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import 'bootstrap/dist/js/bootstrap.bundle.js';
import { debounce } from 'lodash';
import { mapActions, mapState } from 'vuex';
export default {
  name: 'NavBarComponent',
  data() {
    return {
      userProfile: { displayName: localStorage.getItem('user') },
      searchQuery: ''
    };
  },
  computed: {
    ...mapState(['searchResults']),
  },
  methods: {
    ...mapActions(['performSearch']),
    debounceSearch: debounce(function () {
      this.performSearch(this.searchQuery);
    }, 300),
  },
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
  text-decoration: white 
}

li a:hover {
  background-color: var(--secondary-colo) !important;
}

.dropdown-items:hover {
  background-color: var(--secondary-colo) !important;
}

.navbar-nav img {
  vertical-align: middle;
  border-radius: 50%;
}
.search-results ul {
  position: absolute;
  background: white;
  list-style-type: none;
  width: 100%;
  z-index: 1000;
}
.search-results li {
  padding: 10px;
  border-bottom: 1px solid #ccc;
}
.search-results li:last-child {
  border-bottom: none;
}
</style>