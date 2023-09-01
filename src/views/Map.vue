<template>
    <h3>{{ name }}, 您好！</h3><!-- <h3>您的外送員ID為: {{ id }}</h3> -->
    <br>
	<div ref="map" class="google-map"></div>
    <button type="button" class="btn btn-success me-1 mt-2" 
    data-bs-toggle="modal" data-bs-target="#showOrderList" 
    @click="showOrderListModal(id)"><i class="bi bi-journal-check"></i> 已接訂單</button>
       <!--showOrderListModal Modal-->
       <div class="modal fade custom-modal-size" id="showOrderList" tabindex="-1" aria-labelledby="ModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">已接訂單</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <table class="table table-bordered">
                    <thead>
                      <tr>
                        <th class="center">訂單編號</th>
                        <th class="center">外送地址</th>
                        <!-- <th class="center">運送時間</th> -->
                        <th class="center">運費</th>
                        <th class="center">下單時間</th>
                        <th class="center">店家地址</th>
                        <th class="center">店名</th>
                        <th class="center">功能</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in orderlist" :key="item.order[0]">
                        <td class="center">{{ item.order[0] }}</td>
                        <td class="center">{{ item.order[1] }}</td>
                        <!-- <td class="center">{{ item.order[2] }}</td> -->
                        <td class="center">{{ item.order[3] }}</td>
                        <td class="center">{{ item.order[4] }}</td>
                        <td class="center">{{ item.order[5] }}</td>
                        <td class="center">{{ item.order[6] }}</td>

                        <td class="d-flex align-items-center">
                        <button class="btn btn-success me-1" @click="completeDeliver(item.order[0])">完成</button>
                        <button class="btn btn-danger me-1" @click="cancelDeliver(item.order[0])"><i class="bi bi-x-circle"></i> 取消</button>
                        </td>
                    </tr>
                    </tbody>
                  </table>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
              </div>
              <!-- Modal-->
    <div class="container">
    </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
const URL = import.meta.env.VITE_API_JAVAURL;
export default {
	name: "Map",
    setup(){
        const orderlist = ref([]);
        const currentDelivererId = ref(null);
        const orderListModalVisible = ref(false);

        const showOrderListModal=async(id)=>{
        orderListModalVisible.value=true;
        currentDelivererId.value=id;
        try {
            const response = await axios.post(`${URL}order/deliver/findInProgressByDeliver/${id}`);
            // console.log('API Response含有orderid (第一欄):', response.data);
            orderlist.value = response.data.list;
            // console.log("orderlist.value含有orderid (第一欄)",orderlist.value)
            } catch (error) {
                console.error("Error fetching orderlist data:", error);
            }
        }
        return{
            orderlist,
            showOrderListModal,
            //test
            orderid:orderlist.value.id
        };
    },
	data() {
		return {
			map: null,
            addressToBackend:null,
        // 存放資料
            orderListData:[],
            infoWindow: null,
        //  接單按鈕狀態
            orderButtonText: "接單",
            markers: [],
        // 存放Google Maps的Marker對象
            googleMarkers: [], 
            removeShopId: null,  // 初始化 removeShopId
		};
	},
    //創建時從route中獲取name和id
    created(){
        this.name = this.$route.params.name;
        this.id = this.$route.params.id;
    },
	mounted() {
		this.initializeMap();
        this.fetchOrderData();
	},
	methods: {
        async fetchOrderData(){
            try{
                const response = await axios.get(`${URL}order/Takables`);
                this.orderListData = response.data.list;
                console.log("【後端取得資料】:", response.data.list);

                //清空舊標記點
                this.markers=[];

                let orderIds=[];

                for (const order of this.orderListData) {
                if (order.shopAddress) {
                    if (order.id) {
                        orderIds.push(order.id);//儲存order.id
                        const coordinates = await this.convertAddressToLatng(order.shopAddress);//轉換地址變經緯度

                        if (coordinates) {
                            this.markers.push({
                                orderid: order.id, // 使用order.id
                                shop_name: order.shopName,//商店名稱
                                coordinates: coordinates,//座標
                                address: order.address,  //顧客的地址
                                customerID: order.customerID, //顧客ID
                                deliverFee: order.deliverFee,//運費
                                orderTime: order.orderTime,//下單時間
                                shopID: order.shopID,//店家ID
                                cus_status: order.cus_status,//顧客下單狀態
                                shop_status: order.shop_status,//店家下單狀態
                                deliver_status: order.deliver_status,//外送員接單狀態
                            });
                        }
                    } else {
                        console.warn("訂單並未找到ID", order); // 找不到id警告
                            }
                        }
                    }
            } catch(error){
                console.error("取得訂單資料時發生錯誤",error);
            }
        },
		async initializeMap() {
        //定位外送員自身位置並設為地圖中心
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                this.onCurrentPositionSuccess,
                this.onCurrentPositionError
            )
            }
            else{
                alert("Geolocation沒有支援此瀏覽器")
            }
		},
        //接單按鈕狀態切換???
        toggleOrderButton(order){
            const currentOrder=order
            this.orderButtonGrayed = !this.orderButtonGrayed;
            this.orderButtonText = this.orderButtonGrayed ? "已接單" : "接單";
            //  外送員接單後回傳
            this.sendOrderToBackend(currentOrder).then(response => {
                if (response) {
                    //成功接單後重新取得新的訂單列表
                    this.fetchOrderData().then(() => {
                        //更新Marker
                        this.addMarkers();
                    });
                }
            });

            //更新infoWindow
            if(this.infoWindow){
                const content = this.generateInfoContent(this.orderButtonGrayed);
                this.infoWindow.setContent(content);
            }
            this.removeShopId=event.target.dataset.orderId;

            //移除已接單的marker
            if(this.orderButtonText==="已接單"){
                //移除
                this.removeShopId=order.shopID;
                this.removeMarker(this.removeShopId);  // 調用移除marker的函數
            }

        },
        //移除marker
        removeMarker(removeShopId) {
            // 找到要移除的 marker
            let markerToRemove = this.googleMarkers.find(marker => marker.shopId === removeShopId);
            // console.log("1_removeMarker裡的markerToRemove.shopId = ", markerToRemove ? markerToRemove.shopId : 'Not found');
            // console.log("1_removeMarker裡的removeShopId = ",removeShopId)

            if (markerToRemove) {
                // 從 googleMarkers array 中移除
                console.log("Removing marker: ", markerToRemove);
                this.googleMarkers = this.googleMarkers.filter(marker => marker.shopId !== removeShopId);
                console.log("2_removeMarker裡的markerToRemove.shopId = ", markerToRemove ? markerToRemove.shopId : 'Not found');
                console.log("2_removeMarker裡的removeShopId = ",removeShopId)
                // 從地圖上移除
                markerToRemove.setMap(null);
                console.log('Updated googleMarkers是否已移除:', this.googleMarkers);
            }else{
                console.warn('No marker found to remove.');
            }

            //關閉infoWindow
            if (this.infoWindow) {
                this.infoWindow.close();
            }
        },

        //  外送員接單後回傳
        async sendOrderToBackend(order){
            try{
                const orderData={
                    orderid: order.orderid,
                    deliver_status:"已接單",
                    driver:this.$route.params.name,
                    address: this.addressToBackend,
                    deliverID: this.$route.params.id
                }
                // 將資料物件傳送到指定的URL
                const response = await axios.put(`${URL}order/takeOrders`, orderData);
                if(response.data.success===true){
                    alert(response.data.message);
                    return true;
                }else{
                    alert(response.data.message);
                    return false;
                }
                }catch(error){
                    console.error("發生錯誤訊息:",error);
                    alert('發生錯誤，請稍後再試。');
                    return false;
                }
        },

        //產生InfoWindow內部資訊
        generateInfoContent(order, orderButtonGrayed){
            const buttonText = orderButtonGrayed ? "已接單" : "接單";
                return this.generateInfoContentHTML(buttonText,order);
        },

            //HTML共用的產生內容
            generateInfoContentHTML(orderButtonText, order){
                this.addressToBackend = order.address;
                if(!order){
                    // console.error("order object is undefined");
                    return '';
                }
                this.orderID = order.orderid;

                return `
                    <div style="font-weight:bold; margin-bottom: 3px;">${order.shop_name}</div>
                    <div style="margin-bottom: 3px;">顧客地址：${order.address}</div>
                    <div style="margin-bottom: 3px;">【隱藏】店家ID：${order.shopID}</div>
                    <div style="margin-bottom: 3px;">【隱藏】訂單ID：${order.orderid}</div>
                    <div style="margin-bottom: 3px;">運費：30元</div>
                    <div style="margin-bottom: 3px;">預計運送時間：30 ~ 45 分鐘</div>
                    <div class="button-container">
                        <button class="cancel-button" id="cancel-button">取消</button>
                        <button class="order-button" id="order-button">${orderButtonText}</button>
                    </div>
                `;
            },
        onCurrentPositionSuccess(position){
            const{latitude, longitude} = position.coords
            this.currentLocation = new google.maps.LatLng(latitude, longitude)
            this.map= new google.maps.Map(this.$refs.map, {

                // 自身為中心
                center: this.currentLocation,
                //  縮放比例，數值越大近
                zoom:15.5
                // zoom:12
            })

            new google.maps.Marker({
                position:this.currentLocation,
                map:this.map,
                title:"Current Location"
            })
            //增加中心環
            const circle = new google.maps.Circle({
            strokeColor: "#25b2ee",
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: "#25b2ee",
            fillOpacity: 0.2,
            map: this.map,
            center: { lat: this.currentLocation.lat(), lng: this.currentLocation.lng() }, //使用當前位置
            // radius: 1500,
            radius: 900,
            });
            this.addMarkers();
        },
        onCurrentPositionError(error) {
            alert("Error occurred while retrieving your current location")
            console.error("Geolocation error:", error)
        },
        addMarkers() {
            const self = this;

            this.markers.forEach((order) => {
                if (!order.shop_name) {
                    console.warn("Missing shop name for order:", order);
                    return; // 如果缺少shop_name，則跳過此標記
                }

                const googleMarker = new google.maps.Marker({
                    orderId:order.orderid,
                    shopId:order.shopID,
                    title: order.shop_name,
                    position: {
                        lat: parseFloat(order.coordinates.lat),
                        lng: parseFloat(order.coordinates.lng),
                    },
                    map: this.map,
                });

                // 儲存googleMarker對象
                this.googleMarkers.push(googleMarker);
                
                // 產生infoContent
                    const content = self.generateInfoContentHTML(self.orderButtonGrayed, order);
                    const infoWindow = new google.maps.InfoWindow({
                            content: content,
                    })

                    googleMarker.addListener("click",()=>{
                    if(self.infoWindow){
                        self.infoWindow.close();
                    }
                    // 將self.infoWindow設置為新創建的infoWindow
                    self.infoWindow=infoWindow;
                    // 打開infoWindow
                    infoWindow.open(this.map, googleMarker);
                    // 更新當前商店名稱
                    self.currentShopName = order.shop_name;

                    infoWindow.addListener("domready",()=>{
                        const cancelBtn = document.getElementById("cancel-button");
                        cancelBtn.addEventListener("click",()=>{
                            infoWindow.close(); //關閉infoWindow
                        })
                        const orderButton = document.getElementById("order-button");
                        //test 將orderId 存到按鈕的 dataset
                        orderButton.dataset.orderId = order.shopID;
                        orderButton.textContent = self.orderButtonText;
                        orderButton.addEventListener("click", (event) => self.toggleOrderButton(order, event));

                    });
                })
            })
        },
        //轉換地址為經緯度
        async convertAddressToLatng(address){
            try{
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyBJmsd-j2EthUiRXfg7BRdYpgCgs2QBdFQ`);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    const location =data.results[0].geometry.location;
                    return location;
                }
                return null;
            } catch(error){
                console.error("地址轉經緯度發生錯誤",error);
                return null;
            }
        },
        //外送員完成訂單
        async completeDeliver(orderId){
            let completedId =orderId
            console.log("complete orderId = ", orderId)
            const response = await axios.put(`${URL}order/complete/${orderId}`,completedId);
            console.log("response = ", response)

            if(response.data.success){
                //從orderlist移除該訂單
                this.orderlist = this.orderlist.filter(item=>item.order[0]!==orderId);
                alert(response.data.message)
                return true;
            }else{
                alert(response.data.message);
                return false;
            }
        },
        async cancelDeliver(orderId){
        try{
            let cancelData={
                orderid:orderId,
                deliver_status:"未接單"
            }
            const response = await axios.put(`${URL}order/terminate/`,cancelData);

            if(response.data.success){
                //從orderlist移除該訂單
                this.orderlist = this.orderlist.filter(item=>item.order[0]!==orderId);
                alert(response.data.message)
                return true;
            }else{
                alert(response.data.message);
                return false;
            }
        }catch(error){
            console.error("發生了錯誤", error);
            alert("出現問題，請重新嘗試");
            return false;
        }
        }
	},
};
</script>

<style>
.google-map {
		width: 100%;
        height: 400px;
}
.button-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
}
.order-button{
    background-color: blue;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}
.cancel-button{
    background-color: darkred;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}
/* 隱藏右上角預設關閉按鈕 */
.gm-style-iw-c .gm-ui-hover-effect{
    display: none !important;
}
/* 接單按鈕樣式切換 */
.gray-button {
    background-color: gray;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}
.order-button-default {
    background-color: blue;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}
.order-button-grayed {
    background-color: gray;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}
.custom-modal-size .modal-dialog {
  max-width: 200%;
}

</style>