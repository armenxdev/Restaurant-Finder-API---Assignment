export const errorMiddleware = (err, req, res, next) => {
    if(err.name === 'ValidationError') {
        res.status(400).json({
            message: err.message,
        })
        return
    }

    if(err.status === 404) {
        res.status(404).json({
            message: err.message,
        })
        return
    }

    return res.status(500).json({
        message: err.message,
    })

}