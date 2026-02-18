export const errorMiddleware = (err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            error: "File too large",
            message:
                "Max allowed size: 2 MB for profiles, 5 MB for restaurants and products",
        });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            success: false,
            error: "Unexpected file field",
            message: "Check the field name used in your request",
        });
    }

    if (
        err.message ===
        "Only image files are allowed (jpeg, jpg, png, gif, webp)"
    ) {
        return res.status(400).json({
            success: false,
            error: err.message,
        });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: err.message,
        });
    }

    if (err.status === 404) {
        return res.status(404).json({
            message: err.message,
        });
    }

    return res.status(500).json({
        message: err.message || "Internal Server Error",
    });
};
