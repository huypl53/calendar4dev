import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from './errors.js'

describe('AppError', () => {
  it('has correct defaults', () => {
    const err = new AppError('something broke')
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('something broke')
    expect(err.code).toBe('INTERNAL_ERROR')
    expect(err.statusCode).toBe(500)
    expect(err.details).toBeUndefined()
  })

  it('accepts custom code and statusCode', () => {
    const err = new AppError('custom', 'CUSTOM_CODE', 418)
    expect(err.code).toBe('CUSTOM_CODE')
    expect(err.statusCode).toBe(418)
  })

  it('accepts details array', () => {
    const details = [{ field: 'email', message: 'required' }]
    const err = new AppError('bad', 'BAD', 400, details)
    expect(err.details).toEqual(details)
  })
})

describe('ValidationError', () => {
  it('has 400 status and VALIDATION_ERROR code', () => {
    const err = new ValidationError('invalid input')
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.message).toBe('invalid input')
  })

  it('accepts details', () => {
    const details = [{ field: 'title', message: 'required' }]
    const err = new ValidationError('bad', details)
    expect(err.details).toEqual(details)
  })
})

describe('NotFoundError', () => {
  it('has 404 status and NOT_FOUND code', () => {
    const err = new NotFoundError('not here')
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
  })
})

describe('UnauthorizedError', () => {
  it('has 401 status and UNAUTHORIZED code', () => {
    const err = new UnauthorizedError('no token')
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })
})

describe('ForbiddenError', () => {
  it('has 403 status and FORBIDDEN code', () => {
    const err = new ForbiddenError('not allowed')
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
  })
})

describe('ConflictError', () => {
  it('has 409 status and CONFLICT code', () => {
    const err = new ConflictError('already exists')
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
  })
})
