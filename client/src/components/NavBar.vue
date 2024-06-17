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
            <a class="nav-link active" aria-current="page" href="#">Templates</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Shifts</a>
          </li>
        </ul>
        <form class="d-flex" role="search">
          <input class="form-control me-2" v-model="searchQuery" type="search" placeholder="Search" aria-label="Search">
        </form>
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
export default {
  name: 'NavBarComponent',
  data() {
    return {
      userProfile: { displayName: localStorage.getItem('user') },
      searchQuery: ''
    };
  },
  methods: {
    emitSearch() {
      this.$emit('search', this.searchQuery);
    }
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
</style>