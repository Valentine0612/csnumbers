import axios from "axios";

export async function goToFreekassaPayment(amount: number, token: string) {
    try {
        let result = await axios.get("/api/free_kassa/", {
            headers: {
                Authorization: "JWT " + token,
            },
            params: {
                amount: amount,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}
