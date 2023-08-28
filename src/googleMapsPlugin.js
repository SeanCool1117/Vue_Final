import { Loader } from '@googlemaps/js-api-loader'
import { ref } from 'vue'

const loader = new Loader({
    apiKey: "AIzaSyBd1p67R2oANqSxT1J08jhI3lx6CRsEFQs",
    version: 'weekly',
    libraries: ['places']
})

const googleLoader = ref(null)

export function provideGoogleLoader() {
    if(!googleLoader.value) {
        googleLoader.value = loader.load().then(() => loader.google)
    }
    return googleLoader.value
}

export function useGoogleLoader() {
    return provideGoogleLoader()
}

const GoogleMapsPlugin = {
    install(app) {
        app.provide('googleLoader', provideGoogleLoader())
    }
}

export default GoogleMapsPlugin