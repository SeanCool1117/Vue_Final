<template>
      <div class="container">
        <h1>外送員登入</h1>
        <form @submit.prevent="login">
          <div class="container">
            <label for="loginName"><b>帳號</b></label>
            <input type="text" placeholder="Enter Membername" v-model="loginName" required>
            <br>
            <label for="loginPwd"><b>密碼</b></label>
            <input type="password" placeholder="Enter Password" v-model="loginPwd" required>
  
            <button type="submit">登入</button>
          </div>
        </form>
        <br>
        <div v-if="loginMessage">{{ loginMessage }}</div>
        <div v-if="loginMessageID">{{ loginMessageID }}</div>
        <div v-if="loginFailMessage">{{ loginFailMessage }}</div>
      </div>
  </template>
  
    
<script>
import axios from "axios";
const URL = import.meta.env.VITE_API_JAVAURL;

  export default {
    data() {
      return {
        loginName: "",
        loginPwd: "",
        loginMessage: "",
        loginMessageID:"",
        loginFailMessage: "",
        name:"",
        id:""
      };
    },
    methods: {
      login() {
        axios.post(`${URL}deliverer/login`,null,{
            params:{
                loginName: this.loginName,
                loginPwd: this.loginPwd
            }
        })
        //登入成功
        .then(response=>{
            this.loginMessage ='您好， ' + response.data.name;
            this.loginMessageID ='您的ID: ' + response.data.id;
            //登入成功後，跳到Map.vue，並攜帶數據
            this.$router.push({
                // path:'/deliverer/map',
                name:'deliverer-map',
                params:{name:response.data.name, id:response.data.id}
            });
        })
        //登入失敗
        .catch(error=>{
        this.loginFailMessage = "帳號密碼錯誤或可能不存在";
        })
      }
    }
  };
  </script>
  
    
<style>
    
</style>