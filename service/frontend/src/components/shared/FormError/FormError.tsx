import React from "react";
import styles from "./FormError.scss";

function FormError(props: FormError) {
    const { errors, ...otherProps } = props;

    const errorsMessages = Object.entries(errors).map((error: any) => {
        return error[1].message;
    });

    if (errorsMessages.length > 0)
        return (
            <ul className={styles.errorsList}>
                {errorsMessages.map((error, index) => {
                    return <li key={props.keyValue + "-" + index}>{error}</li>;
                })}
            </ul>
        );
    else return null;
}

export default FormError;

type FormError = {
    keyValue: string;
    errors: any;
};
