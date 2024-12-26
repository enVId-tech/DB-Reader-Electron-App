import React from "react";
import './main.scss';

const Main = (): React.JSX.Element => {
    const [pageState, setPageState] = React.useState<string>("");
    const [dbsToLoad, setDbsToLoad] = React.useState<string[]>([]);

    React.useEffect(() => {
        setPageState("Main");
    }, []);

    const appendDb = (db: string): void => {
        setDbsToLoad([...dbsToLoad, db]);
    }

    const handleDb = (db: string): void => {
        // Called when message received from main process
        window.api.receive("fromMain", (data) => {
            console.log(`Received ${data} from main process`);
        });

        // Send a message to the main process
        window.api.send("toMain", "some data");
    }

    return (
        <>
            <div className={"main"}>
                {
                    pageState === "Main" ? (
                        <div className={"main-content"}>
                            <div className={"left-nav"}>
                                <h1 className={"left-nav-title"}>Load Databases</h1>
                                {
                                    dbsToLoad.map((db: string, index: number) => {
                                        return (
                                            <div key={index} className={"left-nav-item"}>
                                                <p className={"left-nav-item-text"}>{db}</p>
                                            </div>
                                        );
                                    })
                                }
                                <button onClick={() => handleDb("Test")} className={"openFile"}>Append Database</button>
                            </div>
                            <div className={"right-content"}>
                                <h1 className={"main-content-title"}>Main Page</h1>
                                <div className={"data"}>

                                </div>
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