<template>
  <router-view/>
</template>

<script>

  export default {
    name: 'App',
    data() {
      return {
        isAuthenticated: false
      }
    }
  //   created() {
  //     this.checkAuthentication();
  //   },
  //   methods: {
  //   checkAuthentication() {
  //     // Check authentication status (simplified for example purposes)
  //     this.isAuthenticated = localStorage.getItem('userAuthenticated') ? true : false;

  //     // Redirect if not authenticated
  //     if (!this.isAuthenticated) {
  //       this.$router.push('/login');
  //     }
  //   }
  // }
}
</script>


<style>
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --info-color: #17a2b8;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}
button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  appearance: none;
}

/* APP.VUE */
</style>