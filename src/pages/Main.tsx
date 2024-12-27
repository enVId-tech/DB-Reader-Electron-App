import React from "react";
import './main.scss';

// Called when message received from main process
window.api.receive("fromMain", (data) => {
    console.log(`Received ${JSON.stringify(data)} from main process`);
});

const Main = (): React.JSX.Element => {
    const [pageState, setPageState] = React.useState<string>("");
    const [dbsToLoad, setDbsToLoad] = React.useState<string[]>([]);

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setPageState("Main");
    }, []);

    const appendDb = (db: string | null): void => {
        const file = inputRef.current?.files?.item(0);

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            window.api.send("toMain", { name: file.name, data: reader.result });
        }

        reader.readAsArrayBuffer(file);
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
                                <input type={"file"} accept={".db"} ref={inputRef} onChange={(e) => appendDb(e.target.value)} />
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