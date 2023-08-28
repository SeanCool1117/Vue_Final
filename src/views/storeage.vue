<template>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>編號<i class="bi" :class="{ 'bi-sort-up': datas.sortOrder === 'asc', 'bi-sort-down': datas.sortOrder === 'desc' }"  @click="sortHandler('id')"></i></th>
          <th class="center">類型</th>
          <th class="center">品牌</th>
          <th class="center">車號</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ id, type, brand, license} in transportation" :key="id">
          <td class="center">{{ id }}</td>
          <td class="center">{{ type }}</td>
          <td class="center">{{ brand }}</td>
          <td class="center">{{ license }}</td>
        </tr>
      </tbody>
    </table>
  </template>
      
  <script setup>
  import { ref, reactive } from "vue";
  import axios from "axios";
  import Paging from "../components/Paging.vue";
  import SearchTextBoxDeliverer from "../components/SearchTextBoxDeliverer.vue";
  import PageSize from "../components/PageSize.vue";
  
  const deliverer = ref([]);
  const currentDelivererId = ref(null);
  const totalPages = ref(0);
  const datas = reactive({
    start: 0,
    rows: 0,
    name: "",
    sortOrder: "asc",
    sortType: "id",
    delerID:'',
    nameLike:""
  });
  const transportationModalVisible=ref(false);
  const showTransportationModal = (id)=>{
    transportationModalVisible.value=true;
    currentDelivererId.value=id;
  }
  const URL = import.meta.env.VITE_API_JAVAURL;
  const loadDeliverer = async () => {
    const URLAPI = `${URL}deliverer/find`;
    const response = await axios.post(URLAPI, datas);
    // console.log(response)
    // console.log(response.data)
    // console.log(response.data.list)
    //取得所有外送員放進deliverer變數
    deliverer.value = response.data.list;
  
    //計算總共幾頁
   totalPages.value = +datas.rows === 0 ? 1 : Math.ceil(response.data.count / datas.rows)
  };
  
  //paging 由子元件觸發
  const clickHandler = page =>{
      datas.start = page - 1
      loadDeliverer()
  }
  
  //搜尋
  const inputHandler = (value) =>{
      datas.delerID = value
      loadDeliverer()
  }
  
  //一頁幾筆資料
  const changeHandler = value => {
      datas.rows = value
      datas.start = 0
      console.log("pagesize：",datas)
      loadDeliverer()
  }
  
  //排序
  const sortHandler = type => {
      datas.sortOrder = datas.sortOrder === "asc" ? "desc" : "asc"
      datas.sortType = type
      loadDeliverer()
  }
  
  //刪除
  const deleteHandler = async(id) =>{
      if(window.confirm("真的要刪除嗎?")){
          const URLAPI = `${URL}deliverer/${id}`;
         const response = await axios.delete(URLAPI);
         if(response.data.success){
          alert(response.data.message)
          loadDeliverer()
         }
      }
  }
  loadDeliverer();

  </script>
      
  <style scoped>
  .center{
    /* text-align: center; */
    vertical-align: middle;
  }

  .id-column{
    width: 5%
  }
  .birthday-column {
    width: 5%;
  }
  
  </style>