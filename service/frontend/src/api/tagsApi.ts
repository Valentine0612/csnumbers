import axios from "axios";

export async function getTagsQuery() {
    try {
        let result = await axios.get("/api/tags/", {});
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function createTagQuery(token: string, title: string) {
    try {
        let result = await axios.post(
            "/api/tag/create/",
            {
                title: title,
            },
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
