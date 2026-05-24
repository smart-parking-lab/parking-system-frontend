import axiosClient from "./axiosClient"

export const AdminService = {
    getAllParkingSessions:() => {
        return axiosClient.get('/parking-sessions')
    },
    getParkingSlotAdmin:() => {
        return axiosClient.get('/parking-slots/with-sensors')
    },
    getRevenue:() => {
        return axiosClient.get('/invoices/');
    },
    login:(email: string, password: string) => {
        return axiosClient.post('/auth/login', {email, password})
    }   
}