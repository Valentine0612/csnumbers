import axios from "axios";

export async function getTransactionsQuery(token: string) {
    try {
        let result = await axios.get("/api/balance/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function createTransactionQuery(token: string, amount: number = 1000) {
    try {
        let result = await axios.post(
            "/api/topup/",
            { amount: amount },
            {
                headers: {
                    Authorization: "JWT " + token,
                },
            }
        );
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function changeUserBalanceQuery(token: string, userId: number, amount: number = 1000) {
    try {
        let result = await axios.post(
            "/api/balance/" + userId + "/change/",
            { amount: amount },
            {
                headers: {
                    Authorization: "JWT " + token,
                },
            }
        );
        return result;
    } catch (err) {
        return err.response;
    }
}
