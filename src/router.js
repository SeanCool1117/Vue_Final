import {createRouter, createWebHistory} from 'vue-router'
import Home from './views/Home.vue';
import About from './views/About.vue';
import Contact from './views/Contact.vue';
import Products from './views/Products.vue';
import Deliverer from './views/Deliverer.vue';
import Add from './views/Add.vue';
import AddDeliverer from './views/AddDeliverer.vue';
import Edit from './views/Edit.vue';
import EditDeliverer from './views/EditDeliverer.vue';
import Map from './views/Map.vue';
import Login from './views/Login.vue';

const routes = [
    {
        //http://localhost/
        path:'/',
        component:Home
    },
    {
        //http://localhost/about
        path:'/about',
        component:About
    },
    {
        //http://localhost/contact
        path:'/contact',
        component:Contact
    },
    {
        //http://localhost/products
        path:'/products',
        component:Products
    },
    {
        //http://localhost/products/add
        path:'/products/add',
        component:Add
    },
    {
        //http://localhost/products/edit/1
        path:'/products/edit/:id',
        component:Edit
    },
    {
        //http://localhost/deliverer
        path:'/deliverer',
        component:Deliverer
    },
    {
        //http://localhost/deliverer/add
        path:'/deliverer/add',
        component:AddDeliverer
    },
    {
        //http://localhost/deliverer/edit/1
        path:'/deliverer/edit/:id',
        component:EditDeliverer
    },
    {
        //http://localhost/deliverer/map
        path:'/deliverer/map/:name/:id',
        component:Map,
        name:'deliverer-map'
    },
    {
        //http://localhost/deliverer/login
        path:'/deliverer/login',
        component:Login
    }
]

const router = createRouter({
    history:createWebHistory(),
    routes
})

export default router