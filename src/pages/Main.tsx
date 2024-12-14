import React from "react";
import './main.scss';

const Main = (): React.JSX.Element => {
    const [pageState, setPageState] = React.useState<string>("");

    React.useEffect(() => {
        setPageState("Main");
    }, []);

    return (
        <>
            <div className={"main"}>
                {
                    pageState === "Main" ? (
                        <div className={"main-content"}>
                            <div className={"left-nav"}>

                            </div>
                            <div className={"right-content"}>
                                <h1 className={"main-content-title"}>Main Page</h1>
                            </div>
                        </div>
                    ) : (
                        <div className={"main-content"}>
                            <h1 className={"main-content-title"}>Loading...</h1>
                        </div>
                    )
                }
            </div>
        </>
    );
}

export default Main;