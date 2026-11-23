/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as models from '../models/index'

// TEST-ONLY: deliberately vulnerable routes used to exercise Continuous PTaaS pull request scans.
// This file lives on a test branch and must never be merged.

// HIGH: SQL injection. The `category` parameter is concatenated into the query.
export function ptaasTestProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    const category = req.query.category ?? ''
    models.sequelize.query(`SELECT id, name, price FROM Products WHERE name LIKE '%${category}%' AND deletedAt IS NULL`)
      .then(([products]: any) => { res.json({ status: 'success', data: products }) })
      .catch((error: Error) => { next(error) })
  }
}

// MEDIUM: reflected cross-site scripting. The `name` parameter is written into HTML without encoding.
export function ptaasTestGreeting () {
  return (req: Request, res: Response) => {
    const name = req.query.name ?? 'guest'
    res.type('html').send(`<html><body><h1>Hello ${name}</h1></body></html>`)
  }
}

// LOW: information disclosure. Runtime details are returned to any anonymous caller.
export function ptaasTestDebug () {
  return (req: Request, res: Response) => {
    res.json({
      node: process.version,
      platform: process.platform,
      cwd: process.cwd(),
      uptimeSeconds: Math.round(process.uptime()),
      envKeys: Object.keys(process.env)
    })
  }
}
