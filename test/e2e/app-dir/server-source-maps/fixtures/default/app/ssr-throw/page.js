'use client'

import { connection } from 'next/server'

function throwError() {
  throw new Error('Boom')
}

export default async function Page() {
  await connection()
  throwError()
  return null
}
