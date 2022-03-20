import axios from "axios";

export async function createFeedbackQuery(token: string, email: string, body: string) {
    try {
        let result = await axios.post(
            "/api/feedback/",
            { email: email, body: body },
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
