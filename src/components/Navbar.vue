<template>
     <nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">EEIT Vue Demo</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
           <RouterLink class="nav-link" to="/">首頁</RouterLink>
        </li>
        <li class="nav-item">
         
          <RouterLink class="nav-link" to="/about">關於</RouterLink>
        </li>
        <li class="nav-item">
            <RouterLink class="nav-link" to="/contact">聯絡我們</RouterLink>
        </li>
        <li class="nav-item">
            <RouterLink class="nav-link" to="/products">產品</RouterLink>
        </li>
        <li class="nav-item">
            <RouterLink class="nav-link" to="/deliverer">外送員管理</RouterLink>
        </li>
        <!-- 不使用，改在外送員登入後才轉移 -->
        <!-- <li class="nav-item">
            <RouterLink class="nav-link" to="/deliverer/map">地圖</RouterLink>
        </li> -->
        <li class="nav-item">
            <RouterLink class="nav-link" to="/deliverer/login">外送員登入</RouterLink>
        </li>

      </ul>
    </div>
  </div>
</nav>   
</template>
    
<script setup>
   
</script>
    
<style>
    
</style>