import { Product } from "../../typings/product";
import {
    ADD_INVENTORY_ITEM,
    DELETE_INVENTORY_ITEM,
    SET_INVENTORY,
} from "../actions/inventoryActions";

function inventoryReducer(state: any = null, action: any) {
    switch (action.type) {
        case SET_INVENTORY:
            return [...action.inventory];

        case ADD_INVENTORY_ITEM:
            return ([...state, action.newItem] as Array<Product>).sort(
                (product_1, product_2) => product_1.pk - product_2.pk
            );

        case DELETE_INVENTORY_ITEM:
            return [
                ...([...state] as Array<Product>).filter(
                    (product) => product.pk !== action.itemID
                ),
            ];

        default:
            return state;
    }
}

export default inventoryReducer;
