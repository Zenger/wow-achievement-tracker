import React from "react";

interface ErrorModalProps {
    open: boolean;
    message: string;
    onClose: () => void;
}


const ErrorModal = (props: ErrorModalProps) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(props.open);
    const [message, setMessage] = React.useState<string>(props.message);

    return <dialog open={isOpen}>
            <article>
            <header>
            <button aria-label="Close" rel="prev" onClick={props.onClose}></button>
            <p>
                <strong>Error</strong>
            </p>
            </header>
                <p>
                    {message}
                </p>
            </article>
        </dialog>
}
export default ErrorModal;