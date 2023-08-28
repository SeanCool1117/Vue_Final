<template>
    <br>
    <h4>{{ name }}, 您好！</h4><!-- <h4>外送員ID: {{ id }}</h4> -->
    <br>
	<div ref="map" class="google-map mb-2"></div>
    <button type="button" class="btn btn-success me-1 mt-2" 
    data-bs-toggle="modal" data-bs-target="#showDeliverOrderList" 
    @click="showDeliverOrderListModal(id)"><i class="bi bi-journal-check"></i> 接單資訊</button>
    <div class="container">
    </div>
</template>

<script>
import axios from "axios";
// import { ref } from "vue";
const URL = import.meta.env.VITE_API_JAVAURL;

// const deliverOrderList=ref([])
// const deliverOrderListModalVisible=ref(false);
// 添加currentDelivererId定義
// const currentDelivererId = ref(null);

// const showDeliverOrderListModal = async(id)=>{
//     deliverOrderListModalVisible.value=true;
//     currentDelivererId.value=id;    //DelivererId還是orderID?
//     console.log("fk_deliverer_id要用的 id = ", id) // 檢查fk_deliverer_id有無值
//     const requestData={
//         fk_deliverer_id : id
//     }
//     try{
//         const response = await axios.post(`${URL}order/deliver/findInProgressByDeliver/${id}`, requestData);
//         // const response = await axios.post(`${URL}order/deliver/findInProgressByDeliver/{id}`, {fk_deliverer_id: id});
//         deliverOrderList.value = response.data.list;
//     }catch(error){
//         console.error("抓取外送員已取得訂單資料時發生錯誤", error);
//     }
// }

export default {
	name: "Map",
	data() {
		return {
			map: null,
            addressToBackend:null,
        // 存放資料
            orderListData:[],
            infoWindow: null,
        //  接單按鈕狀態
            orderButtonText: "接單",
        //  初始化
            markers: [],
        //  外送員已接訂單
            // deliverOrderList: [],
		};
	},

	mounted() {
		this.initializeMap();
        this.fetchOrderData();
	},
    //創建時從route中獲取name和id
    created(){
        this.name = this.$route.params.name;
        this.id = this.$route.params.id;
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

                        //轉換地址變經緯度
                        const coordinates = await this.convertAddressToLatng(order.shopAddress);

                        if (coordinates) {
                            this.markers.push({
                                orderid: order.id, // 使用order.id
                                shop_name: order.shopName,
                                coordinates: coordinates,
                                address: order.address,  //顧客的地址
                                customerID: order.customerID, 
                                deliverFee: order.deliverFee,
                                orderTime: order.orderTime,//下單時間
                                shopID: order.shopID,
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

                // this.addMarkers();

            } catch(error){
                console.error("取得訂單資料時發生錯誤",error);
            }
        },
		async initializeMap() {
			// const loader = new Loader({
            //     //.env variable must contain VITE_ in the front
			// 	apiKey: import.meta.env.VITE_API_KEY,
			// 	version: "weekly"
			// });
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
        //接單按鈕狀態切換
        toggleOrderButton(order){
            const currentOrder=order
            this.orderButtonGrayed = !this.orderButtonGrayed;
            this.orderButtonText = this.orderButtonGrayed ? "已接單" : "接單";
            //  外送員接單後回傳
            this.sendOrderToBackend(currentOrder);
            
            //更新infoWindow
            if(this.infoWindow){
                const content = this.generateInfoContent(this.orderButtonGrayed);
                this.infoWindow.setContent(content);
            }
        },

        //  外送員接單後回傳
        async sendOrderToBackend(order){
            try{
                console.log('sendOrderToBackend的資訊內容：')
                console.log('1.傳入的Order = ',order)
                console.log('2.Get OrderID = ',this.orderID)

                const orderData={
                    orderid: this.orderID,
                    deliver_status:"已接單",
                    driver:this.$route.params.name,
                    address: this.addressToBackend,
                    deliverID: this.$route.params.id
                }
                // 將資料物件傳送到指定的URL
                const response = await axios.put(`${URL}order/takeOrders`, orderData);
                if(response.data.success===true){
                    alert(response.data.message);
                }else{
                    alert(response.data.message);
                }
                }catch(error){
                    console.error("發生錯誤訊息:",error);
                    alert('發生錯誤，請稍後再試。');
                }
        },

        //產生InfoWindow內部資訊
        generateInfoContent(order, orderButtonGrayed){
            console.log("Entered generateInfoContent with order:", order); // 這裡將顯示傳遞給這個函數的order
            const buttonText = orderButtonGrayed ? "已接單" : "接單";
            console.log('generateInfoContent產生內部的order ID = ',order.orderid);

                return this.generateInfoContentHTML(buttonText,order);
        },

            //HTML共用的產生內容
            generateInfoContentHTML(orderButtonText, order){
                this.addressToBackend = order.address;
                if(!order){
                    console.error("order object is undefined");
                    return '';
                }

                let orderID = order.orderid // 更改這一行，使用orderid代替id
                
                this.orderID = order.orderid;

                return `
                    <div style="font-weight:bold; margin-bottom: 3px;">${order.shop_name}</div>
                    <div style="margin-bottom: 3px;">【隱藏】外送地址：${order.address}</div>
                    <div style="margin-bottom: 3px;">【隱藏】訂單ID：${orderID}</div>
                    <div style="margin-bottom: 3px;">【隱藏】訂單狀態：${order.deliver_status}</div>
                    <div style="margin-bottom: 3px;">運費：40元</div>
                    <div style="margin-bottom: 3px;">預計運送時間：30 ~ 45 分鐘</div>
                    <div class="button-container">
                        <button class="cancel-button" id="cancel-button">取消</button>
                        <button class="order-button" id="order-button">${orderButtonText}</button>
                    </div>
                `;
            },

        onCurrentPositionSuccess(position){
            const{latitude, longitude} = position.coords
            // console.log(position.coords)
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
                // 確保每個order都有shop_name
                if (!order.shop_name) {
                    console.warn("Missing shop name for order:", order);
                    return; // 如果缺少shop_name，則跳過此標記
                }

                const googleMarker = new google.maps.Marker({
                    title: order.shop_name,
                    position: {
                        lat: parseFloat(order.coordinates.lat),
                        lng: parseFloat(order.coordinates.lng),
                    },
                    map: this.map,
                });
                
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
                        orderButton.textContent = self.orderButtonText;
                        orderButton.addEventListener("click", self.toggleOrderButton);
                    });
                })
            })
        },
        //轉換地址為經緯度
        async convertAddressToLatng(address){
            try{
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyBJmsd-j2EthUiRXfg7BRdYpgCgs2QBdFQ`);
                const data = await response.json();
                // console.log("Geocoding回應",data);
                if (data.results && data.results.length > 0) {
                    const location =data.results[0].geometry.location;
                    // console.log(`【原始地址】轉換為座標: ${address}, Lat: ${location.lat}, Lng: ${location.lng}`);
                    return location;
                }
                return null;
            } catch(error){
                console.error("地址轉經緯度發生錯誤",error);
                return null;
            }
        },
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
</style>