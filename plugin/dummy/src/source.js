export default class DummySource {
    constructor(send) {
        this.send = send;
        this.count = 0;
    }

    initialize() {
        setTimeout(this.countup, 1000, this);
    }

    countup(self) {
        if (self.count > 10) {
            return;
        }

        self.send('count' /*stream name*/, self.count);
        self.count += 1;

        setTimeout(self.countup, 1000, self);
    }
}
