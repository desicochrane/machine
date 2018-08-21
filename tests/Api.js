export default {
    post(endpoint, data) {
        return new Promise(() => {
            setTimeout(() => {
                throw Error('whoops')
            }, 1)
        })
    }
}
