<template>
    <div>
        <h1>Login</h1>
        <button @click="login">Login with Azure AD</button>
    </div>
</template>

<script>
export default {
  methods: {
    login() {
      window.location.href = '/auth/login'; // Redirect to backend login route
    }
  }
};
</script>

<style>

</style>