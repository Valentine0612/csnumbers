import axios from "axios";

export async function createReferalCodeQuery(token: string, code: string) {
    try {
        let result = await axios.post(
            "/api/referal/",
            { code: code },
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
