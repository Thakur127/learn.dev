import { auth } from "@/auth";
import axiosInstance from "@/lib/axios"
import { UserInterface } from "@/lib/definitions"

export async function getCurrentUser(): Promise<UserInterface>{

    const session = await auth();
    console.log(session)
    console.log('request received')

    const { data }: {data: UserInterface} = await axiosInstance.get("/user/me", {
        headers: {
            'Authorization': 'Bearer ' + session?.accessToken
        }
    })
    return data
}