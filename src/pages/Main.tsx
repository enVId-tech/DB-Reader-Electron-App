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
                                <button onClick={() => appendDb("Test")}>Append Database</button>
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