import axios from "axios";

export async function createOutputItemQuery(token: string, itemID: number) {
    try {
        let result = await axios.post(
            "/api/output/item/" + itemID + "/",
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

export async function deleteOutputItemQuery(token: string, itemID: number) {
    try {
        let result = await axios.delete("/api/output/item/" + itemID + "/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getOutputsItemQuery(token: string) {
    try {
        let result = await axios.get("/api/output/item/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function createOutputBalanceQuery(
    token: string,
    amount: number,
    wallet: string,
    walletAccount: number
) {
    try {
        let result = await axios.post(
            "/api/output/",
            { amount: amount, method: wallet, account: walletAccount },
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

export async function deleteOutputBalanceQuery(token: string, itemID: number) {
    try {
        let result = await axios.delete("/api/output/" + itemID + "/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getOutputsBalanceQuery(token: string) {
    try {
        let result = await axios.get("/api/output/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getOutputsItemAdminQuery(token: string) {
    try {
        let result = await axios.get("/api/outputs/item/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function deleteOutputsItemAdminQuery(
    token: string,
    username: string,
    outputId: number,
    done: boolean = false
) {
    const params = done
        ? {
              done: done,
          }
        : {};

    try {
        let result = await axios.delete(
            "/api/outputs/item/" + username + "/" + outputId + "/",
            {
                params: params,
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

export async function getOutputsBalanceAdminQuery(
    token: string,
    isActive: boolean = true
) {
    try {
        let result = await axios.get("/api/outputs/", {
            headers: {
                Authorization: "JWT " + token,
            },
            params: {
                is_active: isActive ? "True" : "False",
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function updateOutputsBalanceAdminQuery(
    token: string,
    outputId: number,
    isActive: boolean
) {
    try {
        let result = await axios.patch(
            "/api/outputs/" + outputId + "/",
            { is_active: isActive },
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

export async function deleteOutputsBalanceAdminQuery(
    token: string,
    outputId: number
) {
    try {
        let result = await axios.delete("/api/outputs/" + outputId + "/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}
