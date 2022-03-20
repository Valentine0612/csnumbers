import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sellItemQuery } from "../../../api/itemsApi";
import { IState } from "../../../store";
import { deleteInventoryItem } from "../../../store/actionCreators/inventoryActionCreator";
import { setUserState } from "../../../store/actionCreators/userActionCreator";
import ProductCardsList from "../ProductCardsList";

export default function AccountInventory() {
    const tokenState = useSelector((state: IState) => state.user.token);
    const inventoryState = useSelector((state: IState) => state.inventory);

    const dispatch = useDispatch();

    async function sellProduct(productID: number) {
        const result = await sellItemQuery(tokenState, productID);

        if (result.status === 200) {
            dispatch(setUserState(result.data));
            dispatch(deleteInventoryItem(productID));
        } else console.log(result);
    }

    return (
        <ProductCardsList
            background="dark"
            products={inventoryState}
            productButtonText="Продать"
            productButtonOnClick={sellProduct}
        />
    );
}
