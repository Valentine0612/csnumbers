import axios from "axios";

export async function getItemsByTagQuery(tag: string = "") {
    try {
        let result = await axios.get("/api/shop/", {
            params: {
                tag: tag,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getUserItemsQuery(token: string) {
    try {
        let result = await axios.get("/api/items/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function buyItemQuery(token: string, itemId: number) {
    try {
        let result = await axios.post(
            "/api/item/" + itemId + "/buy/",
            {},
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

export async function sellItemQuery(token: string, itemId: number) {
    try {
        let result = await axios.delete("/api/item/" + itemId + "/sell/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function createItemQuery(token: string, data: any) {
    try {
        let result = await axios.post("/api/item/create/", data, {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getItemQuery(itemID: number) {
    try {
        let result = await axios.get("/api/item/" + itemID + "/");
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function updateItemQuery(
    token: string,
    itemID: number,
    data: any
) {
    try {
        let result = await axios.patch(
            "/api/item/" + itemID + "/action/",
            data,
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

export async function deleteItemQuery(token: string, itemID: number) {
    try {
        let result = await axios.delete("/api/item/" + itemID + "/action/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}
