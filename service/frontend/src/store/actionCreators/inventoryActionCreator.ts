import { Product } from "../../typings/product";
import {
    ADD_INVENTORY_ITEM,
    DELETE_INVENTORY_ITEM,
    SET_INVENTORY,
} from "../actions/inventoryActions";

function setInventoryState(inventory: Product[]) {
    return {
        type: SET_INVENTORY,
        inventory: inventory,
    };
}

function deleteInventoryItem(itemID: number) {
    return {
        type: DELETE_INVENTORY_ITEM,
        itemID: itemID,
    };
}

function addInventoryItem(newItem: Product) {
    return {
        type: ADD_INVENTORY_ITEM,
        newItem: newItem,
    };
}

export { setInventoryState, deleteInventoryItem, addInventoryItem };
