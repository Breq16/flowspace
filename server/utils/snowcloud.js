const fetch = require("node-fetch")
const { v4: uuidv4 } = require("uuid")

class Snowcloud {
    EPOCH = 1577836800 // Jan 01 2020 00:00:00 GMT

    constructor({ url, key }) {
        this.url = url
        this.key = key

        this.user = uuidv4()

        this.increment = 0
    }

    urlWithParams(params) {
        const url = new URL(this.url)

        url.searchParams = new URLSearchParams()

        for (const key in params) {
            url.searchParams.append(key, params[key])
        }

        return url.toString()
    }

    async register() {
        const result = await fetch(
            self.urlWithParams({
                url: this.url,
                key: this.key
            }),
            { method: "POST" }
        )

        const data = await result.json()

        this.workerId = data.worker_id
        this.expires = data.expires
        this.ttl = data.ttl
    }

    async renew() {
        const result = await fetch(
            self.urlWithParams({
                url: this.url,
                key: this.key,
                renew: this.workerId
            }),
            { method: "POST" }
        )

        const data = await result.json()

        this.expires = data.expires
        this.ttl = data.ttl
    }

    async renewIfNeeded() {
        if (!this.workerId) {
            await this.register()
        } else if (this.expires <= Date.now() + this.ttl) {
            await this.renew()
        }
    }

    async generate() {
        await renewIfNeeded()

        const timestamp = BigInt(Date.now() - this.EPOCH) * 1000n

        let snowflake = BigInt()

        snowflake |= timestamp << 22
        snowflake |= BigInt(this.workerId) << 12
        snowflake |= BigInt(this.increment)

        this.increment = (this.increment + 1) & 0xFFF
    }
}

module.exports = Snowcloud({
    url: process.env.SNOWCLOUD_URL,
    key: process.env.SNOWCLOUD_KEY
})