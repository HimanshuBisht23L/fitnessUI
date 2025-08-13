import { Bounce, toast } from "react-toastify"

export const SuccesToast = (message) => {
    toast.success(message, {
        position: "top-center",
        autoClose: 2000,
        transition: Bounce,
    })
}

export const FaildToast = (message) => {
    toast.error(message, {
        position: "top-center",
        autoClose: 2000,
        transition: Bounce,
    })
}