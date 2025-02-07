<template>
  <div>
    <Header />
    <main class="">
      <BodyHome />
    </main>
    <Footer />
  </div>
</template>

<script>
import BodyHome from "../../components/user/BodyHome.vue";
import Header from "../../components/user/Header.vue";
import Footer from "../../components/user/Footer.vue";

export default {
  name: "Home",
  components: {
    Header,
    BodyHome,
    Footer,
  },
};
</script>

<style></style>
