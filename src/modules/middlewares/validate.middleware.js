import { AppError } from '../../utils/error.js'

export const validate = (schema, target = 'body') => (req, res, next ) => {
    const { error } = schema.validate(req[target], {abortEarly: false})
console.log(schema.validate(req[target], {abortEarly: false}));
    if (error)
        throw new AppError(
            error.details.map(({ message }) => message),
            400
        )
    next()
}