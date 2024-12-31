import React from "react";
import './main.scss';

// Called when message received from main process
const Main = (): React.JSX.Element => {
    const [filePath, setFilePath] = React.useState<string>("");
    const [filePaths, setFilePaths] = React.useState<string[]>([]);
    const [data, setData] = React.useState<string[]>([]);
    const [tables, setTables] = React.useState<string[]>([]);
    const [pageState, setPageState] = React.useState<string>("");
    const [dbsToLoad, setDbsToLoad] = React.useState<string[]>([]);
    const [error, setError] = React.useState<string>("");

    React.useEffect(() => {
        setPageState("Main");
        getDatabaseLinks();
    }, []);

    React.useEffect(() => {
        if (filePath) {
            setDbsToLoad([...dbsToLoad, shortenDbString(filePath)]);
        }
    }, [filePath]);

    const handleFileSelection = async (): Promise<void> => {
        const selectedPath = await window.electronAPI.selectDatabase();
        if (selectedPath) {
            setFilePath(selectedPath);
        }

        if (selectedPath) {
            await handleReadDatabase(selectedPath);
        }

        return;
    };

    const handleReadDatabase = async (file: string): Promise<void> => {
        const response = await window.electronAPI.readDatabase(file);
        if (response.success) {
            // Clear data and tables
            setData([]);
            setTables([]);

            // Set data and tables
            setData(response.data.sample_data);
            setTables(response.data.tables);
            console.log(response.data);
            setError('');
        } else {
            console.log(response.error);
            setError(response.error);
        }
    };

    const shortenDbString = (db: string): string => {
        db = db.substring(0, db.indexOf("\\")) + "\\...\\" + db.substring(db.lastIndexOf("\\") + 1);

        return db;
    }

    const getDatabaseLinks = async (): Promise<void> => {
        const response = await window.electronAPI.getDatabaseLinks();

        if (response) {
            setFilePaths(response);
            for (const db of response) {
                setDbsToLoad([...dbsToLoad, shortenDbString(db)]);
            }
        }
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
                                            <div key={filePaths[index]} className={"left-nav-item"}>
                                                <p className={"left-nav-item-text"}>{db}</p>
                                            </div>
                                        );
                                    })
                                }
                                <button onClick={handleFileSelection} className={"left-nav-button"}>Select Database</button>
                                {filePath && <p>Selected File: {shortenDbString(filePath)}</p>}
                            </div>
                            <div className={"right-content"}>
                                <h1 className={"main-content-title"}>Main Page</h1>
                                <div className={"data"}>
                                    {
                                        error ? (
                                            <p className={"error"}>{error}</p>
                                        ) : (
                                            <div className={"main-content"}>
                                                <div className={"tables-header"}>
                                                    {
                                                        tables.map((table: string, index: number) => {
                                                            return (
                                                                <h1 key={index} className={"tableNames"}>{table}</h1>
                                                            )
                                                        })
                                                    }
                                                </div>
                                                <table className={"table-data"}>
                                                    <thead>
                                                    <tr>
                                                        {
                                                            data.length > 0 &&
                                                            Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)
                                                        }
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {data.map((row, index) => (
                                                        <tr key={index}>
                                                            {Object.values(row).map((value: any, i) => (
                                                                <td key={i}>{value}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    }
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