<template>
    <!--showTransportation Modal-->
    <div class="modal fade" id="showTransportation" tabindex="-1" aria-labelledby="ModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">交通工具</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <!-- 交通工具清單 -->
                    <table class="table table-bordered">
                    <thead>
                      <tr>
                        <th class="center">編號</th>
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
                  <!-- 交通工具清單 -->
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <!-- <button type="button" class="btn btn-primary">Save changes</button> -->
                  </div>
                </div>
              </div>
              </div>
              <!-- Modal-->
</template>
    
<script setup>
import { ref, defineProps } from 'vue';
const props = defineProps();
const transportation = ref(props.transportation);
const someMethodInChildComponent = () => {
  context.emit('updateTransportation', transportation.value);
};
    
</script>
    
<style>
    
</style>