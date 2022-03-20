import axios from "axios";
import Cookies from "js-cookie";

export async function createUserQuery(username: string, email: string, password: string) {
    try {
        let result = await axios.post(
            "/api/create/",
            {
                email: email,
                username: username,
                password: password,
            },
            {
                headers: {
                    "X-CSRFToken": Cookies.get("csrftoken"),
                },
            }
        );
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getUserInfoQuery(token: string) {
    try {
        const result = await axios.get("/api/current_user/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function updateUserInfoQuery(
    token: string,
    id: number,
    data: any,
    multipart?: boolean
) {
    try {
        console.log(data);

        const contentType = multipart
            ? "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
            : "application/json";

        const result = await axios.put("/api/users/" + id + "/update/", data, {
            headers: {
                Authorization: "JWT " + token,
                "Content-Type": contentType,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getAllUsersQuery(token: string) {
    try {
        const result = await axios.get("/api/users/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getUserQuery(userId: number) {
    try {
        const result = await axios.get("/api/user_info/" + userId + "/");
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function getUserInfoAdminQuery(token: string, userId: number) {
    try {
        const result = await axios.get("/api/users/" + userId + "/", {
            headers: {
                Authorization: "JWT " + token,
            },
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function updateUserInfoAdminQuery(
    token: string,
    userId: number,
    isBanned: boolean,
    isWinner: boolean
) {
    try {
        const result = await axios.post(
            "/api/user/" + userId + "/update/",
            {
                ban: isBanned,
                winner: isWinner,
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
