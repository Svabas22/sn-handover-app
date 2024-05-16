<template>
  <div class="login-container">
    <button @click="login">Log in with Azure AD</button>
  </div>
</template>

<script>
export default {
  methods: {
    login() {
      window.location.href = '/auth/signin'; // Redirect to your Express server's sign-in route
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
