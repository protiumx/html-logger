const HtmlLogger = require('./../index')
const instance = () => { return new HtmlLogger() }

describe("Html Logger tests", () => {
    it ("Checks Html Logger instance", () => {
        expect(instance).not.toBe(undefined)
        expect(instance).not.toBe(null)
        expect(instance).not.toThrow()
    })

    it("Throws exception", () => {
        let logger = instance()

        expect(logger.init).toThrow() // document not exist
    })
})
