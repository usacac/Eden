import { FormEvent } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { Button, Link, SmallText } from "_app";

import { demoTransaction } from "../transactions";

interface WithUALProps {
    ual: any;
}

export const CreatorForm = ({ ual }: WithUALProps) => {
    return (
        <div>
            {ual.activeUser ? (
                <Form ual={ual} />
            ) : (
                <Button onClick={ual.showModal}>Login</Button>
            )}
        </div>
    );
};

const Form = ({ ual }: WithUALProps) => {
    const submitTransaction = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const transaction = demoTransaction(
                ual.activeUser.accountName,
                "edenmember11",
                "1.00000000 WAX",
                "yayyy!"
            );
            await ual.activeUser.signTransaction(transaction, {
                broadcast: true,
            });
        } catch (error) {
            console.error(error);
            alert("An error has occurred.");
        }
    };

    return (
        <form onSubmit={submitTransaction}>
            <Button onClick={submitTransaction}>Submit</Button>
            <LogoutFooter ual={ual} />
        </form>
    );
};

const LogoutFooter = ({ ual }: WithUALProps) => (
    <SmallText className="mt-6">
        Creating NFTs as {ual.activeUser.accountName}{" "}
        <Link onClick={ual.logout}>
            logout <FaSignOutAlt className="inline-block" />
        </Link>
    </SmallText>
);
