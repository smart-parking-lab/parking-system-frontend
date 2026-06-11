import axiosClient from "./axiosClient"

export const homeService = {
    getAllParkingSlot:() => {
        return axiosClient.get('/parking-slots/')
    }
}