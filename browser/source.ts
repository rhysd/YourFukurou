export default class Source {
    raw_source: StreamApp.RawSource;
    sender: GitHubElectron.WebContents;

    constructor(
        window: GitHubElectron.BrowserWindow,
        public source_name: string,
        public RawSourceClass: any
    ) {
        this.sender = window.webContents;
        this.raw_source = new RawSourceClass(
                (stream_name: string, data: any) => {
                    this.sender.send("stream-message", source_name + "-" + stream_name, data);
                }
            );
    }
}

